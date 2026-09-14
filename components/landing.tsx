"use client";

import Link from "next/link";
import { range, story, heroFlip, plotHero, plotFlip } from "@/content/copy";
import { PlaceToggle } from "@/components/place";
import { FeatureGrid } from "@/components/feature-grid";
import { EntitySpec } from "@/components/entity-spec";
import { EntityField, FieldTiles, useField } from "@/components/entity-field";
import { WaitlistForm } from "@/components/waitlist-form";
import { TimeRead } from "@/components/time-read";
import { useEffect, useMemo, useRef, useState, type Ref } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";

const LAST = 3;
const HERO_FLIP_MS = 720;
const HERO_HOLD_MS = 2800;

function isField(node: EventTarget | null) {
  const tag = (node as HTMLElement | null)?.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

function HeroAside({ lines }: { lines: readonly string[] }) {
  const [n, setN] = useState(0);
  const [open, setOpen] = useState(false);
  const [snap, setSnap] = useState(false);
  const front = lines[n];
  const back = lines[(n + 1) % lines.length];

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    let flipId = 0;
    let snapId = 0;
    let holdId = 0;
    const cycle = () => {
      setSnap(false);
      setOpen(true);
      flipId = window.setTimeout(() => {
        setSnap(true);
        setOpen(false);
        setN((i) => (i + 1) % lines.length);
        snapId = window.setTimeout(() => {
          setSnap(false);
          holdId = window.setTimeout(cycle, HERO_HOLD_MS);
        }, 40);
      }, HERO_FLIP_MS);
    };
    holdId = window.setTimeout(cycle, HERO_HOLD_MS);
    return () => {
      window.clearTimeout(flipId);
      window.clearTimeout(snapId);
      window.clearTimeout(holdId);
    };
  }, [lines]);

  return (
    <span className="land-hero-flip" aria-live="polite">
      {lines.map((line) => (
        <span key={line} className="land-hero-flip-sizer" aria-hidden="true">
          {line}
        </span>
      ))}
      <span className={`land-hero-flip-inner${open ? " is-open" : ""}${snap ? " is-snap" : ""}`}>
        <span className="land-hero-flip-face">{front}</span>
        <span className="land-hero-flip-face is-back">{back}</span>
      </span>
    </span>
  );
}

function HeroLine({ title, lines }: { title: string; lines: readonly string[] }) {
  return (
    <p className="land-hero-hold">
      <span className="land-hero-ghost" aria-hidden="true">
        <span className="land-hero-live">{title}</span>
      </span>
      <span className="land-hero-slash land-hero-live">/</span>
      <span className="land-hero-aside land-hero-live">
        <HeroAside lines={lines} />
      </span>
    </p>
  );
}

