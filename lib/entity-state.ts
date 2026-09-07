import type { EcoId } from "@/lib/ecosystems";
import type { HabitatView } from "@/lib/layers";
import type { Health, SliceId } from "@/lib/slices";

export type EntityReading = {
  id: string;
  label: string;
  reading: string;
  health: Health;
  view: HabitatView;
  eco?: EcoId;
  slice?: SliceId;
};

/** What an operator needs from the live body — named facts, not codes. */
export function entityState(): EntityReading[] {
  return [
    {
      id: "hold",
      label: "Hold",
      reading: "Site 04",
      health: "blocked",
      view: "ecosystems",
      eco: "eco-003",
    },
    {
      id: "gate",
      label: "Decisions",
      reading: "3 waiting",
      health: "watch",
      view: "intelligence",
    },
    {
      id: "cap",
      label: "Capacity",
      reading: "94%",
      health: "watch",
      view: "resource",
    },
    {
      id: "time",
      label: "Delay",
      reading: "36 hours",
      health: "watch",
      view: "ecosystems",
      eco: "eco-002",
    },
  ];
}
