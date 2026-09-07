import type { Cloud } from "@/lib/sample-logogram";
import type { HabitatView, LayerView } from "@/lib/layers";
import { isLayerView } from "@/lib/layers";
import { ecoInnerById, ecosystemById, type EcoId } from "@/lib/ecosystems";
import { granuleById, sliceBrief, type Health, type SliceId } from "@/lib/slices";

function fract(n: number) {
  return n - Math.floor(n);
}

function hash(n: number) {
  return fract(Math.sin(n * 127.1) * 43758.5453);
}

function wrapPi(d: number) {
  return Math.atan2(Math.sin(d), Math.cos(d));
}

type Module = {
  id: string;
  pick: string;
  code: number;
  x: number;
  y: number;
  s: number;
  health: Health;
};

function healthFor(pick: string): Health {
  const inner = ecoInnerById(pick);
  if (inner) return inner.inner.health;
  const eco = ecosystemById(pick);
  if (eco) return eco.health;
  const granule = granuleById(pick);
  if (granule) return granule.granule.health;
  return "stable";
}

function finish(mods: Omit<Module, "code" | "health">[]): Module[] {
  return mods.map((m, i) => ({ ...m, code: i, health: healthFor(m.pick) }));
}

function empty(src: Cloud): Cloud {
  const n = src.n;
  return {
    n,
    cx: src.cx,
    cy: src.cy,
    meanR: src.meanR,
    x: new Float32Array(n),
    y: new Float32Array(n),
    z: new Float32Array(n),
    r: new Float32Array(n),
    o: new Float32Array(n),
    a: new Float32Array(n),
    rho: new Float32Array(n),
    rhoN: new Float32Array(n),
    c: new Int8Array(n),
    flow: new Float32Array(n),
    vx: new Float32Array(n),
    vy: new Float32Array(n),
    vz: new Float32Array(n),
    phase: new Float32Array(n),
  };
}

function ring(src: Cloud, n: number, rho: number, s: number, ids: string[]): Omit<Module, "code" | "health">[] {
  const out: Omit<Module, "code" | "health">[] = [];
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    const pick = ids[i % ids.length];
    out.push({
      id: `${pick}#${i}`,
      pick,
      x: src.cx + Math.cos(a) * rho,
      y: src.cy + Math.sin(a) * rho,
      s,
    });
  }
  return out;
}

/** Habitat from the concept sheets, sized in the living mark. */
export function habitatModules(
  src: Cloud,
  view: HabitatView,
  slice: SliceId | null = null,
  ecoId: EcoId | null = null,
): Module[] {
  if (ecoId) return finish(ecoLayout(src, ecoId));
  if (slice && isLayerView(view)) return finish(sliceLayout(src, view, slice));

  const U = src.meanR / 320;
  const ecos = ["eco-001", "eco-002", "eco-003", "eco-004"];
  const core = { id: "concierge", pick: "concierge", x: src.cx, y: src.cy, s: 36 * U };
  const inner = ring(src, 4, 132 * U, 30 * U, ["intel-mod"]);
  const outerN = view === "mechanical" ? 8 : 12;
  const outer = ring(src, outerN, 268 * U, 24 * U, ecos);
  const terminals = ring(src, 4, 330 * U, 16 * U, ["terminal"]);
  const resources = ring(src, 4, 148 * U, 34 * U, ["res-people", "res-matter", "res-capital", "capacity"]);

  if (view === "intelligence") return finish([core, ...ring(src, 12, 168 * U, 30 * U, ["intel-mod"])]);
  if (view === "resource") return finish([core, ...resources]);
  if (view === "mechanical") return finish([core, ...outer]);
  if (view === "base") return finish([...outer, ...terminals]);
  return finish([core, ...inner, ...outer, ...terminals]);
}

function sliceLayout(src: Cloud, view: LayerView, slice: SliceId): Omit<Module, "code" | "health">[] {
  const U = src.meanR / 320;
  const brief = sliceBrief(view, slice);
  const ids = brief?.granules.map((item) => item.id) ?? [`${view}:${slice}:0`];
  const n = ids.length;

  if (slice === "infrastructure") {
    const core = { id: `${ids[0]}#0`, pick: ids[0], x: src.cx, y: src.cy, s: 44 * U };
    if (n === 1) return [core];
    return [core, ...ring(src, n - 1, 168 * U, 30 * U, ids.slice(1))];
  }
  if (slice === "modules") {
    return ring(src, Math.max(n, 10), 186 * U, 24 * U, ids);
  }
  if (slice === "networks") {
    return [...ring(src, Math.max(n, 6), 132 * U, 16 * U, ids), ...ring(src, Math.max(n, 8), 248 * U, 14 * U, ids)];
  }
  return ring(src, Math.max(n, 4), 236 * U, 32 * U, ids);
}

