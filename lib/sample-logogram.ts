import { discloseLogogram, DISCLOSE_REV } from "@/lib/entity-schema";
import { FORM } from "@/lib/sessions";

function wrapPi(d: number) {
  return Math.atan2(Math.sin(d), Math.cos(d));
}

function nearestForm(a: number, limit = 0.55) {
  let best = -1;
  let dist = limit;
  for (const c of FORM) {
    const d = Math.abs(wrapPi(a - c.a));
    if (d < dist) {
      dist = d;
      best = c.id;
    }
  }
  return best;
}

export type Shard = {
  peak: number;
  x: number;
  y: number;
  z: number;
  faces: Float32Array;
};

export type Cloud = {
  n: number;
  cx: number;
  cy: number;
  meanR: number;
  x: Float32Array;
  y: Float32Array;
  z: Float32Array;
  r: Float32Array;
  o: Float32Array;
  a: Float32Array;
  rho: Float32Array;
  rhoN: Float32Array;
  c: Int8Array;
  flow?: Float32Array;
  vx?: Float32Array;
  vy?: Float32Array;
  vz?: Float32Array;
  phase?: Float32Array;
  shards?: Shard[];
};

const TARGET = 14000;
export const CLOUD_REV = 9;

function hash(n: number) {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

async function decode(src: string) {
  const img = new Image();
  img.src = src;
  await img.decode();
  return img;
}

function read(img: HTMLImageElement, sx: number, sy: number, sw: number, sh: number) {
  const src = document.createElement("canvas");
  src.width = Math.max(1, Math.round(sw));
  src.height = Math.max(1, Math.round(sh));
  const sctx = src.getContext("2d", { willReadFrequently: true });
  if (!sctx) throw new Error("no ctx");
  sctx.drawImage(img, sx, sy, sw, sh, 0, 0, src.width, src.height);
  return sctx.getImageData(0, 0, src.width, src.height);
}

function buildCloud(image: ImageData, size: number, seed = 0): Cloud {
  const { data, width, height } = image;
  const raw: { x: number; y: number; ink: number; h: number }[] = [];
  let k = seed;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const v = data[(y * width + x) * 4];
      if (v > 158) continue;
      const ink = (158 - v) / 158;
      const keep = 0.86 + ink * 0.14;
      if (hash(k++) > keep) continue;
      const h0 = hash(k);
      raw.push({ x, y, ink, h: h0 });
      if (ink > 0.12) {
        const j = hash(k + 17);
        raw.push({
          x: x + (j - 0.5) * 0.7,
          y: y + (hash(k + 31) - 0.5) * 0.7,
          ink,
          h: hash(k + 53),
        });
      }
    }
  }
  if (!raw.length) {
    raw.push({ x: width / 2, y: height / 2, ink: 1, h: 0.5 });
  }

  let cx = 0;
  let cy = 0;
  for (const p of raw) {
    cx += p.x;
    cy += p.y;
  }
  cx /= raw.length;
  cy /= raw.length;

  const BINS = 96;
  const bins: number[][] = Array.from({ length: BINS }, () => []);
  const polar0 = raw.map((p) => {
    const dx = p.x - cx;
    const dy = p.y - cy;
    const rho = Math.hypot(dx, dy);
    const a = Math.atan2(dy, dx);
    const b = Math.floor(((a + Math.PI) / (Math.PI * 2)) * BINS) % BINS;
    bins[b].push(rho);
    return { dx, dy, rho, a, ink: p.ink, h: p.h };
  });
  polar0.sort((p, q) => p.a - q.a);
  const centerline = bins.map((list) => {
    if (!list.length) return 0;
    list.sort((q, w) => q - w);
    return list[Math.floor(list.length * 0.5)];
  });
  for (let i = 0; i < BINS; i++) {
    if (centerline[i]) continue;
    centerline[i] = centerline[(i + 1) % BINS] || centerline[(i + BINS - 1) % BINS];
  }

  let meanR = 0;
  let maxR = 0;
  let tube = 0;
  for (const p of polar0) {
    meanR += p.rho;
    if (p.rho > maxR) maxR = p.rho;
    const b = Math.floor(((p.a + Math.PI) / (Math.PI * 2)) * BINS) % BINS;
    tube += Math.abs(p.rho - (centerline[b] || p.rho));
  }
  meanR /= polar0.length;
  maxR = Math.max(maxR, 1);
  tube = (tube / polar0.length) * 2.85;

  const scale = (size * 0.42) / maxR;
  const ox = size / 2;
  const oy = size / 2;
  const cloud: Cloud = {
    n: polar0.length,
    cx: ox,
    cy: oy,
    meanR: meanR * scale,
    x: new Float32Array(polar0.length),
    y: new Float32Array(polar0.length),
    z: new Float32Array(polar0.length),
    r: new Float32Array(polar0.length),
    o: new Float32Array(polar0.length),
    a: new Float32Array(polar0.length),
    rho: new Float32Array(polar0.length),
    rhoN: new Float32Array(polar0.length),
    c: new Int8Array(polar0.length),
  };

  for (let i = 0; i < polar0.length; i++) {
    const p = polar0[i];
    const b = Math.floor(((p.a + Math.PI) / (Math.PI * 2)) * BINS) % BINS;
    const R = centerline[b] || meanR;
    const u = p.rho - R;
    const inside = Math.max(0, tube * tube - u * u);
    const zSign = p.h > 0.5 ? 1 : -1;
    cloud.x[i] = ox + p.dx * scale;
    cloud.y[i] = oy + p.dy * scale;
    cloud.z[i] = zSign * (Math.sqrt(inside) + tube * 0.18) * scale;
    cloud.r[i] = 0.5 + p.ink * 0.78;
    cloud.o[i] = 0.84 + p.ink * 0.16;
    cloud.a[i] = p.a;
    cloud.rho[i] = p.rho * scale;
    cloud.rhoN[i] = R * scale;
    cloud.c[i] = nearestForm(p.a, 0.62);
  }
  return fit(cloud, TARGET);
}

