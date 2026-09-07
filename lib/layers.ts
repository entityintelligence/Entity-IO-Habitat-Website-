export type HabitatView = "entity" | "ecosystems" | "base" | "intelligence" | "resource" | "mechanical";

export type LayerView = Exclude<HabitatView, "entity" | "ecosystems">;

export const HABITAT_VIEWS: {
  id: HabitatView;
  group: "body" | "layer";
  stamp: string;
  label: string;
  hint: string;
}[] = [
  { id: "entity", group: "body", stamp: "AV", label: "Entity", hint: "" },
  { id: "ecosystems", group: "body", stamp: "00", label: "Ecosystems", hint: "nested operational form" },
  { id: "base", group: "layer", stamp: "000", label: "000", hint: "containment, network, terminals" },
  { id: "intelligence", group: "layer", stamp: "001", label: "Governance", hint: "prediction, concierge, governed release" },
  { id: "resource", group: "layer", stamp: "002", label: "Resources", hint: "people, matter, capital" },
  { id: "mechanical", group: "layer", stamp: "003", label: "Mechanical", hint: "actuates the business functions" },
];

export function isLayerView(view: HabitatView): view is LayerView {
  return view === "base" || view === "intelligence" || view === "resource" || view === "mechanical";
}

/** Left–right order of the Habitat. Swipe the body through this sequence. */
export const HABITAT_FLOW: HabitatView[] = [
  "entity",
  "ecosystems",
  "base",
  "intelligence",
  "resource",
  "mechanical",
];

