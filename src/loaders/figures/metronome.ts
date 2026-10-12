// @ts-nocheck
// metronome: a Hairline figure, made with the hairline-create skill and checked with its look.mjs.
// It stays in the skill's format so it can be iterated there; only this header and the export differ.
import { HL } from "../kernel";
/**
 * Metronome: a pyramid metronome keeping time while the history loads. Its rod
 * pivots low in the recess of the front face and swings on an ambient loop,
 * easing at each end; under reduced motion it holds part-way through a swing.
 * The pointer's height, read on a fixed band along the rod's upright axis,
 * slides the weight on a spring, and the weight sets the tempo: the higher it
 * sits, the slower the swing. The slider is the swing, in degrees either side.
 *
 * The pattern: an ambient loop. A phase integrated from the tempo, so changing
 * it never jumps; springs for the weight and the swing; a hit test on a band
 * that never moves, so the swinging rod cannot pull the choice around.
 */
const {
  Cam, clamp, facing, fillet, fit, hull, open, poly, proj, rad, ringAt, rings, rrect, run, seg,
  spring, stepS, reducedMotion, disposer, mk, place, pointer, prism, put, register, solid,
} = HL;

const BW = 32, BD = 28, TW = 11, TD = 9, Z0 = 7, H = 122, PB = 4, MAX = 34;
const FL = Math.hypot(BD - TD, H), FY = (TD - BD) / FL, FZ = H / FL;
const RW = 6.5, T0 = 9, T1 = 114, TP = 18, L = 98, OFF = 2.4, LO = 0.38, HI = 0.94, HALF = 64;
const SLOW = 40, FAST = 208, REST = 96;
/** The tempo with the weight at w, 0 at the bottom of its travel and 1 at the top: Maelzel's 208 down to 40. */
const bpm = (w) => FAST * (SLOW / FAST) ** w;
const W0 = Math.log(REST / FAST) / Math.log(SLOW / FAST);
/** The held pose: 62% of the way out to the left end, on the way back. */
const PHASE0 = -Math.asin(0.62);
const WEIGHT = fillet([[-8, -5.5], [8, -5.5], [5.5, 5.5], [-5.5, 5.5]], [2.2, 2.2, 1.6, 1.6], 3);

