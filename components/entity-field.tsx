"use client";

import { buildField, cellOpen, nearestOpen, neighborIndex, type FieldCell, type FieldZone } from "@/lib/field";
import { nameOf, pathOnSlots } from "@/lib/board";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { EmblaCarouselType } from "embla-carousel";
import { RangeCarousel, RANGE_DISPLAY, type RangeRead } from "@/components/range-carousel";

const STEP_MS = 280;
const LEAVE_MS = 520;
const KIT_MARK_MS = 1150;
const FILM_OUT = 3000;
type PathKind = "line" | "corner";
type PathRot = 0 | 90 | 180 | 270;
type PathAt = { col: number; row: number; kind: PathKind; rot: PathRot; wait?: number };
type MileAt = { col: number; row: number; label: string; name: string; run: number };

const PATH_LEGS: { mile: MileAt; tiles: PathAt[] }[] = [
  {
    mile: { col: 1, row: 0, label: "L01–C02", name: "Resources", run: 0 },
    tiles: [
      { col: 2, row: 0, kind: "corner", rot: 180 },
      { col: 2, row: 1, kind: "corner", rot: 0 },
    ],
  },
  {
    mile: { col: 5, row: 0, label: "L01–C06", name: "Distribution", run: 0 },
    tiles: [
      { col: 4, row: 0, kind: "corner", rot: 90 },
      { col: 4, row: 1, kind: "corner", rot: 270 },
    ],
  },
  {
    mile: { col: 6, row: 2, label: "L03–C07", name: "Manufacturing", run: 0 },
    tiles: [
      { col: 6, row: 1, kind: "line", rot: 90 },
      { col: 6, row: 0, kind: "corner", rot: 180 },
    ],
  },
  {
    mile: { col: 0, row: 2, label: "L03–C01", name: "Project Management", run: 1 },
    tiles: [
      { col: 1, row: 2, kind: "line", rot: 0 },
      { col: 2, row: 2, kind: "line", rot: 0 },
      { col: 3, row: 2, kind: "line", rot: 0 },
    ],
  },
  {
    mile: { col: 6, row: 5, label: "L06–C07", name: "Data Analytics", run: 2 },
    tiles: [{ col: 5, row: 5, kind: "line", rot: 0 }],
  },
  {
    mile: { col: 4, row: 3, label: "L04–C05", name: "Procurement", run: 1 },
    tiles: [
      { col: 4, row: 2, kind: "corner", rot: 180 },
      { col: 3, row: 2, kind: "line", rot: 0 },
    ],
  },
  {
    mile: { col: 4, row: 5, label: "L06–C05", name: "Operational Intelligence", run: 2 },
    tiles: [
      { col: 4, row: 4, kind: "line", rot: 90 },
      { col: 4, row: 2, kind: "corner", rot: 180 },
      { col: 3, row: 2, kind: "line", rot: 0 },
    ],
  },
  {
    mile: { col: 0, row: 7, label: "L08–C01", name: "Automation", run: 3 },
    tiles: [{ col: 0, row: 8, kind: "corner", rot: 0 }],
  },
  {
    mile: { col: 1, row: 8, label: "L09–C02", name: "Prediction", run: 3 },
    tiles: [{ col: 2, row: 8, kind: "line", rot: 0 }],
  },
  {
    mile: { col: 5, row: 7, label: "L08–C06", name: "Critical Pathfinding", run: 3 },
    tiles: [
      { col: 5, row: 8, kind: "corner", rot: 270 },
      { col: 4, row: 8, kind: "line", rot: 0 },
      { col: 3, row: 8, kind: "line", rot: 0 },
      { col: 2, row: 8, kind: "line", rot: 0 },
    ],
  },
];
const PATH_CELL = new Map(PATH_LEGS.flatMap((leg) => leg.tiles.map((tile) => [`${tile.col},${tile.row}`, tile] as const)));
const HUB_HOME = { c: 4, r: 7 };
const HUB_DEST = { c: 3, r: 11 };
type Seat = { c: number; r: number; viaGap?: boolean };
const GAP_HOP = -8;
function isHub(col: number, row: number, hop = HUB_HOME) {
  return (col === 3 && row === 1) || (col === hop.c && row === hop.r);
}
function colTrack(col: number, carouselCol: number | undefined, shift: number) {
  return col + 1 + (carouselCol != null && col === carouselCol ? shift : 0);
}
function spliceGapHops(
  cells: FieldCell[],
  from: Seat,
  steps: number[],
  carouselCol: number | undefined,
  shift: number,
) {
  if (!shift || carouselCol == null || steps.length === 0) return steps;
  const out: number[] = [];
  let prev = from.c;
  for (const idx of steps) {
    const cell = cells[idx];
    if (!cell) continue;
    if (Math.abs(colTrack(cell.col, carouselCol, shift) - colTrack(prev, carouselCol, shift)) > 1) {
      out.push(GAP_HOP);
    }
    out.push(idx);
    prev = cell.col;
  }
  return out;
}
function isInkMark(col: number, row: number, at: Seat | null) {
  return !!at && col === at.c && row === at.r;
}
function hubGoal(page: number, inkAt: Seat | null, dest = HUB_DEST): Seat {
  if (page < 2) return HUB_HOME;
  if (inkAt) return inkAt;
  return dest;
}
function hubSteps(cells: FieldCell[], from: Seat, page: number, inkAt: Seat | null, dest = HUB_DEST) {
  const at = cells.findIndex((cell) => cell.col === from.c && cell.row === from.r);
  const goal = hubGoal(page, inkAt, dest);
  const to = cells.findIndex((cell) => cell.col === goal.c && cell.row === goal.r);
  if (at < 0 || to < 0 || at === to) return [] as number[];
  return pathOnSlots(cells, at, to);
}
const ASK_MILES: MileAt[] = [
  { col: 5, row: 14, label: "L14–C06", name: "Coordination", run: 4 },
  { col: 3, row: 15, label: "L15–C04", name: "Integration", run: 4 },
  { col: 6, row: 16, label: "L16–C07", name: "Assurance", run: 4 },
  { col: 4, row: 18, label: "L18–C05", name: "Stewardship", run: 4 },
];
const MILESTONES: MileAt[] = [...PATH_LEGS.map((leg) => leg.mile), ...ASK_MILES];
const DBL_MS = 320;

