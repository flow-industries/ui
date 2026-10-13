// @ts-nocheck
// paperplane: a Hairline figure, made with the hairline-create skill and checked with its look.mjs.
// It stays in the skill's format so it can be iterated there; only this header and the export differ.
import { HL } from "../kernel";
import type { LoaderFigure } from "../loader";
/**
 * Paperplane: a folded paper dart flies a figure eight over a round table,
 * between two marks, a sender and a receiver: out to one, banked round it, and
 * back to the other, a message and its reply, every four seconds. Its shadow
 * runs across the table under it, and a short dashed trail follows its tail.
 * The pointer turns the line between the two marks toward itself: the receiver
 * slides under the pointer on a spring, the sender opposite, and the loop
 * follows. The slider is the reach: how far from the middle the receiver goes.
 *
 * The pattern: an ambient flight on a periodic path, a spring for where the
 * pointer is, a hit test on the ground plane (which never moves), and paint
 * order read off the keel's plane: the far wing, then the keel, then the near one.
 */
const {
  Cam, clamp, facing, fillet, fit, flatDot, hull, open, place, poly, prism, proj, r2, rad, rrect,
  unproj, spring, stepS, reducedMotion, disposer, mk, pointer, register,
} = HL;

const RG = 66, PB = 6, LAP = 4, RHO = 12, LOBE = 44, Z0 = 26, Z1 = 16, G = 95, TK = 0.9, DIH = rad(12);
const HOME = -Math.PI / 4, AWAY = 30, NEAR = 14, REST = 0.25 * Math.PI, V = [0.612, 0.612, 0.5];
/** One wing in its own plane, forward and out from the keel: nose, tip front, tip back, root. */
const WING = [[33, 0], [-19, 23], [-25, 23], [-25, 0]], KEEL = [[33, 0], [-25, 0], [-21, -8]];
const CREASE = [[27, 1], [-25, 9]];

