"use client";

import { range, rangeNumerals } from "@/content/copy";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { flushSync } from "react-dom";

export type RangeView = (typeof range.views)[number];
export type RangeRead = RangeView | "habitat" | "technical";
export const RANGE_DISPLAY = 2;

const SYSTEMS = range.views.slice(0, 7);
const COLS = 5;
const DISPLAY = RANGE_DISPLAY;
const MOVE_MS = 320;
const QUEUE_MAX = 3;
const SWIPE_PX = 32;
const WHEEL_QUIET = 220;

type Dir = -1 | 1;
type Tile = { id: string; kind: "system" | "habitat" | "technical"; system?: number };

const RING: Tile[] = [
  { id: "s5", kind: "system", system: 5 },
  { id: "s6", kind: "system", system: 6 },
  { id: "hab", kind: "habitat" },
  { id: "tech", kind: "technical" },
  { id: "s0", kind: "system", system: 0 },
  { id: "s1", kind: "system", system: 1 },
  { id: "s2", kind: "system", system: 2 },
  { id: "s3", kind: "system", system: 3 },
  { id: "s4", kind: "system", system: 4 },
];
const LEN = RING.length;

const wrap = (n: number) => ((n % LEN) + LEN) % LEN;

function tilesInView(head: number, dir: 0 | Dir) {
  const first = dir === 1 ? -1 : 0;
  const last = dir === -1 ? COLS : COLS - 1;
  const out: { tile: Tile; base: number }[] = [];
  for (let base = first; base <= last; base += 1) {
    out.push({ tile: RING[wrap(head + base)], base });
  }
  return out;
}

function tileName(tile: Tile) {
  if (tile.kind === "habitat") return "Habitat";
  if (tile.kind === "technical") return range.engineering.name;
  return SYSTEMS[tile.system ?? 0]?.name;
}

function tileGlyph(tile: Tile) {
  if (tile.kind === "technical") return "+";
  if (tile.kind === "system") return rangeNumerals[tile.system ?? 0];
  return undefined;
}

function viewOf(tile: Tile): RangeRead | null {
  if (tile.kind === "habitat") return "habitat";
  if (tile.kind === "technical") return "technical";
  return SYSTEMS[tile.system ?? 0] ?? null;
}

function viewAtHead(head: number) {
  return viewOf(RING[wrap(head + DISPLAY)]);
}

function slotTone(slot: number) {
  if (slot < 0 || slot >= COLS) return "is-off";
  if (slot === DISPLAY) return "is-on";
  if (slot === 0 || slot === COLS - 1) return "is-board";
  return "is-train";
}

function HabitatMark({ spread = false }: { spread?: boolean }) {
  const extra = spread ? 1 : 0;
  const arm = (dir: -1 | 1, d: string) => (
    <g style={extra ? { transform: `translate(${dir * extra}mm, 0px)` } : undefined}>
      <g transform={`translate(${dir * 3.5} 0)`}>
        <path className="feat-epic-shade" d={d} transform="translate(-0.7 -0.9)" />
        <path className="feat-epic-lit" d={d} transform="translate(0.8 1)" />
        <path className="feat-epic-face" d={d} />
      </g>
    </g>
  );
  return (
    <svg className="feat-epic-mark" viewBox="0 0 64 64" aria-hidden="true">
      {arm(-1, "M27 11 L13 22 L13 42 L27 53")}
      {arm(1, "M37 11 L51 22 L51 42 L37 53")}
    </svg>
  );
}

function waitForSlide(node: HTMLElement | null) {
  return new Promise<void>((resolve) => {
    let done = false;
    const started = performance.now();
    const finish = () => {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      node?.removeEventListener("transitionend", onEnd);
      resolve();
    };
    const onEnd = (event: TransitionEvent) => {
      if (event.target !== node || event.propertyName !== "transform") return;
      if (performance.now() - started < MOVE_MS - 40) return;
      finish();
    };
    const timer = window.setTimeout(finish, MOVE_MS + 40);
    node?.addEventListener("transitionend", onEnd);
  });
}