function ecoLayout(src: Cloud, ecoId: EcoId): Omit<Module, "code" | "health">[] {
  const U = src.meanR / 320;
  const eco = ecosystemById(ecoId);
  const ids = eco?.inners.map((item) => item.id) ?? [`${ecoId}:0`];
  const spots = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ];
  return ids.map((id, i) => ({
    id,
    pick: id,
    x: src.cx + spots[i][0] * 98 * U,
    y: src.cy + spots[i][1] * 98 * U,
    s: 42 * U,
  }));
}

function nearestMod(mods: Module[], x: number, y: number) {
  let best = mods[0];
  let dist = 1e9;
  for (const m of mods) {
    const d = Math.hypot(x - m.x, y - m.y);
    if (d < dist) {
      dist = d;
      best = m;
    }
  }
  return { m: best, dist };
}

function nearestByAngle(mods: Module[], src: Cloud, a: number) {
  let best = mods[0];
  let dist = 8;
  for (const m of mods) {
    const ma = Math.atan2(m.y - src.cy, m.x - src.cx);
    const d = m === mods[0] && m.x === src.cx && m.y === src.cy ? 0.15 : Math.abs(wrapPi(a - ma));
    if (d < dist) {
      dist = d;
      best = m;
    }
  }
  return best;
}

/** Same cubing as the system footprint, seated on Habitat components. */
export function shapeHabitat(
  src: Cloud,
  view: HabitatView,
  part: string | null,
  slice: SliceId | null = null,
  ecoId: EcoId | null = null,
): Cloud {
  const out = empty(src);
  const mods = habitatModules(src, view, slice, ecoId);
  const sliced = Boolean((slice && isLayerView(view)) || ecoId);
  const core = mods.filter((m) => m.pick === "concierge" || /:0$/.test(m.pick));
  const inner = mods.filter((m) => m.pick === "intel-mod" || m.pick.startsWith("res-") || m.pick === "capacity");
  const outer = mods.filter((m) => /^eco-\d+$/.test(m.pick));
  const term = mods.filter((m) => m.pick === "terminal");

  for (let i = 0; i < src.n; i++) {
    const h = hash(i * 3.17 + 11.4);
    let pool = mods;
    if (!sliced) {
      if (h < 0.1 && core.length) pool = core;
      else if (h < 0.34 && inner.length) pool = inner;
      else if (h < 0.86 && outer.length) pool = outer;
      else if (term.length) pool = term;
      else if (inner.length) pool = inner;
    }

    const m = nearestByAngle(pool, src, src.a[i]);
    const live = 1;
    const emit = m.health === "blocked" ? 2.2 : m.health === "watch" ? 1.45 : 1;
    const belong = h < 0.9;

    if (!belong || live < 0.18) {
      let other = mods[0];
      let d2 = 99;
      for (const q of mods) {
        if (q === m) continue;
        const d = Math.hypot(src.x[i] - q.x, src.y[i] - q.y);
        if (d < d2) {
          d2 = d;
          other = q;
        }
      }
      const t = 0.35 + h * 0.3;
      const x = m.x * (1 - t) + other.x * t + (src.x[i] - src.cx) * 0.06;
      const y = m.y * (1 - t) + other.y * t + (src.y[i] - src.cy) * 0.06;
      out.x[i] = x;
      out.y[i] = y;
      out.z[i] = src.z[i] * 0.08;
      out.r[i] = src.r[i] * 0.2;
      out.o[i] = src.o[i] * (0.1 + h * 0.08);
      out.a[i] = Math.atan2(y - src.cy, x - src.cx);
      out.rho[i] = Math.hypot(x - src.cx, y - src.cy);
      out.rhoN[i] = src.rhoN[i];
      out.c[i] = -1;
      out.flow![i] = 0.02;
      out.phase![i] = h;
      continue;
    }

    const s = m.s * (0.85 + live * 0.35);
    const k = 0.14 + live * 0.08;
    const cube = 0.55 + h * 0.45;
    const fill = 0.28 + hash(i * 7.1) * 0.72;
    const dx = (src.x[i] - m.x) * k;
    const dy = (src.y[i] - m.y) * k;
    const dz = src.z[i] * k * 1.6;
    const inf = Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz), 1e-4);
    const x = m.x + dx * (1 - cube) + (dx / inf) * s * fill * cube;
    const y = m.y + dy * (1 - cube) + (dy / inf) * s * fill * cube;
    const z = dz * (1 - cube) + (dz / inf) * s * 0.72 * fill * cube;
    out.x[i] = x;
    out.y[i] = y;
    out.z[i] = z;
    out.r[i] = src.r[i] * (0.62 + live * 0.28);
    out.o[i] = Math.min(1, src.o[i] * (0.72 + live * 0.28) + 0.12);
    out.a[i] = Math.atan2(y - src.cy, x - src.cx);
    out.rho[i] = Math.hypot(x - src.cx, y - src.cy);
    out.rhoN[i] = src.rhoN[i];
    out.c[i] = m.code;
    out.flow![i] = 0.08 * live * emit;
    out.vx![i] = -Math.sin(out.a[i]);
    out.vy![i] = Math.cos(out.a[i]);
    out.phase![i] = h;
  }
  return out;
}

