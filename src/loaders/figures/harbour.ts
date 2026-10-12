// @ts-nocheck
// harbour: a Hairline figure, made with the hairline-create skill and checked with its look.mjs.
// It stays in the skill's format so it can be iterated there; only this header and the export differ.
import { HL } from "../kernel";
/**
 * Harbour: a quay with five boats moored stern-to along it, each a service in
 * the fleet, riding a swell that runs down the line. The swell comes in at an
 * angle, so its crest reaches the boats in turn: each heaves with the height
 * under it and pitches with the slope, and the one under the crest takes the
 * bright stroke, the service reporting now. The swell is ambient, a lap that
 * loops from the first frame. The pointer's place along the quay takes the
 * crest on a spring; when it leaves, the lap picks up from there. Under
 * reduced motion the swell holds part way along. The slider is its height.
 *
 * The pattern: a continuous field with an ambient clock. One spring on the
 * crest, a falloff by distance along the quay, and a hit test on a fixed plane
 * at the decks' rest height.
 */
const {
  Cam, clamp, facing, fillet, fit, flatDot, hull, mk, open, place, pointer, poly, prism, proj, put, rad,
  reducedMotion, register, rings, rrect, run, seg, solid, spring, stepS, unproj, disposer,
} = HL;

const N = 5, SP = 28, W = 16, F = 5, CH = 5, AMAX = 12, PITCH = rad(12), ROLL = rad(6);
/** How much of the swell's slope a hull takes along its length and across it: the swell comes in from the sea nearly bow-on, so pitch is most of it. */
const PK = 0.8, RK = 0.35;
const LAP = (N + 0.6) * SP, PERIOD = 4.2, KAPPA = 2.2, WRAP0 = -0.8 * SP, SPEED = LAP / PERIOD;
/** Where the crest holds at rest: just short of berth 3, so it is bright and its neighbours pitch either way. */
const REST = 2 * SP - 7;
/** Each boat's length and its mast's height above the deck: one class of boat, not one mould. */
const FLEET = [[42, 33], [38, 28], [44, 36], [40, 30], [42, 34]];
const QX0 = -W / 2 - 12, QX1 = (N - 1) * SP + W / 2 + 12, QY0 = -18, QZ = 9, GAP = 5, YB = GAP + 22;

const X = (i) => i * SP;
const wrap = (d) => ((((d + LAP / 2) % LAP) + LAP) % LAP) - LAP / 2;
/** The swell's height d along the quay from the crest, as a share: 1 under it, .29 a berth away, nearly 0 two away. Periodic in LAP, so the lap has no seam. */
const swell = (d) => Math.exp(KAPPA * (Math.cos((2 * Math.PI * d) / LAP) - 1));
const slope = (d) => (-swell(d) * KAPPA * Math.sin((2 * Math.PI * d) / LAP) * 2 * Math.PI) / LAP;

