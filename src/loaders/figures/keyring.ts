// @ts-nocheck
// keyring: a Hairline figure, made with the hairline-create skill and checked with its look.mjs.
// It stays in the skill's format so it can be iterated there; only this header and the export differ.
import { HL } from "../kernel";
import type { LoaderFigure } from "../loader";
/**
 * Keyring: a split ring of wire threaded through six solid keys. The bright goes round: each key in turn gives a quarter
 * turn on the wire, teeth up, as if tried in its app's lock, and its neighbours slide apart. The pointer picks a key and
 * the round waits until it leaves; reduced motion holds the rest pose. The slider is the stagger, in ms. The wire meets
 * every hole at the hole's height: over a flat bow on its near side, under it on the far side, straight through a turned one.
 */
const {
  Cam, clamp, fillet, fit, hull, lerp, open, poly, proj, rad, seg, unproj,
  tdone, tset, tval, tween, disposer, mk, pointer, reducedMotion, register,
} = HL;

const N = 6, RR = 28, D = 2.2, TK = 3, ZC = D + TK / 2, HB = 4.2, HOLE = 3.2, W1 = 19, W2 = 11;
const PART = [0, 9, 4, 0], STEP = 750, REST = 0, S = 2.35;
// each key: bow half-height, bow half-length, bow squareness (2 round, 6 square), blade length, cut depths tip to shoulder
const KEYS = [
  [8.6, 9.4, 2, 24, [2, 4, 1, 3, 2]], [8, 8.6, 4.5, 21, [3, 1, 4, 2]], [8.8, 8, 2.4, 23, [1, 3, 2, 4, 1]],
  [7.8, 9.6, 2, 20, [4, 2, 3, 1]], [7.6, 9, 6, 25, [2, 2, 4, 1, 3]], [8.4, 8.4, 3, 22, [3, 4, 1, 2]],
];
const BASE = [0, 4, -3, 2, -4, 3].map((j, k) => -45 + k * 60 + j);
const HOLE_RING = Array.from({ length: 16 }, (_, i) => [HOLE * Math.cos(i * Math.PI / 8), HOLE * Math.sin(i * Math.PI / 8)]);
/** How near the viewer a point at th degrees round the ring lies, -1 to 1. */
const near = (th) => Math.sin(rad(th + 45));
/** 1 within W1 degrees of a hole, easing to 0 over the next W2: how much of a hole's height the wire still carries. */
const carry = (x) => { const t = clamp((x - W1) / W2, 0, 1); return 1 - t * t * (3 - 2 * t); };

/** Key k's outline in its own plane: u runs out along the blade from the hole, v across it, +v the bitting side. */
function profile([bw, hl, p, len, cuts]) {
  const ub = 2 * hl - 5.2, s = ub + 2.6, e = s + len, pts = [], rs = [];
  const at = (u, v, r) => { pts.push([u, v]); rs.push(r); };
  at(ub - 1, -5, 0.9); at(s, -5, 0.6); at(s, -HB, 0.5); at(e - 3, -HB, 1.2); at(e, -1.2, 0.8); at(e, 1.2, 0.8); at(e - 4, HB, 0.6);
  const pitch = (len - 7) / cuts.length;
  cuts.forEach((c, j) => { const uc = e - 5.5 - (j + 0.5) * pitch; at(uc + 1.2, HB, 0.3); at(uc, HB - 0.6 * c, 0.4); at(uc - 1.2, HB, 0.3); });
  at(s + 1, HB, 0.4); at(s, 5.8, 0.5); at(ub - 1, 5.8, 0.9);
  // the bow: a superellipse round the hole, from where the neck leaves it on top, round the far end, back to the neck
  const sp = (x) => Math.sign(x) * Math.abs(x) ** (2 / p);
  for (let f = 0.75; f < 2 * Math.PI - 0.74; f += (2 * Math.PI - 1.5) / 14) at(hl - 5.2 + hl * sp(Math.cos(f)), bw * sp(Math.sin(f)), 0.2);
  // the outline's points from the tip's taper back along the bitting and the shoulder to the bow: one straight edge
  return { shape: fillet(pts, rs, 3), s, e, top: [24, 4 * (9 + 3 * cuts.length) + 3] };
}

/** A key at th degrees round the ring, turned tw of a quarter about its blade through the hole's middle (key.m: teeth up,
 *  face to the viewer) and swung key.yaw on its hole: its top face on screen and o, the step from that face to its foot. */
function pose(P, key, th, tw) {
  const y = rad(th + key.yaw * tw), dx = Math.cos(y), dy = Math.sin(y), f = rad(90 * tw * key.m), cf = Math.cos(f), sf = Math.sin(f);
  const w = (u, v, h = TK / 2) => {
    const a = key.m * v * cf - h * sf;
    return P(RR * Math.cos(rad(th)) + u * dx - a * dy, RR * Math.sin(rad(th)) + u * dy + a * dx, ZC + key.m * v * sf + h * cf);
  };
  const on = (pts) => pts.map(([u, v]) => w(u, v)), c = w(0, 0), b = w(0, 0, -TK / 2), u = w(1, 0);
  return { face: on(key.shape), hole: poly(on(HOLE_RING)), o: [b[0] - c[0], b[1] - c[1]], along: [c[0] - u[0], c[1] - u[1]], groove: seg(w(key.s + 2, -1.4), w(key.e - 5, -1.4)) };
}

