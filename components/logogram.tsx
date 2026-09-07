"use client";

import { useEffect, useRef } from "react";
import { loadFormClouds, loadSystemClouds, FOOTPRINT_FORM, CLOUD_REV, lockGlyph, type Cloud } from "@/lib/sample-logogram";
import { FLOW_CYCLE_S, FLOW_OMEGA, FLOW_TAU, particleRanks, polarField, sampleField } from "@/lib/ink-flow";
import { habitatModules, shapeHabitat } from "@/lib/habitat-cloud";
import type { HabitatView } from "@/lib/layers";
import type { EcoId } from "@/lib/ecosystems";
import type { SliceId } from "@/lib/slices";
import { FORM } from "@/lib/sessions";
import { tempoPresence, tempoTime } from "@/lib/tempo";

const FOCAL = 920;
function smoothstep(a: number, b: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

export function Logogram({
  className = "",
  live = false,
  inverted = false,
  bloom = [],
  form = 0,
  system = false,
  cluster = -2,
  habitatView = "entity",
  partId = null,
  sliceId = null,
  ecoId = null,
  onSelect,
  onHabitat,
  bare = false,
  reel = false,
  passive = false,
  tempo = false,
  compact = false,
}: {
  className?: string;
  live?: boolean;
  inverted?: boolean;
  bloom?: number[];
  form?: number;
  system?: boolean;
  cluster?: number;
  habitatView?: HabitatView;
  partId?: string | null;
  sliceId?: SliceId | null;
  ecoId?: EcoId | null;
  onSelect?: (id: number) => void;
  onHabitat?: (id: string | null) => void;
  bare?: boolean;
  reel?: boolean;
  passive?: boolean;
  tempo?: boolean;
  compact?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bloomRef = useRef(bloom);
  const selectRef = useRef(onSelect);
  const habitatPickRef = useRef(onHabitat);
  const invertedRef = useRef(inverted);
  const formRef = useRef(form);
  const clusterRef = useRef(cluster);
  const habitatViewRef = useRef(habitatView);
  const partIdRef = useRef(partId);
  const sliceIdRef = useRef(sliceId);
  const ecoIdRef = useRef(ecoId);
  const bareRef = useRef(bare);
  const reelRef = useRef(reel);
  const passiveRef = useRef(passive);
  const tempoRef = useRef(tempo);
  const compactRef = useRef(compact);
  bloomRef.current = bloom;
  selectRef.current = onSelect;
  habitatPickRef.current = onHabitat;
  invertedRef.current = inverted;
  formRef.current = form;
  clusterRef.current = cluster;
  habitatViewRef.current = habitatView;
  partIdRef.current = partId;
  sliceIdRef.current = sliceId;
  ecoIdRef.current = ecoId;
  bareRef.current = bare;
  reelRef.current = reel;
  passiveRef.current = passive;
  tempoRef.current = tempo;
  compactRef.current = compact;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: 0, y: 0, live: 0 };
    const select = [0, 0, 0, 0];
    let hoverSmooth = 0;
    let raf = 0;
    let cloud: Cloud | null = null;
    let forms: Cloud[] | null = null;
    let toI = 0;
    let mix = 1;
    let order: Uint32Array | null = null;
    let depths: Float32Array | null = null;
    let px: Float32Array | null = null;
    let py: Float32Array | null = null;
    let pr: Float32Array | null = null;
    let po: Float32Array | null = null;
    let heat: Float32Array | null = null;
    let destCache: Cloud | null = null;
    let destCacheKey = "";
    let tempoReach = 1;
    let tempoGrain = 1;
    let tempoReachKey = "";
    let playFrom: Cloud | null = null;
    let playTo: Cloud | null = null;
    let playKey = "";
    let playFromF = FORM.map(() => ({ x: 0, y: 0 }));
    let playToF = FORM.map(() => ({ x: 0, y: 0 }));
    let lastT = 0;
    let tempoClock = 0;
    let hold = 0;
    let reelI = 0;
    const foci = FORM.map(() => ({ x: 0, y: 0 }));
    const fociP = FORM.map(() => ({ x: 0, y: 0 }));
    let formFoci: { x: number; y: number }[][] = [];
    const origin = performance.now();
    let size = 1100;
    let hoverCode = -1;
    let isol: Float32Array | null = null;
    let modsCache: ReturnType<typeof habitatModules> | null = null;
    let modsKey = "";
    type Hull = { minX: number; minY: number; maxX: number; maxY: number };
    let hulls = new Map<number, Hull>();
    let down: { x: number; y: number } | null = null;
    let fields: Float32Array[] | null = null;
    let flowTh: Float32Array | null = null;
    let flowRd: Float32Array | null = null;
    let flowVr: Float32Array | null = null;
    let flowRank: Float32Array | null = null;
    let flowPhase = 0;
    let inkReady = false;
    let lastPaint = 0;
    let onScreen = true;
    const originX = new Float32Array(256);
    const originY = new Float32Array(256);
    const outerMark = new Uint8Array(256);

    const fociOf = (src: Cloud) =>
      FORM.map((s, i) => {
        let x = 0;
        let y = 0;
        let n = 0;
        for (let p = 0; p < src.n; p++) {
          if (src.c[p] !== s.id) continue;
          x += src.x[p];
          y += src.y[p];
          n += 1;
        }
        if (!n) {
          return {
            x: src.cx + Math.cos(FORM[i].a) * src.meanR,
            y: src.cy + Math.sin(FORM[i].a) * src.meanR,
          };
        }
        return { x: x / n, y: y / n };
      });

    const resize = () => {
      if (!cloud) return;
      size = Math.round(cloud.cx * 2);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const local = (e: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - box.left) / box.width) * size,
        y: ((e.clientY - box.top) / box.height) * size,
      };
    };

    const insideHull = (b: Hull, x: number, y: number, slack: number) =>
      x >= b.minX - slack && x <= b.maxX + slack && y >= b.minY - slack && y <= b.maxY + slack;

    const pickFromHulls = (x: number, y: number) => {
      if (!hulls.size) return null;
      if (hoverCode >= 0) {
        const held = hulls.get(hoverCode);
        if (held && insideHull(held, x, y, 18)) {
          return (modsCache ?? []).find((m) => m.code === hoverCode) ?? null;
        }
      }
      let best: number | null = null;
      let bestArea = 1e18;
      for (const [cid, b] of hulls) {
        if (!insideHull(b, x, y, 0)) continue;
        const area = (b.maxX - b.minX) * (b.maxY - b.minY);
        if (area < bestArea) {
          bestArea = area;
          best = cid;
        }
      }
      if (best == null) return null;
      return (modsCache ?? []).find((m) => m.code === best) ?? null;
    };

    const onMove = (e: PointerEvent) => {
      const p = local(e);
      pointer.x = p.x;
      pointer.y = p.y;
      pointer.live = 1;
    };
    const onLeave = () => {
      pointer.live = 0;
      hoverCode = -1;
      down = null;
      canvas.style.cursor = "";
    };
    const onDown = (e: PointerEvent) => {
      const p = local(e);
      down = { x: p.x, y: p.y };
      pointer.x = p.x;
      pointer.y = p.y;
      pointer.live = 1;
    };
    const onUp = (e: PointerEvent) => {
      if (!cloud || !down) {
        down = null;
        return;
      }
      const p = local(e);
      const dragged = Math.hypot(p.x - down.x, p.y - down.y) > 10;
      down = null;
      if (dragged) return;
      const hab = habitatViewRef.current;
      if (hab && hab !== "entity") {
        const hit = pickFromHulls(p.x, p.y);
        if (hit) habitatPickRef.current?.(hit.pick);
        return;
      }
      if (!selectRef.current) return;
      const blooming = bloomRef.current;
      const ids = blooming.length ? blooming : FORM.map((s) => s.id);
      let best = -1;
      let bestD = cloud.meanR * 0.62;
      for (const id of ids) {
        const f = fociP[id] ?? foci[id];
        const d = Math.hypot(p.x - f.x, p.y - f.y);
        if (d < bestD) {
          bestD = d;
          best = id;
        }
      }
      if (best >= 0) selectRef.current(best);
    };

    if (!passive) {
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerleave", onLeave);
      canvas.addEventListener("pointerdown", onDown);
      canvas.addEventListener("pointerup", onUp);
    }

    const paintInk = (t: number, dt: number) => {
      if (!forms || !fields || !flowTh || !flowRd || !flowVr || !flowRank || !px || !py || !pr || !po) return;
      const n = flowTh.length;
      const cx = forms[0].cx;
      const cy = forms[0].cy;
      const inset = 0.82;
      flowPhase += dt / FLOW_CYCLE_S;
      const count = fields.length;
      const i0 = Math.floor(flowPhase) % count;
      const i1 = (i0 + 1) % count;
      const fract = flowPhase - Math.floor(flowPhase);
      const u = 0.5 - 0.5 * Math.cos(Math.PI * fract);
      const F0 = fields[i0];
      const F1 = fields[i1];
      const inverted = invertedRef.current;

      if (!inkReady) {
        ctx.clearRect(0, 0, size, size);
        inkReady = true;
      } else {
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = "rgba(0,0,0,0.068)";
        ctx.globalAlpha = 1;
        ctx.fillRect(0, 0, size, size);
        ctx.globalCompositeOperation = "source-over";
      }
      ctx.fillStyle = inverted ? "#f4f3f0" : "#111111";

      const swirl = FLOW_OMEGA * (1 + 0.22 * Math.sin(t * 0.13));
      for (let i = 0; i < n; i++) {
        let th = flowTh[i] + swirl * dt + Math.sin(t * 0.41 + flowRank[i] * 5.1) * 0.09 * dt;
        th = Math.atan2(Math.sin(th), Math.cos(th));
        flowTh[i] = th;
        const target = sampleField(F0, th, flowRank[i]) * (1 - u) + sampleField(F1, th, flowRank[i]) * u;
        const err = target - flowRd[i];
        flowVr[i] += err * 7.4 * dt;
        flowVr[i] *= Math.exp(-4.6 * dt);
        flowRd[i] += flowVr[i] * dt;
        const x = cx + Math.cos(th) * flowRd[i];
        const y = cy + Math.sin(th) * flowRd[i];
        px[i] = cx + (x - cx) * inset;
        py[i] = cy + (y - cy) * inset;
        pr[i] = 1.2 + forms[0].r[i] * 2.25;
        po[i] = Math.min(0.66, 0.26 + forms[0].o[i] * 0.4);
      }
      for (let i = 0; i < n; i++) {
        ctx.globalAlpha = po[i];
        ctx.beginPath();
        ctx.arc(px[i], py[i], pr[i], 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const paint = (t: number) => {
      if (!cloud || !forms || !order || !depths || !px || !py || !pr || !po || !heat) return;
      const reelOn = reelRef.current;
      const hab = habitatViewRef.current;
      const slice = sliceIdRef.current;
      const eco = ecoIdRef.current;
      const dt = lastT ? Math.min(0.05, Math.max(0, t - lastT)) : 0;
      lastT = t;
      if (reelOn) {
        paintInk(t, dt);
        return;
      }
      let from: Cloud;
      let to: Cloud;
      let blend: number;
      let quiet: number;
      const habOn = Boolean(hab && hab !== "entity");
      const tempoOn = tempoRef.current;
      let dest: Cloud;
      let key: string;
      if (habOn) {
        key = `h:${CLOUD_REV}:${hab}:${slice ?? ""}:${eco ?? ""}`;
        if (key !== destCacheKey) {
          destCache = shapeHabitat(cloud, hab, null, slice, eco);
          destCacheKey = key;
        }
        dest = destCache ?? forms[0];
      } else {
        const want = Math.max(0, Math.min(forms.length - 1, formRef.current | 0));
        key = `f:${want}`;
        dest = forms[want];
        toI = want;
      }
      if (key !== playKey) {
        playFrom = playTo ?? forms[0];
        playTo = dest;
        playKey = key;
        mix = 0;
        playFromF = fociOf(playFrom);
        playToF = fociOf(playTo);
      }
      const rate = habOn ? 0.11 : 0.07;
      mix += (1 - mix) * rate;
      from = playFrom ?? forms[0];
      to = playTo ?? dest;
      blend = mix;
      const prevHab = playFrom != null && forms.indexOf(playFrom) < 0;
      quiet = 0;
      if (habOn) quiet = prevHab ? 1 : mix;
      else if (prevHab) quiet = 1 - mix;
      else {
        const destForm = playKey.startsWith("f:") ? Number(playKey.slice(2)) : -1;
        const fromForm = playFrom ? forms.indexOf(playFrom) : -1;
        quiet =
          destForm === FOOTPRINT_FORM ? mix : fromForm === FOOTPRINT_FORM ? 1 - mix : 0;
      }
      const n = to.n;
      const cx = reelOn ? from.cx : to.cx;
      const cy = reelOn ? from.cy : to.cy;
      const meanR = from.meanR * (1 - blend) + to.meanR * blend;
      ctx.clearRect(0, 0, size, size);
      if (invertedRef.current) {
        if (!bareRef.current) {
          ctx.fillStyle = "#1a1a1a";
          ctx.fillRect(0, 0, size, size);
        }
        ctx.fillStyle = "#f3f3f3";
      } else {
        if (!bareRef.current) {
          ctx.fillStyle = "#f6f4ef";
          ctx.fillRect(0, 0, size, size);
        }
        ctx.fillStyle = "#111111";
      }

      const blooming = bloomRef.current;
      for (let s = 0; s < FORM.length; s++) {
        const on = blooming.includes(FORM[s].id) ? 1 : 0;
        select[s] += (on - select[s]) * 0.08;
      }
      let bloomAmt = 0;
      for (let s = 0; s < FORM.length; s++) bloomAmt = Math.max(bloomAmt, select[s]);

      const fromF = playFromF;
      const toF = playToF;
      for (let s = 0; s < FORM.length; s++) {
        foci[s].x = fromF[s].x * (1 - blend) + toF[s].x * blend;
        foci[s].y = fromF[s].y * (1 - blend) + toF[s].y * blend;
      }

      const lookR = Math.hypot(pointer.x - cx, pointer.y - cy);
      const onBody = quiet > 0.25
        ? 1 - smoothstep(meanR * 1.65, meanR * 2.45, lookR)
        : smoothstep(meanR * 0.22, meanR * 0.48, lookR) *
          (1 - smoothstep(meanR * 1.95, meanR * 2.55, lookR));
      const hoverAmt = passiveRef.current ? 0 : pointer.live * onBody;
      hoverSmooth += (hoverAmt - hoverSmooth) * 0.1;

      const clock = tempoTime();
      const beat = tempoOn ? tempoPresence(clock) : { vis: 1, rev: 0, flash: 0 };
      if (tempoOn) tempoClock += dt * (1 + beat.rev * beat.rev * 5.4);
      const ax = reelOn ? 0 : 0.18 + Math.sin(t * 0.13) * 0.02 * (quiet > 0.2 ? 1 : 1 - blend * 0.55);
      const ay = reelOn ? 0 : Math.sin(t * 0.09) * 0.03 * (quiet > 0.2 ? 1 : 1 - blend * 0.55);
      const cosX = Math.cos(ax);
      const sinX = Math.sin(ax);
      const cosY = Math.cos(ay);
      const sinY = Math.sin(ay);
      const pulse = reelOn ? 1 : 1 + Math.sin(t * 0.75) * 0.01;
      const inset = tempoOn ? 1 : 0.82;
      if (tempoOn && playKey !== tempoReachKey) {
        let ext = 1;
        for (let i = 0; i < n; i++) {
          const e = Math.hypot(to.x[i] - cx, to.y[i] - cy);
          if (e > ext) ext = e;
        }
        tempoReach = (size * (compactRef.current ? 0.22 : 0.2)) / ext;
        tempoGrain = Math.sqrt((size * 0.28) / ext);
        tempoReachKey = playKey;
      }
      const reach = tempoOn ? tempoReach : 1;
      if (tempoOn && beat.vis < 0.015) {
        ctx.globalAlpha = 1;
        return;
      }
      const twoCore = 2 * (meanR * 0.28) * (meanR * 0.28);
      const twoNear = 2 * (meanR * 0.42) * (meanR * 0.42);
      const twoFar = 2 * (meanR * 0.78) * (meanR * 0.78);
      const twoHover = 2 * (meanR * (0.32 + quiet * 0.4)) * (meanR * (0.32 + quiet * 0.4));
      const depthBuf = depths;
      const heatBuf = heat;

      const project = (xi: number, yi: number, zi: number) => {
        const x0 = (xi - cx) * pulse * inset;
        const y0 = (yi - cy) * pulse * inset;
        const y1 = y0 * cosX - zi * sinX;
        const z1 = y0 * sinX + zi * cosX;
        const x1 = x0 * cosY + z1 * sinY;
        const z2 = -x0 * sinY + z1 * cosY;
        const persp = FOCAL / (FOCAL + z2);
        return { x: cx + x1 * persp, y: cy + y1 * persp };
      };
      for (let s = 0; s < FORM.length; s++) {
        fociP[s] = project(foci[s].x, foci[s].y, 0);
      }

      if (habOn && cloud) {
        const key = `${hab}:${slice ?? ""}:${eco ?? ""}`;
        if (key !== modsKey) {
          modsCache = habitatModules(cloud, hab, slice, eco);
          modsKey = key;
        }
        if (!passiveRef.current && pointer.live > 0.12) {
          hulls = new Map();
          for (let i = 0; i < n; i++) {
            const cid = to.c[i];
            if (cid < 0) continue;
            const oi = from.o[i] * (1 - blend) + to.o[i] * blend;
            if (oi < 0.2) continue;
            const xi = from.x[i] * (1 - blend) + to.x[i] * blend;
            const yi = from.y[i] * (1 - blend) + to.y[i] * blend;
            const zi = from.z[i] * (1 - blend) + to.z[i] * blend;
            const ri = from.r[i] * (1 - blend) + to.r[i] * blend;
            const x0 = (xi - cx) * inset;
            const y0 = (yi - cy) * inset;
            const y1 = y0 * cosX - zi * sinX;
            const z1 = y0 * sinX + zi * cosX;
            const x1 = x0 * cosY + z1 * sinY;
            const z2 = -x0 * sinY + z1 * cosY;
            const persp = FOCAL / (FOCAL + z2);
            const hx = cx + x1 * persp;
            const hy = cy + y1 * persp;
            const pad = ri * persp * 0.9;
            const b = hulls.get(cid);
            if (!b) hulls.set(cid, { minX: hx - pad, minY: hy - pad, maxX: hx + pad, maxY: hy + pad });
            else {
              b.minX = Math.min(b.minX, hx - pad);
              b.minY = Math.min(b.minY, hy - pad);
              b.maxX = Math.max(b.maxX, hx + pad);
              b.maxY = Math.max(b.maxY, hy + pad);
            }
          }
          const hit = pickFromHulls(pointer.x, pointer.y);
          hoverCode = hit ? hit.code : -1;
          canvas.style.cursor = hit ? "pointer" : "";
        } else {
          hoverCode = -1;
          if (!passiveRef.current) canvas.style.cursor = "";
        }
      } else {
        modsCache = null;
        modsKey = "";
        hulls = new Map();
        hoverCode = -1;
      }

      if (!isol || isol.length !== n) isol = new Float32Array(n);
      originX.fill(0);
      originY.fill(0);
      if (habOn && modsCache) {
        for (const m of modsCache) {
          originX[m.code] = m.x;
          originY[m.code] = m.y;
        }
      }

      for (let i = 0; i < n; i++) {
        const fl = reelOn ? 0 : ((from.flow?.[i] ?? 0) * (1 - blend) + (to.flow?.[i] ?? 0) * blend) * quiet;
        const ph = (from.phase?.[i] ?? 0) * (1 - blend) + (to.phase?.[i] ?? 0) * blend;
        const drift = Math.sin(t * 1.55 + ph * Math.PI * 2) * fl * (3.2 + quiet * 11);
        let xi: number;
        let yi: number;
        if (reelOn) {
          const a = from.a[i];
          const rad = from.rho[i] * (1 - blend) + to.rho[i] * blend;
          xi = cx + Math.cos(a) * rad;
          yi = cy + Math.sin(a) * rad;
        } else {
          xi =
            from.x[i] * (1 - blend) +
            to.x[i] * blend +
            ((from.vx?.[i] ?? 0) * (1 - blend) + (to.vx?.[i] ?? 0) * blend) * drift;
          yi =
            from.y[i] * (1 - blend) +
            to.y[i] * blend +
            ((from.vy?.[i] ?? 0) * (1 - blend) + (to.vy?.[i] ?? 0) * blend) * drift;
        }
        if (tempoOn) {
          const dx = xi - cx;
          const dy = yi - cy;
          const rho = Math.hypot(dx, dy);
          const rewind = rho < meanR * 0.5;
          const spin = rewind ? -tempoClock * 0.32 : tempoClock * 0.22;
          const cs = Math.cos(spin);
          const sn = Math.sin(spin);
          xi = cx + dx * cs - dy * sn;
          yi = cy + dx * sn + dy * cs;
          xi = cx + (xi - cx) * reach;
          yi = cy + (yi - cy) * reach;
        }
        const zi =
          from.z[i] * (1 - blend) +
          to.z[i] * blend +
          (reelOn ? 0 : ((from.vz?.[i] ?? 0) * (1 - blend) + (to.vz?.[i] ?? 0) * blend) * drift);
        const ri = from.r[i] * (1 - blend) + to.r[i] * blend;
        const oi = from.o[i] * (1 - blend) + to.o[i] * blend;
        const ai = from.a[i];
        if (tempoOn && beat.rev > 0.12) {
          const shake = beat.rev * beat.rev * 3.4;
          const hz = 14 + beat.rev * 48;
          xi += Math.sin(clock * hz + ai * 6.1) * shake;
          yi += Math.cos(clock * (hz * 0.87) + ai * 5.2) * shake;
        }
        const cluster = clusterRef.current;
        const cid = to.c[i];
        let h = 0;
        if (quiet > 0.35) {
          if (cluster >= 0 && cid === cluster) h += 0.95;
          else if (cluster === -1 && cid >= 0) h += reelRef.current ? 0.55 : 0.38;
          else if (cid < 0) h += 0.04;
        }
        if (!habOn) {
          for (let s = 0; s < FORM.length; s++) {
            if (select[s] < 0.004) continue;
            const dsx = xi - foci[s].x;
            const dsy = yi - foci[s].y;
            const d2 = dsx * dsx + dsy * dsy;
            h += select[s] * FORM[s].amp * (
              Math.exp(-d2 / twoCore) * 1.05 +
              Math.exp(-d2 / twoNear) * 0.72 +
              Math.exp(-d2 / twoFar) * 0.28
            );
          }
        }
        if (habOn && isol) {
          const aim = hoverCode >= 0 && cid === hoverCode ? 1 : 0;
          isol[i] += (aim - isol[i]) * 0.22;
        } else if (!habOn && hoverSmooth > 0.01) {
          const dxp = xi - pointer.x;
          const dyp = yi - pointer.y;
          const h2 = dxp * dxp + dyp * dyp;
          h += hoverSmooth * (1 + quiet * 0.85) * (Math.exp(-h2 / twoHover) * 0.45 + Math.exp(-h2 / twoFar) * 0.18);
        }
        h = Math.min(1.4, h);
        heatBuf[i] = h;
        const glow = habOn && isol ? isol[i] : 0;
        let xh = xi;
        let yh = yi;
        let zh = zi;
        if (glow > 0.002 && cid >= 0) {
          const ox = originX[cid];
          const oy = originY[cid];
          const grow = 1 + glow * 0.45;
          xh = ox + (xi - ox) * grow;
          yh = oy + (yi - oy) * grow;
          zh = zi * grow;
        }
        const breath = reelOn ? 1 : 1 + Math.sin(t * 0.9 + ai * 1.6) * 0.01;
        const ux = Math.cos(ai);
        const uy = Math.sin(ai);
        const body = quiet < 0.2 ? 0.96 : 0.78;
        const swell = habOn || reelOn ? 0 : h;
        const inflate = 1 + swell * (0.16 + quiet * 0.2);
        const flow = reelOn ? 0 : Math.sin(t * 0.55 + ai * 2.1) * (0.85 + swell * 0.7) * (1 - quiet * 0.35);
        const x0 = ((xh - cx) * pulse * breath * inflate + ux * swell * 10 - uy * flow) * inset;
        const y0 = ((yh - cy) * pulse * breath * inflate + uy * swell * 10 + ux * flow) * inset;
        const zz = reelOn
          ? zh * 0.03 * inset
          : (zh * (1 + swell * 0.45) + Math.sin(t * 0.7 + ai * 2.6) * (2.4 + swell * 6) * (1 - quiet * 0.35)) * inset;
        const y1 = y0 * cosX - zz * sinX;
        const z1 = y0 * sinX + zz * cosX;
        const x1 = x0 * cosY + z1 * sinY;
        const z2 = -x0 * sinY + z1 * cosY;
        const persp = FOCAL / (FOCAL + z2);
        px[i] = cx + x1 * persp;
        py[i] = cy + y1 * persp;
        const hush = tempoOn ? 0 : quiet * (1 - Math.min(1, swell * 1.15)) * 0.15;
        pr[i] = ri * persp * (body + swell * 1.55 + glow * 1.05) * (1 - hush);
        const shade = (90 - z2) / 180;
        const lit = Math.max(0, Math.min(1, tempoOn ? 0.78 + shade * 0.22 : shade));
        const rest = oi * ((quiet < 0.2 ? 0.78 : 0.62) + lit * (tempoOn ? 0.52 : 0.28)) * (1 - bloomAmt * 0.08);
        po[i] = Math.min(1, rest * (tempoOn ? 1.62 : 1) + swell * 0.78 + glow * 0.7);
        if (tempoOn) {
          const charge = beat.rev * beat.rev;
          const thick = compactRef.current ? 1.85 : 1.24;
          pr[i] *= thick * tempoGrain * (1 + charge * 0.55 + beat.flash * 0.85);
          po[i] = Math.min(1, po[i] * beat.vis * (1 + charge * 2.4) + beat.flash * 0.95);
        }
        if (reelOn) {
          pr[i] = 1.05 + ri * 2.35;
          po[i] = Math.min(0.78, 0.32 + oi * 0.48);
        }
        depthBuf[i] = z2;
        order[i] = i;
      }

      if (!passiveRef.current) {
        order.sort((i, j) => depthBuf[i] - depthBuf[j]);
      }
      const ink = invertedRef.current ? "243,243,243" : "17,17,17";
      const inkHex = invertedRef.current ? "#f3f3f3" : "#111111";
      const outerHex = "#6226ff";
      outerMark.fill(0);
      if (tempoOn && modsCache) {
        for (const m of modsCache) {
          if (/^eco-\d+$/.test(m.pick)) outerMark[m.code] = 1;
        }
      }

      ctx.fillStyle = inkHex;
      for (let k = 0; k < n; k++) {
        const i = order[k];
        if (po[i] < 0.02 || pr[i] < 0.08) continue;
        if (tempoOn && to.c[i] >= 0 && outerMark[to.c[i]]) continue;
        ctx.globalAlpha = Math.min(1, po[i]);
        ctx.beginPath();
        ctx.arc(px[i], py[i], pr[i], 0, Math.PI * 2);
        ctx.fill();
      }
      if (tempoOn) {
        ctx.fillStyle = outerHex;
        for (let k = 0; k < n; k++) {
          const i = order[k];
          if (po[i] < 0.02 || pr[i] < 0.08) continue;
          if (to.c[i] < 0 || !outerMark[to.c[i]]) continue;
          ctx.globalAlpha = Math.min(1, po[i]);
          ctx.beginPath();
          ctx.arc(px[i], py[i], pr[i], 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (tempoOn && beat.flash > 0.02) {
        const R = meanR * reach * (1.05 + beat.flash * 0.4);
        const flare = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
        flare.addColorStop(0, `rgba(${ink},${0.55 * beat.flash})`);
        flare.addColorStop(0.28, `rgba(${ink},${0.18 * beat.flash})`);
        flare.addColorStop(1, `rgba(${ink},0)`);
        ctx.globalAlpha = 1;
        ctx.fillStyle = flare;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = inkHex;
      }
      if (quiet < 0.25 && !habOn && !reelOn) {
        for (let s = 0; s < FORM.length; s++) {
          if (select[s] < 0.04) continue;
          const f = fociP[s];
          const R = meanR * (0.4 + select[s] * 0.12);
          const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, R);
          g.addColorStop(0, `rgba(${ink},${0.28 * select[s]})`);
          g.addColorStop(0.4, `rgba(${ink},${0.1 * select[s]})`);
          g.addColorStop(1, `rgba(${ink},0)`);
          ctx.globalAlpha = 1;
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(f.x, f.y, R, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = invertedRef.current ? "#f3f3f3" : "#111111";
        }
      }
      ctx.globalAlpha = 1;
    };

    let cancelled = false;
    const load = system ? loadSystemClouds : loadFormClouds;
    load(1100).then((loaded) => {
      if (cancelled) return;
      forms = reel ? loaded.map(lockGlyph) : loaded;
      cloud = forms[0];
      if (reel) {
        fields = forms.map(polarField);
        flowRank = particleRanks(forms[0]);
        flowTh = new Float32Array(forms[0].a);
        flowRd = new Float32Array(forms[0].rho);
        flowVr = new Float32Array(forms[0].n);
        flowPhase = 0;
        inkReady = false;
      }
      order = new Uint32Array(cloud.n);
      depths = new Float32Array(cloud.n);
      px = new Float32Array(cloud.n);
      py = new Float32Array(cloud.n);
      pr = new Float32Array(cloud.n);
      po = new Float32Array(cloud.n);
      heat = new Float32Array(cloud.n);
      for (let i = 0; i < cloud.n; i++) order[i] = i;
      formFoci = loaded.map(fociOf);
      for (let s = 0; s < FORM.length; s++) {
        foci[s].x = formFoci[0][s].x;
        foci[s].y = formFoci[0][s].y;
        fociP[s].x = foci[s].x;
        fociP[s].y = foci[s].y;
      }
      size = Math.round(cloud.cx * 2);
      pointer.x = cloud.cx;
      pointer.y = cloud.cy;
      resize();
      if (reduced) {
        paint(0);
        return;
      }
      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        if (document.hidden || !onScreen) return;
        if (passiveRef.current && now - lastPaint < 33) return;
        lastPaint = now;
        pointer.live += ((pointer.live > 0 ? 1 : 0) - pointer.live) * 0.05;
        paint((now - origin) / 1000);
      };
      raf = requestAnimationFrame(frame);
    });

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry?.isIntersecting ?? true;
      },
      { root: null, threshold: 0.05 },
    );
    io.observe(canvas);

    window.addEventListener("resize", resize);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      raf = 0;
      io.disconnect();
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
    };
  }, [live, system, reel, tempo, compact, passive, CLOUD_REV]);

  return (
    <canvas
      ref={canvasRef}
      className={`${className} ${onSelect ? "cursor-pointer" : ""}`}
      width={1100}
      height={1100}
      role="img"
      aria-label={
        system
          ? "Habitat. Hover a mass to isolate it. Press it to read its state."
          : "Living logogram. Lit clusters are the affected regions — click one to inspect."
      }
    />
  );
}
