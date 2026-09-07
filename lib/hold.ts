import { ECOSYSTEMS } from "@/lib/ecosystems";
import type { Health } from "@/lib/slices";
import type { HabitatView } from "@/lib/layers";

export type Hold = {
  health: Exclude<Health, "stable">;
  mark: string;
  line: string;
};

function worst(items: { health: Health }[]): Health {
  if (items.some((item) => item.health === "blocked")) return "blocked";
  if (items.some((item) => item.health === "watch")) return "watch";
  return "stable";
}

/** The one fact the field is allowed to speak. Silence if the path is clear. */
export function liveHold(view: HabitatView): Hold | null {
  if (view === "entity") return null;
  const heat = worst(ECOSYSTEMS);
  if (heat === "stable") return null;
  return { health: heat, mark: "HOLD", line: "Site 04" };
}

export function exceptions<T extends { health: Health }>(items: T[]): T[] {
  return items.filter((item) => item.health !== "stable");
}
