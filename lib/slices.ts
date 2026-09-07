import type { LayerId } from "@/lib/habitat";

export type SliceId = "infrastructure" | "modules" | "networks" | "gates";
export type Health = "stable" | "watch" | "blocked";

export const SLICES: { id: SliceId; label: string; hint: string }[] = [
  { id: "infrastructure", label: "Infrastructure", hint: "structure and containment" },
  { id: "modules", label: "Modules", hint: "active components" },
  { id: "networks", label: "Networks", hint: "routing and flow" },
  { id: "gates", label: "Gates", hint: "ingress, hold, release" },
];

export type Granule = {
  id: string;
  title: string;
  health: Health;
  note: string;
};

export type SliceBrief = {
  layer: LayerId;
  slice: SliceId;
  code: string;
  title: string;
  health: Health;
  load: string;
  state: string;
  body: string;
  granules: Granule[];
};

function g(layer: LayerId, slice: SliceId, i: number, title: string, health: Health, note: string): Granule {
  return { id: `${layer}:${slice}:${i}`, title, health, note };
}

export const SLICE_BRIEFS: SliceBrief[] = [
  {
    layer: "base",
    slice: "infrastructure",
    code: "BASE · INFRA",
    title: "Containment",
    health: "stable",
    load: "18%",
    state: "Form holding",
    body: "The Habitat’s structural shell. Modules can stack and nest because this layer does not move.",
    granules: [
      g("base", "infrastructure", 0, "Shell", "stable", "Containment intact."),
      g("base", "infrastructure", 1, "Stacking grid", "stable", "Spread and branch within tolerance."),
      g("base", "infrastructure", 2, "Foundations", "stable", "No drift on the sitting plane."),
    ],
  },
  {
    layer: "base",
    slice: "modules",
    code: "BASE · MODULES",
    title: "Routing nodes",
    health: "watch",
    load: "41%",
    state: "One node warm",
    body: "Nodes that move payloads between ecosystems, layers, and the outside. One inbound node is running hot.",
    granules: [
      g("base", "modules", 0, "Ingress node", "watch", "Site 04 confirmation still open."),
      g("base", "modules", 1, "Transfer node", "stable", "Internal hops clear."),
      g("base", "modules", 2, "Egress node", "stable", "Outbound packages leaving on time."),
    ],
  },
  {
    layer: "base",
    slice: "networks",
    code: "BASE · NETWORK",
    title: "Transport bus",
    health: "stable",
    load: "33%",
    state: "Coherent",
    body: "Shared state bus. Intelligence, resource and mechanical layers ride the same routes.",
    granules: [
      g("base", "networks", 0, "State bus", "stable", "Single source, no fork."),
      g("base", "networks", 1, "Layer routes", "stable", "001–003 bound to Base."),
      g("base", "networks", 2, "External link", "watch", "Supplier feed delayed 36h."),
    ],
  },
  {
    layer: "base",
    slice: "gates",
    code: "BASE · GATES",
    title: "Terminals",
    health: "watch",
    load: "4 open",
    state: "Inbound held",
    body: "Controlled shipping points. Work, information and resources only enter or leave here.",
    granules: [
      g("base", "gates", 0, "Inbound gate", "watch", "Confirmation not yet seated."),
      g("base", "gates", 1, "Transfer gate", "stable", "Internal handoff clear."),
      g("base", "gates", 2, "Outbound gate", "stable", "Field packages can still leave."),
      g("base", "gates", 3, "External gate", "watch", "Supplier channel open too long."),
    ],
  },
  {
    layer: "intelligence",
    slice: "infrastructure",
    code: "001 · GOVERNANCE",
    title: "Concierge fabric",
    health: "watch",
    load: "3 open",
    state: "Decisions waiting",
    body: "The face of intelligence. Interprets the entity and names what must be decided — it does not live inside an ecosystem.",
    granules: [
      g("intelligence", "infrastructure", 0, "Intent surface", "watch", "Three decisions outstanding."),
      g("intelligence", "infrastructure", 1, "Role context", "stable", "Permissions coherent."),
      g("intelligence", "infrastructure", 2, "Memory", "stable", "State trail intact."),
    ],
  },
  {
    layer: "intelligence",
    slice: "modules",
    code: "001 · MODULES",
    title: "Prediction modules",
    health: "stable",
    load: "62%",
    state: "Sovereign",
    body: "Pattern, pathway and recalibration. Control without residing in any operational domain.",
    granules: [
      g("intelligence", "modules", 0, "Pattern", "stable", "Site 04 delay already named."),
      g("intelligence", "modules", 1, "Pathway sim", "watch", "Commissioning slip still live."),
      g("intelligence", "modules", 2, "Recalibration", "stable", "Waiting on an approved path."),
    ],
  },
  {
    layer: "intelligence",
    slice: "networks",
    code: "001 · NETWORK",
    title: "Guidance bus",
    health: "stable",
    load: "27%",
    state: "Bound to Base",
    body: "Recommendations ride the Base network. Nothing here owns plant, people, or a site.",
    granules: [
      g("intelligence", "networks", 0, "Advice route", "stable", "Packages ready on approval."),
      g("intelligence", "networks", 1, "Layer listen", "stable", "002 and 003 in view."),
      g("intelligence", "networks", 2, "Avatar link", "stable", "Entity still readable."),
    ],
  },
  {
    layer: "intelligence",
    slice: "gates",
    code: "001 · GATES",
    title: "Governed release",
    health: "watch",
    load: "1 hold",
    state: "Signature open",
    body: "A path does not run until this gate closes. Work has already arrived at it.",
    granules: [
      g("intelligence", "gates", 0, "Approve", "watch", "Hold commissioning, or accept the slip."),
      g("intelligence", "gates", 1, "Condition", "stable", "Return path unused."),
      g("intelligence", "gates", 2, "Refuse", "stable", "Not yet invoked."),
    ],
  },
  {
    layer: "resource",
    slice: "infrastructure",
    code: "002 · INFRA",
    title: "Capacity plane",
    health: "watch",
    load: "94%",
    state: "Near ceiling",
    body: "What the entity can carry. People, matter and capital sit here — never assigned past actual load.",
    granules: [
      g("resource", "infrastructure", 0, "Capability", "stable", "Skills match the path."),
      g("resource", "infrastructure", 1, "Capacity", "watch", "Field utilisation 94%."),
      g("resource", "infrastructure", 2, "Reserve", "stable", "Capital still within margin."),
    ],
  },
  {
    layer: "resource",
    slice: "modules",
    code: "002 · MODULES",
    title: "People · matter · capital",
    health: "blocked",
    load: "1 freeze",
    state: "Matter waiting",
    body: "Usable energy of the entity. Matter is frozen on Site 04 confirmation.",
    granules: [
      g("resource", "modules", 0, "People", "watch", "Crews waiting on release."),
      g("resource", "modules", 1, "Matter", "blocked", "Confirmation +36h."),
      g("resource", "modules", 2, "Capital", "stable", "Within margin."),
    ],
  },
  {
    layer: "resource",
    slice: "networks",
    code: "002 · NETWORK",
    title: "Allocation flow",
    health: "watch",
    load: "71%",
    state: "Held against 003",
    body: "Assignments move only against an approved path. 003 is waiting on this flow.",
    granules: [
      g("resource", "networks", 0, "People flow", "watch", "Specialists not yet released."),
      g("resource", "networks", 1, "Matter flow", "blocked", "Inbound not seated."),
      g("resource", "networks", 2, "Capital flow", "stable", "No extra draw."),
    ],
  },
  {
    layer: "resource",
    slice: "gates",
    code: "002 · GATES",
    title: "Release gates",
    health: "blocked",
    load: "closed",
    state: "Cannot issue",
    body: "Capacity does not leave this layer until confirmation lands or an alternate is approved.",
    granules: [
      g("resource", "gates", 0, "Crew release", "blocked", "Waiting on matter."),
      g("resource", "gates", 1, "Plant release", "blocked", "Same hold."),
      g("resource", "gates", 2, "Alternate path", "watch", "Supplier option unapproved."),
    ],
  },
  {
    layer: "mechanical",
    slice: "infrastructure",
    code: "003 · INFRA",
    title: "Ecosystem shells",
    health: "watch",
    load: "4 live",
    state: "Delivery at risk",
    body: "Operational domains. They fulfil output. They do not own intelligence or resources.",
    granules: [
      g("mechanical", "infrastructure", 0, "Engineering", "stable", "On pathway."),
      g("mechanical", "infrastructure", 1, "Procurement", "watch", "Waiting on confirmation."),
      g("mechanical", "infrastructure", 2, "Field", "blocked", "Blocked by Site 04."),
      g("mechanical", "infrastructure", 3, "Delivery", "watch", "Commissioning at risk."),
    ],
  },
  {
    layer: "mechanical",
    slice: "modules",
    code: "003 · MODULES",
    title: "Nested work",
    health: "watch",
    load: "68%",
    state: "Upstream freeze",
    body: "Mechanical modules nested inside ecosystems. Recalibrating as the information model changes.",
    granules: [
      g("mechanical", "modules", 0, "Design / change", "stable", "Engineering still moving."),
      g("mechanical", "modules", 1, "Order / inbound", "watch", "Procurement held."),
      g("mechanical", "modules", 2, "Crew / site", "blocked", "Field cannot start."),
    ],
  },
  {
    layer: "mechanical",
    slice: "networks",
    code: "003 · NETWORK",
    title: "Work path",
    health: "blocked",
    load: "break",
    state: "002 → 003 cut",
    body: "Work should move Engineering → Procurement → Field → Delivery. The cut is at confirmation.",
    granules: [
      g("mechanical", "networks", 0, "001 → 002", "watch", "Orders waiting."),
      g("mechanical", "networks", 1, "002 → 003", "blocked", "No release from Resource."),
      g("mechanical", "networks", 2, "003 → 004", "watch", "Commissioning cannot be held from here."),
    ],
  },
  {
    layer: "mechanical",
    slice: "gates",
    code: "003 · GATES",
    title: "Handover holds",
    health: "blocked",
    load: "1 hold",
    state: "Commissioning gated",
    body: "Quality and handover gates. The field is not inventing an unofficial path.",
    granules: [
      g("mechanical", "gates", 0, "Quality gate", "watch", "Inbound not yet inspectable."),
      g("mechanical", "gates", 1, "Site gate", "blocked", "Crew held."),
      g("mechanical", "gates", 2, "Commission gate", "blocked", "Do not start."),
    ],
  },
];

export function sliceBrief(layer: LayerId, slice: SliceId): SliceBrief | null {
  return SLICE_BRIEFS.find((item) => item.layer === layer && item.slice === slice) ?? null;
}

export function granuleById(id: string): { brief: SliceBrief; granule: Granule } | null {
  for (const brief of SLICE_BRIEFS) {
    const granule = brief.granules.find((item) => item.id === id);
    if (granule) return { brief, granule };
  }
  return null;
}