/** A hull's plan, bow to +y: a transom at the stern, widest just aft of the middle, tapering to the stem. */
const plan = (L, B, dy = 0) => fillet(
  [[-B * 0.36, -L / 2], [-B / 2, -L * 0.1], [-B * 0.42, L * 0.24], [0, L / 2], [B * 0.42, L * 0.24], [B / 2, -L * 0.1], [B * 0.36, -L / 2]],
  [2.5, 12, 12, 1.2, 12, 12, 2.5],
).map(([x, y]) => [x, y + dy]);
/** A closed outline as ring samples with outward normals, so run() keeps the side facing the camera. */
function asRing(pts) {
  const n = pts.length, s = Math.sign(pts.reduce((a, p, i) => a + p[0] * pts[(i + 1) % n][1] - pts[(i + 1) % n][0] * p[1], 0));
  return pts.map(([u, v], i) => {
    const a = pts[(i + n - 1) % n], b = pts[(i + 1) % n], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return { u, v, nu: (s * (b[1] - a[1])) / l, nv: (-s * (b[0] - a[0])) / l };
  });
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  const C = Cam(45, 0.5, 2.25);
  // Fitted to the most extreme pose: the quay, the bows, and a masthead at the top of the highest swell.
  const top = AMAX + F + 38, bows = YB + 28;
  fit(C, [[QX0, QY0, 0], [QX1, QY0, QZ], [QX0, bows, 0], [QX1, bows, 0], [QX0 + 10, YB - 10, top], [QX1 - 10, YB, top]], 200, 166);
  const P = proj(C), front = facing(C);
  let A = value;

  const g = mk("g", {}, svg);
  const [qr, qi] = rings(QX0, QY0, QX1, 0, 6, 1.8);
  put(solid(g), prism(P, front, qr, qi, 0, QZ));

  // Back to front, berth by berth along +x: the stern lines, then the hull, the cabin and the rig.
  const boats = FLEET.map(([L, mh], i) => {
    const x = X(i), dot = flatDot(g, C, 1.2, "dot off");
    place(dot, P(x, -2.6, QZ));
    return {
      x, L, mh, dot, line: mk("path", { class: "nf lo" }, g),
      foot: asRing(plan(L * 0.84, W * 0.74, -L * 0.05)), deck: asRing(plan(L, W)), inner: asRing(plan(L - 2.6, W - 2.6)),
      cabFoot: rrect(-4.4, -L * 0.3, 4.4, L * 0.02, 2.4, 4),
      cabTop: rrect(-3.4, -L * 0.3 + 1, 3.4, L * 0.02 - 3.5, 1.6, 4),
      cabIn: rrect(-2.4, -L * 0.3 + 2, 2.4, L * 0.02 - 4.5, 0.8, 4),
      hull: solid(g), cabin: solid(g), rig: mk("path", { class: "nf" }, g),
    };
  });

  /** Boat b heaved by h, pitched by tp (bow up is positive) and rolled by tr, about the middle of its waterline. */
  function drawBoat(b, h, tp, tr) {
    const cp = Math.cos(tp), sp = Math.sin(tp), cr = Math.cos(tr), sr = Math.sin(tr);
    const at = (u, v, w) => {
      const v1 = v * cp - w * sp, w1 = v * sp + w * cp;
      return P(b.x + u * cr - w1 * sr, YB + v1, h + u * sr + w1 * cr);
    };
    const ring = (r, w) => r.map((q) => at(q.u, q.v, w));
    put(b.hull, { sil: poly(hull(ring(b.foot, 0).concat(ring(b.deck, F)))), crease: open(ring(run(b.inner, front), F)) });
    put(b.cabin, { sil: poly(hull(ring(b.cabFoot, F).concat(ring(b.cabTop, F + CH)))), crease: open(ring(run(b.cabIn, front), F + CH)) });
    const mv = -b.L * 0.06, head = at(0, mv, F + b.mh), boom = F + CH + 3;
    b.rig.setAttribute("d", seg(at(0, mv, F + CH), head) + seg(head, at(0, b.L / 2 - 0.6, F + 0.4)) + seg(at(0, mv, boom), at(0, -b.L / 2 + 3, boom)));
    const bollard = P(b.x, -2.6, QZ);
    b.line.setAttribute("d", seg(bollard, at(-W * 0.3, -b.L / 2 + 1.5, F)) + seg(bollard, at(W * 0.3, -b.L / 2 + 1.5, F)));
  }

  let c = REST, held = false, lit = -1, drawn = "";
  const crest = spring(REST, { eps: 0.05 }), rate = spring(1);

  function draw() {
    const key = c + "," + A;
    if (key === drawn) return;
    drawn = key;
    for (const b of boats) {
      const s = A * slope(b.x - c);
      drawBoat(b, A * swell(b.x - c), clamp(Math.atan(-PK * s), -PITCH, PITCH), clamp(Math.atan(RK * s), -ROLL, ROLL));
    }
  }
  const nearest = (aim) => boats.reduce((m, b, i) => (Math.abs(wrap(b.x - aim)) < Math.abs(wrap(boats[m].x - aim)) ? i : m), 0);
  /** The bright boat: the one under the crest, read from the spring's target while the pointer holds it (rule 01). */
  function light() {
    const k = nearest(held ? crest.t : c);
    if (k === lit) return;
    lit = k;
    boats.forEach((b, i) => {
      for (const el of [b.hull.sil, b.cabin.sil, b.rig]) el.classList.toggle("hi", i === k);
      b.dot.classList.toggle("off", i !== k);
    });
  }

  const loop = register(stage, (dt) => {
    let moving = stepS(rate, dt);
    if (held || reducedMotion()) {
      if (!held) crest.t = REST;
      moving = stepS(crest, dt) || moving;
    } else {
      crest.x = WRAP0 + ((((crest.x + rate.x * SPEED * dt - WRAP0) % LAP) + LAP) % LAP);
      crest.t = crest.x; crest.v = 0; moving = true;
    }
    c = crest.x;
    draw(); light();
    return moving;
  });
  bag.add(loop.unregister);
  draw(); light();

  bag.add(pointer(stage, {
    move: (p) => {
      if (!held) { held = true; crest.x = c; crest.v = reducedMotion() ? 0 : rate.x * SPEED; }
      crest.t = clamp(unproj(C, p[0], p[1], F)[0], X(0), X(N - 1));
      read.textContent = `berth ${nearest(crest.t) + 1}`;
      loop.wake();
    },
    leave: () => { held = false; rate.x = 0; rate.t = 1; read.textContent = "rest"; loop.wake(); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { A = v; draw(); loop.wake(); },
    destroy: bag.dispose,
  };
}

export default {
  name: "harbour",
  means: "Boats moored at a quay ride a swell down the line; the pointer moves the crest, and the boat under it is the one reporting.",
  rules: [1, 3, 5, 7],
  range: [4, 8, 12],
  tour: [[142, 167], [276, 234], [187, 189], null],
  mount,
};
