import type { Cloud } from "@/lib/sample-logogram";

/** Bump so the system cloud cache cannot keep a previous disclose. */
export const DISCLOSE_REV = 26;

function fract(n: number) {
  return n - Math.floor(n);
}

function hash(n: number) {
  return fract(Math.sin(n * 127.1) * 43758.5453);
}

function wrapPi(d: number) {
  return Math.atan2(Math.sin(d), Math.cos(d));
}

export type Peak = { a: number; x: number; y: number; z: number; mass: number };

export function peaksOf(src: Cloud): Peak[] {
  const B = 64;
  const w = new Float64Array(B);
  const xs = new Float64Array(B);
  const ys = new Float64Array(B);
  const zs = new Float64Array(B);
  for (let i = 0; i < src.n; i++) {
    const b = Math.floor(((src.a[i] + Math.PI) / (Math.PI * 2)) * B) % B;
    const wt = src.o[i] * src.r[i];
    w[b] += wt;
    xs[b] += src.x[i] * wt;
    ys[b] += src.y[i] * wt;
    zs[b] += src.z[i] * wt;
  }
  const sm = new Float64Array(B);
  for (let b = 0; b < B; b++) {
    sm[b] = w[(b + B - 1) % B] * 0.25 + w[b] * 0.5 + w[(b + 1) % B] * 0.25;
  }
  let mean = 0;
  for (let b = 0; b < B; b++) mean += sm[b];
  mean /= B;

  const raw: Peak[] = [];
  for (let b = 0; b < B; b++) {
    if (sm[b] < mean * 0.92) continue;
    if (sm[b] < sm[(b + B - 1) % B] || sm[b] < sm[(b + 1) % B]) continue;
    const mass = sm[b];
    raw.push({
      a: (b / B) * Math.PI * 2 - Math.PI,
      x: xs[b] / Math.max(1e-6, w[b]),
      y: ys[b] / Math.max(1e-6, w[b]),
      z: zs[b] / Math.max(1e-6, w[b]),
      mass,
    });
  }
  raw.sort((p, q) => q.mass - p.mass);

  const merged: Peak[] = [];
  for (const p of raw) {
    const near = merged.find((q) => Math.abs(wrapPi(p.a - q.a)) < 0.22);
    if (near) {
      const t = p.mass / (near.mass + p.mass);
      near.x += (p.x - near.x) * t;
      near.y += (p.y - near.y) * t;
      near.z += (p.z - near.z) * t;
      near.mass += p.mass;
      continue;
    }
    merged.push({ ...p });
  }
  return merged.slice(0, 16);
}

function nearest(peaks: Peak[], a: number) {
  let best = peaks[0];
  let dist = 8;
  let index = 0;
  for (let i = 0; i < peaks.length; i++) {
    const p = peaks[i];
    const d = Math.abs(wrapPi(a - p.a));
    if (d < dist) {
      dist = d;
      best = p;
      index = i;
    }
  }
  return { peak: best, dist, index };
}

/**
 * The mark’s own ink gathers into the blotches already in the logogram.
 */
export function discloseLogogram(src: Cloud): Cloud {
  const n = src.n;
  const peaks = peaksOf(src);
  if (!peaks.length) {
    peaks.push({ a: 0, x: src.cx, y: src.cy, z: 0, mass: 1 });
  }
  const maxM = Math.max(...peaks.map((p) => p.mass), 1);
  const out: Cloud = {
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

  for (let i = 0; i < n; i++) {
    const { peak, dist, index } = nearest(peaks, src.a[i]);
    const massN = peak.mass / maxM;
    const belong = dist < 0.34 + massN * 0.1;
    const h = hash(i * 3.17 + 11.4);

    let x = src.x[i];
    let y = src.y[i];
    let z = src.z[i] * 0.18;
    let r = src.r[i];
    let o = src.o[i];
    let flow = 0;
    let vx = 0;
    let vy = 0;
    let cluster = -1;

    if (belong && h < 0.9) {
      const s = 9 + massN * 18 + hash(i * 9.1) * 7;
      const k = 0.14 + massN * 0.08;
      const dx = (src.x[i] - peak.x) * k;
      const dy = (src.y[i] - peak.y) * k;
      const dz = src.z[i] * k * 1.6;
      const inf = Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz), 1e-4);
      const cube = 0.55 + h * 0.45;
      const rx = (dx / inf) * s;
      const ry = (dy / inf) * s;
      const rz = (dz / inf) * s * 0.72;
      x = peak.x + dx * (1 - cube) + rx * cube;
      y = peak.y + dy * (1 - cube) + ry * cube;
      z = dz * (1 - cube) + rz * cube;
      r *= 0.62 + massN * 0.28;
      o *= 0.72 + massN * 0.28;
      const a = Math.atan2(y - src.cy, x - src.cx);
      vx = -Math.sin(a);
      vy = Math.cos(a);
      flow = 0.08;
      cluster = index;
    } else {
      let p2 = peaks[0];
      let d2 = 99;
      for (const q of peaks) {
        if (q === peak) continue;
        const d = Math.abs(wrapPi(src.a[i] - q.a));
        if (d < d2) {
          d2 = d;
          p2 = q;
        }
      }
      const t = 0.35 + h * 0.3;
      x = peak.x * (1 - t) + p2.x * t + (src.x[i] - src.cx) * 0.08;
      y = peak.y * (1 - t) + p2.y * t + (src.y[i] - src.cy) * 0.08;
      z = src.z[i] * 0.08;
      r *= 0.22;
      o *= 0.16 + h * 0.1;
      cluster = -1;
    }

    out.x[i] = x;
    out.y[i] = y;
    out.z[i] = z;
    out.r[i] = r;
    out.o[i] = o;
    out.a[i] = Math.atan2(y - src.cy, x - src.cx);
    out.rho[i] = Math.hypot(x - src.cx, y - src.cy);
    out.rhoN[i] = src.rhoN[i];
    out.c[i] = cluster;
    out.flow![i] = flow;
    out.vx![i] = vx;
    out.vy![i] = vy;
    out.vz![i] = 0;
    out.phase![i] = h;
  }

  return out;
}
