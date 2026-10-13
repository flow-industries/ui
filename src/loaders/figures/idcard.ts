// @ts-nocheck
// idcard: a Hairline figure, made with the hairline-create skill and checked with its look.mjs.
// It stays in the skill's format so it can be iterated there; only this header and the export differ.
import { HL } from "../kernel";
import type { LoaderFigure } from "../loader";
/**
 * Idcard: a Flow ID card seated on a small board, its traces running out to eight app contacts. The identity goes out
 * to each contact in turn: the card leans toward that app, the face-scan brackets in its photo well close on the face,
 * the trace lights from the card outward and the contact rises lit as the light reaches it. The pointer routes the
 * identity to the contact it is over, and the round waits until it leaves. Under reduced motion it holds the rest
 * pose: the card leaning toward one app, its route lit. The slider is how far the card leans, in degrees.
 *
 * The pattern: discrete items on a fixed board. Tweens for which route is lit and where the card leans, a hit test on
 * the board plane at the contacts' rest and risen heights, and the bright stroke as the only highlight.
 */
const {
  Cam, facing, fit, flatDot, open, place, poly, prism, proj, put, rad, rings, ringAt, rrect, run, solid, unproj,
  tdone, tset, tval, tween, disposer, mk, pointer, reducedMotion, register,
} = HL;

const A = 34, B = 19, CT = 3, WD = 1, PH = 1.6, PR = 4.5, RISE = 7, STEP = 550, REST = 2, S = 2.05;
// the traces, clockwise from the back: board points from under the card's edge out to an app's contact
const TRACES = [
  [[16, -16], [16, -37]],
  [[31, -5], [52, -5]],
  [[31, 7], [40, 7], [46, 13], [52, 13]],
  [[12, 16], [12, 25], [18, 31], [18, 37]],
  [[-16, 16], [-16, 37]],
  [[-31, 5], [-52, 5]],
  [[-31, -7], [-40, -7], [-46, -13], [-52, -13]],
  [[-12, -16], [-12, -25], [-18, -31], [-18, -37]],
];
const N = TRACES.length;
const CARD = rings(-A, -B, A, B, 5, 1.3), WELL = rings(-30, -11, -8, 11, 3.5, 1)[0];
const BARS = [[-8, 30], [0, 24], [8, 18]].map(([y, l]) => rings(-3, y - 2, -3 + l, y + 2, 2, 0.7));
const SMILE = Array.from({ length: 9 }, (_, i) => rad(25 + i * 16.25)).map((a) => [3.4 * Math.cos(a), -0.6 + 3.4 * Math.sin(a)]);

