"use client";

import { useState } from "react";
import Link from "next/link";
import { range, story } from "@/content/copy";
import { ThemeToggle } from "@/components/theme-toggle";
import { PlaceToggle } from "@/components/place";
import { TimeRead } from "@/components/time-read";

const ENROLL = "/?enroll=1";

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

function EpicGlyph() {
  return (
    <svg className="feat-epic-mark" viewBox="0 0 64 64" aria-hidden="true">
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

function GoMark() {
  return (
    <span className="land-ask-go-mark" aria-hidden="true">
      <svg viewBox="0 0 12 12">
        <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="0.85" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function ProductRange() {
  const [open, setOpen] = useState(false);

  return (
    <div className="split land-site range-page">
      <span className="land-spine" aria-hidden="true" />
      <header className="land-head">
        <div className="head-bar">
          <div className="head-ident">
            <Link href="/" className="head-brand">
              HABITAT<span className="head-brand-slash">/</span>ENTITY ICT
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
            <PlaceToggle />
            <span className="head-sep" aria-hidden="true" />
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <section className="split-stage land land-story">
        <div className="range-cluster">
          <div className="range-hold">
            <span className="feat-tile" data-epic="1" aria-hidden="true">
              <EpicGlyph />
            </span>
          </div>
          <div className="land-story-col">
            <h1 className="land-story-head">
              <button
                type="button"
                className="land-core-kicker range-toggle"
                aria-expanded={open}
                onClick={() => setOpen((next) => !next)}
              >
                <span className="land-hero-live">{range.hero}</span>
                <span className="land-hero-slash land-hero-live">/</span>
                <span className="land-hero-aside land-hero-live">{range.aside}</span>
                <GoMark />
              </button>
            </h1>
            {open ? (
              <div className="land-story-body">
                <div className="land-story-copy">
                  <p className="land-mid">
                    {story.coreBody.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </p>
                  <Link href={ENROLL} className="land-core-kicker">
                    <span className="land-hero-live">{range.enroll}</span>
                    <GoMark />
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