/** A world point on the front face: u across it, t up its slope from the foot, n out of it. */
const face = (u, t, n = 0) => [u, BD + t * FY + n * FZ, Z0 + t * FZ - n * FY];
/** A world point in the rod's plane, the rod at angle th: a across it, s along it from the pivot. */
const onRod = (th, a, s, n) => face(a * Math.cos(th) + s * Math.sin(th), TP + s * Math.cos(th) - a * Math.sin(th), n);

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  const C = Cam(45, 0.5, 1.8);
  fit(C, [
    [-BW - PB, -BD - PB, 0], [BW + PB, BD + PB, 0], [BW + PB, -BD - PB, 0], [-BW - PB, BD + PB, 0], [0, 0, Z0 + H],
    onRod(rad(-MAX), -9, L, OFF), onRod(rad(MAX), 9, L, OFF),
  ], 200, 166);
  const P = proj(C), front = facing(C), Pw = (w) => P(w[0], w[1], w[2]);
  const onFace = (ring, n = 0) => ring.map((q) => Pw(face(q.u, q.v, n)));

  const g = mk("g", {}, svg);
  const [pr, pi] = rings(-BW - PB, -BD - PB, BW + PB, BD + PB, 7, 1.4);
  put(solid(g), prism(P, front, pr, pi, 0, Z0));
  // The body tapers: its silhouette is the hull of its foot and its smaller top, its crease the top's near edge.
  const foot = rrect(-BW, -BD, BW, BD, 6, 6), top = rrect(-TW, -TD, TW, TD, 3, 6), inner = rrect(-TW + 1.4, -TD + 1.4, TW - 1.4, TD - 1.4, 1.6, 6);
  put(solid(g), {
    sil: poly(hull(ringAt(P, foot, Z0).concat(ringAt(P, top, Z0 + H)))),
    crease: open(ringAt(P, run(inner, front), Z0 + H)),
  });
  // the recess in the front face, its floor's edge, and the scale set into it along the weight's travel
  mk("path", { d: poly(onFace(rrect(-RW, T0, RW, T1, 3, 4))), class: "nf" }, g);
  mk("path", { d: poly(onFace(rrect(-RW + 1.3, T0 + 1.3, RW - 1.3, T1 - 1.3, 1.8, 4))), class: "nf lo" }, g);
  const marks = [];
  for (let k = 0; k <= 6; k++) {
    const t = TP + (LO + (k / 6) * (HI - LO)) * L, h = k % 3 ? 2.2 : 3.6;
    marks.push(seg(Pw(face(-h, t)), Pw(face(h, t))));
  }
  mk("path", { d: marks.join(""), class: "nf lo" }, g);

  const rod = mk("path", { class: "nf sil" }, g);
  const hub = mk("circle", { r: 1.8, class: "dot m" }, g);
  place(hub, Pw(face(0, TP, OFF)));
  const back = mk("path", { class: "lo" }, g), plate = mk("path", { class: "sil hi" }, g);

  const amp = spring(value), wt = spring(W0);
  let phase = PHASE0, drawn = "";
  function draw() {
    const th = rad(amp.x * Math.sin(phase)), s = (LO + wt.x * (HI - LO)) * L, key = th.toFixed(4) + "," + s.toFixed(3);
    if (key === drawn) return;
    drawn = key;
    rod.setAttribute("d", open([Pw(onRod(th, 0, -3, OFF)), Pw(onRod(th, 0, L, OFF))]));
    const at = (n) => poly(WEIGHT.map(([a, b]) => Pw(onRod(th, a, s + b, n))));
    back.setAttribute("d", at(OFF - 1.6));
    plate.setAttribute("d", at(OFF + 2));
  }
  draw();

  // The phase advances by the tempo the weight is at now, so a change of tempo bends the swing and never jumps it.
  const B = register(stage, (dt) => {
    const moving = [stepS(wt, dt), stepS(amp, dt)].some(Boolean), held = reducedMotion();
    phase = held ? PHASE0 : (phase + ((Math.PI * bpm(wt.x)) / 60) * Math.min(dt, 0.05)) % (2 * Math.PI);
    draw();
    return moving || !held;
  });
  bag.add(B.unregister);
  B.wake();

  // The band: the rod's upright axis on screen, fixed at mount, with HALF either side of it.
  const a0 = Pw(onRod(0, 0, 0, OFF)), a1 = Pw(onRod(0, 0, L, OFF)), ax = [a1[0] - a0[0], a1[1] - a0[1]], len = Math.hypot(ax[0], ax[1]);
  /** How far up the band the pointer is, 0 at the pivot and 1 at the rod's tip; null off the band. */
  function along([x, y]) {
    const qx = x - a0[0], qy = y - a0[1], s = (qx * ax[0] + qy * ax[1]) / (len * len);
    return Math.abs(qx * ax[1] - qy * ax[0]) / len <= HALF && s >= -0.08 && s <= 1.15 ? s : null;
  }
  function aim(s) {
    wt.t = s === null ? W0 : clamp((s - LO) / (HI - LO), 0, 1);
    read.textContent = s === null ? "rest" : `${Math.round(bpm(wt.t))} bpm`;
    B.wake();
  }

  bag.add(pointer(stage, { move: (p) => aim(along(p)), leave: () => aim(null) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { amp.t = v; B.wake(); },
    destroy: bag.dispose,
  };
}

export default {
  name: "metronome",
  means: "A metronome keeps time: the pointer slides the weight along the rod, and the higher it sits, the slower the swing.",
  rules: [1, 5, 7, 9],
  range: [14, 24, 34],
  tour: [[188, 81], [180, 153], [184, 129], null],
  mount,
};