/** A plate from its top contour on screen and o, the step to its foot: the silhouette, the crease where the top meets
 *  a side the viewer sees, and with `seam` a line halfway down those sides. A side shows by the outline's run over K
 *  points either way, and the edges in `top` by `along`, so a bitting's cuts show or hide with the blade's edge. */
function slab(c, o, { seam, K = 1, top = [-1, -1], along } = {}) {
  const n = c.length, sh = (p, k) => [p[0] + o[0] * k, p[1] + o[1] * k];
  let A = 0, run = null;
  c.forEach((p, i) => { const q = c[(i + 1) % n]; A += p[0] * q[1] - q[0] * p[1]; });
  const shows = (i) => {
    const p = c[(i - K + 1 + n) % n], q = c[(i + K) % n], [ex, ey] = i >= top[0] && i <= top[1] ? along : [q[0] - p[0], q[1] - p[1]];
    return (ex * o[1] - ey * o[0]) * A < 0;
  };
  // a side that shows for fewer than eight edges in a row (a shoulder step, a fillet) takes its neighbours' side
  const raw = c.map((_, i) => shows(i)), vis = raw.map((_, i) => Array.from({ length: 15 }, (_, j) => raw[(i + j - 7 + n) % n]).filter(Boolean).length > 7);
  const i0 = Math.max(0, vis.indexOf(false)), sil = [], runs = [];
  for (let k = 0; k < n; k++) {
    const i = (i0 + k) % n, p = c[i], q = c[(i + 1) % n];
    if (!vis[i]) { sil.push(p, q); run = null; continue; }
    sil.push(sh(p, 1), sh(q, 1));
    if (!run) runs.push((run = [p]));
    run.push(q);
  }
  // where a concave corner or a cut makes the foot's outline cross the top's, the outline cuts across the small loop
  const out = [];
  for (let i = 0; i < sil.length; i++) {
    out.push(sil[i]);
    for (let j = i + 2; j < Math.min(sil.length - 1, i + 24); j++) {
      const x = meet(sil[i], sil[i + 1], sil[j], sil[j + 1]);
      if (x) { out.push(x); i = j; break; }
    }
  }
  const lines = runs.map(open).join("") + (seam ? runs.map((r) => open(r.map((p) => sh(p, 0.5)))).join("") : "");
  return { sil: poly(out), lines };
}

/** Where segments ab and cd cross, or null. */
function meet(a, b, c, d) {
  const r = [b[0] - a[0], b[1] - a[1]], s = [d[0] - c[0], d[1] - c[1]], den = r[0] * s[1] - r[1] * s[0], e = [c[0] - a[0], c[1] - a[1]], t = (e[0] * s[1] - e[1] * s[0]) / den, u = (e[0] * r[1] - e[1] * r[0]) / den;
  return den && t > 0 && t < 1 && u > 0 && u < 1 ? [a[0] + t * r[0], a[1] + t * r[1]] : null;
}