export function RangeCarousel({
  style,
  at,
  live,
  armed,
  flat = false,
  habitatHere = true,
  onPick,
  onSeat,
  onView,
}: {
  style: CSSProperties;
  at: string;
  live: boolean;
  armed?: boolean;
  flat?: boolean;
  habitatHere?: boolean;
  onPick: (kind: "habitat" | "technical" | number) => void;
  onSeat?: (slot: number) => void;
  onView?: (view: RangeRead | null) => void;
}) {
  const [head, setHead] = useState(0);
  const [dir, setDir] = useState<0 | Dir>(0);
  const [shift, setShift] = useState(0);
  const [snap, setSnap] = useState(false);

  const headRef = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const open = useRef(true);
  const cool = useRef(0);
  const queue = useRef<Dir[]>([]);
  const dragged = useRef(false);
  const stepRef = useRef<(next: Dir) => void>(() => undefined);
  const onViewRef = useRef(onView);
  onViewRef.current = onView;

  const shown = RING[wrap(head + DISPLAY)];
  const read: RangeRead | null = viewOf(shown);

  const destHead = () => {
    let at = headRef.current;
    for (const next of queue.current) at = wrap(at - next);
    return at;
  };

  const callView = (at: number) => {
    onViewRef.current?.(viewAtHead(at));
  };

  useEffect(() => {
    onViewRef.current?.(read);
  }, [read]);

  const run = async (next: Dir) => {
    const track = trackRef.current;
    open.current = false;
    flushSync(() => {
      setSnap(true);
      setDir(next);
      setShift(0);
    });
    if (track) void track.offsetHeight;
    flushSync(() => {
      setSnap(false);
      setShift(next);
    });
    await waitForSlide(track?.querySelector(".range-reel-item"));

    const after = wrap(headRef.current - next);
    headRef.current = after;
    flushSync(() => {
      setSnap(true);
      setHead(after);
      setShift(0);
      setDir(0);
    });
    if (track) void track.offsetHeight;
    open.current = true;
    cool.current = performance.now() + 50;
    setSnap(false);
  };

  const drain = async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      while (queue.current.length) {
        const next = queue.current.shift();
        if (next) await run(next);
      }
    } finally {
      busy.current = false;
      if (queue.current.length) void drain();
    }
  };

  const step = (next: Dir) => {
    if (flat || queue.current.length >= QUEUE_MAX) return;
    queue.current.push(next);
    callView(destHead());
    void drain();
  };
  stepRef.current = step;

  useEffect(() => {
    if (flat) return;

    let pointerY: number | null = null;
    let wheelAt = 0;
    let wheelMag = 0;
    let wheelDir: 0 | Dir = 0;
    let wheelSpent = false;

    const ignore = (target: EventTarget | null) =>
      target instanceof HTMLElement && Boolean(target.closest("input, textarea, select"));

    const take = (next: Dir) => {
      if (!open.current) return;
      if (performance.now() < cool.current) return;
      open.current = false;
      stepRef.current(next);
    };

    const onDown = (event: PointerEvent) => {
      if (event.button !== 0 || ignore(event.target)) return;
      pointerY = event.clientY;
      dragged.current = false;
    };
    const onMove = (event: PointerEvent) => {
      if (pointerY == null) return;
      if (Math.abs(event.clientY - pointerY) > 18) dragged.current = true;
    };
    const onUp = (event: PointerEvent) => {
      if (pointerY == null) return;
      const dy = event.clientY - pointerY;
      pointerY = null;
      if (Math.abs(dy) <= SWIPE_PX) return;
      dragged.current = true;
      take(dy > 0 ? -1 : 1);
    };
    const onCancel = () => {
      pointerY = null;
    };
    const onWheel = (event: WheelEvent) => {
      const mag = Math.abs(event.deltaY);
      if (mag < 10) return;
      event.preventDefault();
      const now = performance.now();
      const next: Dir = event.deltaY > 0 ? -1 : 1;
      const quiet = now - wheelAt > WHEEL_QUIET;
      const reverse = wheelDir !== 0 && next !== wheelDir;
      const punch = mag > wheelMag * 1.8 && mag > 28;
      if (reverse || punch || (quiet && mag > 32)) wheelSpent = false;
      wheelAt = now;
      wheelDir = next;
      wheelMag = mag;
      if (wheelSpent) return;
      wheelSpent = true;
      take(next);
    };

    window.addEventListener("pointerdown", onDown, true);
    window.addEventListener("pointermove", onMove, true);
    window.addEventListener("pointerup", onUp, true);
    window.addEventListener("pointercancel", onCancel, true);
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("pointermove", onMove, true);
      window.removeEventListener("pointerup", onUp, true);
      window.removeEventListener("pointercancel", onCancel, true);
      window.removeEventListener("wheel", onWheel);
    };
  }, [flat]);

  const onTile = (tile: Tile, slot: number) => {
    if (dragged.current) {
      dragged.current = false;
      return;
    }
    if (flat) {
      if (slot < 0 || slot >= COLS) return;
      if (tile.kind === "habitat" && slot === DISPLAY && habitatHere) onPick("habitat");
      else if (tile.kind === "technical" && slot === DISPLAY) onPick("technical");
      else onSeat?.(slot);
      return;
    }
    if (slot === DISPLAY) {
      onPick(tile.kind === "habitat" ? "habitat" : tile.kind === "technical" ? "technical" : tile.system ?? 0);
      return;
    }
    if (slot === COLS - 1) {
      step(-1);
      return;
    }
    const steps = Math.abs(DISPLAY - slot);
    const next: Dir = slot < DISPLAY ? 1 : -1;
    for (let i = 0; i < steps && queue.current.length < QUEUE_MAX; i += 1) queue.current.push(next);
    callView(destHead());
    void drain();
  };

  return (
    <div className="range-reel" style={style} data-at={at} data-live={live ? "1" : undefined} data-armed={armed ? "1" : undefined} data-flat={flat ? "1" : undefined}>
      <div className="range-reel-view" ref={trackRef}>
        {tilesInView(head, dir).map(({ tile, base }) => {
          const slot = base + shift;
          const name = tileName(tile);
          const glyph = tileGlyph(tile);
          const plus = tile.kind === "technical";
          const on = slot === DISPLAY;
          const showMark = on && (plus || (tile.kind === "habitat" && habitatHere));
          return (
            <div
              key={tile.id}
              className={`range-reel-item${snap ? " is-jump" : ""}`}
              style={{ ["--slot" as string]: String(slot) }}
            >
              <button
                type="button"
                className={`feat-tile range-reel-slide ${slotTone(slot)}${tile.kind === "habitat" ? " is-hab" : ""}`}
                aria-label={name ?? "Board tile"}
                aria-current={on ? "true" : undefined}
                tabIndex={slot < 0 || slot >= COLS ? -1 : undefined}
                onClick={() => onTile(tile, slot)}
              >
                {showMark ? <HabitatMark spread={plus} /> : null}
                {on && glyph ? (
                  <p className="range-reel-label">
                    <span className={`land-hero-live range-numeral${plus ? " is-plus" : ""}`}>{glyph}</span>
                  </p>
                ) : null}
              </button>
            </div>
          );
        })}
        <button
          type="button"
          className="range-reel-arrow is-up"
          aria-label="Move carousel up"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => {
            if (dragged.current) {
              dragged.current = false;
              return;
            }
            step(1);
          }}
        >
          <span className="land-flick-mark" aria-hidden="true">
            <svg viewBox="0 0 12 12">
              <path d="M2 8l4-4 4 4" fill="none" stroke="currentColor" strokeWidth="0.85" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
        <button
          type="button"
          className="range-reel-arrow is-down"
          aria-label="Move carousel down"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => {
            if (dragged.current) {
              dragged.current = false;
              return;
            }
            step(-1);
          }}
        >
          <span className="land-flick-mark" aria-hidden="true">
            <svg viewBox="0 0 12 12">
              <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="0.85" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}
