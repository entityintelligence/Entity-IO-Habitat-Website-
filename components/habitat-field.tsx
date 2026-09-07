"use client";

import { useState } from "react";

type Lens = "attention" | "entity" | "time";
type Focus = "none" | "delay" | "intel" | "resource" | "field" | "desired";

const decisions = [
  { who: "you", line: "approve the alternate supplier, or accept a three-day shift." },
  { who: "procurement", line: "confirm inbound within 36 hours so field capacity can release." },
  { who: "delivery", line: "hold commissioning until the path is coherent again." },
];

export function HabitatField() {
  const [lens, setLens] = useState<Lens>("attention");
  const [focus, setFocus] = useState<Focus>("none");

  return (
    <div id="habitat">
      <div className="mb-8 flex gap-10">
        {(
          [
            ["attention", "attention"],
            ["entity", "entity"],
            ["time", "time"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setLens(id);
              setFocus("none");
            }}
            className={`mono ${lens === id ? "text-ink" : "text-mute"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {lens === "attention" ? (
        <div className="flex flex-wrap gap-8">
          <button type="button" className="mono" onClick={() => setFocus("delay")}>
            [delay]
          </button>
        </div>
      ) : null}
      {lens === "entity" ? (
        <div className="flex flex-wrap gap-8">
          <button type="button" className="mono" onClick={() => setFocus("intel")}>
            [intelligence]
          </button>
          <button type="button" className="mono" onClick={() => setFocus("resource")}>
            [resource]
          </button>
          <button type="button" className="mono" onClick={() => setFocus("field")}>
            [field]
          </button>
        </div>
      ) : null}
      {lens === "time" ? (
        <div className="flex flex-wrap gap-8">
          <button type="button" className="mono" onClick={() => setFocus("desired")}>
            [footprint]
          </button>
        </div>
      ) : null}

      {lens === "attention" && focus === "none" ? (
        <p className="display mt-10 text-[1.65rem] sm:text-3xl">what needs my attention today?</p>
      ) : null}

      <div className="measure mt-8 min-h-[7.5rem] text-[16px] leading-[1.55]">
        {lens === "attention" && focus === "none" ? (
          <p className="mono text-mute">the field is quiet. one node is live.</p>
        ) : null}
        {focus === "delay" ? (
          <div>
            <p className="cy text-xl">site 04 is holding the critical path.</p>
            <p className="mt-3">
              confirmation slipped 36 hours. field capacity waits. commissioning moves three days unless the path is
              rewritten. the rest of the entity has already felt it.
            </p>
            <ul className="mt-6 space-y-3">
              {decisions.map((d) => (
                <li key={d.who} className="flex gap-5">
                  <span className="mono w-28 shrink-0 text-mute">[{d.who}]</span>
                  <span>{d.line}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {lens === "entity" && focus === "none" ? (
          <p className="mono text-mute">[intelligence] [resource] [field] — a node, not a menu.</p>
        ) : null}
        {focus === "intel" ? (
          <p>
            intelligence is sovereign across the whole. it does not live in a module. it names risk only when a
            decision is required.
          </p>
        ) : null}
        {focus === "resource" ? (
          <p>people, plant, materials, capital — allocated against the pathway, never against a static plan.</p>
        ) : null}
        {focus === "field" ? (
          <p>mechanical work nests inside ecosystems. none of them owns the truth of the entity.</p>
        ) : null}
        {lens === "time" && focus !== "desired" ? (
          <p className="mono text-mute">now. desired. the simulated states between.</p>
        ) : null}
        {focus === "desired" ? (
          <p>
            desired state as a footprint. KIT will not approve a path the entity lacks capacity to walk. take the
            unsuccessful branch and the footprint moves — and everyone bound to it.
          </p>
        ) : null}
      </div>
    </div>
  );
}
