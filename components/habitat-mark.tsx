"use client";

import { parts, type HabitatPart } from "@/lib/habitat";
import type { HabitatView } from "@/lib/layers";

const CX = 500;
const CY = 500;

function wedge(
  r0: number,
  r1: number,
  a0: number,
  a1: number,
  cx = CX,
  cy = CY,
) {
  const p = (r: number, a: number) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as const;
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const [x0, y0] = p(r1, a0);
  const [x1, y1] = p(r1, a1);
  const [x2, y2] = p(r0, a1);
  const [x3, y3] = p(r0, a0);
  return `M${x0} ${y0} A${r1} ${r1} 0 ${large} 1 ${x1} ${y1} L${x2} ${y2} A${r0} ${r0} 0 ${large} 0 ${x3} ${y3} Z`;
}

function pill(cx: number, cy: number, a: number, r: number) {
  const x = cx + Math.cos(a) * r;
  const y = cy + Math.sin(a) * r;
  const rot = (a * 180) / Math.PI + 90;
  return { x, y, rot };
}

const ECO = [
  { id: "eco-001", label: "ECOSYSTEM 001", a: Math.PI },
  { id: "eco-002", label: "ECOSYSTEM 002", a: 0 },
  { id: "eco-003", label: "ECOSYSTEM 003", a: Math.PI * 0.35 },
  { id: "eco-004", label: "ECOSYSTEM 004", a: Math.PI * 0.72 },
] as const;

