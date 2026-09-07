import type { Health } from "@/lib/slices";

export type EcoId = "eco-001" | "eco-002" | "eco-003" | "eco-004";

export type EcoInner = {
  id: string;
  title: string;
  health: Health;
  note: string;
};

export type Ecosystem = {
  id: EcoId;
  stamp: string;
  label: string;
  health: Health;
  state: string;
  body: string;
  inners: EcoInner[];
};

function inner(eco: EcoId, i: number, title: string, health: Health, note: string): EcoInner {
  return { id: `${eco}:${i}`, title, health, note };
}

export const ECOSYSTEMS: Ecosystem[] = [
  {
    id: "eco-001",
    stamp: "001",
    label: "Engineering",
    health: "stable",
    state: "On pathway",
    body: "Design and technical coordination. Four modules. It does not own people, plant, or intelligence.",
    inners: [
      inner("eco-001", 0, "Design", "stable", "Drawings tracking the live path."),
      inner("eco-001", 1, "Approvals", "stable", "No hold inside this ecosystem."),
      inner("eco-001", 2, "Coordination", "stable", "Interfaces coherent."),
      inner("eco-001", 3, "Change", "watch", "Waiting on 002 confirmation before issuing the next pack."),
    ],
  },
  {
    id: "eco-002",
    stamp: "002",
    label: "Procurement",
    health: "watch",
    state: "Confirmation +36h",
    body: "Supplier, order, inbound, quality. The delay here is already propagating.",
    inners: [
      inner("eco-002", 0, "Supplier", "watch", "Confirmation slipped thirty-six hours."),
      inner("eco-002", 1, "Order", "watch", "Alternate path unapproved."),
      inner("eco-002", 2, "Inbound", "blocked", "Nothing seated for Site 04."),
      inner("eco-002", 3, "Quality gate", "watch", "Cannot inspect what has not arrived."),
    ],
  },
  {
    id: "eco-003",
    stamp: "003",
    label: "Field",
    health: "blocked",
    state: "Held by Site 04",
    body: "Crew, site, plant, safety. Waiting on Resource release. No unofficial path.",
    inners: [
      inner("eco-003", 0, "Crew", "blocked", "Utilisation high — cannot release."),
      inner("eco-003", 1, "Site", "blocked", "Site 04 is the hold."),
      inner("eco-003", 2, "Plant", "watch", "8-tonne bound until the path is rewritten."),
      inner("eco-003", 3, "Safety", "stable", "Hold is governed. Do not improvise."),
    ],
  },
  {
    id: "eco-004",
    stamp: "004",
    label: "Delivery",
    health: "watch",
    state: "Commissioning at risk",
    body: "Handover and close. Recalibrates as upstream events rewrite the model.",
    inners: [
      inner("eco-004", 0, "Commission", "blocked", "Do not start."),
      inner("eco-004", 1, "Handover", "watch", "Date moves unless 002 clears."),
      inner("eco-004", 2, "Defects", "stable", "No extra load yet."),
      inner("eco-004", 3, "Close", "watch", "Waiting on a coherent path."),
    ],
  },
];

export function ecosystemById(id: string): Ecosystem | null {
  return ECOSYSTEMS.find((item) => item.id === id) ?? null;
}

export function ecoInnerById(id: string): { eco: Ecosystem; inner: EcoInner } | null {
  for (const eco of ECOSYSTEMS) {
    const found = eco.inners.find((item) => item.id === id);
    if (found) return { eco, inner: found };
  }
  return null;
}
