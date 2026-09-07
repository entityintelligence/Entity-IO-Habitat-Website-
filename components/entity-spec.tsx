"use client";

import { story } from "@/content/copy";
import { FieldTiles, useField } from "@/components/entity-field";
import { useEffect, useRef } from "react";

export function EntitySpec({ panelId = "land-spec-panel" }: { panelId?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { open, setOpen } = useField();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointer = (event: PointerEvent) => {
      const node = event.target as Element | null;
      if (node?.closest?.(".land-spec-hold")) return;
      setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open, setOpen]);

  return (
    <div ref={rootRef} className="land-spec-hold">
      <FieldTiles zones={["story"]} className="land-spec" />
      <div className="land-spec-panel" id={panelId} hidden={!open}>
        <p className="land-story-lede">
          {story.native.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </p>
        <ul className="land-spec-cats">
          {story.cats.map((item) => (
            <li key={item.label} className="land-spec-cat">
              <span className="land-hero-live">{item.label}</span>
              <p>{item.line}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