/** A polyline's length. */
const len = (pts) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
/** The polyline from its start to s along it. */
function upTo(pts, s) {
  const out = [pts[0]];
  for (let i = 1; i < pts.length && s > 0; i++) {
    const a = pts[i - 1], b = pts[i], l = Math.hypot(b[0] - a[0], b[1] - a[1]), k = Math.min(1, s / l);
    out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]);
    s -= l;
  }
  return out;
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let tilt = value;

  // fitted to the board, a contact risen at the back and the card's back corner at the steepest lean
  const C = Cam(45, 0.5, S);
  fit(C, [[-60, -45, -4], [60, 45, -4], [60, -45, 0], [-60, 45, 0], [-52, -13, PH + RISE], [-A, -B, 20]], 200, 166);
  const P = proj(C), front = facing(C), g = mk("g", {}, svg);
  const on = (pts, z) => pts.map(([x, y]) => P(x, y, z));

  // the board, and the traces printed on it
  put(solid(g), prism(P, front, rrect(-60, -45, 60, 45, 16, 14), rrect(-58, -43, 58, 43, 14, 14), -4, 0));
  const traces = TRACES.map((pts) => ({ pts, L: len(pts) }));
  for (const t of traces) mk("path", { d: open(on(t.pts, 0)), class: "nf" }, g);
  const lit = mk("path", { class: "nf hi" }, g);

  // the contacts and the card, far to near: the card covers the traces' starts and a contact covers its trace's end
  const pads = TRACES.map((pts) => {
    const [x, y] = pts[pts.length - 1];
    return { x, y, phi: Math.atan2(y, x) / rad(1), depth: x + y, ring: rings(x - PR, y - PR, x + PR, y + PR, PR, 1), lift: tween(0), h: NaN };
  });
  const card = { depth: 0 };
  for (const it of [...pads, card].sort((p, q) => p.depth - q.depth)) {
    if (it !== card) { it.el = solid(g); continue; }
    card.body = solid(g);
    // the photo well, sunk into the card: the foot of its far walls on the floor, and its rim
    card.seam = mk("path", { class: "nf lo" }, g);
    card.rim = mk("path", { class: "nf" }, g);
    // on its floor a face, two eyes and a smile, inside the scanner's corner brackets
    card.eyes = [0, 1].map(() => flatDot(g, C, 0.85, "dot m"));
    card.mouth = mk("path", { class: "nf lo" }, g);
    card.scan = mk("path", { class: "nf" }, g);
    // three raised lines of the holder's details, longest first
    card.bars = BARS.map(() => solid(g));
  }

  /** The card leaning tilt degrees toward phi, on the edge nearest that way: a projection of points in its own frame. */
  function leaning(phi) {
    const f = rad(phi), a = rad(tilt), cf = Math.cos(f), sf = Math.sin(f), ca = Math.cos(a), sa = Math.sin(a);
    const lift = sa * (A * Math.abs(cf) + B * Math.abs(sf));
    return (x, y, z) => {
      const d = x * cf + y * sf, e = -x * sf + y * cf, d2 = d * ca + z * sa;
      return P(d2 * cf - e * sf, d2 * sf + e * cf, -d * sa + z * ca + lift);
    };
  }
  function drawCard(phi, t) {
    const Q = leaning(phi), F = (x, y) => Q(-19 + x, y, CT - WD), h = 8 - 2.4 * Math.sin(Math.PI * t);
    put(card.body, prism(Q, front, CARD[0], CARD[1], 0, CT));
    card.seam.setAttribute("d", open(ringAt(Q, run(WELL, (q) => !front(q)), CT - WD)));
    card.rim.setAttribute("d", poly(ringAt(Q, WELL, CT)));
    card.eyes.forEach((el, i) => place(el, F(i ? 2.6 : -2.6, -2.4)));
    card.mouth.setAttribute("d", open(SMILE.map(([x, y]) => F(x, y))));
    card.scan.setAttribute("d", [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([u, v]) => open([F(u * h, v * (h - 2.8)), F(u * h, v * h), F(u * (h - 2.8), v * h)])).join(""));
    card.bars.forEach((el, i) => put(el, prism(Q, front, BARS[i][0], BARS[i][1], CT, CT + 0.8)));
  }

  let route = REST, runT = tween(1), over = -1, next = 0, drawn = "", phiTo = pads[REST].phi;
  const phiT = tween(phiTo);
  pads[REST].lift = tween(1);

  /** Sends the identity to contact k: the card turns its lean toward k, the last contact settles, k's trace lights and k rises. */
  function send(k, now) {
    if (k === route) return;
    tset(pads[route].lift, 0, now, 0);
    route = k;
    runT = tween(0);
    tset(runT, 1, now, 0);
    tset(pads[k].lift, 1, now, 160);
    phiTo += ((((pads[k].phi - phiTo) % 360) + 540) % 360) - 180;
    tset(phiT, phiTo, now, 0);
  }

  function draw(now) {
    const t = tval(runT, now), phi = tval(phiT, now), id = [route, t, phi, tilt].join();
    if (id !== drawn) {
      drawn = id;
      const tr = traces[route];
      lit.setAttribute("d", open(on(upTo(tr.pts, t * tr.L), 0.15)));
      drawCard(phi, t);
    }
    pads.forEach((p, k) => {
      const h = PH + RISE * tval(p.lift, now);
      if (h !== p.h) { p.h = h; put(p.el, prism(P, front, p.ring[0], p.ring[1], 0, h)); }
      p.el.sil.classList.toggle("hi", k === route && t > 0.8);
    });
  }

  // the round: while the pointer is off the contacts the identity moves on every STEP; reduced motion holds the rest pose
  const R = register(stage, (_dt, now) => {
    const still = reducedMotion();
    if (over < 0 && still) send(REST, now);
    else if (over < 0 && now >= next) { next = now - next > STEP ? now + STEP : next + STEP; send((route + 1) % N, now); }
    draw(now);
    return (over < 0 && !still) || !tdone(runT, now) || !tdone(phiT, now) || pads.some((p) => !tdone(p.lift, now));
  });
  bag.add(R.unregister);

  /** The contact under a viewBox point, read on the board at a contact's rest height and at its full rise; -1 off them. */
  function hit([sx, sy]) {
    let best = -1, bd = 13;
    for (const z of [PH, PH + RISE]) {
      const [x, y] = unproj(C, sx, sy, z);
      pads.forEach((p, k) => { const d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; best = k; } });
    }
    return best;
  }

  function aim(k) {
    const now = performance.now();
    if (k < 0 && over >= 0) next = now + STEP;
    over = k;
    if (k >= 0) send(k, now);
    read.textContent = k < 0 ? "rest" : "app " + (k + 1);
    R.wake();
  }

  bag.add(pointer(stage, { move: (p) => aim(hit(p)), leave: () => aim(-1) }));
  bag.add(() => svg.replaceChildren());
  R.wake();

  return { set: (v) => { tilt = v; R.wake(); }, destroy: bag.dispose };
}

export default {
  name: "idcard",
  means: "Your ID leans to each app in turn and its trace lights from the card to the app's contact; point at a contact to send it there.",
  rules: [1, 4, 5, 7],
  range: [3, 7, 12],
  tour: [[123, 174], [277, 143], [172, 198], null],
  mount,
} satisfies LoaderFigure;