export function shapePredict(src: Cloud): Cloud {
  const out = empty(src);
  const present = habitatModules(src, "ecosystems");
  const U = src.meanR / 320;
  const desired: Module[] = [
    { id: "hold#0", pick: "hold", code: 7, x: src.cx + U * 90, y: src.cy - U * 70, s: 38 * U, health: "watch" },
    { id: "hold#1", pick: "hold", code: 7, x: src.cx + U * 150, y: src.cy - U * 20, s: 28 * U, health: "watch" },
    { id: "hold#2", pick: "hold", code: 7, x: src.cx + U * 110, y: src.cy + U * 40, s: 24 * U, health: "stable" },
  ];
  const fail: Module = {
    id: "slip",
    pick: "slip",
    code: -1,
    x: src.cx + U * 40,
    y: src.cy + U * 140,
    s: 22 * U,
    health: "blocked",
  };

  for (let i = 0; i < src.n; i++) {
    const h = hash(i * 3.17 + 11.4);
    if (h < 0.42) {
      cubify(out, i, src, nearestByAngle(present, src, src.a[i]), 0.55);
      continue;
    }
    if (h < 0.78) {
      cubify(out, i, src, desired[Math.floor(h * 30) % desired.length], 1);
      continue;
    }
    if (h < 0.9) {
      const t = (h - 0.78) / 0.12;
      const a = present[0];
      const b = desired[0];
      out.x[i] = a.x * (1 - t) + b.x * t + (hash(i) - 0.5) * 8;
      out.y[i] = a.y * (1 - t) + b.y * t + (hash(i * 2) - 0.5) * 8;
      out.z[i] = src.z[i] * 0.2;
      out.r[i] = src.r[i] * 0.7;
      out.o[i] = 0.85;
      out.a[i] = Math.atan2(out.y[i] - src.cy, out.x[i] - src.cx);
      out.rho[i] = Math.hypot(out.x[i] - src.cx, out.y[i] - src.cy);
      out.rhoN[i] = src.rhoN[i];
      out.c[i] = 7;
      out.flow![i] = 0.12;
      out.vx![i] = (b.x - a.x) * 0.02;
      out.vy![i] = (b.y - a.y) * 0.02;
      out.phase![i] = h;
      continue;
    }
    cubify(out, i, src, fail, 0.28);
    out.c[i] = -1;
    out.o[i] *= 0.45;
  }
  return out;
}

export function shapeSeat(src: Cloud): Cloud {
  return shapeHabitat(src, "ecosystems", null);
}

export function shapeApprove(src: Cloud): Cloud {
  return shapeHabitat(src, "mechanical", "eco-001");
}

function cubify(out: Cloud, i: number, src: Cloud, m: Module, live: number) {
  const h = hash(i * 3.17 + 11.4);
  const s = m.s * (0.85 + live * 0.35);
  const k = 0.14 + live * 0.08;
  const cube = 0.55 + h * 0.45;
  const fill = 0.28 + hash(i * 7.1) * 0.72;
  const dx = (src.x[i] - m.x) * k;
  const dy = (src.y[i] - m.y) * k;
  const dz = src.z[i] * k * 1.6;
  const inf = Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz), 1e-4);
  const x = m.x + dx * (1 - cube) + (dx / inf) * s * fill * cube;
  const y = m.y + dy * (1 - cube) + (dy / inf) * s * fill * cube;
  const z = dz * (1 - cube) + (dz / inf) * s * 0.72 * fill * cube;
  out.x[i] = x;
  out.y[i] = y;
  out.z[i] = z;
  out.r[i] = src.r[i] * (0.62 + live * 0.28);
  out.o[i] = Math.min(1, src.o[i] * (0.72 + live * 0.28) + 0.12);
  out.a[i] = Math.atan2(y - src.cy, x - src.cx);
  out.rho[i] = Math.hypot(x - src.cx, y - src.cy);
  out.rhoN[i] = src.rhoN[i];
  out.c[i] = m.code;
  out.flow![i] = 0.08 * live;
  out.vx![i] = -Math.sin(out.a[i]);
  out.vy![i] = Math.cos(out.a[i]);
  out.phase![i] = h;
}

export type HabitatHit = { pick: string; code: number };

export function hitHabitat(
  src: Cloud,
  x: number,
  y: number,
  view: HabitatView,
  slice: SliceId | null = null,
  ecoId: EcoId | null = null,
): HabitatHit | null {
  const mods = habitatModules(src, view, slice, ecoId);
  if (!mods.length) return null;
  const px = src.cx + (x - src.cx) / 0.82;
  const py = src.cy + (y - src.cy) / 0.82;
  const { m, dist } = nearestMod(mods, px, py);
  if (dist > m.s * 1.55) return null;
  return { pick: m.pick, code: m.code };
}