function hubDist(col: number, row: number) {
  return Math.min(
    Math.abs(col - 3) + Math.abs(row - 1),
    Math.abs(col - 4) + Math.abs(row - 7),
    Math.abs(col - 3) + Math.abs(row - 11),
  );
}

function snapWeb(
  setOfferPhase: (phase: OfferPhase) => void,
  setOfferWeb: (web: OfferWeb) => void,
  setMileShow: (keys: string[]) => void,
) {
  setOfferPhase("web");
  setOfferWeb("dist");
  setMileShow(MILESTONES.map((mile) => `${mile.col},${mile.row}`));
}

type OfferPhase = "idle" | "jump" | "grow" | "play" | "stack" | "shrink" | "home" | "rest" | "epic" | "web";
type OfferWeb = "off" | "dist" | "in" | "make" | "proj";

function pathHit(col: number, row: number, path: PathAt[] | null) {
  if ((col === 3 && row === 1) || (col === 4 && row === 7) || !path) return null;
  return path.find((item) => item.col === col && item.row === row) ?? null;
}

function mileHit(col: number, row: number) {
  return MILESTONES.find((item) => item.col === col && item.row === row) ?? null;
}

function CriticalPathHint() {
  return (
    <span className="range-gate-hint" aria-hidden="true">
      <span className="range-gate-go">
        <svg className="range-gate-bolt" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M13.6 2.4 L6.2 13.2 H12.1 L10.4 21.6 L17.9 10.5 H12 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.55"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Critical Path
      </span>
    </span>
  );
}

function tileRise(col: number, row: number) {
  if (row >= 9 && row <= 13) return 0;
  if (col === 3 && row === 0) return 0;
  if (col === 6 && row === 0) return 1;
  const n = (col + row * 2) % 3;
  if (n === 0) return 1;
  if (n === 1) return -1;
  return 0;
}

