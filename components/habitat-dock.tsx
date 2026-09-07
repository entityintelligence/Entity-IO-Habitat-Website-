"use client";

import { Fragment, useEffect } from "react";
import { ECOSYSTEMS, type EcoId, type EcoInner, type Ecosystem } from "@/lib/ecosystems";
import { entityState } from "@/lib/entity-state";
import { liveHold } from "@/lib/hold";
import { HABITAT_FLOW, HABITAT_VIEWS, isLayerView, type HabitatView } from "@/lib/layers";
import { SLICES, sliceBrief, type SliceId } from "@/lib/slices";

function callSign(id: HabitatView) {
  return HABITAT_VIEWS.find((item) => item.id === id)?.label ?? id;
}

export function HabitatAnatomy({
  view,
  slice,
  eco,
  ecoInner,
  onView,
  onEco,
  onSlice,
  onInner,
  onJump,
}: {
  view: HabitatView;
  slice: SliceId | null;
  eco: Ecosystem | null;
  ecoInner: EcoInner | null;
  onView: (view: HabitatView) => void;
  onEco: (id: EcoId) => void;
  onSlice: (id: SliceId) => void;
  onInner: (inner: EcoInner) => void;
  onJump: (next: { view: HabitatView; eco?: EcoId; slice?: SliceId }) => void;
}) {
  const live = HABITAT_VIEWS.find((item) => item.id === view);
  const hold = liveHold(view);
  const inside =
    isLayerView(view)
      ? SLICES.map((item) => ({
          id: item.id,
          label: item.label,
          on: slice === item.id,
          health: sliceBrief(view, item.id)?.health,
          go: () => onSlice(item.id),
        }))
      : view === "ecosystems" && eco
        ? eco.inners.map((item) => ({
            id: item.id,
            label: item.title,
            on: ecoInner?.id === item.id,
            health: item.health,
            go: () => onInner(item),
          }))
        : view === "ecosystems"
          ? ECOSYSTEMS.map((item) => ({
              id: item.id,
              label: item.label,
              on: false,
              health: item.health,
              go: () => onEco(item.id),
            }))
          : [];

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const node = event.target;
      if (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement) return;
      const here = HABITAT_FLOW.indexOf(view);
      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        event.preventDefault();
        const next = HABITAT_FLOW[Math.min(HABITAT_FLOW.length - 1, here + 1)];
        if (next) onView(next);
      }
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        event.preventDefault();
        const next = HABITAT_FLOW[Math.max(0, here - 1)];
        if (next) onView(next);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, onView]);

  return (
    <nav className="kit-sys" aria-label="Habitat">
      <div className="kit-sys-rail">
        {HABITAT_FLOW.map((id) => {
          const item = HABITAT_VIEWS.find((entry) => entry.id === id);
          if (!item) return null;
          return (
            <button
              key={id}
              type="button"
              className={view === id ? "is-on" : ""}
              aria-label={callSign(id)}
              onClick={() => onView(id)}
            >
              {item.stamp}
            </button>
          );
        })}
      </div>
      {view === "entity" ? (
        <div className="kit-sys-board" aria-label="System state">
          {entityState().map((item) => (
            <button
              key={item.id}
              type="button"
              className={`kit-sys-reading is-${item.health}`}
              aria-label={`${item.label}: ${item.reading}`}
              onClick={() => onJump(item)}
            >
              <span>{item.label}</span>
              {item.reading}
            </button>
          ))}
        </div>
      ) : (
        <div className="kit-sys-bus">
          <p className="kit-sys-call">
            <span>{live?.stamp}</span>
            {callSign(view) !== live?.stamp ? callSign(view) : null}
          </p>
          {hold ? (
            <p className={`kit-sys-hold is-${hold.health}`}>
              <span>{hold.mark}</span>
              {hold.line}
            </p>
          ) : null}
          {inside.length ? (
            <div className="kit-sys-lanes">
              {inside.map((item, i) => (
                <Fragment key={item.id}>
                  {i > 0 ? <span className="kit-sys-sep" aria-hidden="true" /> : null}
                  <button
                    type="button"
                    className={`${item.on ? "is-on" : ""} ${item.health && item.health !== "stable" ? `is-${item.health}` : ""}`.trim()}
                    onClick={item.go}
                  >
                    {item.label}
                  </button>
                </Fragment>
              ))}
            </div>
          ) : live?.hint ? (
            <p className="kit-sys-lanes is-empty">{live.hint}</p>
          ) : null}
        </div>
      )}
    </nav>
  );
}
