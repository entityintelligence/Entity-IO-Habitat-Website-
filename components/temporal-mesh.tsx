"use client";

import { useState } from "react";

type Horizon = "Year" | "Quarter" | "Month" | "Week" | "Day";

const events = [
  { id: "a", x: 8, y: 28, when: "Past", title: "Baseline locked", thread: "now" as const },
  { id: "b", x: 22, y: 58, when: "Past", title: "Crew committed", thread: "now" as const },
  { id: "c", x: 38, y: 36, when: "Present", title: "Site 04 delay", thread: "risk" as const },
  { id: "d", x: 52, y: 18, when: "Sim +3d", title: "Alternate supplier", thread: "path" as const },
  { id: "e", x: 66, y: 42, when: "Sim +10d", title: "Crew reallocated", thread: "path" as const },
  { id: "f", x: 82, y: 22, when: "Desired", title: "Commissioning held", thread: "path" as const },
  { id: "g", x: 74, y: 68, when: "Unsuccessful", title: "Pathway slips 3 wks", thread: "risk" as const },
  { id: "h", x: 48, y: 72, when: "Present", title: "Field idle cost", thread: "risk" as const },
];

const copy: Record<string, string> = {
  a: "A time-stamped information object. Once placed on the mesh, it becomes an event the rest of the model can inherit.",
  b: "People were allocated against the approved pathway. That assignment is now a constraint on every simulated future.",
  c: "The live delay. Cause sits in Procurement. Consequence is already visible in Field and Delivery. This is what Concierge surfaces first.",
  d: "A probable thread: confirm the alternate supplier. The footprint of the desired state remains reachable.",
  e: "A simulated state required to move from here to there — two specialists from Ecosystem 001 into 003.",
  f: "Desired system state as a footprint. Not a report. The condition the entity is trying to occupy.",
  g: "Unsuccessful thread. If the delay is accepted, commissioning moves and the levelling spine will not unlock the next capability on time.",
  h: "Idle crews are not a utilisation metric. They are a propagating cost against the approved pathway.",
};

export function TemporalMesh() {
  const [horizon, setHorizon] = useState<Horizon>("Week");
  const [active, setActive] = useState("c");
  const ev = events.find((e) => e.id === active)!;

  return (
    <div className="sheet">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div>
          <p className="kicker">Sheet 02 · Augmented temporal mesh</p>
          <p className="mt-1 font-mono text-[11px] tracking-widest text-ink-muted">
            EVENT TILES → STRATEGIC THREADS · {horizon.toUpperCase()}
          </p>
        </div>
        <div className="flex gap-3 font-mono text-[10px] tracking-widest uppercase text-ink-muted">
          {(["Year", "Quarter", "Month", "Week", "Day"] as Horizon[]).map((h) => (
            <button key={h} type="button" onClick={() => setHorizon(h)} className={horizon === h ? "text-ink" : ""}>
              {h}
            </button>
          ))}
        </div>
      </div>

      <div className="relative min-h-[22rem] bg-[#f7f3ea]">
        <svg viewBox="0 0 100 80" className="h-[22rem] w-full md:h-[28rem]" aria-hidden>
          <rect x="58" y="8" width="36" height="28" fill="none" stroke="#161513" strokeWidth="0.25" strokeDasharray="1 0.8" />
          <text x="59.5" y="12" fontSize="2.2" fill="#6a655c" fontFamily="ui-monospace,monospace">
            DESIRED FOOTPRINT
          </text>
          <rect x="6" y="22" width="28" height="22" fill="none" stroke="#161513" strokeWidth="0.2" opacity="0.45" />
          <text x="7.5" y="26" fontSize="2.2" fill="#6a655c" fontFamily="ui-monospace,monospace">
            CURRENT
          </text>
          <path d="M38 40 C 48 28, 62 24, 82 24" fill="none" stroke="#c45c32" strokeWidth="0.35" />
          <path d="M38 40 C 50 62, 64 68, 74 68" fill="none" stroke="#161513" strokeWidth="0.25" strokeDasharray="1 0.7" />
          <path d="M22 58 C 30 64, 40 70, 48 72" fill="none" stroke="#161513" strokeWidth="0.2" />
        </svg>

        {events.map((e) => {
          const on = e.id === active;
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => setActive(e.id)}
              style={{ left: `${e.x}%`, top: `${e.y}%` }}
              className={`absolute w-36 -translate-x-1/2 -translate-y-1/2 border px-2.5 py-2 text-left transition-colors ${
                on ? "border-accent bg-accent-soft" : "border-line bg-[#f7f3ea]/90 hover:border-ink"
              }`}
            >
              <span className="block font-mono text-[9px] tracking-widest text-ink-muted uppercase">{e.when}</span>
              <span className="mt-1 block text-xs leading-snug">{e.title}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 border-t border-line px-4 py-4 md:grid-cols-[1fr_1fr]">
        <p className="text-sm leading-relaxed text-ink-muted">
          <span className="text-ink">{ev.title}.</span> {copy[ev.id]}
        </p>
        <p className="font-mono text-[11px] leading-relaxed tracking-wide text-ink-muted">
          Scale {horizon.toLowerCase()}. Deeper access reveals the operational blueprint beneath the mesh. Threads are
          not timelines — they are probable pathways, successful or unsuccessful, through the same organisational
          state.
        </p>
      </div>
    </div>
  );
}
