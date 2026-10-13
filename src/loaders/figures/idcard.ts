// @ts-nocheck
// idcard: a Hairline figure, made with the hairline-create skill and checked with its look.mjs.
// It stays in the skill's format so it can be iterated there; only this header and the export differ.
import { HL } from "../kernel";
import type { LoaderFigure } from "../loader";
/**
 * Idcard: an ID card held up to the viewer, a landscape plate with a lanyard slot, a photo window holding a head and
 * shoulders inside the scanner's corner brackets, and four lines of details, the name longest. It is being read: the
 * brackets close on the portrait, then each line lights from left to right as it is read, and the card turns a little
 * toward what is read. The pointer reads what it is over: the card turns toward it on a spring and that part lights.
 * Under reduced motion it holds the rest pose, the brackets shut on the portrait. The slider is how far the card turns.
 *
 * The pattern: one plate, a part picked on its rest plane. Springs for where the card turns, tweens for which part is
 * read, and the bright stroke as the only highlight, on the part being read.
 */
const {
  Cam, clamp, fit, hull, open, poly, proj, rad, rrect, run, spring, stepS,
  tdone, tset, tval, tween, disposer, mk, pointer, reducedMotion, register,
} = HL;

const W = 42.8, H = 27, TK = 3, Y0 = 16, L0 = 14, STEP = 800, S = 3.05;
const CARD = rrect(-W, -H, W, H, 4, 6), WIN = [-37, -19, -13, 13], SLOT = rrect(-6, 20.5, 6, 23.5, 1.5, 4);
// the lines of details: left end, height on the card, length, half their thickness; the name first and heaviest
const LINES = [[-7, 9, 40, 2.6], [-7, 1.5, 31, 1.6], [-7, -5, 35, 1.6], [-7, -11.5, 22, 1.6]];
// what the reader looks at, in turn: the portrait, then each line
const ITEMS = [[-25, -3], ...LINES.map(([u, v, l]) => [u + l / 2, v])];
const HEAD = Array.from({ length: 20 }, (_, i) => [-25 + 5.5 * Math.cos((i * Math.PI) / 10), 1.5 + 5.5 * Math.sin((i * Math.PI) / 10)]);
const SHOULDERS = Array.from({ length: 17 }, (_, i) => [-25 + 8.8 * Math.cos((i * Math.PI) / 16), -19 + 11.5 * Math.sin((i * Math.PI) / 16)]);

