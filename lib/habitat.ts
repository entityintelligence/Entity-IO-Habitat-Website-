export type LayerId = "intelligence" | "resource" | "mechanical" | "base";
export type ViewMode = "complete" | "layer" | "component";

export type HabitatPart = {
  id: string;
  layer: LayerId;
  code: string;
  title: string;
  state: string;
  body: string;
  inner: string[];
};

export const parts: HabitatPart[] = [
  {
    id: "concierge",
    layer: "intelligence",
    code: "001 · CENTRE",
    title: "System Concierge",
    state: "Three decisions outstanding",
    body: "The face of intelligence. Interprets organisational state, names what matters, and packages action for the people who must take it.",
    inner: ["Intent surface", "Role + permission context", "Governed recommendation"],
  },
  {
    id: "intel-mod",
    layer: "intelligence",
    code: "001 · MODULES",
    title: "Intelligence modules",
    state: "Sovereign across all ecosystems",
    body: "Prediction, orchestration and guidance on the Base Layer network — control without residing inside any single operational domain.",
    inner: ["Pattern recognition", "Pathway simulation", "Recalibration loop"],
  },
  {
    id: "res-people",
    layer: "resource",
    code: "002 · PEOPLE",
    title: "People & skills",
    state: "Field utilisation 94%",
    body: "Capacity, availability and competence matched to the approved pathway — never assigned beyond what the entity can actually carry.",
    inner: ["Roles", "Availability", "Skill match"],
  },
  {
    id: "res-matter",
    layer: "resource",
    code: "002 · MATTER",
    title: "Materials & assets",
    state: "Site 04 confirmation +36h",
    body: "Usable energy: materials, plant, inventory. Allocated against requirements issued by the user or the Concierge.",
    inner: ["Inventory", "Plant", "Supplier confirmation"],
  },
  {
    id: "res-capital",
    layer: "resource",
    code: "002 · CAPITAL",
    title: "Capital & knowledge",
    state: "Within margin",
    body: "Money, data, repositories and agentic workforce held as reserves — released against the same governing objectives as people and matter.",
    inner: ["Budget", "Information objects", "Agent capacity"],
  },
  {
    id: "eco-001",
    layer: "mechanical",
    code: "ECOSYSTEM 001",
    title: "Engineering",
    state: "On pathway",
    body: "Design, approvals and technical coordination. Nested mechanical modules that fulfil this ecosystem’s output without owning resources or intelligence.",
    inner: ["Design", "Approvals", "Technical coordination", "Change"],
  },
  {
    id: "eco-002",
    layer: "mechanical",
    code: "ECOSYSTEM 002",
    title: "Procurement",
    state: "Waiting on confirmation",
    body: "Supplier, order and inbound flow. The delay here is already propagating — Intelligence has named the consequence.",
    inner: ["Supplier", "Order", "Inbound", "Quality gate"],
  },
  {
    id: "eco-003",
    layer: "mechanical",
    code: "ECOSYSTEM 003",
    title: "Field execution",
    state: "Blocked by Site 04",
    body: "People, sites and logistics. Waiting on Resource Layer capacity that cannot be released until 002 confirms.",
    inner: ["Crew", "Site", "Plant movement", "Safety"],
  },
  {
    id: "eco-004",
    layer: "mechanical",
    code: "ECOSYSTEM 004",
    title: "Delivery",
    state: "Commissioning at risk",
    body: "Handover and completion. Recalibrates as upstream events rewrite the information model.",
    inner: ["Commission", "Handover", "Defects", "Close"],
  },
  {
    id: "terminal",
    layer: "base",
    code: "BASE · TERMINALS",
    title: "Access terminals",
    state: "Routing payloads",
    body: "Controlled shipping points. Information, governance and resources enter, exit, transfer and route between systems, ecosystems and the outside.",
    inner: ["Ingress", "Egress", "Transfer", "External connection"],
  },
  {
    id: "network",
    layer: "base",
    code: "BASE · NETWORK",
    title: "Transport network",
    state: "Coherent",
    body: "The Habitat’s structural foundation and containment. Modules stack, spread, branch and nest without the form collapsing.",
    inner: ["Containment", "Routing", "Shared state bus"],
  },
  {
    id: "temporal",
    layer: "intelligence",
    code: "UX · MESH",
    title: "Augmented Temporal Mesh",
    state: "Past · present · probable futures",
    body: "The virtual environment through which the avatar moves across time. Event tiles become strategic threads — pathways toward successful or unsuccessful outcomes.",
    inner: ["Event tiles", "Strategic threads", "Annual to daily scale"],
  },
  {
    id: "packages",
    layer: "intelligence",
    code: "UX · DELIVERY",
    title: "User information delivery",
    state: "Execution units, not reports",
    body: "Once a pathway is approved, the Concierge translates it into live packages — role-bound, time-bound, recalibrating as the information model changes.",
    inner: ["Select pathway", "Generate packages", "Deliver · execute · recalibrate"],
  },
  {
    id: "capacity",
    layer: "resource",
    code: "UX · CALIBRATION",
    title: "Capability and capacity",
    state: "Load against the approved path",
    body: "What the entity can do, and how much it can carry. Roles, skills and availability matched to the pathway — never assigned beyond actual capacity.",
    inner: ["Capability", "Capacity", "Constraint and reallocation"],
  },
];

export const layers: { id: LayerId | "all"; stamp: string; name: string }[] = [
  { id: "all", stamp: "00", name: "Complete model" },
  { id: "intelligence", stamp: "001", name: "Intelligence" },
  { id: "resource", stamp: "002", name: "Resource" },
  { id: "mechanical", stamp: "003", name: "Mechanical" },
  { id: "base", stamp: "000", name: "000" },
];
