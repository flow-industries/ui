// @ts-nocheck
// keyring: a Hairline figure, made with the hairline-create skill and checked with its look.mjs.
// It stays in the skill's format so it can be iterated there; only this header and the typed export differ.
import { HL } from "../kernel";
import type { LoaderFigure } from "../loader";
/**
 * Keyring: a split ring lying flat, holding six keys. Each key is a real one:
 * a bow of its own shape with the ring through its hole, a shoulder stop, and
 * a blade with its own bitting, so no two are alike. On its own the bright goes
 * round the ring: each key in turn turns a quarter on the wire, teeth up, as if
 * tried in its app's lock, and its neighbours slide apart. The pointer picks a
 * key by its resting angle round the ring; it turns bright, its neighbours
 * part, staggered by their distance from it, and the round waits until the
 * pointer is off the keys. Under reduced motion the round holds its rest pose,
 * the first key turned. The slider is the stagger, in ms.
 */
const {
  Cam, circ, facing, fillet, fit, hull, open, poly, prism, proj, put, rad, ringAt, run, seg, solid, unproj,
  tdone, tset, tval, tween, disposer, mk, pointer, reducedMotion, register,
} = HL;

const N = 6, RR = 26, RO = 27.9, RI = 24.1, ZR = 3, ZK = 3.4, TK = 1.5, HB = 4.2, HOLE = 2.6;
const PART = [0, 9, 4, 0], STEP = 750, REST = 0, SPLIT = 105, S = 2.4;
// each key: bow half-height, bow half-length, bow squareness (2 round, 6 square), blade length, cut depths tip to shoulder
const KEYS = [
  [9.4, 9.4, 2, 24, [2, 4, 1, 3, 2]],
  [8.4, 8.6, 4.5, 21, [3, 1, 4, 2]],
  [10, 8, 2.4, 23, [1, 3, 2, 4, 1]],
  [8.2, 9.6, 2, 20, [4, 2, 3, 1]],
  [8, 9, 6, 25, [2, 2, 4, 1, 3]],
  [9, 8.4, 3, 22, [3, 4, 1, 2]],
];
const JIT = [0, 4, -3, 2, -4, 3];
const BASE = KEYS.map((_, k) => -45 + k * 60 + JIT[k]);
const HOLE_RING = Array.from({ length: 16 }, (_, i) => [HOLE * Math.cos(-i * Math.PI / 8), HOLE * Math.sin(-i * Math.PI / 8)]);

/** Key k's outline in its own plane: u runs out along the blade from the hole, v across it, +v the bitting side. */
function profile([bw, hl, p, len, cuts]) {
  const ub = 2 * hl - 4.6, s = ub + 2.6, e = s + len, pts = [], rs = [];
  const at = (u, v, r) => { pts.push([u, v]); rs.push(r); };
  at(ub - 1, -5, 0.9); at(s, -5, 0.6); at(s, -HB, 0.5); at(e - 3, -HB, 1.2); at(e, -1.2, 0.8); at(e, 1.2, 0.8); at(e - 4, HB, 0.6);
  const pitch = (len - 7) / cuts.length;
  cuts.forEach((c, j) => {
    const uc = e - 5.5 - (j + 0.5) * pitch;
    at(uc + 1.2, HB, 0.3); at(uc, HB - 0.6 * c, 0.4); at(uc - 1.2, HB, 0.3);
  });
  at(s + 1, HB, 0.4); at(s, 5.8, 0.5); at(ub - 1, 5.8, 0.9);
  // the bow: a superellipse round the hole, from where the neck leaves it on top, round the far end, back to the neck
  const sp = (x) => Math.sign(x) * Math.abs(x) ** (2 / p);
  for (let i = 0; i <= 14; i++) {
    const f = 0.75 + (i / 14) * (2 * Math.PI - 1.5);
    at(hl - 4.6 + hl * sp(Math.cos(f)), bw * sp(Math.sin(f)), 0.2);
  }
  return { shape: fillet(pts, rs, 3), s, e };
}

/**
 * A key at th degrees round the ring, turned tw of a quarter about its own blade, the wire through its hole:
 * its paths and its face's points. It turns the way that brings its teeth up and its face to the viewer (key.m).
 */
function pose(P, key, th, tw) {
  const dx = Math.cos(rad(th)), dy = Math.sin(rad(th)), f = rad(90 * tw * key.m), cf = Math.cos(f), sf = Math.sin(f);
  const w = (u, v, h = 0) => {
    const r = RR + u, a = key.m * v * cf - h * sf;
    return P(r * dx - a * dy, r * dy + a * dx, ZK + key.m * v * sf + h * cf);
  };
  const on = (pts, h) => poly(pts.map(([u, v]) => w(u, v, h)));
  return {
    back: on(key.shape, -TK) + on(HOLE_RING, -TK),
    face: on(key.shape, 0) + on(HOLE_RING, 0),
    groove: seg(w(key.s + 2, -1.4), w(key.e - 5, -1.4)),
    pts: key.shape.map(([u, v]) => w(u, v)),
  };
}

