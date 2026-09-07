"use client";

import { useMemo, useState } from "react";
import { layers, parts, type HabitatPart, type LayerId, type ViewMode } from "@/lib/habitat";

function dim(id: string, selected: string, mode: ViewMode, layer: LayerId | "all", part: HabitatPart) {
  if (mode === "complete" && layer === "all") return selected === id ? 1 : 0.92;
  if (mode === "layer" && layer !== "all") return part.layer === layer ? 1 : 0.18;
  if (mode === "component") return selected === id ? 1 : 0.16;
  return selected === id ? 1 : 0.55;
}

export function BlueprintStage() {
  const [mode, setMode] = useState<ViewMode>("complete");
  const [layer, setLayer] = useState<LayerId | "all">("all");
  const [selectedId, setSelectedId] = useState("concierge");
  const selected = parts.find((p) => p.id === selectedId) ?? parts[0];

  const select = (id: string) => {
    setSelectedId(id);
    if (mode === "layer") {
      const p = parts.find((x) => x.id === id);
      if (p) setLayer(p.layer);
    }
  };

  const o = useMemo(
    () => (id: string) => {
      const part = parts.find((p) => p.id === id)!;
      return dim(id, selectedId, mode, layer, part);
    },
    [selectedId, mode, layer],
  );

  return (
    <div className="sheet">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div>
          <p className="kicker">Sheet 01 · Architectural blueprint</p>
          <p className="mt-1 font-mono text-[11px] tracking-widest text-ink-muted">THE HABITAT / NESTED MODULAR FORM</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["complete", "layer", "component"] as ViewMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                if (m === "complete") setLayer("all");
              }}
              className={`px-2.5 py-1 font-mono text-[10px] tracking-wider uppercase ${
                mode === m ? "bg-ink text-paper" : "text-ink-muted hover:text-ink"
              }`}
            >
              {m === "complete" ? "Complete" : m === "layer" ? "By layer" : "By component"}
            </button>
          ))}
        </div>
      </div>

      {mode === "layer" ? (
        <div className="flex flex-wrap gap-4 border-b border-line px-4 py-2 font-mono text-[10px] tracking-widest uppercase">
          {layers.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setLayer(l.id)}
              className={layer === l.id ? "text-ink" : "text-ink-muted"}
            >
              {l.stamp} {l.name}
            </button>
          ))}
        </div>
      ) : null}

      <div className="grid lg:grid-cols-[1fr_17.5rem]">
        <div className="relative overflow-x-auto bg-[#f7f3ea]">
          <svg
            viewBox="0 0 1120 720"
            className="h-auto min-w-[720px] w-full"
            role="img"
            aria-label="Architectural blueprint of the Habitat"
          >
            <defs>
              <pattern id="mini" width="16" height="16" patternUnits="userSpaceOnUse">
                <path d="M16 0H0V16" fill="none" stroke="#d8d1c4" strokeWidth="0.4" />
              </pattern>
            </defs>
            <rect width="1120" height="720" fill="url(#mini)" />
            <rect x="28" y="24" width="1064" height="672" fill="none" stroke="#161513" strokeWidth="0.8" />
            <path d="M28 36h12M28 36v12M1092 36h-12M1092 36v12M28 684h12M28 684v-12M1092 684h-12M1092 684v-12" stroke="#161513" strokeWidth="1.2" fill="none" />

            {/* Intelligence */}
            <g opacity={mode === "layer" && layer !== "all" && layer !== "intelligence" ? 0.18 : 1} style={{ transition: "opacity 300ms" }}>
              <text x="48" y="52" fill="#6a655c" fontSize="9" letterSpacing="2.4" fontFamily="ui-monospace,monospace">
                THE HABITAT / 001 : INTELLIGENCE LAYER
              </text>
              <rect x="48" y="64" width="1024" height="148" fill="none" stroke="#161513" strokeWidth="0.7" />
              <g
                opacity={o("intel-mod")}
                onClick={() => select("intel-mod")}
                className="cursor-pointer"
                style={{ transition: "opacity 300ms" }}
              >
                <rect x="64" y="84" width="200" height="108" fill="#f7f3ea" stroke="#161513" strokeWidth="0.7" />
                <rect x="76" y="98" width="50" height="36" fill="none" stroke="#161513" strokeWidth="0.6" />
                <rect x="134" y="98" width="50" height="36" fill="none" stroke="#161513" strokeWidth="0.6" />
                <rect x="192" y="98" width="50" height="36" fill="none" stroke="#161513" strokeWidth="0.6" />
                <text x="76" y="158" fontSize="10" fill="#161513" fontFamily="ui-monospace,monospace">
                  MODULES
                </text>
              </g>
              <g
                opacity={o("concierge")}
                onClick={() => select("concierge")}
                className="cursor-pointer"
                style={{ transition: "opacity 300ms" }}
              >
                <circle cx="560" cy="138" r="44" fill={selectedId === "concierge" ? "#f3ddd2" : "#f7f3ea"} stroke="#c45c32" strokeWidth="1.4" />
                <circle cx="560" cy="138" r="8" fill="#c45c32" />
                <text x="560" y="198" textAnchor="middle" fontSize="10" fill="#c45c32" fontFamily="ui-monospace,monospace" letterSpacing="1.5">
                  SYSTEM CONCIERGE
                </text>
              </g>
              <g opacity={o("intel-mod")} onClick={() => select("intel-mod")} className="cursor-pointer">
                <rect x="856" y="84" width="200" height="108" fill="#f7f3ea" stroke="#161513" strokeWidth="0.7" />
                <text x="872" y="112" fontSize="10" fill="#6a655c" fontFamily="ui-monospace,monospace">
                  TEMPORAL ENV.
                </text>
                <path d="M872 128h168M872 148h120M872 168h148" stroke="#161513" strokeWidth="0.5" />
              </g>
              <line x1="264" y1="138" x2="516" y2="138" stroke="#161513" strokeWidth="0.5" />
              <line x1="604" y1="138" x2="856" y2="138" stroke="#161513" strokeWidth="0.5" />
            </g>

            {/* Resource */}
            <g opacity={mode === "layer" && layer !== "all" && layer !== "resource" ? 0.18 : 1} style={{ transition: "opacity 300ms" }}>
              <text x="48" y="240" fill="#6a655c" fontSize="9" letterSpacing="2.4" fontFamily="ui-monospace,monospace">
                THE HABITAT / 002 : RESOURCE LAYER
              </text>
              <rect x="48" y="252" width="1024" height="112" fill="none" stroke="#161513" strokeWidth="0.7" />
              {(
                [
                  ["res-people", 180, "PEOPLE"],
                  ["res-matter", 560, "MATTER"],
                  ["res-capital", 940, "CAPITAL"],
                ] as const
              ).map(([id, x, label]) => (
                <g
                  key={id}
                  opacity={o(id)}
                  onClick={() => select(id)}
                  className="cursor-pointer"
                  style={{ transition: "opacity 300ms" }}
                >
                  <circle cx={x} cy="308" r="28" fill={selectedId === id ? "#f3ddd2" : "none"} stroke="#161513" strokeWidth="0.8" />
                  <circle cx={x} cy="308" r="4" fill="#161513" />
                  <text x={x} y="352" textAnchor="middle" fontSize="10" fontFamily="ui-monospace,monospace" fill="#161513">
                    {label}
                  </text>
                </g>
              ))}
              <line x1="208" y1="308" x2="532" y2="308" stroke="#161513" strokeWidth="0.5" />
              <line x1="588" y1="308" x2="912" y2="308" stroke="#161513" strokeWidth="0.5" />
            </g>

            {/* Mechanical */}
            <g opacity={mode === "layer" && layer !== "all" && layer !== "mechanical" ? 0.18 : 1} style={{ transition: "opacity 300ms" }}>
              <text x="48" y="392" fill="#6a655c" fontSize="9" letterSpacing="2.4" fontFamily="ui-monospace,monospace">
                THE HABITAT / 003 : MECHANICAL LAYER
              </text>
              {(
                [
                  ["eco-001", 48, "001 ENGINEERING", false],
                  ["eco-002", 312, "002 PROCUREMENT", false],
                  ["eco-003", 576, "003 FIELD", true],
                  ["eco-004", 840, "004 DELIVERY", false],
                ] as const
              ).map(([id, x, label, delay]) => (
                <g
                  key={id}
                  opacity={o(id)}
                  onClick={() => select(id)}
                  className={`cursor-pointer ${delay ? "pulse-delay" : ""}`}
                  style={{ transition: "opacity 300ms" }}
                >
                  <rect
                    x={x}
                    y="404"
                    width="232"
                    height="148"
                    fill={selectedId === id ? "#f3ddd2" : "#f7f3ea"}
                    stroke={delay ? "#c45c32" : "#161513"}
                    strokeWidth={delay ? 1.2 : 0.7}
                  />
                  <text x={x + 12} y="424" fontSize="9" letterSpacing="1.6" fontFamily="ui-monospace,monospace" fill={delay ? "#c45c32" : "#6a655c"}>
                    ECOSYSTEM {label}
                  </text>
                  {[0, 1, 2, 3].map((i) => (
                    <rect
                      key={i}
                      x={x + 14 + (i % 2) * 102}
                      y={438 + Math.floor(i / 2) * 48}
                      width="92"
                      height="40"
                      fill="none"
                      stroke="#161513"
                      strokeWidth="0.55"
                    />
                  ))}
                </g>
              ))}
            </g>

            {/* Base */}
            <g opacity={mode === "layer" && layer !== "all" && layer !== "base" ? 0.18 : 1} style={{ transition: "opacity 300ms" }}>
              <text x="48" y="580" fill="#6a655c" fontSize="9" letterSpacing="2.4" fontFamily="ui-monospace,monospace">
                THE HABITAT / BASE LAYER
              </text>
              <g opacity={o("network")} onClick={() => select("network")} className="cursor-pointer">
                <line x1="64" y1="620" x2="1056" y2="620" stroke="#161513" strokeWidth="1.1" />
                <line x1="64" y1="628" x2="1056" y2="628" stroke="#161513" strokeWidth="0.5" />
              </g>
              <g opacity={o("terminal")} onClick={() => select("terminal")} className="cursor-pointer">
                {[164, 428, 692, 956].map((x, i) => (
                  <g key={x}>
                    <path d={`M${x} 608 v28 M${x - 10} 622 h20`} stroke="#c45c32" strokeWidth="1.2" />
                    <text x={x} y="656" textAnchor="middle" fontSize="8" fontFamily="ui-monospace,monospace" fill="#6a655c">
                      T 00{i + 1}
                    </text>
                  </g>
                ))}
                <text x="48" y="676" fontSize="9" fontFamily="ui-monospace,monospace" fill="#6a655c">
                  ACCESS TERMINALS · PAYLOAD INGRESS / EGRESS
                </text>
              </g>
            </g>

            {/* risers */}
            <line x1="164" y1="212" x2="164" y2="404" stroke="#161513" strokeWidth="0.4" strokeDasharray="2 3" />
            <line x1="560" y1="182" x2="560" y2="404" stroke="#c45c32" strokeWidth="0.5" strokeDasharray="2 3" />
            <line x1="956" y1="212" x2="956" y2="404" stroke="#161513" strokeWidth="0.4" strokeDasharray="2 3" />

            <rect x="900" y="24" width="192" height="48" fill="none" stroke="#161513" strokeWidth="0.6" />
            <text x="912" y="42" fontSize="8" fontFamily="ui-monospace,monospace" fill="#6a655c">
              ENTITY IO · KIT
            </text>
            <text x="912" y="58" fontSize="8" fontFamily="ui-monospace,monospace" fill="#161513">
              DWG 001 / HABITAT
            </text>
          </svg>
        </div>

        <aside className="border-t border-line p-5 lg:border-l lg:border-t-0">
          <p className="kicker">Inspect</p>
          <p className="mt-4 font-mono text-[10px] tracking-widest text-accent">{selected.code}</p>
          <h3 className="mt-2 font-serif text-2xl italic leading-tight">{selected.title}</h3>
          <p className="mt-2 text-xs text-accent">{selected.state}</p>
          <p className="mt-4 text-sm leading-relaxed text-ink-muted">{selected.body}</p>
          <ul className="mt-5 space-y-1.5 border-t border-line pt-4">
            {selected.inner.map((item) => (
              <li key={item} className="flex items-center gap-2 font-mono text-[11px] tracking-wide text-ink-muted">
                <span className="inline-block h-px w-3 bg-line-strong" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-6 font-mono text-[10px] leading-relaxed tracking-wide text-ink-muted">
            Nested form. Intelligence and Resource remain sovereign across every ecosystem. Mechanical modules nest
            inside 001–004.
          </p>
        </aside>
      </div>
    </div>
  );
}
