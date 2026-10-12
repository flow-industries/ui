// @ts-nocheck
// pigeonholes: a Hairline figure, made with the hairline-create skill and checked with its look.mjs.
// It stays in the skill's format so it can be iterated there; only this header and the export differ.
import { HL } from "../kernel";
/**
 * Pigeonholes: a wall of twelve open-fronted mail cubbies, one per room, with
 * shared dividers and slots deep enough to swallow a letter. Letters stand in
 * them as thin envelopes. Every beat one is posted into a cubby, shoving that
 * cubby's stack back a place, while the oldest letter on the wall is drawn back
 * into the dark of its slot, so the wall never fills. The newest letter carries
 * the bright stroke. The pointer picks a cubby: its letters lift out of the
 * slot, fanned, the others sink back in turn, and the arrivals wait until it leaves.
 * The slider is the fan: the roll, in degrees, of the outermost letters.
 *
 * The pattern: discrete items over an ambient loop. Tweens, a stagger by grid
 * distance, a hit test on the front plane (which never moves), and paint order
 * kept by cubby: each cubby's mouth is filled before its letters and painted
 * after the cubbies below and left of it, whose deep letters it must hide.
 */
const {
  Cam, clamp, facing, fit, hull, open, poly, prism, proj, rad, r2, ringAt, rings, rrect,
  tdone, tset, tval, tween, reducedMotion, disposer, mk, pointer, reflect, register,
} = HL;

const COLS = 4, ROWS = 3, T = 5, CW = 44, CH = 28, PX = CW + T, PZ = CH + T;
const W = COLS * PX + T, H = ROWS * PZ + T, D = 46, R = 4;
const LW = 26, LH = 15, TK = 1.3, ENTER = -6, HIDE = 40, SLOT = 8, SINK = 8, LEAN = 7, LIFT = 5, OUT = -10;
const STEP = 40, BEAT = 0.8, N = 7;
/** Which cubby each letter is posted to, in turn, round and round; any seven in a row put at most two in one cubby. */
const SEQ = [10, 1, 4, 10, 7, 1, 6, 0, 6, 9, 3, 0, 11, 2, 5, 11, 8, 2];

