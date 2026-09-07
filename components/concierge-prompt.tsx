"use client";

import { useState } from "react";

const replies = [
  {
    q: "What needs my attention today?",
    a: "A materials delay on Site 04 is holding the critical path. Cause: supplier confirmation slipped 36 hours. Consequence: commissioning moves three days unless capacity is reallocated. Decision: approve the alternate supplier, or accept the shift.",
  },
  {
    q: "Where is the entity constrained?",
    a: "Resource Layer, people — field crews at 94% utilisation. Mechanical Layer, Ecosystem 003 is waiting on that same capacity. Intelligence recommends redistributing two specialists from Ecosystem 001.",
  },
];

export function ConciergePrompt() {
  const [index, setIndex] = useState(0);
  const item = replies[index];

  return (
    <div className="border border-line bg-[#f7f3ea]/80">
      <div className="flex items-center justify-between border-b border-line px-4 py-2">
        <p className="kicker">Concierge · intent</p>
        <p className="font-mono text-[10px] tracking-widest text-ink-muted">NOT A MENU</p>
      </div>
      <button
        type="button"
        className="flex w-full items-end justify-between gap-6 px-4 py-4 text-left"
        onClick={() => setIndex((i) => (i + 1) % replies.length)}
      >
        <span className="font-serif text-xl italic leading-snug md:text-2xl">{item.q}</span>
        <span className="shrink-0 font-mono text-[10px] tracking-widest text-ink-muted">ASK</span>
      </button>
      <p className="border-t border-line px-4 py-4 text-sm leading-relaxed text-ink-muted">{item.a}</p>
    </div>
  );
}