export function capCloud(src: Cloud, n: number): Cloud {
  return fit(src, n);
}

function fit(src: Cloud, n: number): Cloud {
  if (src.n === n) return src;
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
  };
  for (let i = 0; i < n; i++) {
    const j = src.n > n
      ? Math.min(src.n - 1, Math.floor((i / n) * src.n))
      : i % src.n;
    const jx = (hash(i * 19.1) - 0.5) * (src.n >= n ? 0.35 : 1.15);
    const jy = (hash(i * 41.7) - 0.5) * (src.n >= n ? 0.35 : 1.15);
    out.x[i] = src.x[j] + jx;
    out.y[i] = src.y[j] + jy;
    out.z[i] = src.z[j] + (hash(i * 7.3) - 0.5) * 1.4;
    out.r[i] = src.r[j];
    out.o[i] = src.o[j];
    out.a[i] = src.a[j];
    out.rho[i] = src.rho[j];
    out.rhoN[i] = src.rhoN[j];
    out.c[i] = src.c[j];
  }
  return out;
}

/** Pin a glyph to canvas centre with a shared median radius so every form occupies the same ring. */
export function lockGlyph(src: Cloud): Cloud {
  const n = src.n;
  const B = 96;
  const sx = new Float64Array(B);
  const sy = new Float64Array(B);
  const sn = new Float64Array(B);
  for (let i = 0; i < n; i++) {
    const a = Math.atan2(src.y[i] - src.cy, src.x[i] - src.cx);
    const b = ((Math.floor(((a + Math.PI) / (Math.PI * 2)) * B) % B) + B) % B;
    sx[b] += src.x[i];
    sy[b] += src.y[i];
    sn[b] += 1;
  }
  let cx = 0;
  let cy = 0;
  let c = 0;
  for (let b = 0; b < B; b++) {
    if (!sn[b]) continue;
    cx += sx[b] / sn[b];
    cy += sy[b] / sn[b];
    c += 1;
  }
  if (c) {
    cx /= c;
    cy /= c;
  } else {
    cx = src.cx;
    cy = src.cy;
  }

  const tmp = new Float32Array(n);
  for (let i = 0; i < n; i++) tmp[i] = Math.hypot(src.x[i] - cx, src.y[i] - cy);
  const sorted = Float32Array.from(tmp);
  sorted.sort();
  const med = sorted[n >> 1] || 1;
  const ox = src.cx;
  const oy = src.cy;
  const s = (ox * 2 * 0.39) / med;
  const spine = ox * 2 * 0.39;
  const out: Cloud = {
    n,
    cx: ox,
    cy: oy,
    meanR: spine,
    x: new Float32Array(n),
    y: new Float32Array(n),
    z: new Float32Array(n),
    r: new Float32Array(n),
    o: new Float32Array(n),
    a: new Float32Array(n),
    rho: new Float32Array(n),
    rhoN: new Float32Array(n),
    c: new Int8Array(n),
  };
  for (let i = 0; i < n; i++) {
    out.x[i] = ox + (src.x[i] - cx) * s;
    out.y[i] = oy + (src.y[i] - cy) * s;
    out.z[i] = src.z[i] * s * 0.08;
    out.r[i] = src.r[i];
    out.o[i] = src.o[i];
    out.a[i] = Math.atan2(out.y[i] - oy, out.x[i] - ox);
    out.rho[i] = Math.hypot(out.x[i] - ox, out.y[i] - oy);
    out.rhoN[i] = spine;
    out.c[i] = src.c[i];
  }
  return out;
}