/** Cubby k, read left to right from the top row: its column, its row, and the floor's left corner on the front. */
const box = (k) => { const c = k % COLS, r = (k / COLS) | 0; return { c, r, x0: T + c * PX, z0: H - (r + 1) * PZ }; };
const area = (pts) => pts.reduce((s, p, i) => { const q = pts[(i + 1) % pts.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0);
const gap = (a, b) => { const A = box(a), B = box(b); return Math.hypot(A.c - B.c, A.r - B.r); };

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let fan = clamp(value, 0, 16), act = -1, b = N - 1, clock = 0, next = 0.12;

  const C = Cam(45, 0.5, 1.32);
  fit(C, [[0, 0, 0], [W, D, -8], [W, 0, 0], [0, D, 0], [0, 0, H], [W, D, H]], 200, 166);
  const P = proj(C), front = facing(C);
  const [outer, inner] = rings(0, 0, W, D, R, 1.6);
  const body = prism(P, front, outer, inner, 0, H);
  const shell = hull(ringAt(P, outer, 0).concat(ringAt(P, outer, H)));

  const g = mk("g", {}, svg);
  reflect(svg, g, P, front, outer, 0, 14);

  // Cubby by cubby, up and to the right: a deep letter shows only up and to the right of its own mouth, behind a later fill.
  const cub = [], mouths = [], holes = [], ks = [...Array(COLS * ROWS).keys()];
  for (const k of ks.slice().sort((p, q) => box(p).c - box(p).r - (box(q).c - box(q).r))) {
    const { x0, z0 } = box(k), m = rrect(x0, z0, x0 + CW, z0 + CH, 2.5, 4).map((q) => P(q.u, D, q.v));
    cub[k] = mk("g", {}, g);
    mk("path", { d: poly(m), class: "fo" }, cub[k]);
    mk("path", { d: open([P(x0, D, z0), P(x0, D - 42, z0)]), class: "nf lo" }, cub[k]);
    holes[k] = Math.sign(area(m)) === Math.sign(area(shell)) ? m.slice().reverse() : m;
  }
  // The carcass: one opaque face pierced by the twelve mouths, then its crease, the rims, and the outline.
  mk("path", { d: poly(shell) + holes.map(poly).join(""), class: "fo" }, g);
  mk("path", { d: body.crease, class: "nf lo" }, g);
  for (const k of ks) mouths[k] = mk("path", { d: poly(holes[k]), class: "nf" }, g);
  mk("path", { d: body.sil, class: "nf sil" }, g);
  const fore = mk("g", {}, g);

  const shape = rrect(-LW / 2, 0, LW / 2, LH, 1.4, 3), pool = [];
  for (let i = 0; i < N + 2; i++) {
    const lg = mk("g", {}, fore);
    pool.push({ g: lg, back: mk("path", { class: "lo" }, lg), face: mk("path", { class: "sil" }, lg), flap: mk("path", { class: "nf lo" }, lg), state: "free" });
  }
  const held = (k) => pool.filter((L) => L.state === "live" && L.k === k);
  const slot = (L) => held(L.k).filter((M) => M.n > L.n).length;

  /** Where letter L belongs: [depth into the slot, lift, roll, lean], in units and degrees. */
  function goal(L) {
    let d = HIDE, f = L.f0, t = LEAN, h = 0;
    if (L.state === "live") {
      const p = slot(L), n = held(L.k).length;
      if (act === L.k) { d = OUT + p * 5; f = n > 1 ? fan * (1 - (2 * p) / (n - 1)) : 0; t = 0; h = LIFT; }
      else d = 3 + p * SLOT + (act >= 0 ? SINK : 0);
    }
    return [d, h + (LW / 2) * Math.abs(Math.sin(rad(f))), f, t];
  }
  function aim(L, now, delay) {
    const [d, h, f, t] = goal(L);
    tset(L.d, d, now, delay); tset(L.h, h, now, delay); tset(L.f, f, now, delay); tset(L.t, t, now, delay);
  }
  /** Puts letter L, posted n-th, in cubby k: at its slot when the wall is laid out, at the mouth when it is posted. */
  function post(L, k, n, posted) {
    Object.assign(L, { state: "live", k, n, xo: ((n * 5) % 7) / 3 - 1, f0: (((n * 3) % 5) - 2) * 0.8, key: "" });
    const [d, h, f, t] = posted ? [ENTER, 0, L.f0, LEAN] : goal(L);
    Object.assign(L, { d: tween(d), h: tween(h), f: tween(f), t: tween(t) });
  }

  function draw(L, now) {
    const d = tval(L.d, now), h = tval(L.h, now), f = rad(tval(L.f, now)), t = rad(tval(L.t, now));
    const key = [d, h, f, t].map(r2).join();
    if (key === L.key) return;
    L.key = key;
    const { x0, z0 } = box(L.k), xc = x0 + CW / 2 + L.xo, cf = Math.cos(f), sf = Math.sin(f);
    const at = (u, v, back) => {
      const w = u * sf + v * cf;
      return P(xc + u * cf - v * sf, D - d - w * Math.sin(t) - back * TK, z0 + h + w * Math.cos(t));
    };
    L.back.setAttribute("d", poly(shape.map((q) => at(q.u, q.v, 1))));
    L.face.setAttribute("d", poly(shape.map((q) => at(q.u, q.v, 0))));
    L.flap.setAttribute("d", open([at(1.6 - LW / 2, LH - 1.2, 0), at(0, LH * 0.4, 0), at(LW / 2 - 1.6, LH - 1.2, 0)]));
    L.dv = d;
    if ((d < 0) !== L.out) { L.out = d < 0; layer(L.k); }
  }
  /** Out of its mouth a letter is in front of the whole wall; inside, it is its cubby's. Either way, deepest first. */
  function layer(k) {
    const by = (p, q) => q.dv - p.dv, on = pool.filter((M) => M.state !== "free");
    on.filter((M) => !M.out && M.k === k).sort(by).forEach((M) => cub[k].append(M.g));
    on.filter((M) => M.out).sort(by).forEach((M) => fore.append(M.g));
  }

  function light() {
    pool.forEach((L) => L.face.classList.toggle("hi", L.state === "live" && (act >= 0 ? L.k === act : L.n === b)));
    mouths.forEach((m, k) => m.classList.toggle("hi", k === act));
  }

  /** One beat: the oldest letter is drawn back into its slot, and the next is posted, pushing its cubby's stack back. */
  function beat(now) {
    b++;
    const old = pool.find((L) => L.state === "live" && L.n === b - N);
    if (old) { old.state = "gone"; aim(old, now, 0); }
    const L = pool.find((M) => M.state === "free") || pool.find((M) => M.state === "gone" && M !== old);
    post(L, SEQ[b % SEQ.length], b, true);
    held(L.k).forEach((M) => aim(M, now, slot(M) * STEP));
    light();
  }

  for (let n = 0; n < N; n++) post(pool[n], SEQ[n], n, false);
  light();

  const B = register(stage, (dt, now) => {
    const ambient = act < 0 && !reducedMotion();
    if (ambient) { clock += Math.min(dt, 0.1); if (clock >= next) { beat(now); next = clock + BEAT; } }
    let moving = false;
    for (const L of pool) {
      if (L.state === "free") continue;
      draw(L, now);
      if (!tdone(L.d, now) || !tdone(L.h, now) || !tdone(L.f, now) || !tdone(L.t, now)) moving = true;
      else if (L.state === "gone") L.state = "free";
    }
    return moving || ambient;
  });
  bag.add(B.unregister);

  // The pointer lands on the front plane, which never moves, and the cubby is read off its column and row.
  const o = P(0, D, 0), pu = P(1, D, 0), pw = P(0, D, 1);
  const eu = [pu[0] - o[0], pu[1] - o[1]], ew = [pw[0] - o[0], pw[1] - o[1]], det = eu[0] * ew[1] - eu[1] * ew[0];
  function hit([x, y]) {
    const qx = x - o[0], qy = y - o[1], u = (qx * ew[1] - qy * ew[0]) / det, w = (eu[0] * qy - eu[1] * qx) / det;
    if (u < -2 || u > W + 2 || w < -2 || w > H + 2) return -1;
    return clamp(Math.floor((H - T / 2 - w) / PZ), 0, ROWS - 1) * COLS + clamp(Math.floor((u - T / 2) / PX), 0, COLS - 1);
  }

  /** Picks cubby a (-1 lets go). The stagger spreads out from the cubby picked, or the one let go. */
  function pick(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act;
    act = a;
    for (const L of pool) if (L.state === "live") aim(L, now, (L.k === from ? slot(L) * 0.75 : gap(L.k, from)) * STEP);
    if (a < 0) next = clock + 0.4;
    light();
    read.textContent = a < 0 ? "rest" : `room ${a + 1} · ${held(a).length}`;
    B.wake();
  }

  bag.add(pointer(stage, { move: (p) => pick(hit(p)), leave: () => pick(-1) }));
  bag.add(() => svg.replaceChildren());
  B.wake();

  return {
    set: (v) => {
      fan = clamp(v, 0, 16);
      if (act >= 0) { const now = performance.now(); held(act).forEach((L) => aim(L, now, 0)); B.wake(); }
    },
    destroy: bag.dispose,
  };
}

export default {
  name: "pigeonholes",
  means: "A wall of mail cubbies, one per room: letters are posted in turn, and the cubby under the pointer fans its letters out.",
  rules: [1, 2, 5, 6, 7],
  range: [4, 9, 14],
  tour: [[156, 123], [201, 184], [247, 244], null],
  mount,
};