const add = (a, b, s = 1) => [a[0] + b[0] * s, a[1] + b[1] * s, a[2] + b[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a) => { const l = Math.hypot(a[0], a[1], a[2]); return [a[0] / l, a[1] / l, a[2] / l]; };

/** The loop at phase t, with the receiver at R and the sender opposite: a figure eight, high in the middle, low round each mark. */
function path(t, R) {
  const half = Math.hypot(R[0], R[1]), ux = R[0] / half, uy = R[1] / half;
  const s = Math.sin(t), c = Math.cos(t), A = (half + RHO) * s, B = LOBE * s * c;
  return [ux * A - uy * B, uy * A + ux * B, Z0 + Z1 * c * c];
}

/** Where the plane is and how it sits: forward along the path, and up tilted into the turn, as a glider banks. */
function frame(t, R) {
  const h = 0.004, X = path(t, R), Xa = path(t + h, R), Xb = path(t - h, R);
  const f = unit(add(Xa, Xb, -1)), acc = add(add(Xa, Xb), X, -2).map((v) => v / (h * h));
  const lat = add(acc, f, -dot(acc, f));
  const r = unit(cross(f, unit([lat[0], lat[1], G])));
  return { X, f, r, up: cross(r, f) };
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let reach = value, t = REST, drawn = "";

  const C = Cam(45, 0.5, 2);
  fit(C, [[-RG, 0, -PB], [RG, 0, -PB], [47, 47, -PB], [-36, -36, Z0 + Z1 + 6]], 200, 166);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  const disc = prism(P, front, rrect(-RG, -RG, RG, RG, RG, 14), rrect(2 - RG, 2 - RG, RG - 2, RG - 2, RG - 2, 14), -PB, 0);
  mk("path", { d: disc.sil, class: "sil" }, g);
  mk("path", { d: disc.crease, class: "nf lo" }, g);

  // The two marks on the table: a ring and its centre, the receiver's at R, the sender's opposite.
  const ring = rrect(-9, -9, 9, 9, 9, 5), marks = [0, 1].map(() => ({ o: mk("path", { class: "nf lo" }, g), c: flatDot(g, C, 1.2, "dot m") }));
  const shadow = mk("path", { class: "nf lo" }, g), trail = mk("path", { class: "dash nf" }, g), plane = mk("g", {}, g);

  const cd = Math.cos(DIH), sd = Math.sin(DIH), wing = fillet(WING, [0.6, 1.4, 1.2, 0.8], 3);
  const side = (k) => ([a, s]) => [a, k * s * cd, s * sd];
  const parts = [1, -1].map((k) => ({ pts: wing.map(side(k)), crease: CREASE.map(side(k)), n: [0, -k * sd, cd] }));
  parts.push({ pts: fillet(KEEL, [0.5, 0.8, 1.2], 3).map(([a, c]) => [a, 0, c]), n: [0, 1, 0] });
  for (const q of parts) {
    q.g = mk("g", {}, plane);
    q.back = mk("path", { class: "lo" }, q.g);
    q.face = mk("path", { class: "sil hi" }, q.g);
    if (q.crease) q.fold = mk("path", { class: "nf lo" }, q.g);
  }

  // The receiver in polar terms, so a route swung right round never passes through the middle.
  const ang = spring(HOME), len = spring(AWAY);
  let near = -1;

  function draw() {
    const key = [t, ang.x, len.x].map(r2).join();
    if (key === drawn) return;
    drawn = key;
    const R = [len.x * Math.cos(ang.x), len.x * Math.sin(ang.x)], { X, f, r, up } = frame(t, R);
    const W = (q) => [0, 1, 2].map((i) => X[i] + f[i] * q[0] + r[i] * q[1] + up[i] * q[2]);
    const all = [];
    for (const q of parts) {
      const n = W(q.n).map((v, i) => v - X[i]), o = n.map((v) => v * (dot(n, V) > 0 ? -TK : TK));
      const pts = q.pts.map(W);
      all.push(...pts);
      q.back.setAttribute("d", poly(pts.map((p) => P(...add(p, o)))));
      q.face.setAttribute("d", poly(pts.map((p) => P(...p))));
      if (q.fold) q.fold.setAttribute("d", open(q.crease.map((p) => P(...W(p)))));
    }
    // The keel's plane splits the two wings: the one on the camera's side is painted last.
    const n = dot(r, V) > 0 ? 0 : 1;
    if (n !== near) { near = n; [parts[1 - n], parts[2], parts[n]].forEach((q) => plane.append(q.g)); }
    shadow.setAttribute("d", poly(hull(all.map((p) => P(p[0], p[1], 0)))));

    // The trail: the loop just behind the tail, from the path itself, so it bends when the loop does.
    const tr = [];
    for (let j = 1, run = 0, prev = X; j < 60 && run < 100; j++) {
      const p = path(t - j * 0.025, R);
      run += Math.hypot(p[0] - prev[0], p[1] - prev[1], p[2] - prev[2]);
      prev = p;
      if (run > 30) tr.push(P(...p));
    }
    trail.setAttribute("d", open(tr));

    [R, [-R[0], -R[1]]].forEach((c, i) => {
      marks[i].o.setAttribute("d", poly(ring.map((q) => P(c[0] + q.u, c[1] + q.v, 0))));
      place(marks[i].c, P(c[0], c[1], 0));
    });
  }

  const B = register(stage, (dt) => {
    const still = reducedMotion();
    t = still ? REST : (t + (Math.min(dt, 0.1) * 2 * Math.PI) / LAP) % (2 * Math.PI);
    const ma = stepS(ang, dt), ml = stepS(len, dt);
    draw();
    return !still || ma || ml;
  });
  bag.add(B.unregister);

  let over = null;
  /** Points the receiver at the ground under the pointer, between NEAR and the reach from the middle, turning the short way round. */
  function aim() {
    const a = over ? Math.atan2(over[1], over[0]) : HOME;
    ang.t += Math.atan2(Math.sin(a - ang.t), Math.cos(a - ang.t));
    len.t = over ? clamp(Math.hypot(over[0], over[1]), NEAR, reach) : AWAY;
    if (over) {
      const s = P(-Math.cos(a), -Math.sin(a), 0), e = P(Math.cos(a), Math.sin(a), 0);
      const deg = Math.round(((Math.atan2(e[0] - s[0], s[1] - e[1]) * 180) / Math.PI + 360) % 360) % 360;
      read.textContent = "heading " + String(deg).padStart(3, "0");
    } else read.textContent = "rest";
    B.wake();
  }

  bag.add(pointer(stage, {
    move: (p) => { over = unproj(C, p[0], p[1], 0); aim(); },
    leave: () => { over = null; aim(); },
  }));
  bag.add(() => svg.replaceChildren());
  B.wake();

  return {
    set: (v) => { reach = v; if (over) aim(); },
    destroy: bag.dispose,
  };
}

export default {
  name: "paperplane",
  means: "A paper plane flies a figure eight between a sender and a receiver; the pointer turns the route toward itself.",
  rules: [1, 3, 5, 6, 7],
  range: [18, 30, 38],
  tour: [[249, 156], [172, 237], [115, 180], null],
  mount,
} satisfies LoaderFigure;
