// @ts-nocheck
// lighthouse: a Hairline figure, made with the hairline-create skill and checked with its look.mjs.
// It stays in the skill's format so it can be iterated there; only this header and the typed export differ.
import { HL } from "../kernel";
import type { LoaderFigure } from "../loader";
/**
 * Lighthouse: a tapering tower on a rock, with a gallery and its rail, a
 * glazed lantern and a roof. Its beam, a thin plate at the lamp's height,
 * sweeps a full turn every five seconds on its own. Under the pointer it turns
 * on a spring to face it and takes the bright stroke; when the pointer leaves,
 * the sweep picks up again from there on a spring on its rate. The pointer is
 * unprojected onto the lamp's own plane, which never moves, and the bearing is
 * read from there. At rest under reduced motion the beam holds at bearing 120,
 * out toward the viewer's right, and the lamp is the bright mark. The slider
 * is the beam's reach.
 *
 * The pattern: an ambient loop that yields to a continuous answer.
 */
const {
  Cam, circ, facing, fillet, fit, hull, open, poly, proj, rad, ringAt, rrect, run, seg, unproj,
  spring, stepS, reducedMotion, mk, place, pointer, prism, put, register, disposer, solid,
} = HL;

const REACH = 70, REST = 120, TURN = 360 / 5;
const H = 100, RF = 16, RT = 10.5, DECK = 15.5, RAIL = 14.8, GLASS = 8.2, ZL = 112;
const Z_DECK = H + 3.5, Z_RAIL = Z_DECK + 6, Z_ROOF = 119, ROCK_Z = -14;
const W0 = 2.8, SPREAD = 0.22;
/** The rock's outline, as [degrees, radius] corners round its centre. */
const ROCK = [[0, 27], [52, 31], [104, 25], [150, 30], [198, 27], [252, 29], [306, 24]];

/** The ground direction of a bearing: 0 runs away from the viewer, 90 to the right, 180 toward the viewer. */
const dir = (b) => { const c = Math.cos(rad(b)), s = Math.sin(rad(b)); return [(s - c) / Math.SQRT2, (-s - c) / Math.SQRT2]; };
const bearing = (x, y) => ((Math.atan2(x - y, -(x + y)) * 180) / Math.PI + 360) % 360;
const wrap = (d) => ((((d + 180) % 360) + 360) % 360) - 180;

/** A closed convex outline as a ring of samples with outward normals, for prism, ringAt and run. */
function ringOf(pts) {
  const n = pts.length, cx = pts.reduce((a, p) => a + p[0], 0) / n, cy = pts.reduce((a, p) => a + p[1], 0) / n;
  return pts.map((p, i) => {
    const a = pts[(i + n - 1) % n], b = pts[(i + 1) % n];
    const nu = b[1] - a[1], nv = a[0] - b[0], l = Math.hypot(nu, nv) || 1;
    const s = nu * (p[0] - cx) + nv * (p[1] - cy) < 0 ? -l : l;
    return { u: p[0], v: p[1], nu: nu / s, nv: nv / s };
  });
}

