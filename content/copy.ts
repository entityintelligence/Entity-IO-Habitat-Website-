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
  core: "Explore Habitat 1: Genesis",
  coreTitle: "The Core Product",
  coreAside: "Habitat 1: Genesis",
  coreBody: [
    "Centered around time management and operational health, our core product is a persistent generative software system that perpetually optimises an entire business toward its ideal state.",
    "Seven Native Capabilities",
    "At its core, Entity io holds your business as one coherent, evolving system — connecting its people, resources, projects, information and activity to understand the operation as a whole and continuously move it toward its highest achievable state.",
  ],
  heroAside: "Enhanced Digital Twins",
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
  "Maximise Automation",
  "Universally Stack",
  "AI Native",
  "Radical Visibility",
  "Unlock Performance",
] as const;

export const plotHero = "Predict The Future";

export const plotFlip = [
  "Temporal Projection",
  "Critical Path",
  "System States",
  "Preferred Futures",
  "Before It Arrives",
] as const;

export const rangeNumerals = ["I", "II", "III", "IV", "V", "VI", "VII"] as const;

export const range = {
  hero: "Explore Habitat 1: Genesis",
  aside: "Habitat 1: Genesis",
  enroll: "Pilot Product",
  explore: "Explore Habitat 1: Genesis",
  habitat: {
    name: "Welcome to Habitat 1: Genesis",
    aside: "A certified asset, holding the digital identity of your business operation within one coherent command environment. As that captured business evolves, it moves through states. Habitat 1 maps those states across time and space, forming a critical path toward the objective and guiding the entity through each successive state to reach it.",
    lines: [
      "Information is delivered in context and translated into coordinated action, driving execution along the critical path while every change propagates through the entity — continuously recalibrating the pathway and keeping the operation aligned in motion.",
    ],
  },
  engineering: {
    name: "Technical Interpretation",
    lines: [
      "A persistent, self-regulating software system that identifies and generates its own optimal state within specific contextual parameters. The native elements of the environment are centered around time management, operational health and frontier intelligence technology.",
      "Effective Implementation: Requires a large volume of data from operationally complex subjects.",
      "The product is engineered through seven influential fields. Each field is a constitutive discipline of Habitat 1.",
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
        "The product maintains a continuous temporal model of the operation, connecting historical activity, current conditions and future requirements across projects, resources, schedules, workflows and dependencies. This creates radical visibility over what has happened, what is happening now, what is likely to happen next and what must occur to reach a defined objective.",
        "Future pathways are projected against the live state of the business, exposing critical paths, constraints, timing conflicts and resource requirements. As conditions change, the system recalculates what follows and translates the selected pathway into sequenced work, coordinating dependencies and progressing activity as required conditions are satisfied.",
        "Project & Portfolio Management · Advanced Planning & Scheduling · Critical Path Management · Forecasting & Predictive Planning · Scenario Planning & Simulation · Workflow & Process Orchestration · Resource Planning · Radical Operational Visibility",
      ],
    },
    {
      code: "02",
      name: "Spatial",
      at: "2,1",
      aside: "Know where everything is and where it needs to be.",
      lines: [
        "The product maintains a live spatial view of the operation, connecting people, assets, inventory, facilities, resources and activity across physical, digital and organisational environments. It brings together live signalling, system-of-record data, static repositories and reference datasets to understand location, distribution, movement, capacity and the relationships between operational elements.",
        "This gives Habitat 1 the spatial context to understand what is available where, how resources and activity are distributed across the enterprise, and where people, assets, inventory or work need to move to support execution.",
        "Enterprise Resource Planning · Enterprise Asset Management · Inventory & Warehouse Management · Supply Chain & Logistics · Workforce & Resource Planning · Facilities Management · IoT, Telemetry & Live Tracking · Location Intelligence & GIS · Master Data & Systems of Record",
      ],
    },
    {
      code: "03",
      name: "Connectivity",
      at: "1,1",
      aside: "Unify systems, data and operations without carrying legacy complexity forward.",
      lines: [
        "The product connects with specialist software, external services, live signalling and data sources through APIs and integration layers, allowing valuable tools to remain part of the operating environment. Data and operational resources held in legacy systems can be ingested into Habitat 1, allowing those systems and functions to be progressively superseded.",
        "This reduces fragmentation, consolidates duplicated capability and moves the enterprise toward a more coherent systems architecture.",
        "Enterprise Resource Planning · API Integration & Management · Enterprise Application Integration · Live Signalling & Data Exchange · Legacy System Migration & Modernisation · Systems Consolidation & Rationalisation · Master Data Management · Systems Interoperability · Integration Architecture · Agentic Automation",
      ],
    },
    {
      code: "04",
      name: "Evolution",
      at: "2,2",
      aside: "Turn the operation into a progressively more capable version of itself.",
      lines: [
        "Habitat 1 is structured as an evolutionary pathway: ingest the entity, instantiate its operational model, then continuously guide and optimise it toward a more capable state. It identifies maturity gaps, constraints and improvement opportunities across systems, processes, resources and structure.",
        "Informed by the acatech Industrie 4.0 Maturity Index, the system continually recalibrates that pathway as conditions change — removing constraints, unlocking capability and advancing the entity through successive stages of maturity.",
        "Capability Maturity Management · Autonomous Optimisation · Continuous Improvement · Digital Transformation · Operating Model Transformation · Business Process Improvement · Capability Development · Strategic Roadmapping · Scalability & Organisational Readiness",
      ],
    },
    {
      code: "05",
      name: "Cognition",
      at: "1,2",
      aside: "Give the enterprise an intelligence layer that can govern, orchestrate and control the whole.",
      lines: [
        "Cognition is the overarching intelligence within Habitat 1, continuously interpreting the complete state of the entity and coordinating how the system responds. It provides the reasoning, governance and control needed to keep the operation aligned as conditions change.",
        "Unlike traditional ERP and management software that primarily records and reports, Habitat 1 can reason across the whole entity, set priorities, enforce rules and authority, coordinate agents and workflows, manage exceptions and orchestrate the operation toward its intended state.",
        "Enterprise Intelligence · AI & Agentic Orchestration · Decision Intelligence · Governance, Risk & Controls · Policy & Rules Management · Authority & Approval Management · Autonomous Operations · Exception & Intervention Management · Enterprise Automation · Operational Command & Control",
      ],
    },
    {
      code: "06",
      name: "Causality",
      at: "2,3",
      aside: "Understand cause, effect and how change propagates through the operation.",
      lines: [
        "The product models the cause-and-effect relationships and interdependencies that exist across the entity, showing how changes in one area influence conditions elsewhere and what they are likely to trigger next.",
        "As change occurs, Habitat 1 traces how effects propagate through those interdependencies. This exposes downstream consequences, reveals root causes and allows interventions to be tested against the wider operation before they are introduced.",
        "Cause & Effect Modelling · Interdependency Modelling · Change Propagation · Impact Analysis · Root Cause Analysis · Dependency & Constraint Analysis · What-if & Scenario Simulation · Risk & Consequence Analysis · Decision Impact Modelling",
      ],
    },
    {
      code: "07",
      name: "Adaptation",
      at: "1,3",
      aside: "Keep the operation aligned as conditions change, while the technology remains fit for what comes next.",
      lines: [
        "Within Habitat 1, adaptation means recalibrating plans, resources, workflows and execution as the entity changes — maintaining alignment without destabilising the wider operation.",
        "At the technology level, the direction is broader: preserve cognitive throughput as complexity grows and AI capability expands. Habitat 1 is built to flex around that moving frontier while maintaining structural integrity where it matters.",
        "Dynamic Replanning · Continuous Recalibration · Adaptive Resource Management · Workflow Orchestration · Exception Management · Operational Resilience · Cognitive Throughput Preservation · AI Capability Expansion · Technological Agility · Structural Integrity · Objective Alignment",
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