/** Pair particles by clock angle, then by radius, so ink grows in place instead of sliding. */
export function matchPolar(from: Cloud, to: Cloud): Cloud {
  const n = from.n;
  const B = 180;
  const fromBins: number[][] = Array.from({ length: B }, () => []);
  const toBins: number[][] = Array.from({ length: B }, () => []);
  for (let i = 0; i < from.n; i++) {
    const b = ((Math.floor(((from.a[i] + Math.PI) / (Math.PI * 2)) * B) % B) + B) % B;
    fromBins[b].push(i);
  }
  for (let i = 0; i < to.n; i++) {
    const b = ((Math.floor(((to.a[i] + Math.PI) / (Math.PI * 2)) * B) % B) + B) % B;
    toBins[b].push(i);
  }
  for (let b = 0; b < B; b++) {
    fromBins[b].sort((i, j) => from.rho[i] - from.rho[j]);
    toBins[b].sort((i, j) => to.rho[i] - to.rho[j]);
  }
  const nearestTo = (b0: number) => {
    if (toBins[b0].length) return toBins[b0];
    for (let d = 1; d < B; d++) {
      const p = toBins[(b0 + d) % B];
      const q = toBins[(b0 - d + B) % B];
      if (p.length) return p;
      if (q.length) return q;
    }
    return [0];
  };
  const slot = new Uint32Array(n);
  for (let b = 0; b < B; b++) {
    const fb = fromBins[b];
    if (!fb.length) continue;
    const tb = nearestTo(b);
    for (let k = 0; k < fb.length; k++) {
      slot[fb[k]] = tb[Math.min(tb.length - 1, Math.floor((k / fb.length) * tb.length))];
    }
  }
  const takeF = (src: Float32Array) => {
    const out = new Float32Array(n);
    for (let i = 0; i < n; i++) out[i] = src[slot[i]];
    return out;
  };
  const c = new Int8Array(n);
  for (let i = 0; i < n; i++) c[i] = to.c[slot[i]];
  return {
    n,
    cx: from.cx,
    cy: from.cy,
    meanR: from.meanR,
    x: takeF(to.x),
    y: takeF(to.y),
    z: takeF(to.z),
    r: takeF(to.r),
    o: takeF(to.o),
    a: takeF(to.a),
    rho: takeF(to.rho),
    rhoN: takeF(to.rhoN),
    c,
  };
}

export const FOOTPRINT_FORM = 10;

let pending: Promise<Cloud> | null = null;
let formCache: Promise<Cloud[]> | null = null;
let formRev = -1;
let systemCache: Promise<Cloud[]> | null = null;
let systemRev = -1;

export function loadLogogramCloud(size = 1100): Promise<Cloud> {
  if (!pending || formRev !== CLOUD_REV) pending = loadFormClouds(size).then((forms) => forms[0]);
  return pending;
}

export function loadFormClouds(size = 1100): Promise<Cloud[]> {
  if (!formCache || formRev !== CLOUD_REV) {
    formRev = CLOUD_REV;
    formCache = loadAll(size);
  }
  return formCache;
}

async function loadAll(size: number): Promise<Cloud[]> {
  const [base, sheet] = await Promise.all([decode("/logogram.jpg"), decode("/forms-9.jpg")]);
  const forms: Cloud[] = [buildCloud(read(base, 0, 150, base.width, 540), size, 11)];
  const cw = sheet.width / 3;
  const ch = sheet.height / 3;
  const padX = cw * 0.07;
  const padY = ch * 0.07;
  let seed = 40;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      forms.push(
        buildCloud(
          read(sheet, col * cw + padX, row * ch + padY, cw - padX * 2, ch - padY * 2),
          size,
          seed++,
        ),
      );
    }
  }
  return forms;
}

export function loadSystemClouds(size = 1100): Promise<Cloud[]> {
  if (!systemCache || systemRev !== DISCLOSE_REV || formRev !== CLOUD_REV) {
    systemRev = DISCLOSE_REV;
    systemCache = loadFormClouds(size).then((forms) => [...forms, discloseLogogram(forms[0])]);
  }
  return systemCache;
}
