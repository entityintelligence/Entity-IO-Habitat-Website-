"use client";

import Link from "next/link";
import { useState } from "react";
import { range, rangeNumerals } from "@/content/copy";
import { PlaceToggle } from "@/components/place";
import { TimeRead } from "@/components/time-read";
import { EntityField, FieldTiles } from "@/components/entity-field";
import type { RangeRead } from "@/components/range-carousel";

const ENROLL = "/?enroll=1";
const PLOT_CORNER = [{ col: 6, row: 13, zone: "plot" as const }];
const PLOT_CAROUSEL = { c: 6, r: 11 };
const PLOT_GATE = { c: 0, r: 12 };
const PLOT_KEEP = ["0,12"];

function HabitatMark() {
  return (
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
  );
}

function viewNumeral(view: (typeof range.habitat) | (typeof range.engineering) | (typeof range.views)[number]) {
  if (!("code" in view)) return null;
  return rangeNumerals[Number(view.code) - 1] ?? null;
}

export function ProductRange() {
  const [read, setRead] = useState<RangeRead | null>("habitat");
  const [cover, setCover] = useState(false);
  const view =
    read === "habitat"
      ? cover
        ? null
        : range.habitat
      : read === "technical"
        ? range.engineering
        : read && read !== "habitat" && read !== "technical"
          ? read
          : null;
  const numeral = view ? viewNumeral(view) : null;
  const habitat = Boolean(view && read === "habitat");

  return (
    <EntityField page={2} extraCells={PLOT_CORNER} hubSeat={PLOT_CAROUSEL} hubStart={PLOT_GATE}>
      <div className="split land-site range-page" data-page="2">
        <span className="land-spine" aria-hidden="true" />
        <header className="land-head">
          <div className="head-bar">
            <div className="head-ident">
              <Link href="/" className="head-brand">
                ENTITY ICT
              </Link>
              <span className="head-sep" aria-hidden="true" />
              <TimeRead />
              <span className="head-sep" aria-hidden="true" />
              <Link href="/" className="head-mark-hit" aria-label="Habitat">
                <HabitatMark />
              </Link>
            </div>
            <nav className="head-rail">
              <Link href={ENROLL} className="head-link">
                {range.enroll}
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
        <section className="split-stage land land-story land-plot-stage">
          {view ? (
            <div className="land-story-col" key={view.name}>
              <p className="land-story-head">
                <span className="land-hero-live">
                  {numeral ? <span className="range-numeral">{numeral}.</span> : null}
                  {numeral ? " " : null}
                  {view.name}
                </span>
              </p>
              <div className="land-story-body">
                <div className="land-story-copy">
                  {habitat ? (
                    <p className="land-mid">
                      <span>{view.aside}</span>
                      {view.lines.map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </p>
                  ) : (
                    <>
                      <p className="land-mid">
                        {"aside" in view && view.aside ? <span>{view.aside}</span> : null}
                        {view.lines.slice(0, view.lines.length > 1 ? -1 : undefined).map((line) => (
                          <span key={line}>{line}</span>
                        ))}
                      </p>
                      {view.lines.length > 1 ? (
                        <div className="range-foot">
                          {read === "technical" ? null : <span className="land-story-rule" aria-hidden="true" />}
                          <ul className="range-uses">
                            {view.lines[view.lines.length - 1].split(" · ").map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : null}
          <div className="land-spec-hold land-plot-hold">
            <FieldTiles
              zones={["plot"]}
              className="land-spec"
              loneEpic
              carouselSeat={PLOT_CAROUSEL}
              showCells={PLOT_KEEP}
              onView={setRead}
              onCover={setCover}
            />
          </div>
        </section>
      </div>
    </EntityField>
  );
}
