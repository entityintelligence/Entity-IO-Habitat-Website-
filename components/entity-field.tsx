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

const STEP_MS = 280;
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
const HUB_DEST = { c: 3, r: 12 };
type Seat = { c: number; r: number };
function isHub(col: number, row: number, hop = HUB_HOME) {
  return (col === 3 && row === 1) || (col === hop.c && row === hop.r);
}
function isInkMark(col: number, row: number, at: Seat | null) {
  return !!at && col === at.c && row === at.r;
}
function hubGoal(page: number, inkAt: Seat | null): Seat {
  if (page < 2) return HUB_HOME;
  if (inkAt) return inkAt;
  return HUB_DEST;
}
function hubSteps(cells: FieldCell[], from: Seat, page: number, inkAt: Seat | null) {
  const at = cells.findIndex((cell) => cell.col === from.c && cell.row === from.r);
  const goal = hubGoal(page, inkAt);
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
const SWAP_MS = 640;
const SWAP_BEAT = 880;
const SWAP_WAIT = 720;
const SWAP_PAIRS = 3;
const DBL_MS = 320;
const SWAP_LOCK = new Set<string>([
  "3,1",
  "4,7",
  "3,12",
  "4,12",
  "5,12",
  "5,13",
  ...PATH_LEGS.flatMap((leg) => [`${leg.mile.col},${leg.mile.row}`, ...leg.tiles.map((tile) => `${tile.col},${tile.row}`)]),
]);
const SWAP_POOL: string[] = [
  ...Array.from({ length: 3 }, (_, row) => Array.from({ length: 7 }, (_, col) => `${col},${row}`)).flat(),
  ...Array.from({ length: 2 }, (_, n) => {
    const row = n + 3;
    return Array.from({ length: 4 }, (_, i) => `${i + 3},${row}`).filter((id) => id !== "6,3");
  }).flat(),
  ...Array.from({ length: 2 }, (_, n) => Array.from({ length: 4 }, (_, i) => `${i + 3},${n + 5}`)).flat(),
  ...Array.from({ length: 7 }, (_, col) => `${col},7`),
  ...Array.from({ length: 6 }, (_, col) => `${col},8`),
  ...Array.from({ length: 5 }, (_, n) => Array.from({ length: 4 }, (_, i) => `${i + 3},${n + 9}`))
    .flat()
    .filter((id) => id !== "6,13"),
  ...Array.from({ length: 5 }, (_, n) => Array.from({ length: 3 }, (_, col) => `${col},${n + 9}`)).flat(),
  ...Array.from({ length: 3 }, (_, col) => `${col},14`),
  ...Array.from({ length: 5 }, (_, n) => Array.from({ length: 4 }, (_, i) => `${i + 3},${n + 14}`)).flat(),
].filter((id) => !SWAP_LOCK.has(id));

function hubDist(col: number, row: number) {
  return Math.min(
    Math.abs(col - 3) + Math.abs(row - 1),
    Math.abs(col - 4) + Math.abs(row - 7),
    Math.abs(col - 3) + Math.abs(row - 12),
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

function filmFlip(col: number, row: number, now: number) {
  const delay = 90 + ((col * 19 + row * 37) % 24) * 52;
  return now >= delay && now < FILM_OUT;
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
  hubAt: { c: number; r: number };
  inkShow: boolean;
  inkAt: Seat | null;
  pickInk: (col: number, row: number) => void;
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
  children,
}: {
  embla: EmblaCarouselType | undefined;
  children: ReactNode;
}) {
  const field = useMemo(() => buildField(), []);
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
  const [page, setPage] = useState(0);
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
  const [hubAt, setHubAt] = useState(HUB_HOME);
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
  const logic = useRef({ go: (_n: number) => undefined as void, field, kitOn: false });
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
  }, [embla]);

  useEffect(() => {
    if (page < 2) {
      setInkShow(false);
      setInkAt(null);
    }
    const at = hubAtRef.current;
    setHubTrail(hubSteps(field.cells, at, page, inkAt));
  }, [page, inkAt, field.cells]);

  useEffect(() => {
    if (!inkShow || !inkAt) return;
    if (hubAt.c !== inkAt.c || hubAt.r !== inkAt.r || hubTrail.length > 0) return;
    const id = window.setTimeout(() => setInkShow(false), 2200);
    return () => window.clearTimeout(id);
  }, [inkShow, inkAt, hubAt, hubTrail.length]);

  useEffect(() => {
    if (hubTrail.length === 0) return;
    const id = window.setTimeout(() => {
      const [head, ...rest] = hubTrail;
      const cell = field.cells[head];
      if (cell) setHubAt({ c: cell.col, r: cell.row });
      setHubTrail(rest);
    }, STEP_MS);
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
      inkShow,
      inkAt,
      pickInk,
      toggleWeb,
      endFilm,
      returnOffer,
    }),
    [field.cells, entityAt, goal, trail, wave, fore, go, jump, tap, open, kitOn, holdKit, route, watchMs, watchPrev, watchPrevMs, watchRun, page, film, filmAt, offer, offerPhase, offerLine, offerMorph, offerWeb, offerPath, mileShow, boardFlip, boardShift, boardSeat, webOn, hubAt, inkShow, inkAt, pickInk, toggleWeb, endFilm, returnOffer],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function EpicMark({ ink = false }: { ink?: boolean }) {
  return (
    <svg className={`feat-epic-mark${ink ? " is-ink" : ""}`} viewBox="0 0 64 64" aria-hidden="true">
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
}: {
  zones: FieldZone[];
  className: string;
  waveMark?: boolean;
}) {
  const { cells, entityAt, goal, trail, wave, fore, setFore, go, jump, tap, open, kitOn, route, page, film, filmAt, offer, offerPhase, offerPath, mileShow, boardShift, boardSeat, webOn, hubAt, inkShow, inkAt, pickInk, toggleWeb } = useField();
  const lastTap = useRef<{ t: number; i: number } | null>(null);
  const aimInk = (event: { button: number; preventDefault: () => void; stopPropagation: () => void }, col: number, row: number) => {
    if (page < 2 || event.button !== 0) return false;
    event.preventDefault();
    event.stopPropagation();
    pickInk(col, row);
    return true;
  };
  const openAt = (cell: FieldCell) => cellOpen(cell, kitOn);
  const zone = cells.map((cell, index) => ({ cell, index })).filter((item) => zones.includes(item.cell.zone));
  const minRow = zone.reduce((min, item) => Math.min(min, item.cell.row), Number.POSITIVE_INFINITY);
  const beating = goal !== null || trail.length > 0;
  const beatAt = new Map(beating ? route.map((index, step) => [index, step + 1]) : []);

  return (
    <div
      className={className}
      role="grid"
      aria-label="Entity"
      data-wave={waveMark && wave ? "1" : undefined}
      data-film={film ? "1" : undefined}
      data-offer={offer ? "1" : undefined}
      data-offer-phase={offer ? offerPhase : undefined}
      data-web={webOn ? "1" : undefined}
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
          gridColumn: slot.c + 1,
          gridRow: Number.isFinite(minRow) ? slot.r - minRow + 1 : 1,
          ["--dc" as string]: shove?.dc ?? 0,
          ["--dr" as string]: shove?.dr ?? 0,
        };
        const home: CSSProperties = {
          gridColumn: cell.col + 1,
          gridRow: Number.isFinite(minRow) ? cell.row - minRow + 1 : 1,
          ["--push" as string]: hubDist(cell.col, cell.row),
        };
        if (isHub(cell.col, cell.row, hubAt)) {
          const overInk = inkShow && isInkMark(cell.col, cell.row, inkAt);
          return (
            <button
              key={`${cell.col}-${cell.row}`}
              type="button"
              className="feat-tile"
              style={home}
              data-at={at}
              data-film="1"
              data-epic="1"
              data-ink-under={overInk ? "1" : undefined}
              aria-label={webOn ? "Hide modules" : "Show modules"}
              aria-pressed={webOn}
              tabIndex={0}
              onPointerDown={(event) => {
                if (aimInk(event, cell.col, cell.row)) return;
                if (event.button !== 0) return;
                event.preventDefault();
                event.stopPropagation();
                toggleWeb();
              }}
            >
              {overInk ? <EpicMark ink /> : null}
              <EpicMark />
            </button>
          );
        }
        if (inkShow && isInkMark(cell.col, cell.row, inkAt)) {
          return (
            <span
              key={`${cell.col}-${cell.row}`}
              className="feat-tile"
              style={home}
              data-at={at}
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
          return (
            <span
              key={`${cell.col}-${cell.row}`}
              className="feat-tile"
              style={home}
              data-at={at}
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