function readWatch(ms: number) {
  const t = Math.max(0, ms);
  const m = Math.floor(t / 60000);
  const s = Math.floor((t % 60000) / 1000);
  const d = Math.floor((t % 1000) / 100);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${d}`;
}

type FieldCtx = {
  cells: FieldCell[];
  entityAt: number;
  goal: number | null;
  trail: number[];
  wave: boolean;
  fore: number | null;
  setFore: (n: number | null) => void;
  go: (n: number) => void;
  jump: (n: number) => void;
  tap: (n: number) => void;
  open: boolean;
  setOpen: (n: boolean | ((v: boolean) => boolean)) => void;
  kitOn: boolean;
  holdKit: () => void;
  route: number[];
  watch: string;
  watchPrev: string | null;
  watchDiff: string | null;
  watchRun: boolean;
  page: number;
  film: boolean;
  filmAt: number;
  offer: boolean;
  offerPhase: OfferPhase;
  offerLine: number;
  offerMorph: boolean;
  offerWeb: OfferWeb;
  offerPath: PathAt[] | null;
  mileShow: string[];
  boardFlip: string[];
  boardShift: Record<string, { dc: number; dr: number }>;
  boardSeat: Record<string, { c: number; r: number }>;
  webOn: boolean;
  hubAt: Seat;
  hubWalk: boolean;
  hubStart: Seat | null;
  padCols: number;
  inkShow: boolean;
  inkAt: Seat | null;
  pickInk: (col: number, row: number) => void;
  recallHome: () => void;
  restHub: () => void;
  toggleWeb: () => void;
  endFilm: (played?: boolean) => void;
  returnOffer: () => void;
};

const Ctx = createContext<FieldCtx | null>(null);

export function useField() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useField");
  return ctx;
}

export function EntityField({
  embla,
  page: pageLock,
  extraCells,
  hubSeat,
  hubStart,
  children,
}: {
  embla?: EmblaCarouselType;
  page?: number;
  extraCells?: FieldCell[];
  hubSeat?: Seat;
  hubStart?: Seat;
  children: ReactNode;
}) {
  const padCols = usePadCols();
  const field = useMemo(() => {
    const next = buildField();
    if (!extraCells?.length) return next;
    return { ...next, cells: [...next.cells, ...extraCells] };
  }, [extraCells]);
  const [entityAt, setEntityAt] = useState(field.topHome);
  const [goal, setGoal] = useState<number | null>(null);
  const [trail, setTrail] = useState<number[]>([]);
  const [wave, setWave] = useState(false);
  const [fore, setFore] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [kitOn, setKitOn] = useState(false);
  const [watchMs, setWatchMs] = useState(0);
  const [watchPrev, setWatchPrev] = useState<string | null>(null);
  const [watchPrevMs, setWatchPrevMs] = useState<number | null>(null);
  const [watchRun, setWatchRun] = useState(false);
  const [page, setPage] = useState(pageLock ?? 0);
  const [film, setFilm] = useState(true);
  const [filmAt, setFilmAt] = useState(0);
  const [offer, setOffer] = useState(true);
  const [offerPhase, setOfferPhase] = useState<OfferPhase>("epic");
  const [offerLine, setOfferLine] = useState(0);
  const [offerMorph, setOfferMorph] = useState(false);
  const [offerWeb, setOfferWeb] = useState<OfferWeb>("off");
  const [offerPath, setOfferPath] = useState<PathAt[] | null>(null);
  const [mileShow, setMileShow] = useState<string[]>([]);
  const [webOn, setWebOn] = useState(false);
  const park = hubSeat ?? HUB_DEST;
  const [hubAt, setHubAt] = useState(hubStart ?? (pageLock != null && pageLock >= 2 ? park : HUB_HOME));
  const [hubTrail, setHubTrail] = useState<number[]>([]);
  const [inkShow, setInkShow] = useState(false);
  const [inkAt, setInkAt] = useState<Seat | null>(null);
  const [boardFlip, setBoardFlip] = useState<string[]>([]);
  const [boardShift, setBoardShift] = useState<Record<string, { dc: number; dr: number }>>({});
  const [boardSeat, setBoardSeat] = useState<Record<string, { c: number; r: number }>>({});
  const filmPlayed = useRef(false);
  const waveRef = useRef(wave);
  waveRef.current = wave;
  const entityRef = useRef(entityAt);
  entityRef.current = entityAt;
  const originRef = useRef(0);
  const lastWatchRef = useRef(0);
  const autoRun = useRef(false);
  const logic = useRef({ go: (n: number) => { void n; }, field, kitOn: false });
  const phaseRef = useRef(offerPhase);
  phaseRef.current = offerPhase;
  const pathRef = useRef(offerPath);
  pathRef.current = offerPath;
  const seatRef = useRef(boardSeat);
  seatRef.current = boardSeat;
  const hubAtRef = useRef(hubAt);
  hubAtRef.current = hubAt;

  const pass = useCallback((cell: FieldCell) => {
    if (isHub(cell.col, cell.row, hubAt)) return false;
    return cellOpen(cell, kitOn);
  }, [kitOn, hubAt]);

  const go = useCallback(
    (next: number) => {
      if (film) return;
      if (next === entityAt || next < 0 || next >= field.cells.length) return;
      if (!pass(field.cells[next])) return;
      const steps = pathOnSlots(field.cells, entityAt, next, (cell) => pass(cell as FieldCell));
      if (steps.length === 0) return;
      setOpen(false);
      setGoal(next);
      setTrail(steps);
      setFore(null);
      if (!watchRun) {
        if (lastWatchRef.current > 0) {
          setWatchPrev(readWatch(lastWatchRef.current));
          setWatchPrevMs(lastWatchRef.current);
        }
        originRef.current = performance.now();
        setWatchMs(0);
        setWatchRun(true);
      }
    },
    [entityAt, field, pass, watchRun, film],
  );

  const jump = useCallback(
    (next: number) => {
      if (film) return;
      if (next === entityAt || next < 0 || next >= field.cells.length) return;
      if (!pass(field.cells[next])) return;
      setOpen(false);
      setEntityAt(next);
      setTrail([]);
      setGoal(null);
      setFore(null);
    },
    [entityAt, field.cells, pass, film],
  );

  const tap = useCallback(
    (next: number) => {
      if (film) return;
      if (next === entityAt) {
        if (field.cells[next]?.zone === "story") setOpen((on) => !on);
        return;
      }
      go(next);
    },
    [entityAt, field.cells, go, film],
  );

  const holdKit = useCallback(() => {
    if (film) return;
    autoRun.current = true;
    setKitOn((on) => !on);
  }, [film]);

  const endFilm = useCallback((played = true) => {
    if (played) filmPlayed.current = true;
    setOffer(false);
    setFilm(false);
  }, []);

  const toggleWeb = useCallback(() => {
    setWebOn((on) => !on);
  }, []);

  const pickInk = useCallback((col: number, row: number) => {
    if (page < 2) return;
    setInkAt({ c: col, r: row });
    setInkShow(true);
  }, [page]);
  const voyageRef = useRef<number[]>([]);
  const recallRef = useRef(false);
  const leaveRef = useRef(false);
  const recallHome = useCallback(() => {
    if (!hubStart) return;
    recallRef.current = true;
    setInkAt({ c: hubStart.c, r: hubStart.r });
    setInkShow(false);
  }, [hubStart]);

  const restHub = useCallback(() => {
    setWebOn(false);
    setInkShow(false);
    setInkAt(null);
    setHubTrail([]);
    setHubAt(park);
  }, [park]);

  const returnOffer = useCallback(() => {
    autoRun.current = false;
    setKitOn(false);
    setOpen(false);
    setGoal(null);
    setTrail([]);
    setFore(null);
    setWebOn(false);
    setOffer(true);
    setFilm(true);
    setFilmAt(0);
    setInkShow(false);
    setInkAt(null);
  }, []);

  useEffect(() => {
    if (!film || offer) return;
    const origin = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const at = now - origin;
      setFilmAt(at);
      if (at >= FILM_OUT) {
        setOffer(true);
        return;
      }
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") endFilm(true);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
    };
  }, [film, offer, endFilm]);

  useEffect(() => {
    if (!offer || !webOn) {
      setOfferPhase(offer ? "epic" : "idle");
      setOfferLine(0);
      setOfferMorph(false);
      setOfferWeb("off");
      setOfferPath(null);
      setMileShow([]);
      if (!offer) {
        setBoardFlip([]);
        setBoardShift({});
        setBoardSeat({});
        setWebOn(false);
      }
      return;
    }
    snapWeb(setOfferPhase, setOfferWeb, setMileShow);
  }, [offer, webOn]);

  useEffect(() => {
    if (offer) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") returnOffer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [offer, returnOffer]);

  logic.current = { go, field, kitOn };

  const route = useMemo(() => {
    const dest = goal != null && goal >= 0 ? goal : field.storyHome;
    if (dest < 0 || entityAt === dest) return [] as number[];
    const steps = pathOnSlots(field.cells, entityAt, dest, (cell) => cellOpen(cell as FieldCell, kitOn));
    if (steps.length === 0) return [];
    return steps;
  }, [entityAt, field, goal, kitOn]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFilm(true);
      setOffer(true);
      setWave(false);
      return;
    }
    if (film) return;
    if (filmPlayed.current) {
      setWave(false);
      return;
    }
    setWave(true);
    const id = window.setTimeout(() => setWave(false), 110 * 2 * 6 + 900);
    return () => window.clearTimeout(id);
  }, [film]);

  useEffect(() => {
    if (trail.length === 0) return;
    const reduced =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setEntityAt(trail[trail.length - 1]);
      setTrail([]);
      setGoal(null);
      setWatchRun(false);
      const ms = performance.now() - originRef.current;
      lastWatchRef.current = ms;
      setWatchMs(ms);
      return;
    }
    const id = window.setTimeout(() => {
      const [head, ...rest] = trail;
      setEntityAt(head);
      setTrail(rest);
      if (rest.length === 0) {
        const ms = performance.now() - originRef.current;
        lastWatchRef.current = ms;
        setGoal(null);
        setWatchRun(false);
        setWatchMs(ms);
      }
    }, STEP_MS);
    return () => window.clearTimeout(id);
  }, [trail]);

  useEffect(() => {
    if (!watchRun) return;
    const tick = () => setWatchMs(performance.now() - originRef.current);
    tick();
    const id = window.setInterval(tick, 80);
    return () => window.clearInterval(id);
  }, [watchRun]);

  useEffect(() => {
    let at = entityRef.current;
    if (!kitOn && field.cells[at]?.kit) {
      at = nearestOpen(field.cells, at, false);
      if (at !== entityRef.current) setEntityAt(at);
    }

    if (!autoRun.current) return;
    autoRun.current = false;
    const dest = kitOn ? field.storyHome : field.topHome;
    const delay = kitOn ? KIT_MARK_MS : 0;
    const id = window.setTimeout(() => {
      const here = entityRef.current;
      if (dest < 0 || dest === here) return;
      const steps = pathOnSlots(field.cells, here, dest, (cell) => cellOpen(cell as FieldCell, kitOn));
      if (steps.length === 0) return;
      if (lastWatchRef.current > 0) {
        setWatchPrev(readWatch(lastWatchRef.current));
        setWatchPrevMs(lastWatchRef.current);
      }
      originRef.current = performance.now();
      setWatchMs(0);
      setWatchRun(true);
      setOpen(false);
      setFore(null);
      setGoal(dest);
      setTrail(steps);
    }, delay);
    return () => window.clearTimeout(id);
  }, [kitOn, field]);

  useEffect(() => {
    if (autoRun.current) return;
    let at = entityRef.current;
    if (!kitOn && field.cells[at]?.kit) {
      at = nearestOpen(field.cells, at, false);
      if (at !== entityRef.current) setEntityAt(at);
    }
    if (goal == null) {
      if (!kitOn) setTrail([]);
      return;
    }
    const steps = pathOnSlots(field.cells, at, goal, (cell) => cellOpen(cell as FieldCell, kitOn));
    setTrail(steps);
    if (steps.length === 0) setGoal(null);
  }, [kitOn, field, goal]);

  useEffect(() => {
    const holds = () => document.querySelectorAll<HTMLElement>(".land-spec-hold, .land-open");
    const clear = () => {
      holds().forEach((el) => {
        el.style.removeProperty("--plot-nudge");
        el.style.removeProperty("--story-nudge");
        el.style.removeProperty("--ask-nudge");
        el.style.removeProperty("--field-nudge");
      });
    };
    clear();
    const id = window.setTimeout(clear, 50);
    void document.fonts?.ready.then(clear);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (pageLock != null) {
      setPage(pageLock);
      return;
    }
    if (!embla) return;
    const onSelect = () => {
      const atPage = embla.selectedScrollSnap();
      setPage(atPage);
      if (waveRef.current) return;
      const { go: walk, field: next } = logic.current;
      const at = next.cells[entityRef.current];
      if (atPage >= 1 && atPage < 3 && at && at.row < next.storyAt && next.storyHome >= 0) {
        walk(next.storyHome);
      }
      if (atPage === 0 && at && at.row >= 3 && next.topHome >= 0) {
        walk(next.topHome);
      }
    };
    onSelect();
    embla.on("select", onSelect);
    return () => {
      embla.off("select", onSelect);
    };
  }, [embla, pageLock]);

  useEffect(() => {
    if (page < 2) {
      setInkShow(false);
      setInkAt(null);
    }
    const at = hubAtRef.current;
    if (!inkAt && hubStart && at.c === hubStart.c && at.r === hubStart.r) {
      setHubTrail([]);
      return;
    }
    if (recallRef.current) {
      recallRef.current = false;
      const recorded = voyageRef.current.length
        ? voyageRef.current
        : hubStart
          ? spliceGapHops(
              field.cells,
              hubStart,
              hubSteps(field.cells, hubStart, page, park, park),
              hubSeat?.c,
              hubSeat && padCols > 7 ? 1 : 0,
            )
          : [];
      const start = hubStart ? field.cells.findIndex((cell) => cell.col === hubStart.c && cell.row === hubStart.r) : -1;
      const back = [...recorded].reverse().slice(1);
      if (start >= 0) back.push(start);
      leaveRef.current = true;
      const first = back[0];
      if (first === GAP_HOP) {
        setHubAt({ c: at.c, r: at.r, viaGap: true });
      } else {
        const cell = first != null ? field.cells[first] : null;
        if (cell) setHubAt({ c: cell.col, r: cell.row });
      }
      setHubTrail(back.slice(1));
      return;
    }
    const raw = hubSteps(field.cells, at, page, inkAt, park);
    const steps = spliceGapHops(field.cells, at, raw, hubSeat?.c, hubSeat && padCols > 7 ? 1 : 0);
    if (hubStart && inkAt && inkAt.c === park.c && inkAt.r === park.r) {
      voyageRef.current = steps;
    }
    setHubTrail(steps);
  }, [page, inkAt, field.cells, park, hubSeat, hubStart, padCols]);

  useEffect(() => {
    if (!inkShow || !inkAt) return;
    if (hubAt.viaGap || hubAt.c !== inkAt.c || hubAt.r !== inkAt.r || hubTrail.length > 0) return;
    const id = window.setTimeout(() => setInkShow(false), 2200);
    return () => window.clearTimeout(id);
  }, [inkShow, inkAt, hubAt, hubTrail.length]);

  useEffect(() => {
    if (hubTrail.length === 0) return;
    const leave = leaveRef.current;
    leaveRef.current = false;
    const slow = leave && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wait = slow ? LEAVE_MS : STEP_MS;
    const id = window.setTimeout(() => {
      const [head, ...rest] = hubTrail;
      if (head === GAP_HOP) {
        const here = hubAtRef.current;
        setHubAt({ c: here.c, r: here.r, viaGap: true });
      } else {
        const cell = field.cells[head];
        if (cell) setHubAt({ c: cell.col, r: cell.row });
      }
      setHubTrail(rest);
    }, wait);
    return () => window.clearTimeout(id);
  }, [hubTrail, field.cells]);

  const value = useMemo(
    () => ({
      cells: field.cells,
      entityAt,
      goal,
      trail,
      wave,
      fore,
      setFore,
      go,
      jump,
      tap,
      open,
      setOpen,
      kitOn,
      holdKit,
      route,
      watch: readWatch(watchMs),
      watchPrev,
      watchDiff:
        watchPrevMs != null && !watchRun && lastWatchRef.current > 0
          ? readWatch(Math.abs(lastWatchRef.current - watchPrevMs))
          : null,
      watchRun,
      page,
      film,
      filmAt,
      offer,
      offerPhase,
      offerLine,
      offerMorph,
      offerWeb,
      offerPath,
      mileShow,
      boardFlip,
      boardShift,
      boardSeat,
      webOn,
      hubAt,
      hubWalk: hubTrail.length > 0,
      hubStart: hubStart ?? null,
      padCols,
      inkShow,
      inkAt,
      pickInk,
      recallHome,
      restHub,
      toggleWeb,
      endFilm,
      returnOffer,
    }),
    [field.cells, entityAt, goal, trail, wave, fore, go, jump, tap, open, kitOn, holdKit, route, watchMs, watchPrev, watchPrevMs, watchRun, page, film, filmAt, offer, offerPhase, offerLine, offerMorph, offerWeb, offerPath, mileShow, boardFlip, boardShift, boardSeat, webOn, hubAt, hubTrail.length, hubStart, padCols, inkShow, inkAt, pickInk, recallHome, restHub, toggleWeb, endFilm, returnOffer],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function readPadCols() {
  if (typeof window === "undefined") return 7;
  if (window.matchMedia("(min-width: 120rem)").matches) return 9;
  if (window.matchMedia("(min-width: 105rem)").matches) return 8;
  return 7;
}
function usePadCols() {
  const [cols, setCols] = useState(readPadCols);
  useEffect(() => {
    const apply = () => setCols(readPadCols());
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);
  return cols;
}

function EpicMark({ ink = false }: { ink?: boolean }) {
  return (
    <svg className={`feat-epic-mark${ink ? " is-ink" : ""}`} viewBox="8 9 48 46" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      {ink ? (
        <>
          <path d="M27 11 L13 22 L13 42 L27 53" transform="translate(-3.5 0)" />
          <path d="M37 11 L51 22 L51 42 L37 53" transform="translate(3.5 0)" />
        </>
      ) : (
        <>
          <g transform="translate(-3.5 0)">
            <path className="feat-epic-shade" d="M27 11 L13 22 L13 42 L27 53" transform="translate(-0.7 -0.9)" />
            <path className="feat-epic-lit" d="M27 11 L13 22 L13 42 L27 53" transform="translate(0.8 1)" />
            <path className="feat-epic-face" d="M27 11 L13 22 L13 42 L27 53" />
          </g>
          <g transform="translate(3.5 0)">
            <path className="feat-epic-shade" d="M37 11 L51 22 L51 42 L37 53" transform="translate(-0.7 -0.9)" />
            <path className="feat-epic-lit" d="M37 11 L51 22 L51 42 L37 53" transform="translate(0.8 1)" />
            <path className="feat-epic-face" d="M37 11 L51 22 L51 42 L37 53" />
          </g>
        </>
      )}
    </svg>
  );
}

function PathMark({ kind, rot, wait = 0 }: { kind: PathKind; rot: PathRot; wait?: number }) {
  const delay = { transitionDelay: `${wait}ms` } as CSSProperties;
  if (kind === "line") {
    return (
      <span className="feat-path-mark" style={delay} aria-hidden="true">
        <i className={rot === 90 || rot === 270 ? "feat-path-line is-vert" : "feat-path-line"} />
      </span>
    );
  }
  return (
    <span className="feat-path-mark" style={{ ...delay, transform: `rotate(${rot}deg)` }} aria-hidden="true">
      <i className="feat-path-corner" />
    </span>
  );
}

export function FieldTiles({
  zones,
  className,
  waveMark,
  hideRows,
  loneEpic,
  carouselSeat,
  onView,
  onCover,
  showCells,
}: {
  zones: FieldZone[];
  className: string;
  waveMark?: boolean;
  hideRows?: number[];
  loneEpic?: boolean;
  carouselSeat?: Seat;
  onView?: (view: RangeRead | null) => void;
  onCover?: (on: boolean) => void;
  showCells?: string[];
}) {
  const { cells, entityAt, goal, trail, wave, fore, setFore, go, jump, tap, open, kitOn, route, page, film, offer, offerPhase, offerPath, mileShow, boardShift, boardSeat, webOn, hubAt, hubWalk, hubStart, padCols, inkShow, inkAt, pickInk, recallHome, restHub } = useField();
  const seatShift = carouselSeat && padCols > 7 ? 1 : 0;
  const track = (col: number) => colTrack(col, carouselSeat?.c, seatShift);
  const gapCol = carouselSeat && seatShift ? track(carouselSeat.c) - 1 : 0;
  const lastTap = useRef<{ t: number; i: number } | null>(null);
  const onViewRef = useRef(onView);
  onViewRef.current = onView;
  const onCoverRef = useRef(onCover);
  onCoverRef.current = onCover;
  const [boardOn, setBoardOn] = useState(!loneEpic);
  const [rangeRead, setRangeRead] = useState<RangeRead | null>(carouselSeat ? "habitat" : null);
  const [waveAt, setWaveAt] = useState<number | "done" | null>(null);
  const [waveDir, setWaveDir] = useState<"in" | "out" | null>(null);
  const [coverOn, setCoverOn] = useState(false);
  const [play, setPlay] = useState(false);
  const [hubReady, setHubReady] = useState(false);
  const [away, setAway] = useState(false);
  const [docked, setDocked] = useState(false);
  const [recalling, setRecalling] = useState(false);
  const habitatOn = Boolean(carouselSeat && coverOn);
  const reelFlat = Boolean(carouselSeat && play && rangeRead === "habitat");
  const hubOnCarousel = Boolean(
    carouselSeat && !hubAt.viaGap && hubAt.c === carouselSeat.c && hubAt.r === carouselSeat.r,
  );
  const boardOut = docked || hubOnCarousel;
  const showPads = !carouselSeat || hubOnCarousel;
  const charged = Boolean(carouselSeat && !hubWalk && !recalling && (!docked || hubOnCarousel));
  const [flash, setFlash] = useState(false);
  const chargeRef = useRef<HTMLButtonElement | null>(null);
  const floodRef = useRef(false);
  const homeTimer = useRef(0);
  const coverRef = useRef(false);
  const simRef = useRef(false);
  const waveAtRef = useRef<number | "done" | null>(null);
  coverRef.current = coverOn;
  waveAtRef.current = waveAt;
  const dockedRef = useRef(false);
  const onCarouselRef = useRef(false);
  dockedRef.current = docked;
  onCarouselRef.current = hubOnCarousel;
  const takeView = useCallback((next: RangeRead | null) => {
    setRangeRead(next);
  }, []);
  const closeLone = () => {
    restHub();
    setBoardOn(false);
  };

  useEffect(() => {
    if (!carouselSeat) return;
    let cancel = false;
    const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));
    const publish = (next: RangeRead | null) => onViewRef.current?.(next);
    const cover = (on: boolean) => {
      coverRef.current = on;
      setCoverOn(on);
      onCoverRef.current?.(on);
    };
    const finishOut = (next: RangeRead | null) => {
      setPlay(false);
      cover(false);
      setWaveAt(null);
      setWaveDir(null);
      setHubReady(false);
      publish(next);
    };
    const outOrder = (at: number | "done" | null) => {
      if (at === "done" || at === 0) return [0, 1, 2];
      if (at === 1) return [1, 2];
      if (at === 2) return [2];
      return [];
    };

    if (rangeRead === "habitat") {
      setBoardOn(true);
      if (!play) {
        if (!onCarouselRef.current && !dockedRef.current) {
          simRef.current = false;
          cover(false);
          setAway(false);
          setHubReady(false);
          setWaveDir(null);
          setWaveAt(null);
        }
        publish("habitat");
        return;
      }
      if (simRef.current) {
        setHubReady(true);
        publish("habitat");
        return;
      }
      cover(true);
      setHubReady(false);
      setWaveDir("in");
      setWaveAt(null);
      publish("habitat");
      void (async () => {
        await wait(80);
        for (const col of [2, 1, 0]) {
          if (cancel) return;
          setWaveAt(col);
          await wait(450);
        }
        if (cancel) return;
        setWaveAt("done");
        setHubReady(true);
      })();
      return () => {
        cancel = true;
      };
    }

    restHub();
    setHubReady(false);
    if (!coverRef.current) {
      publish(rangeRead);
      return;
    }

    setWaveDir("out");
    const order = outOrder(waveAtRef.current);
    void (async () => {
      if (order.length === 0) {
        if (!cancel) finishOut(rangeRead);
        return;
      }
      await wait(80);
      for (const col of order) {
        if (cancel) return;
        setWaveAt(col);
        await wait(450);
      }
      if (cancel) return;
      finishOut(rangeRead);
    })();
    return () => {
      cancel = true;
    };
  }, [carouselSeat, rangeRead, play, restHub]);
  useEffect(() => {
    if (!carouselSeat || !play) return;
    const here = !hubAt.viaGap && hubAt.c === carouselSeat.c && hubAt.r === carouselSeat.r;
    if (!here) {
      setAway(true);
      return;
    }
    if (!away || hubWalk) return;
    const home = !inkAt || (inkAt.c === carouselSeat.c && inkAt.r === carouselSeat.r);
    if (home) setPlay(false);
  }, [away, carouselSeat, hubAt, hubWalk, inkAt, play]);
  useEffect(() => {
    if (!hubOnCarousel || floodRef.current) return;
    floodRef.current = true;
    setDocked(true);
  }, [hubOnCarousel]);
  useEffect(() => {
    const el = chargeRef.current;
    if (!charged || !el) return;
    el.style.setProperty("--charge", "0");
    const born = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      const t = Math.min(1, (now - born) / 15000);
      el.style.setProperty("--charge", (t * t).toFixed(4));
      if (t < 1) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      el.style.setProperty("--charge", "0");
    };
  }, [charged]);
  useEffect(() => {
    if (!charged || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFlash(false);
      return;
    }
    let cancel = false;
    let timer = 0;
    const beat = () => {
      const hold = 28 + Math.random() * 36;
      setFlash(true);
      timer = window.setTimeout(() => {
        if (cancel) return;
        setFlash(false);
        if (Math.random() < 0.12) {
          timer = window.setTimeout(() => {
            if (cancel) return;
            setFlash(true);
            timer = window.setTimeout(() => {
              if (cancel) return;
              setFlash(false);
              wait();
            }, 22 + Math.random() * 24);
          }, 70 + Math.random() * 90);
          return;
        }
        wait();
      }, hold);
    };
    const wait = () => {
      timer = window.setTimeout(() => {
        if (cancel) return;
        beat();
      }, 1400 + Math.random() * 2600);
    };
    wait();
    return () => {
      cancel = true;
      window.clearTimeout(timer);
    };
  }, [charged]);
  const aimInk = (event: { button: number; preventDefault: () => void; stopPropagation: () => void }, col: number, row: number) => {
    if (!boardOn || page < 2 || event.button !== 0) return false;
    if (carouselSeat && (rangeRead !== "habitat" || !hubReady)) return false;
    event.preventDefault();
    event.stopPropagation();
    pickInk(col, row);
    return true;
  };
  const callHome = () => {
    if (!hubStart || recalling) return;
    if (carouselSeat && rangeRead !== "habitat") return;
    setRecalling(true);
    setPlay(false);
    setCoverOn(false);
    onCoverRef.current?.(false);
    setWaveDir(null);
    setWaveAt(null);
    setHubReady(false);
    recallHome();
    const wait = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1100;
    window.clearTimeout(homeTimer.current);
    homeTimer.current = window.setTimeout(() => {
      setDocked(false);
      setRecalling(false);
    }, wait);
  };
  useEffect(() => () => window.clearTimeout(homeTimer.current), []);
  useEffect(() => {
    if (!hubStart || hubWalk) return;
    if (hubAt.c !== hubStart.c || hubAt.r !== hubStart.r) return;
    floodRef.current = false;
    setDocked(false);
    setRecalling(false);
  }, [hubAt, hubStart, hubWalk]);
  const openAt = (cell: FieldCell) => cellOpen(cell, kitOn);
  const zone = cells
    .map((cell, index) => ({ cell, index }))
    .filter((item) => zones.includes(item.cell.zone) && !hideRows?.includes(item.cell.row));
  const minRow = zone.reduce((min, item) => Math.min(min, item.cell.row), Number.POSITIVE_INFINITY);
  const maxRow = zone.reduce((max, item) => Math.max(max, item.cell.row), 0);
  const padRows = Number.isFinite(minRow) ? maxRow - minRow + 1 : 0;
  const beating = goal !== null || trail.length > 0;
  const beatAt = new Map(beating ? route.map((index, step) => [index, step + 1]) : []);

  return (
    <div
      className={className}
      role="grid"
      aria-label="Entity"
      data-wave={waveMark && wave ? "1" : undefined}
      data-habitat={habitatOn ? "1" : undefined}
      data-armed={habitatOn && hubReady && rangeRead === "habitat" ? "1" : undefined}
      data-wave-dir={waveDir ?? undefined}
      data-wave-at={waveAt === null ? undefined : String(waveAt)}
      data-film={film ? "1" : undefined}
      data-offer={offer ? "1" : undefined}
      data-offer-phase={offer ? offerPhase : undefined}
      data-web={webOn ? "1" : undefined}
      data-board={boardOn ? "1" : undefined}
      data-range={carouselSeat ? "1" : undefined}
      data-dock={carouselSeat && boardOut ? "1" : undefined}
      data-recall={recalling ? "1" : undefined}
      onMouseDown={(event) => event.stopPropagation()}
      onTouchStart={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      onPointerLeave={() => setFore(null)}
      onKeyDown={(event) => {
        if (offer || film) return;
        let next = entityAt;
        if (event.key === "ArrowRight") next = neighborIndex(cells, entityAt, 1, 0, openAt);
        if (event.key === "ArrowLeft") next = neighborIndex(cells, entityAt, -1, 0, openAt);
        if (event.key === "ArrowDown") next = neighborIndex(cells, entityAt, 0, 1, openAt);
        if (event.key === "ArrowUp") next = neighborIndex(cells, entityAt, 0, -1, openAt);
        if (next < 0 || next === goal) return;
        event.preventDefault();
        event.stopPropagation();
        go(next);
      }}
    >
      {zone.map(({ cell, index }) => {
        const at = `${cell.col},${cell.row}`;
        const slot = boardSeat[at] ?? { c: cell.col, r: cell.row };
        const shove = boardShift[at];
        const style: CSSProperties = {
          gridColumn: track(slot.c),
          gridRow: Number.isFinite(minRow) ? slot.r - minRow + 1 : 1,
          ["--dc" as string]: shove?.dc ?? 0,
          ["--dr" as string]: shove?.dr ?? 0,
        };
        const home: CSSProperties = {
          gridColumn: hubAt.viaGap && gapCol > 0 && isHub(cell.col, cell.row, hubAt) ? gapCol : track(cell.col),
          gridRow: Number.isFinite(minRow) ? cell.row - minRow + 1 : 1,
          ["--push" as string]: hubDist(cell.col, cell.row),
          ["--col" as string]: cell.col,
        };
        const habitatWelcome = rangeRead === "habitat";
        const gateLeft = Boolean(hubStart && (hubAt.c !== hubStart.c || hubAt.r !== hubStart.r));
        if (
          carouselSeat &&
          !boardOut &&
          !isHub(cell.col, cell.row, hubAt) &&
          !(showCells?.includes(`${cell.col},${cell.row}`) && habitatWelcome && gateLeft)
        ) {
          return null;
        }
        if (isHub(cell.col, cell.row, hubAt) && (!carouselSeat || !hubOnCarousel)) {
          const overInk = !carouselSeat && inkShow && isInkMark(cell.col, cell.row, inkAt);
          const leaving = Boolean(
            recalling && carouselSeat && hubAt.c === carouselSeat.c && hubAt.r === carouselSeat.r + 1,
          );
          return (
            <span key={`${cell.col}-${cell.row}`} className="range-gate" style={home} data-leave={leaving ? "1" : undefined}>
              <button
                ref={chargeRef}
                type="button"
                className="feat-tile"
                data-at={at}
                data-col={cell.col}
                data-film="1"
                data-epic="1"
                data-charge={charged ? "1" : undefined}
                data-flash={charged && flash ? "1" : undefined}
                data-ink-under={overInk ? "1" : undefined}
                aria-label={carouselSeat ? "Explore the product" : loneEpic ? (boardOn ? "Rest board" : "Habitat") : "Habitat"}
                tabIndex={0}
                onPointerDown={(event) => {
                  if (event.button !== 0) return;
                  if (carouselSeat) {
                    event.preventDefault();
                    event.stopPropagation();
                    pickInk(carouselSeat.c, carouselSeat.r);
                    return;
                  }
                  if (loneEpic) {
                    event.preventDefault();
                    event.stopPropagation();
                    if (boardOn) closeLone();
                    return;
                  }
                  if (aimInk(event, cell.col, cell.row)) return;
                  event.preventDefault();
                  event.stopPropagation();
                }}
              >
                {overInk ? <EpicMark ink /> : null}
                <EpicMark />
              </button>
              {carouselSeat ? null : charged ? <CriticalPathHint /> : null}
            </span>
          );
        }
        if (carouselSeat && cell.col === carouselSeat.c) {
          if (recalling && !hubOnCarousel) return null;
          if (Number.isFinite(minRow) && cell.row !== minRow) return null;
          return (
            <RangeCarousel
              key={`${cell.col}-${cell.row}`}
              style={{
                gridColumn: track(carouselSeat.c),
                gridRow: "1 / -1",
              }}
              at={at}
              live={boardOn}
              armed={hubReady}
              flat={reelFlat}
              habitatHere={hubOnCarousel}
              charge={hubOnCarousel && charged}
              chargeRef={chargeRef}
              flash={hubOnCarousel && charged && flash}
              onView={takeView}
              onSeat={(slot) => {
                pickInk(carouselSeat.c, carouselSeat.r + (slot - RANGE_DISPLAY));
              }}
              onPick={(kind) => {
                if (kind === "habitat") {
                  if (hubOnCarousel) {
                    callHome();
                    return;
                  }
                  pickInk(carouselSeat.c, carouselSeat.r);
                  return;
                }
                if (kind === "technical") return;
                setBoardOn(true);
              }}
            />
          );
        }
        if (inkShow && !carouselSeat && isInkMark(cell.col, cell.row, inkAt)) {
          return (
            <span
              key={`${cell.col}-${cell.row}`}
              className="feat-tile"
              style={home}
              data-at={at}
              data-col={cell.col}
              data-film="1"
              data-ink="1"
              aria-hidden="true"
              onPointerDown={(event) => {
                aimInk(event, cell.col, cell.row);
              }}
            >
              <EpicMark ink />
            </span>
          );
        }
        if (film && (cell.zone === "top" || cell.zone === "join" || (offer && (cell.zone === "story" || cell.zone === "plot" || cell.zone === "ask")))) {
          const mile = offer ? mileHit(cell.col, cell.row) : null;
          if (mile) {
            const on = mileShow.includes(`${cell.col},${cell.row}`);
            return (
              <div
                key={`${cell.col}-${cell.row}`}
                className={`feat-tile${on ? " is-on" : ""}`}
                style={home}
                data-at={at}
                data-col={cell.col}
                data-film="1"
                data-mile="1"
                onPointerDown={(event) => {
                  aimInk(event, cell.col, cell.row);
                }}
              >
                <div className="feat-offer-copy is-mod">
                  <span className="feat-mod-code">{mile.label}</span>
                </div>
              </div>
            );
          }
          const spec = offer ? PATH_CELL.get(`${cell.col},${cell.row}`) : undefined;
          if (spec) {
            const hit = pathHit(cell.col, cell.row, offerPath);
            return (
              <span
                key={`${cell.col}-${cell.row}`}
                className={`feat-tile${hit ? " is-on" : ""}`}
                style={home}
                data-at={at}
                data-col={cell.col}
                data-film="1"
                data-path="1"
                aria-hidden="true"
                onPointerDown={(event) => {
                  aimInk(event, cell.col, cell.row);
                }}
              >
                <PathMark kind={spec.kind} rot={spec.rot} wait={hit?.wait ?? 0} />
              </span>
            );
          }
          const keep = Boolean(showCells?.includes(at) && rangeRead === "habitat");
          if (keep) {
            const canHome = rangeRead === "habitat";
            return canHome ? (
              <button
                key={`${cell.col}-${cell.row}`}
                type="button"
                className="feat-tile"
                style={home}
                data-at={at}
                data-col={cell.col}
                data-film="1"
                data-keep="1"
                data-rise={tileRise(cell.col, cell.row) || undefined}
                aria-label="Return Habitat"
                onPointerDown={(event) => {
                  if (event.button !== 0) return;
                  event.preventDefault();
                  event.stopPropagation();
                  callHome();
                }}
              />
            ) : (
              <span
                key={`${cell.col}-${cell.row}`}
                className="feat-tile"
                style={home}
                data-at={at}
                data-col={cell.col}
                data-film="1"
                data-keep="1"
                data-rise={tileRise(cell.col, cell.row) || undefined}
                aria-hidden="true"
              />
            );
          }
          return (
            <span
              key={`${cell.col}-${cell.row}`}
              className="feat-tile"
              style={home}
              data-at={at}
              data-col={cell.col}
              data-film="1"
              data-rise={tileRise(cell.col, cell.row) || undefined}
              aria-hidden="true"
              onPointerDown={(event) => {
                aimInk(event, cell.col, cell.row);
              }}
            />
          );
        }
        if (!openAt(cell)) {
          const hush = page >= 1 && (cell.zone === "top" || cell.zone === "join");
          return (
            <span key={`${cell.col}-${cell.row}`} className="feat-gap" style={style} aria-hidden="true">
              {hush ? null : "locked"}
            </span>
          );
        }
        const live = !wave && index === entityAt;
        const kind = wave ? "option" : index === entityAt ? "live" : goal === index ? "goal" : "option";
        const beat = !wave && !live ? beatAt.get(index) : undefined;
        return (
          <button
            key={`${cell.col}-${cell.row}`}
            type="button"
            role="gridcell"
            className="feat-tile"
            style={style}
            data-kind={kind}
            data-kit={cell.kit ? "1" : undefined}
            data-end={index === goal ? "1" : undefined}
            data-fore={fore === index && index !== goal ? "1" : undefined}
            aria-current={live ? "true" : undefined}
            aria-expanded={live ? open : undefined}
            aria-controls={live ? "land-spec-panel" : undefined}
            aria-label={wave ? "Possible state" : nameOf(index, entityAt, goal)}
            tabIndex={live ? 0 : -1}
            onMouseEnter={() => {
              if (wave || index === entityAt) return;
              setFore(index);
            }}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => {
              if (wave) return;
              const now = performance.now();
              const prior = lastTap.current;
              if (prior && now - prior.t < DBL_MS && prior.i === index) {
                lastTap.current = null;
                jump(index);
                return;
              }
              lastTap.current = { t: now, i: index };
              tap(index);
            }}
          >
            {cell.kit && !live && !beat ? (
              <span className="feat-kit-mark" aria-hidden="true">
                Habitat
              </span>
            ) : null}
            {live ? <h2 className="land-hero-ink">Enterprise</h2> : beat ? <span className="feat-beat">{String(beat).padStart(2, "0")}</span> : null}
          </button>
        );
      })}
      {carouselSeat && hubStart && rangeRead === "habitat" && Number.isFinite(minRow) ? (
        <span
          className="range-gate"
          style={{
            gridColumn: hubStart.c + 1,
            gridRow: hubStart.r - minRow + 1,
            pointerEvents: "none",
          }}
          aria-hidden="true"
        >
          <CriticalPathHint />
        </span>
      ) : null}
      {showPads && gapCol > 0
        ? Array.from({ length: padRows }, (_, row) => (
            <i
              key={`shift-gap-${row}`}
              className="feat-tile feat-tile-pad"
              style={{ gridColumn: gapCol, gridRow: row + 1, pointerEvents: "none" }}
              aria-hidden="true"
            />
          ))
        : null}
      {showPads
        ? Array.from({ length: Math.max(0, padCols - 7) * padRows }, (_, index) => {
            const extra = Math.floor(index / Math.max(padRows, 1));
            const row = index % Math.max(padRows, 1);
            const col = 8 + extra;
            const lastCol = col === padCols;
            if (!carouselSeat && lastCol && (row === padRows - 1 || zones.includes("join"))) return null;
            if (carouselSeat && col === track(carouselSeat.c)) return null;
            return (
              <i
                key={`pad-${extra}-${row}`}
                className="feat-tile feat-tile-pad"
                style={{ gridColumn: col, gridRow: row + 1 }}
                aria-hidden="true"
              />
            );
          })
        : null}
    </div>
  );
}

export function HoldTogether() {
  const { kitOn, holdKit, watch, watchPrev, watchDiff, watchRun } = useField();
  return (
    <>
      {watchPrev ? (
        <>
          <time className="land-kit-watch land-kit-watch-prev" dateTime={watchPrev.replace(".", ":")}>
            {watchPrev}
          </time>
          <span className="head-sep" aria-hidden="true" />
        </>
      ) : null}
      <time className="land-kit-watch" data-run={watchRun ? "1" : undefined} dateTime={watch.replace(".", ":")}>
        {watch}
      </time>
      {watchDiff ? (
        <>
          <span className="head-sep" aria-hidden="true" />
          <time className="land-kit-watch land-kit-watch-diff" dateTime={watchDiff.replace(".", ":")}>
            {watchDiff}
          </time>
        </>
      ) : null}
      <span className="head-sep" aria-hidden="true" />
      <button
        type="button"
        className="head-link head-kit"
        data-on={kitOn ? "1" : undefined}
        aria-pressed={kitOn}
        aria-label={kitOn ? "Lock Potential" : "Unlock Potential"}
        onClick={holdKit}
      >
        {kitOn ? "Lock Potential" : "Unlock Potential"}
      </button>
    </>
  );
}

export { nameOf, neighborIndex };
