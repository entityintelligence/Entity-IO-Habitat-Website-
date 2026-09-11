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
  plotGuide: {
    why: "The future is at your fingertips",
    how: "Select the desired system state  >  Entity ICT unlocks the pathway",
  },
  core: "Explore Product Range",
  coreTitle: "The Core Product",
  coreAside: "Habitat",
  coreBody: [
    "Centered around time management and operational health, our core product is a persistent generative software system that perpetually optimises an entire business toward its ideal state.",
    "Seven Native Capabilities",
    "At its core, Entity io holds your business as one coherent, evolving system — connecting its people, resources, projects, information and activity to understand the operation as a whole and continuously move it toward its highest achievable state.",
  ],
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
      label: "Temporal",
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

export const rangeNumerals = ["I", "II", "III", "IV", "V", "VI", "VII"] as const;

export const range = {
  hero: "Explore Product Range",
  aside: "Habitat",
  enroll: "Pilot Product",
  explore: "Explore Product",
  habitat: {
    name: "Welcome to Habitat 01",
    aside: "A certified asset, holding the digital identity of your business operation within one coherent command environment — shaped to funnel and push an entity through its evolutionary states.",
    lines: [
      "As your business evolves, it moves through a continuous sequence of states. Within Habitat 01, these states are mapped across time and space, revealing what needs to happen, when, where and in what order to move the entity toward its objective.",
      "The mosaic offers a glimpse into this process. Each tile represents a possible state of the business, providing a visual point of entry into the journey toward a selected destination.",
    ],
  },
  engineering: {
    name: "Technical Interpretation",
    lines: [
      "A persistent, self-regulating software system that identifies and generates its own optimal state within specific contextual parameters.",
      "The native elements of the environment are centered around time management, operational health and frontier intelligence technology.",
      "Effective Implementation: Requires a large volume of data from operationally complex subjects.",
      "The product is engineered through seven influential fields. Each field is a constitutive discipline of Habitat 01 — the structure through which the environment reads an entity, predicts its next state and aligns the operation toward an objective.",
      "Temporal · Spatial · Connectivity · Evolution · Cognition · Causality · Adaptation",
    ],
  },
  views: [
    {
      code: "01",
      name: "Temporal",
      at: "2,0",
      aside: "See your operation through time.",
      lines: [
        "Entity io connects what has happened, what is happening and what is likely to happen next. Projects, schedules, resources and dependencies exist on a common timeline, allowing critical paths to emerge, requirements to be anticipated and future activity to adjust as conditions change.",
        "Project planning · Scheduling · Critical paths · Forecasting · Scenario modelling",
      ],
    },
    {
      code: "02",
      name: "Spatial",
      at: "2,1",
      aside: "Know where everything is and where it needs to be.",
      lines: [
        "People, assets, inventory, resources and activity are mapped across the physical, digital and organisational structure of your business — creating visibility across sites, teams and operational environments.",
        "Asset management · Logistics · Inventory · Workforce deployment · Operational mapping",
      ],
    },
    {
      code: "03",
      name: "Connectivity",
      at: "1,1",
      aside: "Bring the entire operation into one coherent state.",
      lines: [
        "Information, people, processes, resources, projects and systems are connected through their relationships and dependencies. Changes no longer disappear into silos — the wider operation remains connected and visible.",
        "ERP · Data integration · Dependency mapping · Workflow coordination · Cross-functional visibility",
      ],
    },
    {
      code: "04",
      name: "Evolution",
      at: "2,2",
      aside: "Build a more capable operation.",
      lines: [
        "Entity io understands the business as something that continuously develops. Influenced by the Acatech 4.0 Maturity Index, it identifies capability gaps, maps maturity and creates pathways that push the entity from the way it works today toward its optimal state.",
        "Maturity modelling · Capability development · Process improvement · Transformation planning · Strategic roadmapping · Unlocking scaling thresholds",
      ],
    },
    {
      code: "05",
      name: "Cognition",
      at: "1,2",
      aside: "Turn operational complexity into understanding.",
      lines: [
        "Entity io continuously interprets information across the business, identifying what matters and delivering it within context. Instead of searching, reconciling and interpreting information across multiple systems, your people receive the understanding they need to make better decisions.",
        "Operational intelligence · Contextual information delivery · Pattern recognition · Decision support · Organisational knowledge",
      ],
    },
    {
      code: "06",
      name: "Causality",
      at: "2,3",
      aside: "Understand the consequence of change.",
      lines: [
        "Every decision has downstream effects. Entity io models how changes propagate across projects, resources, costs, schedules, capacity and objectives — revealing consequences that would otherwise emerge after the fact.",
        "Impact analysis · Dependency modelling · Scenario simulation · Constraint analysis · Change propagation",
      ],
    },
    {
      code: "07",
      name: "Adaptation",
      at: "1,3",
      aside: "Keep the operation aligned as reality changes.",
      lines: [
        "Plans rarely survive unchanged. As work moves, resources change, new information arrives or priorities shift, Entity io recalibrates the wider operational state — coordinating what needs to change and maintaining alignment with your objectives. Centered around operational health, it perpetually optimises the business toward its ideal state.",
        "Automation · Resource management · Workflow orchestration · Dynamic replanning · Exception management · Objective alignment",
      ],
    },
    {
      code: "08",
      name: "Enrollment",
      at: "1,4",
      lines: [
        "We are inviting select businesses to join us on the frontline as Design Partners and future users. Enquire to explore the opportunity, the benefits and whether your business is a fit.",
      ],
    },
  ],
} as const;

export const ladder = [
  { id: "01", title: "Free access", body: "Low-friction exposure to KIT." },
  { id: "02", title: "Core operating environment", body: "The shared organisational state." },
  { id: "03", title: "Intelligence & automation", body: "Prediction, simulation, Concierge depth." },
  { id: "04", title: "Premium / enterprise", body: "Advanced governance, integrations, operating functions." },
] as const;
