import type { Cloud } from "@/lib/sample-logogram";

export const FLOW_BINS = 192;
export const FLOW_RANKS = 36;
/** Seconds for one glyph to become the next. */
export const FLOW_CYCLE_S = 9.5;
/** Circumferential current, radians per second. */
export const FLOW_OMEGA = 0.34;
/** Radius lag — higher is more viscous. */
export const FLOW_TAU = 0.72;

export function polarField(cloud: Cloud): Float32Array {
  const bins: number[][] = Array.from({ length: FLOW_BINS }, () => []);
  for (let i = 0; i < cloud.n; i++) {
    const b = binOf(cloud.a[i]);
    bins[b].push(cloud.rho[i]);
  }
  for (let b = 0; b < FLOW_BINS; b++) bins[b].sort((q, w) => q - w);
  for (let b = 0; b < FLOW_BINS; b++) {
    if (bins[b].length) continue;
    for (let d = 1; d < FLOW_BINS; d++) {
      const p = bins[(b + d) % FLOW_BINS];
      const q = bins[(b - d + FLOW_BINS) % FLOW_BINS];
      if (p.length) {
        bins[b] = p;
        break;
      }
      if (q.length) {
        bins[b] = q;
        break;
      }
    }
  }
  const field = new Float32Array(FLOW_BINS * FLOW_RANKS);
  for (let b = 0; b < FLOW_BINS; b++) {
    const list = bins[b];
    const last = list.length ? list[list.length - 1] : cloud.meanR;
    for (let k = 0; k < FLOW_RANKS; k++) {
      field[b * FLOW_RANKS + k] = quantile(list, k / (FLOW_RANKS - 1), last);
    }
  }
  return field;
}

export function sampleField(field: Float32Array, theta: number, rank: number) {
  const u = ((theta + Math.PI) / (Math.PI * 2)) * FLOW_BINS;
  let b = Math.floor(u);
  const bf = u - b;
  b = ((b % FLOW_BINS) + FLOW_BINS) % FLOW_BINS;
  const b1 = (b + 1) % FLOW_BINS;
  const r = Math.max(0, Math.min(1, rank)) * (FLOW_RANKS - 1);
  const k = Math.floor(r);
  const kf = r - k;
  const k0 = k;
  const k1 = Math.min(FLOW_RANKS - 1, k + 1);
  const a00 = field[b * FLOW_RANKS + k0];
  const a01 = field[b * FLOW_RANKS + k1];
  const a10 = field[b1 * FLOW_RANKS + k0];
  const a11 = field[b1 * FLOW_RANKS + k1];
  return (a00 * (1 - kf) + a01 * kf) * (1 - bf) + (a10 * (1 - kf) + a11 * kf) * bf;
}

export function particleRanks(cloud: Cloud): Float32Array {
  const bins: number[][] = Array.from({ length: FLOW_BINS }, () => []);
  for (let i = 0; i < cloud.n; i++) bins[binOf(cloud.a[i])].push(i);
  const rank = new Float32Array(cloud.n);
  for (let b = 0; b < FLOW_BINS; b++) {
    const ids = bins[b];
    ids.sort((i, j) => cloud.rho[i] - cloud.rho[j]);
    const d = Math.max(1, ids.length - 1);
    for (let k = 0; k < ids.length; k++) rank[ids[k]] = k / d;
  }
  return rank;
}

function binOf(a: number) {
  return ((Math.floor(((a + Math.PI) / (Math.PI * 2)) * FLOW_BINS) % FLOW_BINS) + FLOW_BINS) % FLOW_BINS;
}

function quantile(list: number[], t: number, fallback: number) {
  if (!list.length) return fallback;
  if (list.length === 1) return list[0];
  const x = t * (list.length - 1);
  const i = Math.min(list.length - 2, Math.floor(x));
  const f = x - i;
  return list[i] * (1 - f) + list[i + 1] * f;
}