const rockAt = (k, dx, dy) =>
  ringOf(fillet(ROCK.map(([a, r]) => [dx + k * r * Math.cos(rad(a)), dy + k * r * Math.sin(rad(a))]), ROCK.map(() => 7 * k), 5));

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  const C = Cam(45, 0.5, 1.75);
  const reach = REACH + 1, ext = [[0, 0, 138]];
  for (let i = 0; i < 16; i++) { const [dx, dy] = dir(i * 22.5); ext.push([dx * reach, dy * reach, ZL + 1]); }
  rockAt(1, 0, 0).forEach((q) => ext.push([q.u, q.v, ROCK_Z]));
  fit(C, ext, 200, 163);
  const P = proj(C), front = facing(C);
  let L = value;

  /** A solid whose top is smaller than its foot: the hull of both rings, and the top's inset ring as the crease. */
  const taper = (parent, foot, top, inner, z0, z1) =>
    put(solid(parent), { sil: poly(hull(ringAt(P, foot, z0).concat(ringAt(P, top, z1)))), crease: open(ringAt(P, run(inner, front), z1)) });
  /** A point on the tower's face, s across from the line facing bearing b, at height z. */
  const onTower = (b, s, z) => {
    const [dx, dy] = dir(b), R = RF + ((RT - RF) * z) / H, c = Math.sqrt(R * R - s * s);
    return P(dx * c - dy * s, dy * c + dx * s, z);
  };

  const g = mk("g", {}, svg);
  taper(g, rockAt(1, 0, 0), rockAt(0.84, 0, 0), rockAt(0.78, 0, 0), ROCK_Z, 0);
  taper(g, rockAt(0.34, -4, 36), rockAt(0.26, -4, 36), rockAt(0.21, -4, 36), ROCK_Z, -7);
  taper(g, circ(RF, 48), circ(RT, 48), circ(RT - 1, 48), 0, H);
  const door = [[-3.4, 0], [-3.4, 8.6]];
  for (let k = 0; k <= 8; k++) door.push([-3.4 * Math.cos((k * Math.PI) / 8), 8.6 + 3.4 * Math.sin((k * Math.PI) / 8)]);
  door.push([3.4, 0]);
  mk("path", { d: open(door.map(([s, z]) => onTower(200, s, z))), class: "nf" }, g);
  for (const [b, z] of [[164, 46], [214, 74]]) {
    mk("path", { d: poly(rrect(-1.5, -3.4, 1.5, 3.4, 1.4, 3).map((q) => onTower(b, q.u, z + q.v))), class: "nf lo" }, g);
  }
  put(solid(g), prism(P, front, circ(DECK, 48), circ(DECK - 1.2, 48), H, Z_DECK));

  // The rail and its posts, split into the half behind the lantern and the half in front of it.
  const rail = circ(RAIL, 48), railBack = mk("g", {}, g);
  mk("path", { d: open(ringAt(P, run(rail, (q) => !front(q)), Z_RAIL)), class: "nf" }, railBack);
  const posts = [[], []];
  for (let k = 0; k < 16; k++) {
    const q = rail[k * 3];
    posts[front(q) ? 1 : 0].push(seg(P(q.u, q.v, Z_DECK), P(q.u, q.v, Z_RAIL)));
  }
  mk("path", { d: posts[0].join(""), class: "nf lo" }, railBack);

  put(solid(g), prism(P, front, circ(GLASS, 40), circ(GLASS - 1, 40), Z_DECK, Z_ROOF));
  place(mk("circle", { r: 2.6, class: "dot" }, g), P(0, 0, ZL));
  const bars = [];
  for (let k = 0; k < 8; k++) {
    const a = rad(22.5 + 45 * k), x = GLASS * Math.cos(a), y = GLASS * Math.sin(a);
    if (x + y > 2) bars.push(seg(P(x, y, Z_DECK), P(x, y, Z_ROOF)));
  }
  mk("path", { d: bars.join(""), class: "nf lo" }, g);
  put(solid(g), prism(P, front, circ(10.8, 40), circ(9.6, 40), Z_ROOF, Z_ROOF + 1.5));
  taper(g, circ(9.8, 40), circ(1.8, 24), circ(1.2, 24), Z_ROOF + 1.5, Z_ROOF + 9);
  const ball = P(0, 0, Z_ROOF + 11);
  mk("path", { d: poly(circ(2.2, 16).map((q) => [ball[0] + q.u, ball[1] + q.v])) }, g);
  mk("path", { d: seg(P(0, 0, Z_ROOF + 13.6), P(0, 0, Z_ROOF + 19)), class: "nf" }, g);

  const railFront = mk("g", {}, g);
  mk("path", { d: posts[1].join(""), class: "nf lo" }, railFront);
  mk("path", { d: open(ringAt(P, run(rail, front), Z_RAIL)), class: "nf" }, railFront);

  // The beam: a fan from a round root at the glass to an arc at its reach, all of it round the lamp.
  const beamG = mk("g", {}, g), beam = solid(beamG);
  let drawn = NaN, inFront = true;
  function fan(dx, dy, ins) {
    const at = (a, s) => [dx * a - dy * s, dy * a + dx * s], half = Math.atan((W0 + SPREAD * L) / L), pts = [];
    for (let k = 0; k < 16; k++) {
      const c = Math.cos((k * Math.PI) / 8), s = Math.sin((k * Math.PI) / 8);
      pts.push(at(GLASS + W0 + (W0 - ins) * c, (W0 - ins) * s));
      for (const f of [-half, half]) pts.push(at((L - 2) * Math.cos(f) + (2 - ins) * c, (L - 2) * Math.sin(f) + (2 - ins) * s));
    }
    for (let k = -4; k <= 4; k++) pts.push(at((L - ins) * Math.cos((half * k) / 4), (L - ins) * Math.sin((half * k) / 4)));
    return ringOf(hull(pts));
  }
  function drawBeam(b) {
    if (b === drawn) return;
    drawn = b;
    const [dx, dy] = dir(b);
    put(beam, prism(P, front, fan(dx, dy, 0), fan(dx, dy, 0.8), ZL - 0.75, ZL + 0.75));
    const f = Math.cos(rad(b)) < 0;
    if (f !== inFront) { inFront = f; (f ? railFront : railBack).after(beamG); }
  }

  const sp = spring(REST), rate = spring(TURN);
  let theta = REST, over = false;
  drawBeam(theta);

  const B = register(stage, (dt) => {
    let moving = true;
    if (over || reducedMotion()) {
      if (!over) { sp.x = theta; sp.t = theta + wrap(REST - theta); }
      moving = stepS(sp, dt);
      theta = sp.x;
    } else {
      stepS(rate, dt);
      theta = (theta + rate.x * dt) % 360;
    }
    drawBeam(theta);
    return moving;
  });
  bag.add(B.unregister);
  B.wake();

  function aim(b) {
    if (!over) { over = true; sp.x = theta; sp.v = reducedMotion() ? 0 : rate.x; sp.t = theta; }
    sp.t += wrap(b - sp.t);
    beam.sil.classList.add("hi");
    read.textContent = "bearing " + String(Math.round(b) % 360).padStart(3, "0");
    B.wake();
  }
  function release() {
    if (!over) return;
    over = false;
    theta = sp.x;
    rate.x = sp.v; rate.v = 0;
    beam.sil.classList.remove("hi");
    read.textContent = "rest";
    B.wake();
  }

  bag.add(pointer(stage, {
    move: (p) => { const [x, y] = unproj(C, p[0], p[1], ZL); if (Math.hypot(x, y) > 6) aim(bearing(x, y)); },
    leave: release,
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { L = v; drawn = NaN; drawBeam(theta); B.wake(); },
    destroy: bag.dispose,
  };
}

export default {
  name: "lighthouse",
  means: "A lighthouse on a rock: its beam sweeps round on its own, and turns to find the pointer.",
  rules: [1, 5, 7, 9],
  range: [40, 55, 70],
  tour: [[327, 104], [110, 130], [80, 60], null],
  mount,
} satisfies LoaderFigure;