/** Signed steps round the ring from key a to key i, -2 to 3. */
const steps = (i, a) => { const d = (((i - a) % N) + N) % N; return d > N / 2 ? d - N : d; };
/** Where key i rests while key a is tried: pushed along the ring away from a, the nearest most. */
const parted = (i, a) => BASE[i] + Math.sign(steps(i, a)) * PART[Math.abs(steps(i, a))];
/** Whether a screen point lies in a convex hull. */
const inside = (h, x, y) => new Set(h.map((p, i) => { const q = h[(i + 1) % h.length]; return Math.sign((q[0] - p[0]) * (y - p[1]) - (q[1] - p[1]) * (x - p[0])) || 0; }).filter(Boolean)).size < 2;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;

  // fitted to the longest flat keys and a key turned at the very back, so no pose of the round leaves the frame
  const C = Cam(45, 0.5, S), F = 70 * Math.SQRT1_2, B2 = 34 * Math.SQRT1_2;
  fit(C, [[F, -F, 0], [-F, F, 0], [F, F, -TK], [-F, -F, 0], [-B2, -B2, ZC + 10]], 200, 166);
  const P = proj(C), g = mk("g", {}, svg), z0 = P(0, 0, 0), z1 = P(0, 0, D), drop = [z0[0] - z1[0], z0[1] - z1[1]];

  const keys = KEYS.map((spec, k) => {
    const key = profile(spec), view = (((BASE[k] - 45) % 180) + 180) % 180;   // 0 points the blade at the viewer, 90 shows its face
    key.m = Math.sin(rad(BASE[k])) > Math.cos(rad(BASE[k])) ? 1 : -1; key.yaw = (view < 90 ? 60 : 120) - view;
    key.tw = tween(k === REST ? 1 : 0); key.th = tween(parted(k, REST));
    key.depth = near(BASE[k]); key.reach = hull(pose(P, key, BASE[k], 1).face);
    return key;
  });
  // the wire in six pieces, hole to hole; a piece is on a key's near side when it leaves the hole the way its face turns
  const pieces = BASE.map((th, k) => ({ a: k, b: (k + 1) % N, na: keys[k].m < 0, nb: keys[(k + 1) % N].m > 0, depth: near((th + BASE[(k + 1) % N] + (k === N - 1 ? 360 : 0)) / 2) }));
  const items = [...keys, ...pieces].sort((p, q) => p.depth - q.depth);
  for (const it of items) {
    const grp = mk("g", {}, g);
    it.drawn = ""; it.sil = mk("path", { class: "sil" }, grp); it.lines = mk("path", { class: "nf lo" }, grp);
    if (it.shape) { it.hole = mk("path", { class: "nf" }, grp); it.groove = mk("path", { class: "nf lo" }, grp); }
  }
  keys[REST].sil.classList.add("hi");

  /** The wire's underside at a hole: on a flat bow's top on its near side, the ground on its far side, the hole's middle once turned. */ const lift = (tw, nearSide) => lerp(nearSide ? D + TK : 0, ZC - D / 2, tw);
  /** A piece's top outline from hole angle A to B, outer edge out and inner edge back, each point at the wire's height
   *  there: each hole's height carried a little way out, and no lower between than the lower of the two. */
  function wire(A, B, hA, hB) {
    const edge = (R, a0, a1) => Array.from({ length: 41 }, (_, i) => a0 + ((a1 - a0) * i) / 40).map((a) => P(R * Math.cos(rad(a)), R * Math.sin(rad(a)), D + Math.max(hA * carry(a - A), hB * carry(B - a), Math.min(hA, hB))));
    return edge(RR + D / 2, A, B).concat(edge(RR - D / 2, B, A));
  }
  function draw(it, now) {
    const ka = keys[it.a], kb = keys[it.b];
    const at = it.shape ? [tval(it.th, now), tval(it.tw, now)] : [tval(ka.th, now), tval(kb.th, now) + (it.b ? 0 : 360), tval(ka.tw, now), tval(kb.tw, now)];
    const id = at.map((v) => v.toFixed(3)).join(",");
    if (id === it.drawn) return;
    it.drawn = id;
    const q = it.shape && pose(P, it, at[0], at[1]);
    const s = q ? slab(q.face, q.o, { K: 6, top: it.top, along: q.along }) : slab(wire(at[0], at[1], lift(at[2], it.na), lift(at[3], it.nb)), drop, { seam: true });
    it.sil.setAttribute("d", s.sil); it.lines.setAttribute("d", s.lines);
    if (q) { it.hole.setAttribute("d", q.hole); it.groove.setAttribute("d", q.groove); }
  }

  let act = REST, over = -1, next = 0;
  /** Tries key a: it turns and takes the bright; the rest part along the ring, staggered by their steps from it. */
  function choose(a, now) {
    if (a === act) return;
    act = a;
    keys.forEach((key, i) => {
      const delay = Math.abs(steps(i, a)) * stag;
      tset(key.tw, i === a ? 1 : 0, now, delay); tset(key.th, parted(i, a), now, delay);
      key.sil.classList.toggle("hi", i === a);
    });
  }

  // the round: while the pointer is off the keys the bright moves on every STEP; under reduced motion it holds the rest pose
  const B = register(stage, (_dt, now) => {
    const still = reducedMotion();
    if (over < 0 && still) choose(REST, now);
    else if (over < 0 && now >= next) { next = now + STEP; choose((act + 1) % N, now); }
    let moving = over < 0 && !still;
    keys.forEach((key) => { if (!tdone(key.tw, now) || !tdone(key.th, now)) moving = true; });
    items.forEach((it) => draw(it, now));
    return moving;
  });
  bag.add(B.unregister);

  /** The key under a viewBox point: the one tried while the point is on its turned pose, else the nearest resting angle round the ring; -1 off the keys. */
  function hit([sx, sy]) {
    if (inside(keys[act].reach, sx, sy)) return act;
    const [x, y] = unproj(C, sx, sy, ZC), r = Math.hypot(x, y), ang = Math.atan2(y, x) / rad(1);
    const gap = (k) => Math.abs(((((ang - BASE[k]) % 360) + 540) % 360) - 180);
    return r < RR - 4 || r > RR + 46 ? -1 : BASE.reduce((b, _, k) => (gap(k) < gap(b) ? k : b), 0);
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

  return { set: (v) => { stag = v; }, destroy: bag.dispose };
}

export default {
  name: "keyring", rules: [1, 2, 5, 7], range: [0, 45, 90], tour: [[150, 208], [260, 113], [310, 159], null], mount,
  means: "One ring holds a key for every app: the bright goes round as each is tried, and the key under the pointer turns.",
} satisfies LoaderFigure;
