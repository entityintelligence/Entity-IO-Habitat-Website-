"use client";

import { FieldTiles } from "@/components/entity-field";

export function FeatureGrid() {
  return (
    <div className="feat-stage">
      <div className="feat-board">
        <FieldTiles zones={["top"]} className="feat-grid" waveMark />
      </div>
      <FieldTiles zones={["join"]} className="feat-join feat-join-open" />
    </div>
  );
}
