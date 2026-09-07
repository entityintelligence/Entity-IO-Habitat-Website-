"use client";

import { useState } from "react";
import { HabitatAnatomy } from "@/components/habitat-dock";
import { Logogram } from "@/components/logogram";
import { ECOSYSTEMS, ecoInnerById, ecosystemById, type EcoId, type EcoInner, type Ecosystem } from "@/lib/ecosystems";
import { parts, type HabitatPart } from "@/lib/habitat";
import { isLayerView, type HabitatView } from "@/lib/layers";
import { granuleById, sliceBrief, type Granule, type SliceBrief, type SliceId } from "@/lib/slices";
import { useTheme } from "@/components/theme";

export function Attention() {
  const [view, setView] = useState<HabitatView>("entity");
  const [slice, setSlice] = useState<SliceId | null>(null);
  const [ecoId, setEcoId] = useState<EcoId | null>(null);
  const [part, setPart] = useState<HabitatPart | null>(null);
  const [brief, setBrief] = useState<SliceBrief | null>(null);
  const [granule, setGranule] = useState<Granule | null>(null);
  const [eco, setEco] = useState<Ecosystem | null>(null);
  const [ecoInner, setEcoInner] = useState<EcoInner | null>(null);
  const { theme } = useTheme();

  return (
    <div className="split">
      <section className="split-stage">
        <div className="split-mark">
          <Logogram
            className="block h-auto w-full"
            live
            inverted={theme === "dark"}
            system
            habitatView={view}
            partId={ecoInner?.id ?? granule?.id ?? part?.id ?? null}
            sliceId={slice}
            ecoId={ecoId}
            cluster={view === "entity" ? -2 : -1}
            tempo={view === "entity"}
            compact={view === "entity"}
            onHabitat={(id) => {
              if (!id) return;
              const innerHit = ecoInnerById(id);
              if (innerHit) {
                setView("ecosystems");
                setEcoId(innerHit.eco.id);
                setEco(innerHit.eco);
                setEcoInner(innerHit.inner);
                setSlice(null);
                setBrief(null);
                setGranule(null);
                setPart(null);
                return;
              }
              const asEco = ecosystemById(id);
              if (asEco) {
                setView("ecosystems");
                setEcoId(asEco.id);
                setEco(asEco);
                setEcoInner(null);
                setSlice(null);
                setBrief(null);
                setGranule(null);
                setPart(null);
                return;
              }
              const hit = granuleById(id);
              if (hit) {
                setBrief(hit.brief);
                setGranule(hit.granule);
                setPart(null);
                setEco(null);
                setEcoInner(null);
                return;
              }
              setPart(parts.find((p) => p.id === id) ?? null);
              setGranule(null);
              setBrief(null);
              setEcoInner(null);
            }}
          />
        </div>
        <HabitatAnatomy
          view={view}
          slice={slice}
          eco={eco}
          ecoInner={ecoInner}
          onView={(next) => {
            setView(next);
            setSlice(null);
            setEcoId(null);
            setPart(null);
            setBrief(null);
            setGranule(null);
            setEco(null);
            setEcoInner(null);
          }}
          onEco={(id) => {
            setView("ecosystems");
            setEcoId(id);
            setEco(ECOSYSTEMS.find((item) => item.id === id) ?? null);
            setEcoInner(null);
            setSlice(null);
            setPart(null);
            setBrief(null);
            setGranule(null);
          }}
          onSlice={(id) => {
            if (!isLayerView(view)) return;
            setSlice(id);
            setBrief(sliceBrief(view, id));
            setGranule(null);
            setEco(null);
            setEcoId(null);
            setEcoInner(null);
            setPart(null);
          }}
          onInner={(inner) => {
            setEcoInner(inner);
            setPart(null);
            setBrief(null);
            setGranule(null);
          }}
          onJump={(next) => {
            if (next.eco) {
              setView("ecosystems");
              setEcoId(next.eco);
              setEco(ECOSYSTEMS.find((item) => item.id === next.eco) ?? null);
              setEcoInner(null);
              setSlice(null);
              setPart(null);
              setBrief(null);
              setGranule(null);
              return;
            }
            setView(next.view);
            setSlice(next.slice ?? null);
            setBrief(next.slice && isLayerView(next.view) ? sliceBrief(next.view, next.slice) : null);
            setEcoId(null);
            setEco(null);
            setEcoInner(null);
            setPart(null);
            setGranule(null);
          }}
        />
      </section>
    </div>
  );
}