/** Signed steps round the ring from key a to key i, -2 to 3. */
const steps = (i, a) => { const d = (((i - a) % N) + N) % N; return d > N / 2 ? d - N : d; };
/** Where key i rests while key a is tried: pushed along the ring away from a, the nearest most. */
const parted = (i, a) => BASE[i] + Math.sign(steps(i, a)) * PART[Math.abs(steps(i, a))];
/** Whether a screen point lies in a convex hull. */
function inside(h, x, y) {
  let pos = 0, neg = 0;
  h.forEach((p, i) => {
    const q = h[(i + 1) % h.length], c = (q[0] - p[0]) * (y - p[1]) - (q[1] - p[1]) * (x - p[0]);
    if (c > 0) pos++; else if (c < 0) neg++;
  });
  return !pos || !neg;
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;

  // fitted to the longest flat keys and a key turned at the very back, so no pose of the round leaves the frame
  const C = Cam(45, 0.5, S), F = 68 * Math.SQRT1_2, B2 = 34 * Math.SQRT1_2;
  fit(C, [[F, -F, 0], [-F, F, 0], [F, F, 0], [-F, -F, 0], [-B2, -B2, ZK + 10]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  // the ring, under every bow: two coils of flat wire, the seam between them and the step where the top one ends
  const outer = circ(RO, 56), inner = circ(RI, 56);
  put(solid(g), prism(P, front, outer, circ(RO - 0.7, 56), 0, ZR));
  mk("path", { d: open(ringAt(P, run(inner, (q) => !front(q)), 0)), class: "nf lo" }, g);
  mk("path", { d: poly(ringAt(P, inner, ZR)), class: "nf" }, g);
  const cs = Math.cos(rad(SPLIT)), sn = Math.sin(rad(SPLIT));
  mk("path", { d: open(ringAt(P, run(outer, front), ZR / 2)) + seg(P(RI * cs, RI * sn, ZR), P(RO * cs, RO * sn, ZR)), class: "nf lo" }, g);

  // the keys, appended far to near
  const keys = [];
  const depth = (k) => Math.cos(rad(BASE[k])) + Math.sin(rad(BASE[k]));
  for (const k of KEYS.map((_, k) => k).sort((a, b) => depth(a) - depth(b))) {
    const key = profile(KEYS[k]), grp = mk("g", {}, g);
    key.m = Math.sin(rad(BASE[k])) > Math.cos(rad(BASE[k])) ? 1 : -1;
    key.back = mk("path", { class: "lo" }, grp);
    key.face = mk("path", { class: "sil" + (k === REST ? " hi" : "") }, grp);
    key.groove = mk("path", { class: "nf lo" }, grp);
    key.tw = tween(k === REST ? 1 : 0);
    key.th = tween(parted(k, REST));
    key.drawn = "";
    key.reach = hull(pose(P, key, BASE[k], 1).pts);
    keys[k] = key;
  }

  function draw(key, now) {
    const th = tval(key.th, now), tw = tval(key.tw, now), at = th.toFixed(2) + "," + tw.toFixed(3);
    if (at === key.drawn) return;
    key.drawn = at;
    const q = pose(P, key, th, tw);
    key.back.setAttribute("d", q.back);
    key.face.setAttribute("d", q.face);
    key.groove.setAttribute("d", q.groove);
  }

  let act = REST, over = -1, next = 0;
  /** Tries key a: it turns and takes the bright; the rest part along the ring, staggered by their steps from it. */
  function choose(a, now) {
    if (a === act) return;
    act = a;
    keys.forEach((key, i) => {
      const delay = Math.abs(steps(i, a)) * stag;
      tset(key.tw, i === a ? 1 : 0, now, delay);
      tset(key.th, parted(i, a), now, delay);
      key.face.classList.toggle("hi", i === a);
    });
  }

  // the round: while the pointer is off the keys the bright moves on every STEP; under reduced motion it holds the rest pose
  const B = register(stage, (_dt, now) => {
    const still = reducedMotion();
    if (over < 0 && still) choose(REST, now);
    else if (over < 0 && now >= next) { next = now + STEP; choose((act + 1) % N, now); }
    let moving = over < 0 && !still;
    keys.forEach((key) => { draw(key, now); if (!tdone(key.tw, now) || !tdone(key.th, now)) moving = true; });
    return moving;
  });
  bag.add(B.unregister);

  /** The key under a viewBox point: the one tried while the point is on its turned pose, else the nearest resting angle round the ring; -1 off the keys. */
  function hit([sx, sy]) {
    if (inside(keys[act].reach, sx, sy)) return act;
    const [x, y] = unproj(C, sx, sy, ZK), r = Math.hypot(x, y);
    if (r < RI - 2 || r > RR + 46) return -1;
    const ang = Math.atan2(y, x) / rad(1);
    let best = -1, bd = 360;
    BASE.forEach((th, k) => { const d = Math.abs(((((ang - th) % 360) + 540) % 360) - 180); if (d < bd) { bd = d; best = k; } });
    return best;
  }

  function aim(k) {
    const now = performance.now();
    if (k < 0 && over >= 0) next = now + STEP;
    over = k;
    if (k >= 0) choose(k, now);
    read.textContent = k < 0 ? "rest" : "key " + (k + 1);
    B.wake();
  }

  bag.add(pointer(stage, { move: (p) => aim(hit(p)), leave: () => aim(-1) }));
  bag.add(() => svg.replaceChildren());
  B.wake();

  return {
    set: (v) => { stag = v; },
    destroy: bag.dispose,
  };
}

export default {
  name: "keyring",
  means: "One ring holds a key for every app: the bright goes round as each is tried, and the key under the pointer turns.",
  rules: [1, 2, 5, 7],
  range: [0, 45, 90],
  tour: [[150, 208], [260, 113], [310, 159], null],
  mount,
} satisfies LoaderFigure;
