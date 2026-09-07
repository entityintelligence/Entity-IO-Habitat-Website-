export const nav = [
  { href: "/habitat", label: "Product" },
  { href: "/join", label: "Partnership Seats" },
] as const;

export const industries = [
  "Engineering & infrastructure",
  "Construction / specialist contracting",
  "Energy & renewables",
  "Mining services",
  "Telecommunications infrastructure",
  "Industrial services",
  "Marine / shipbuilding",
  "Aerospace & defence supply",
  "Complex / project-based manufacturing",
] as const;

export const employeeBands = [
  "Fewer than 100",
  "100–250",
  "250–500",
  "500+",
] as const;

export const operatorRoles = ["Operations", "Projects", "Owner / director"] as const;

export const planStacks = [
  "Excel / sheets",
  "P6 / Primavera",
  "Procore / ACC",
  "ERP",
  "A mix of those",
] as const;

export const nativeCapabilities = [
  {
    id: "01",
    title: "Digital Twin / ERP Core",
    body: "Captures, persists and maintains operational state, entities, relationships, events and information flows.",
  },
  {
    id: "02",
    title: "Temporal Projection",
    body: "Historical state, present condition and potential futures — prediction, simulation and critical-path analysis.",
  },
  {
    id: "03",
    title: "Work & Project Orchestration",
    body: "Objectives, projects, workflows, dependencies and responsibilities, bound to the changing entity.",
  },
  {
    id: "04",
    title: "Logistics & Flow",
    body: "Movement and dependencies of materials, assets, orders, information and operational processes.",
  },
  {
    id: "05",
    title: "Resource & Capacity",
    body: "People, skills, equipment, inventory and constraints against current and anticipated demand.",
  },
  {
    id: "06",
    title: "Objectives & Pathways",
    body: "Organisational objectives connected to strategies, critical paths, resources, work and execution.",
  },
  {
    id: "07",
    title: "Governance & Visibility",
    body: "Complete underlying transparency, with control over who sees, approves or acts.",
  },
  {
    id: "08",
    title: "Concierge / Intelligence",
    body: "The guide inside KIT. Interprets state, identifies risk and opportunity, recommends governed action.",
  },
] as const;

export const mechanicalModules = [
  "CRM & Sales",
  "Procurement & Suppliers",
  "Manufacturing",
  "Warehouse & Inventory",
  "Asset & Maintenance",
  "Field Service",
  "Quality",
  "HR & Workforce",
  "Finance & Accounting",
  "Payroll",
  "Customer Service",
  "E-commerce & Orders",
  "Compliance & Risk",
  "Contracts & Documents",
] as const;

export const offerings = {
  kicker: "KIT · Next-generation enterprise planning · Australia",
  line: "Stop planning",
  line2: "a company you cannot see.",
  lede: "Project-driven operators. 100–250 people. The organisation already runs as one body — projects, people, plant and sites. The tools do not. KIT is the live twin. You see the whole, predict the next state and the path to it, approve, and the change propagates.",
  points: [
    { label: "See", body: "Every instrument rides the same entity." },
    { label: "Predict", body: "The next state — and how to get there." },
    { label: "Approve", body: "You sign. KIT runs the rest." },
  ],
  who: "Two founding seats · Built on your company · The list is public",
} as const;

export const story = {
  hero: "N–Gen Enterprise Assets",
  join: "Join Entity ICT at the Vanguard",
  plot: "Temporal Projection",
  plotCopy: "Select your business entity's future and press execute critical path.",
  heroAside: "Entity Digital Twin",
  problem: [
    "When the components of your business fall out of rhythm, you lose time – similar to a clock.",
    "We are developing a product line that holds them in rhythm, enabling your operation to run like clockwork.",
    "Harness time and unlock enterprise performance with the next generation of command environment.",
  ],
  native: ["Native system capabilities include:"],
  cats: [
    {
      label: "Visibility",
      line: "Complete underlying transparency.",
    },
    {
      label: "Prediction",
      line: "High-quality predictive capability.",
    },
    {
      label: "Autonomy",
      line: "High-quality automation capability.",
    },
    {
      label: "Evolution",
      line: "Immerse yourself in your entity and watch it evolve.",
    },
  ],
  who: "Project-driven operators. 100–250.",
  ask: "We are inviting select businesses to join us on the frontline as Design Partners and future users. Enquire to explore the opportunity, the benefits and whether your business is a fit.",
  paths: [
    {
      value: "waitlist",
      label: "Future User",
      note: "First access as the product line comes online. We write when a seat is ready — no generic rollout.",
    },
    {
      value: "design-partner",
      label: "Design Partner",
      note: "A founding seat. We sit with your live operation, persist it as an entity, and shape the product line with you. Two seats.",
    },
  ],
  waiting: "on the waitlist",
  pathNote: "Design partner gets a short follow-up. User waitlist is first access.",
  ok: "You’re on the list. We’ll write.",
  features: [
    {
      label: "Concierge",
      line: [
        "The face of intelligence in the system. Understands, orchestrates and automates the entity.",
        "The concierge guides users from ingestion through the whole experience.",
      ],
    },
    {
      label: "Instantiation",
      line: "The organisation is ingested and stood up as a live entity — systems, records and structure, bound from the first pass.",
    },
    {
      label: "Levelling",
      line: "Unlock capabilities as the entity levels — new functions, depth and practice coming online as the organisation is ready.",
    },
    {
      label: "Workflow management",
      line: "Objectives, projects, workflows, dependencies and responsibilities, bound to the changing entity.",
    },
    {
      label: "Temporal Projection",
      line: "Historical state, present condition and potential futures — prediction, simulation and critical-path analysis.",
    },
    {
      label: "Critical Path Routing",
      line: "The live route through the work that holds — dependencies, delay, and the path that must be kept.",
    },
    {
      label: "Information delivery",
      line: "Once a pathway is approved, the Concierge translates it into live packages — role-bound, time-bound, recalibrating as the information model changes.",
    },
    {
      label: "Logistics & Flow",
      line: "Movement and dependencies of materials, assets, orders, information and operational processes.",
    },
    {
      label: "Resource & Capacity",
      line: "People, skills, equipment, inventory and constraints against current and anticipated demand.",
    },
  ],
} as const;

export const heroFlip = [
  story.heroAside,
  "Temporal Projection",
  "Autonomous Orchestration",
  "Situational Awareness",
  "Universally Stack",
  "Native AI Infrastructure",
  "Radical Visibility",
  "Systemic Propagation",
  "Preserve Cognition",
  "Unlock Performance",
] as const;

export const ladder = [
  { id: "01", title: "Free access", body: "Low-friction exposure to KIT." },
  { id: "02", title: "Core operating environment", body: "The shared organisational state." },
  { id: "03", title: "Intelligence & automation", body: "Prediction, simulation, Concierge depth." },
  { id: "04", title: "Premium / enterprise", body: "Advanced governance, integrations, operating functions." },
] as const;