/** The card turned yaw degrees and leaned back lean degrees: a world point for a point on it, w out of its face. */
function pose(yaw, lean) {
  const g = rad(yaw), l = rad(lean), h = [Math.cos(rad(-45) + g), Math.sin(rad(-45) + g)], n = [Math.cos(rad(45) + g), Math.sin(rad(45) + g)];
  const up = [-n[0] * Math.sin(l), -n[1] * Math.sin(l), Math.cos(l)], out = [n[0] * Math.cos(l), n[1] * Math.cos(l), Math.sin(l)];
  return (u, v, w = 0) => [u * h[0] + v * up[0] + w * out[0], u * h[1] + v * up[1] + w * out[1], v * up[2] + w * out[2]];
}
/** Twice the signed area of a closed screen polygon. */
const area = (pts) => pts.reduce((s, p, i) => { const q = pts[(i + 1) % pts.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0);

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let tilt = value;

  // fitted to the card at the steepest turns either way, so no pose leaves the frame
  const C = Cam(45, 0.5, S), ends = [];
  for (const y of [Y0 - 16, Y0 + 16]) for (const l of [L0 - 10, L0 + 10]) for (const [u, v] of [[-W, -H], [W, -H], [W, H], [-W, H]]) ends.push(pose(y, l)(u, v, -TK));
  fit(C, ends, 200, 160);
  const P = proj(C), g = mk("g", {}, svg);

  // the card: its silhouette with the slot cut through, the line of its thickness, and what is printed on its face
  const sil = mk("path", { class: "sil" }, g), edge = mk("path", { class: "nf lo" }, g);
  const slot = mk("path", { class: "nf" }, g), rim = mk("path", { class: "nf" }, g);
  const head = mk("path", { class: "nf" }, g), shoulders = mk("path", { class: "nf" }, g);
  const brackets = mk("path", { class: "nf" }, g);
  const lines = LINES.map(() => mk("path", { class: "nf" }, g)), sweep = mk("path", { class: "nf hi" }, g);

  const yawS = spring(Y0), leanS = spring(L0);
  let focus = 0, over = -1, next = 0, prog = tween(1), drawn = "";
  const shut = tween(1);
  /** Turns the card toward a point on its face, as the reader's eye or the pointer would. */
  const lookAt = (u, v) => { yawS.t = Y0 + clamp(u / W, -1, 1) * tilt; leanS.t = L0 - clamp(v / H, -1, 1) * tilt * 0.6; };
  lookAt(...ITEMS[0]);
  yawS.x = yawS.t; leanS.x = leanS.t;

  /** Reads part k: the brackets close on the portrait, or line k lights from its left end. */
  function readPart(k, now) {
    if (k === focus) return;
    focus = k;
    prog = tween(0);
    tset(prog, 1, now, 0);
    tset(shut, k === 0 ? 1 : 0, now, 0);
  }

  function draw(now) {
    const t = tval(prog, now), s = tval(shut, now), id = [yawS.x, leanS.x, t, s, focus].join();
    if (id === drawn) return;
    drawn = id;
    const Wp = pose(yawS.x, leanS.x), Q = (u, v, w = 0) => P(...Wp(u, v, w)), at = (pts) => pts.map(([u, v]) => Q(u, v));
    const face = CARD.map((q) => Q(q.u, q.v)), back = CARD.map((q) => Q(q.u, q.v, -TK));
    const o = [back[0][0] - face[0][0], back[0][1] - face[0][1]], c = Q(0, 0);
    const outline = hull(face.concat(back)), cut = SLOT.map((q) => Q(q.u, q.v));
    sil.setAttribute("d", poly(outline) + poly(Math.sign(area(cut)) === Math.sign(area(outline)) ? cut.reverse() : cut));
    // the plate's thickness shows past the edges that face o
    edge.setAttribute("d", open(run(CARD, (q) => { const d = Q(q.nu, q.nv); return (d[0] - c[0]) * o[0] + (d[1] - c[1]) * o[1] > 0; }).map((q) => Q(q.u, q.v))));
    slot.setAttribute("d", poly(SLOT.map((q) => Q(q.u, q.v))));
    rim.setAttribute("d", poly(rrect(WIN[0], WIN[1], WIN[2], WIN[3], 3, 4).map((q) => Q(q.u, q.v))));
    head.setAttribute("d", poly(at(HEAD)));
    shoulders.setAttribute("d", open(at(SHOULDERS)));
    const f = 3.4 - 2.6 * s, a = 5.5, [u0, v0, u1, v1] = [WIN[0] - f, WIN[1] - f, WIN[2] + f, WIN[3] + f];
    // each bracket turns its corner on a quarter circle of radius r, so the scanner's corners read rounded
    const r = 3.2, turn = (u, v, du, dv) => Array.from({ length: 7 }, (_, k) => { const t = (k / 6) * Math.PI / 2; return [u + du * r - du * r * Math.cos(t), v + dv * r - dv * r * Math.sin(t)]; });
    brackets.setAttribute("d", [[u0, v1, 1, -1], [u1, v1, -1, -1], [u1, v0, -1, 1], [u0, v0, 1, 1]].map(([u, v, du, dv]) => open(at([[u, v + dv * a], ...turn(u, v, du, dv), [u + du * a, v]]))).join(""));
    brackets.classList.toggle("hi", focus === 0);
    LINES.forEach(([u, v, l, hh], i) => lines[i].setAttribute("d", poly(rrect(u, v - hh, u + l, v + hh, hh, 4).map((q) => Q(q.u, q.v)))));
    const ln = LINES[focus - 1];
    sweep.setAttribute("d", ln ? poly(rrect(ln[0], ln[1] - ln[3], ln[0] + Math.max(2 * ln[3], ln[2] * t), ln[1] + ln[3], ln[3], 4).map((q) => Q(q.u, q.v))) : "");
  }

  // the round: while the pointer is off the card the reader moves on every STEP; reduced motion holds the rest pose
  const B = register(stage, (dt, now) => {
    const still = reducedMotion();
    if (over < 0 && still) { readPart(0, now); lookAt(...ITEMS[0]); }
    else if (over < 0 && now >= next) {
      next = now - next > STEP ? now + STEP : next + STEP;
      readPart((focus + 1) % ITEMS.length, now);
      lookAt(...ITEMS[focus]);
    }
    const m = stepS(yawS, dt) | stepS(leanS, dt);
    draw(now);
    return (over < 0 && !still) || !!m || !tdone(prog, now) || !tdone(shut, now);
  });
  bag.add(B.unregister);

  // the card's rest plane, for the hit test: a screen point back to a point on the card's face as it rests
  const R = pose(Y0, L0), o0 = P(...R(0, 0)), eu = P(...R(1, 0)), ev = P(...R(0, 1));
  const a = [eu[0] - o0[0], eu[1] - o0[1]], b = [ev[0] - o0[0], ev[1] - o0[1]], det = a[0] * b[1] - a[1] * b[0];
  const onCard = ([x, y]) => { const dx = x - o0[0], dy = y - o0[1]; return [(dx * b[1] - dy * b[0]) / det, (a[0] * dy - a[1] * dx) / det]; };

  /** The part under a point on the resting card: the portrait left of the lines, else the nearest line; -1 off the card. */
  const part = (u, v) => Math.abs(u) > W || Math.abs(v) > H ? -1 : u < -10 ? 0 : 1 + LINES.reduce((k, l, i) => (Math.abs(l[1] - v) < Math.abs(LINES[k][1] - v) ? i : k), 0);

  function aim(p) {
    const now = performance.now(), [u, v] = p ? onCard(p) : [0, 0], k = p ? part(u, v) : -1;
    if (k < 0 && over >= 0) { next = now + STEP; lookAt(...ITEMS[focus]); }
    over = k;
    if (k >= 0) { readPart(k, now); lookAt(u, v); }
    read.textContent = k < 0 ? "rest" : k === 0 ? "photo" : "line " + k;
    B.wake();
  }

  bag.add(pointer(stage, { move: (p) => aim(p), leave: () => aim(null) }));
  bag.add(() => svg.replaceChildren());
  B.wake();

  return { set: (v) => { tilt = v; if (over < 0) lookAt(...ITEMS[focus]); B.wake(); }, destroy: bag.dispose };
}

export default {
  name: "idcard",
  means: "An ID card being read: brackets close on the portrait, then each line lights in turn; point at a part to read it.",
  rules: [1, 4, 5, 8],
  range: [4, 10, 16],
  tour: [[125, 159], [239, 139], [209, 195], null],
  mount,
} satisfies LoaderFigure;