export function HabitatMark({
  view,
  selected,
  onSelect,
}: {
  view: HabitatView;
  selected: string | null;
  onSelect: (part: HabitatPart) => void;
}) {
  const show = (layer: HabitatPart["layer"] | "core") => {
    if (view === "ecosystems") return 1;
    if (view === "base") return layer === "base" || layer === "mechanical" ? 1 : 0.16;
    if (view === "intelligence") return layer === "intelligence" || layer === "core" ? 1 : 0.14;
    if (view === "resource") return layer === "resource" || layer === "core" ? 1 : 0.14;
    if (view === "mechanical") return layer === "mechanical" ? 1 : 0.14;
    return 1;
  };

  const on = (id: string) => selected === id;
  const fill = (id: string) => (on(id) ? "rgba(243,243,241,0.22)" : "rgba(243,243,241,0.04)");
  const stroke = (id: string) => (on(id) ? "#f3f3f1" : "rgba(243,243,241,0.55)");

  const outerN = view === "mechanical" ? 8 : view === "intelligence" ? 16 : 12;
  const outerR0 = view === "mechanical" ? 210 : 248;
  const outerR1 = 368;
  const gap = 0.018;

  return (
    <svg viewBox="0 0 1000 1000" className="habitat-mark" role="img" aria-label="The Habitat">
      <circle cx={CX} cy={CY} r="392" fill="none" stroke="rgba(243,243,241,0.18)" strokeWidth="1.1" />
      <circle cx={CX} cy={CY} r="384" fill="none" stroke="rgba(243,243,241,0.1)" strokeWidth="0.7" />

      <g opacity={show("mechanical")} style={{ transition: "opacity 280ms" }}>
        {Array.from({ length: outerN }, (_, i) => {
          const a0 = -Math.PI / 2 + (i * Math.PI * 2) / outerN + gap;
          const a1 = -Math.PI / 2 + ((i + 1) * Math.PI * 2) / outerN - gap;
          const eco = ECO[i % 4];
          const id = view === "mechanical" ? `eco-00${(i % 4) + 1}` : eco.id;
          return (
            <path
              key={`o${i}`}
              d={wedge(outerR0, outerR1, a0, a1)}
              fill={fill(id)}
              stroke={stroke(id)}
              strokeWidth={on(id) ? 1.8 : 1.05}
              className="habitat-hit"
              onClick={() => onSelect(parts.find((p) => p.id === id) ?? parts[0])}
            />
          );
        })}
      </g>

      <g opacity={show("intelligence")} style={{ transition: "opacity 280ms" }}>
        {[0, 1, 2, 3].map((i) => {
          const a0 = -Math.PI / 2 + (i * Math.PI) / 2 + 0.06;
          const a1 = -Math.PI / 2 + ((i + 1) * Math.PI) / 2 - 0.06;
          return (
            <path
              key={`q${i}`}
              d={wedge(92, 198, a0, a1)}
              fill={fill("intel-mod")}
              stroke={stroke("intel-mod")}
              strokeWidth={on("intel-mod") ? 1.8 : 1.05}
              className="habitat-hit"
              onClick={() => onSelect(parts.find((p) => p.id === "intel-mod")!)}
            />
          );
        })}
      </g>

      <g
        opacity={view === "resource" ? 1 : 0}
        style={{ transition: "opacity 280ms", pointerEvents: view === "resource" ? "auto" : "none" }}
      >
        {(
          [
            ["res-people", -Math.PI / 2],
            ["res-matter", 0],
            ["res-capital", Math.PI / 2],
          ] as const
        ).map(([id, a]) => {
          const x = CX + Math.cos(a) * 148;
          const y = CY + Math.sin(a) * 148;
          return (
            <g key={id} className="habitat-hit" onClick={() => onSelect(parts.find((p) => p.id === id)!)}>
              <circle cx={x} cy={y} r="28" fill={fill(id)} stroke={stroke(id)} strokeWidth={on(id) ? 1.8 : 1.1} />
              <circle cx={x} cy={y} r="4" fill="#f3f3f1" />
            </g>
          );
        })}
        <text
          x={CX}
          y="78"
          textAnchor="middle"
          fill={on("capacity") ? "#f3f3f1" : "rgba(243,243,241,0.4)"}
          fontSize="11"
          fontFamily="ui-monospace, monospace"
          letterSpacing="1.4"
          className="habitat-hit"
          onClick={() => onSelect(parts.find((p) => p.id === "capacity")!)}
        >
          CAPABILITY / CAPACITY
        </text>
      </g>

      <g
        opacity={show("core")}
        className="habitat-hit"
        onClick={() => onSelect(parts.find((p) => p.id === "concierge")!)}
        style={{ transition: "opacity 280ms" }}
      >
        <circle cx={CX} cy={CY} r="54" fill={on("concierge") ? "#f3f3f1" : "rgba(243,243,241,0.92)"} />
        <circle cx={CX} cy={CY} r="38" fill="none" stroke="#1a1a1a" strokeWidth="1.2" />
        <circle cx={CX} cy={CY} r="8" fill="#1a1a1a" />
      </g>

      <g opacity={show("base")} style={{ transition: "opacity 280ms" }}>
        {[0, 1, 2, 3].map((i) => {
          const a = -Math.PI / 2 + (i * Math.PI) / 2;
          const p = pill(CX, CY, a, 368);
          return (
            <g
              key={`t${i}`}
              transform={`translate(${p.x} ${p.y}) rotate(${p.rot})`}
              className="habitat-hit"
              onClick={() => onSelect(parts.find((x) => x.id === "terminal")!)}
            >
              <rect
                x="-16"
                y="-8"
                width="32"
                height="16"
                rx="8"
                fill={fill("terminal")}
                stroke={stroke("terminal")}
                strokeWidth={on("terminal") ? 1.8 : 1.1}
              />
            </g>
          );
        })}
        <circle
          cx={CX}
          cy={CY}
          r="376"
          fill="none"
          stroke={on("network") ? "#f3f3f1" : "rgba(243,243,241,0.22)"}
          strokeWidth={on("network") ? 2 : 1}
          className="habitat-hit"
          onClick={() => onSelect(parts.find((p) => p.id === "network")!)}
        />
      </g>

      {view === "base" || view === "ecosystems"
        ? ECO.map((e) => {
            const x = CX + Math.cos(e.a) * 410;
            const y = CY + Math.sin(e.a) * 410;
            return (
              <text
                key={e.id}
                x={x}
                y={y}
                textAnchor="middle"
                fill="rgba(243,243,241,0.42)"
                fontSize="11"
                fontFamily="ui-monospace, monospace"
                letterSpacing="1.4"
              >
                {e.label}
              </text>
            );
          })
        : null}

      {view === "intelligence" ? (
        <>
          <text x={CX} y="86" textAnchor="middle" fill="rgba(243,243,241,0.45)" fontSize="12" fontFamily="ui-monospace, monospace" letterSpacing="2">
            SYSTEM CONCIERGE
          </text>
          <text
            x="820"
            y="500"
            textAnchor="middle"
            fill={on("temporal") ? "#f3f3f1" : "rgba(243,243,241,0.4)"}
            fontSize="11"
            fontFamily="ui-monospace, monospace"
            letterSpacing="1.2"
            className="habitat-hit"
            onClick={() => onSelect(parts.find((p) => p.id === "temporal")!)}
          >
            TEMPORAL ENV.
          </text>
          <text
            x="180"
            y="500"
            textAnchor="middle"
            fill={on("packages") ? "#f3f3f1" : "rgba(243,243,241,0.4)"}
            fontSize="11"
            fontFamily="ui-monospace, monospace"
            letterSpacing="1.2"
            className="habitat-hit"
            onClick={() => onSelect(parts.find((p) => p.id === "packages")!)}
          >
            DELIVERY
          </text>
        </>
      ) : null}
    </svg>
  );
}