function StoryPage({
  headRef,
  specId,
}: {
  headRef?: Ref<HTMLParagraphElement>;
  specId?: string;
}) {
  return (
    <section className="split-stage land land-story">
      <div className="land-story-col">
        <p className="land-story-head" ref={headRef} aria-hidden="true">
          <span className="land-hero-live">{story.hero}</span>
        </p>
        <div className="land-story-body">
          <div className="land-story-copy">
            <p className="land-mid">
              {story.problem.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </p>
            <Link href="/product" className="land-core-kicker">
              <span className="land-hero-live">{story.core}</span>
              <span className="land-ask-go-mark" aria-hidden="true">
                <svg viewBox="0 0 12 12">
                  <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="0.85" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </div>
      <EntitySpec panelId={specId} />
    </section>
  );
}

function PlotPage({ headRef }: { headRef?: Ref<HTMLParagraphElement> }) {
  return (
    <section className="split-stage land land-story land-plot-stage">
      <div className="land-story-col">
        <p className="land-story-head" ref={headRef} aria-hidden="true" />
      </div>
      <div className="land-spec-hold land-plot-hold">
        <FieldTiles zones={["plot"]} className="land-spec" />
      </div>
      <HeroLine title={plotHero} lines={plotFlip} />
    </section>
  );
}

function LandingHead({
  onHome,
  onJoin,
}: {
  onHome: () => void;
  onJoin: () => void;
}) {
  const { offer, kitOn, holdKit, returnOffer } = useField();
  return (
    <header className="land-head">
      <div className="head-bar">
        <div className="head-ident">
          <Link
            href="/"
            className="head-mark-hit"
            aria-label="Habitat"
            onClick={(event) => {
              event.preventDefault();
              if (!offer) returnOffer();
              onHome();
            }}
          >
            <svg className="head-mark" viewBox="0 0 64 64" aria-hidden="true">
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
            </svg>
          </Link>
          <span className="head-sep" aria-hidden="true" />
          {offer ? (
            <TimeRead />
          ) : (
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
          )}
          <span className="head-sep" aria-hidden="true" />
          <Link
            href="/"
            className="head-brand"
            onClick={(event) => {
              event.preventDefault();
              if (!offer) returnOffer();
              onHome();
            }}
          >
            ENTITY ICT
          </Link>
        </div>
        <nav className="head-rail">
          <Link
            href="/join"
            className="head-link"
            onClick={(event) => {
              event.preventDefault();
              onJoin();
            }}
          >
            Pilot Product
          </Link>
          <span className="head-sep" aria-hidden="true" />
          <Link href="/product" className="head-link">
            {range.explore}
          </Link>
          <span className="head-sep" aria-hidden="true" />
          <PlaceToggle />
        </nav>
      </div>
    </header>
  );
}

export function Landing() {
  const rootRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLHeadingElement>(null);
  const slotRef = useRef<HTMLParagraphElement>(null);
  const slotCopyRef = useRef<HTMLParagraphElement>(null);
  const joinSlotRef = useRef<HTMLParagraphElement>(null);
  const goRef = useRef<(next: number) => void>(() => undefined);
  const wheel = useMemo(() => [WheelGesturesPlugin({ forceWheelAxis: "y" as const })], []);
  const [viewportRef, embla] = useEmblaCarousel(
    {
      axis: "y",
      loop: false,
      align: "start",
      skipSnaps: false,
      duration: 18,
      watchDrag: (_, event) => {
        if (isField(event.target)) return false;
        const path = typeof event.composedPath === "function" ? event.composedPath() : [];
        if (path.some((node) => node instanceof Element && node.closest(".feat-reel, .feat-grid, .feat-board, .land-spec, .feat-join, .land-ask-form, [data-epic]"))) {
          return false;
        }
        const node = event.target as HTMLElement | null;
        return !node?.closest(".feat-reel, .feat-grid, .feat-board, .land-spec, .feat-join, .land-ask-form, [data-epic]");
      },
    },
    wheel,
  );

  useEffect(() => {
    const root = rootRef.current;
    const nextNum = root?.querySelector<HTMLElement>(".land-next");
    if (!root || !nextNum || !embla) return;

    const pin = pinRef.current;
    const slot = slotRef.current;
    const joinSlot = joinSlotRef.current;
    const live = pin?.querySelector<HTMLElement>(".land-hero-live");

    const place = () => {
      if (!pin) return;
      const at = Number(root.dataset.page ?? 0);
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const bottomPad = (window.matchMedia("(max-width: 860px)").matches ? 0.15 : 0.35) * rem + 96;
      const restTop = root.clientHeight - bottomPad - pin.offsetHeight;
      pin.style.bottom = "auto";
      const mark = at === LAST ? joinSlot : at === 2 ? null : slot;
      if (!mark) {
        pin.style.top = `${restTop}px`;
        return;
      }
      const slotTop = mark.getBoundingClientRect().top - root.getBoundingClientRect().top;
      pin.style.top = `${Math.min(restTop, slotTop)}px`;
    };

    const paint = (page: number) => {
      const at = Math.max(0, Math.min(LAST, page));
      root.dataset.page = String(at);
      nextNum.textContent = String(Math.min(at + 2, LAST + 1)).padStart(2, "0");
      if (live) {
        live.textContent = at === LAST ? story.join : at === 2 ? plotHero : story.hero;
      }
    };

    const nearest = () => {
      const snaps = embla.scrollSnapList();
      const progress = embla.scrollProgress();
      let at = 0;
      let best = Infinity;
      for (let i = 0; i < snaps.length; i += 1) {
        const d = Math.abs(snaps[i] - progress);
        if (d < best) {
          best = d;
          at = i;
        }
      }
      return at;
    };

    goRef.current = (next) => {
      const page = Math.max(0, Math.min(LAST, next));
      paint(page);
      embla.scrollTo(page);
    };

    const sync = () => {
      paint(nearest());
      place();
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.repeat || isField(event.target)) return;
      if ((event.target as HTMLElement | null)?.closest?.(".feat-grid, .feat-board, .land-spec, .feat-join")) return;
      if (["ArrowDown", "PageDown", " "].includes(event.key)) {
        event.preventDefault();
        goRef.current(Number(root.dataset.page ?? 0) + 1);
      }
      if (["ArrowUp", "PageUp"].includes(event.key)) {
        event.preventDefault();
        goRef.current(Number(root.dataset.page ?? 0) - 1);
      }
    };

    paint(embla.selectedScrollSnap());
    place();
    if (new URLSearchParams(window.location.search).has("enroll")) {
      goRef.current(LAST);
    }
    embla.on("scroll", sync);
    embla.on("select", sync);
    embla.on("reInit", sync);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", place);
    return () => {
      embla.off("scroll", sync);
      embla.off("select", sync);
      embla.off("reInit", sync);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", place);
    };
  }, [embla]);

  return (
    <EntityField embla={embla}>
    <div className="split land-site" ref={rootRef} data-page="0">
      <span className="land-spine" aria-hidden="true" />
      <LandingHead onHome={() => goRef.current(0)} onJoin={() => goRef.current(LAST)} />
      <h1 className="land-hero" ref={pinRef}>
        <span className="land-hero-live">{story.hero}</span>
      </h1>
      <div className="land-pager" ref={viewportRef}>
        <div className="land-track">
          <section className="split-stage land land-open">
            <FeatureGrid />
            <HeroLine title={story.hero} lines={heroFlip} />
          </section>
          <StoryPage headRef={slotRef} />
          <PlotPage headRef={slotCopyRef} />
          <section className="split-stage land land-story land-seat-stage">
            <div className="land-story-col">
              <p className="land-story-head" ref={joinSlotRef} aria-hidden="true">
                <span className="land-hero-live">{story.join}</span>
              </p>
              <div className="land-story-body">
                <div className="land-story-copy">
                  <p className="land-mid">
                    <span>{story.ask}</span>
                  </p>
                  <WaitlistForm tone="field" />
                </div>
              </div>
            </div>
            <div className="land-spec-hold land-ask-hold">
              <FieldTiles zones={["ask"]} className="land-spec land-ask-field" />
            </div>
          </section>
        </div>
      </div>
      <div className="land-hint">
        <button
          type="button"
          className="land-flick"
          aria-label="Next page"
          onClick={() => goRef.current(Number(rootRef.current?.dataset.page ?? 0) + 1)}
        >
          <span className="land-flick-mark" aria-hidden="true">
            <svg viewBox="0 0 12 12" width="12" height="12">
              <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="0.85" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
        <button
          type="button"
          className="land-next"
          onClick={() => goRef.current(Number(rootRef.current?.dataset.page ?? 0) + 1)}
        >
          02
        </button>
      </div>
    </div>
    </EntityField>
  );
}
