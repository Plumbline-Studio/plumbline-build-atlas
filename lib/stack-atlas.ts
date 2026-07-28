// Project archetypes — the evaluation half of the atlas.
//
// The point of this file is not to be clever about languages. It is to make the
// early scoping conversation repeatable: name the kind of thing being built,
// hear the signals that confirm it, ask the questions that change the quote,
// and land on a stack you can defend six months later.
//
// `avoid` entries are load-bearing. They are the mistakes that cost money.

export type StackFit = "primary" | "alt";

export interface StackOption {
  language: string;
  framework: string;
  why: string;
  fit: StackFit;
  /** Optional pre-resolved MARKS keys; omitted — Mark() resolves by name. */
  languageMark?: string | null;
  frameworkMark?: string | null;
}

export interface AntiPattern {
  what: string;
  why: string;
}

export type ProjectWeight = "Small" | "Medium" | "Large";

export interface ProjectArchetype {
  id: string;
  label: string;
  /** One paragraph a non-technical client would recognise themselves in. */
  blurb: string;
  /** Phrases that indicate this archetype during discovery. */
  signals: string[];
  /** Questions that materially change scope, price, or risk. Ask before quoting. */
  questions: string[];
  stacks: StackOption[];
  avoid: AntiPattern[];
  weight: ProjectWeight;
}

export const WEIGHT_ACCENT: Record<ProjectWeight, string> = {
  Small: "bg-slate/15 text-slate border-slate/25",
  Medium: "bg-primary/12 text-primary border-primary/25",
  Large: "bg-gold-bright/15 text-gold-bright border-gold-bright/30",
};

export const ARCHETYPES: ProjectArchetype[] = [
  {
    id: "marketing-site",
    label: "Marketing / brochure site",
    blurb:
      "A few pages that explain who the client is and get someone to call. Speed, SEO and edit-ability matter more than anything technical.",
    signals: [
      "\"We just need a website\"",
      "No login, no accounts",
      "Content changes a few times a year",
      "Local SEO is the real goal",
    ],
    questions: [
      "Who edits copy after launch — you or them?",
      "Do they need a blog, or is this static forever?",
      "Is there an existing brand kit, or are we making one?",
      "Forms: where do submissions actually need to land?",
    ],
    stacks: [
      { language: "TypeScript", framework: "Astro", fit: "primary", why: "Ships almost no JavaScript, so Core Web Vitals are green by default. Best-in-class for content-first sites." },
      { language: "TypeScript", framework: "Next.js", fit: "primary", why: "Right call when the brochure site will grow a portal or app later — one codebase instead of a migration." },
      { language: "PHP", framework: "WordPress", fit: "alt", why: "Only when the client insists on editing everything themselves and already knows WP. Cheap to hand off, expensive to maintain." },
    ],
    avoid: [
      { what: "A full SPA framework", why: "Client-side rendering on a brochure site costs SEO and page speed for no benefit." },
      { what: "A custom CMS", why: "You will maintain it forever. Use a hosted one or Markdown in the repo." },
    ],
    weight: "Small",
  },
  {
    id: "content-site",
    label: "Content & CMS site",
    blurb:
      "Editorial volume: many pages, non-technical editors, taxonomies, and search. The CMS choice matters more than the framework.",
    signals: [
      "\"We publish weekly\"",
      "Multiple authors",
      "Categories, tags, related content",
      "SEO is a named business goal",
    ],
    questions: [
      "How many editors, and how technical are they?",
      "Do they need preview before publish?",
      "Is content localised or multi-region?",
      "Who owns the content model — us or them?",
    ],
    stacks: [
      { language: "TypeScript", framework: "Astro + Sanity", fit: "primary", why: "Static output with a structured, genuinely pleasant editor experience. Fast to build, fast to serve." },
      { language: "TypeScript", framework: "Next.js + Payload", fit: "primary", why: "When you want the CMS in the same repo and the same database. Self-hosted, no per-seat pricing." },
      { language: "PHP", framework: "WordPress (headless)", fit: "alt", why: "When the editorial team already lives in WordPress and retraining them is out of scope." },
    ],
    avoid: [
      { what: "Markdown-in-repo for non-technical editors", why: "They will email you the changes instead, and you become the CMS." },
    ],
    weight: "Medium",
  },
  {
    id: "ecommerce",
    label: "E-commerce storefront",
    blurb:
      "Money changes hands. Payments, tax, inventory and fulfilment are the hard parts — the storefront is the easy part.",
    signals: [
      "Selling products directly",
      "Inventory counts matter",
      "Shipping and tax rules",
      "Abandoned-cart and email flows",
    ],
    questions: [
      "Physical goods, digital, or subscription?",
      "Who handles tax and compliance — a platform or us?",
      "Existing inventory system to sync with?",
      "How many SKUs, realistically?",
    ],
    stacks: [
      { language: "TypeScript", framework: "Next.js + Stripe", fit: "primary", why: "Custom storefront with Stripe handling payments, tax and subscriptions. Right when the catalogue is small and the brand is the point." },
      { language: "Liquid / JS", framework: "Shopify", fit: "primary", why: "Do not rebuild tax, fraud and fulfilment. For real retail volume, Shopify plus a custom theme wins on total cost." },
      { language: "PHP", framework: "Laravel + Cashier", fit: "alt", why: "When the client already runs a PHP shop or needs deep custom pricing logic." },
    ],
    avoid: [
      { what: "Hand-rolled payment handling", why: "PCI scope, chargebacks and tax nexus are not worth owning. Always delegate to Stripe or a platform." },
    ],
    weight: "Large",
  },
  {
    id: "marketplace",
    label: "Multi-sided marketplace",
    blurb:
      "Two or more user types who need each other. The technical work is real, but trust, payouts and cold-start are what kill these.",
    signals: [
      "Buyers and sellers",
      "Commission or take rate",
      "Listings, search, messaging",
      "Reviews and reputation",
    ],
    questions: [
      "Who is on the supply side on day one?",
      "Do we handle payouts, or do the parties transact off-platform?",
      "What stops the two sides from going around us?",
      "Moderation: who reviews listings?",
    ],
    stacks: [
      { language: "TypeScript", framework: "Next.js + Supabase + Stripe Connect", fit: "primary", why: "Row-level security fits the two-sided permission model, and Connect handles split payouts and KYC." },
      { language: "Ruby", framework: "Rails + Stripe Connect", fit: "alt", why: "Rails' conventions and mature marketplace gems make the CRUD surface quick when the team knows Ruby." },
      { language: "PHP", framework: "Laravel + Cashier Connect", fit: "alt", why: "Strong option where PHP hosting is a constraint or the client has PHP staff." },
    ],
    avoid: [
      { what: "Building payouts yourself", why: "Money transmission licensing. Use Stripe Connect or an equivalent." },
      { what: "Launching both sides at once", why: "Not a stack problem, but it is the most common cause of a dead marketplace." },
    ],
    weight: "Large",
  },
  {
    id: "client-portal",
    label: "Client portal / customer dashboard",
    blurb:
      "Authenticated views onto data the client already has. Access control is the whole job — get the permission model right first.",
    signals: [
      "\"Customers should be able to log in and see…\"",
      "Documents, invoices, statuses",
      "Different views per role",
      "Email notifications on change",
    ],
    questions: [
      "What must one customer never see about another?",
      "Where does the data live today?",
      "Do they need to upload, or only view?",
      "Who provisions accounts?",
    ],
    stacks: [
      { language: "TypeScript", framework: "Next.js + Supabase (RLS)", fit: "primary", why: "Row-level security enforces isolation in the database, not just the UI — the difference between a portal and a breach." },
      { language: "Python", framework: "Django", fit: "primary", why: "Batteries-included auth, admin and permissions. Fastest path when the portal is mostly forms and tables." },
      { language: "C#", framework: "ASP.NET Core", fit: "alt", why: "When the client is a Microsoft shop and wants Entra ID sign-in and Azure hosting." },
    ],
    avoid: [
      { what: "Enforcing access only in the front end", why: "Anyone can call the API directly. Isolation belongs in the database or the server." },
    ],
    weight: "Medium",
  },
  {
    id: "internal-tool",
    label: "Internal admin / CRUD tool",
    blurb:
      "Staff-facing screens over a database. Nobody will admire it; they will use it forty times a day. Optimise for speed of building and speed of use.",
    signals: [
      "\"We're running this on spreadsheets\"",
      "One team, known users",
      "Lots of tables and forms",
      "Reporting bolted on later",
    ],
    questions: [
      "What spreadsheet is this replacing, and can I see it?",
      "How many people, and are they on desktop?",
      "Does it need to work offline?",
      "What breaks today when two people edit at once?",
    ],
    stacks: [
      { language: "TypeScript", framework: "Next.js + Supabase + shadcn/ui", fit: "primary", why: "Fast to build, easy to restyle, and the table/form primitives are already solved." },
      { language: "Python", framework: "Django admin", fit: "primary", why: "Genuinely hard to beat when the tool is 80% CRUD. Hours, not weeks." },
      { language: "Ruby", framework: "Rails + Hotwire", fit: "alt", why: "Server-rendered interactivity without a front-end build. Very fast for form-heavy internal work." },
      { language: "Python", framework: "Streamlit", fit: "alt", why: "For a data-team-only tool where the UI just needs to exist. Not for anything customer-adjacent." },
    ],
    avoid: [
      { what: "A bespoke design system", why: "Internal tools should borrow a component library and spend the time on workflow." },
    ],
    weight: "Small",
  },
  {
    id: "mobile-app",
    label: "Cross-platform mobile app",
    blurb:
      "App-store presence, push notifications, device hardware. Decide early whether it truly needs to be an app or whether a PWA does the job.",
    signals: [
      "\"We need to be in the App Store\"",
      "Push notifications",
      "Camera, GPS or Bluetooth",
      "Users are out in the field",
    ],
    questions: [
      "What specifically needs the app store — discovery, push, or hardware?",
      "Who owns the Apple and Google developer accounts?",
      "Offline: nice-to-have or non-negotiable?",
      "Is there a web version too, and must they share code?",
    ],
    stacks: [
      { language: "TypeScript", framework: "React Native + Expo", fit: "primary", why: "One codebase, over-the-air updates, and the web skills already in the room. Default choice unless something rules it out." },
      { language: "Dart", framework: "Flutter", fit: "primary", why: "Better when the UI is highly custom or animation-heavy, and when consistent rendering across devices matters more than native feel." },
      { language: "Swift", framework: "SwiftUI", fit: "alt", why: "iOS-only, deep hardware integration, or a client who demands truly native. Doubles the cost if Android is also needed." },
    ],
    avoid: [
      { what: "Native iOS and native Android in parallel", why: "Two codebases, two release cycles, two sets of bugs — for a studio-sized team this is rarely justified." },
    ],
    weight: "Large",
  },
  {
    id: "pwa",
    label: "Installable PWA / offline-first",
    blurb:
      "Field work with bad signal. Data must be usable offline and reconcile cleanly when the connection returns — sync is the hard part, not the UI.",
    signals: [
      "Technicians, drivers, inspectors",
      "Warehouses, basements, rural routes",
      "\"It has to work without service\"",
      "Photos captured on site",
    ],
    questions: [
      "How long might a device be offline?",
      "What happens when two people edit the same record offline?",
      "Do photos need to upload later, in the background?",
      "Is app-store distribution actually required?",
    ],
    stacks: [
      { language: "TypeScript", framework: "Next.js PWA + IndexedDB", fit: "primary", why: "Installs to the home screen, no app-store review, and one deploy updates everyone. Right answer more often than people expect." },
      { language: "TypeScript", framework: "React Native + WatermelonDB", fit: "primary", why: "When you need real background sync, reliable push, or hardware the browser will not give you." },
      { language: "Dart", framework: "Flutter + Drift", fit: "alt", why: "Strong local-database story and consistent UI on cheap Android hardware." },
    ],
    avoid: [
      { what: "Last-write-wins sync", why: "It silently destroys field data. Decide the conflict rule with the client before writing any code." },
    ],
    weight: "Large",
  },
  {
    id: "api-service",
    label: "API / integration service",
    blurb:
      "Software talking to software. Contract stability, error handling and observability are the deliverable — there is no UI to hide behind.",
    signals: [
      "\"Connect system A to system B\"",
      "Webhooks",
      "Partner or vendor APIs",
      "Nightly syncs that keep failing",
    ],
    questions: [
      "Who consumes this, and can they tolerate a breaking change?",
      "What are the rate limits on the far end?",
      "What happens when the upstream system is down for a day?",
      "Do we need an audit trail of every call?",
    ],
    stacks: [
      { language: "TypeScript", framework: "Hono / Fastify", fit: "primary", why: "Small, fast, deploys to the edge or a container. Types shared with the front end if there is one." },
      { language: "Python", framework: "FastAPI", fit: "primary", why: "Automatic OpenAPI docs and request validation from type hints — the fastest way to a documented, correct API." },
      { language: "Go", framework: "Gin / Chi", fit: "alt", why: "When throughput or a single static binary matters, or the service must run somewhere awkward." },
    ],
    avoid: [
      { what: "Shipping without idempotency keys", why: "Retries will duplicate records. Design for at-least-once delivery from day one." },
    ],
    weight: "Medium",
  },
  {
    id: "realtime",
    label: "Real-time collaboration or presence",
    blurb:
      "Multiple people seeing the same thing change at once. Connection state and conflict resolution are the real scope.",
    signals: [
      "Live dashboards",
      "Chat or comments",
      "\"Who else is looking at this?\"",
      "Collaborative editing",
    ],
    questions: [
      "How many concurrent users at peak?",
      "Does stale-by-a-few-seconds actually hurt anyone?",
      "Do we need history and replay, or just current state?",
      "What happens on reconnect?",
    ],
    stacks: [
      { language: "TypeScript", framework: "Next.js + Supabase Realtime", fit: "primary", why: "Postgres changes streamed to clients with no separate socket infrastructure to run." },
      { language: "Elixir", framework: "Phoenix Channels / LiveView", fit: "primary", why: "The BEAM was built for exactly this. Hundreds of thousands of connections on modest hardware." },
      { language: "TypeScript", framework: "Node + Socket.IO", fit: "alt", why: "Familiar and flexible when the real-time surface is small and bespoke." },
    ],
    avoid: [
      { what: "Polling every second and calling it real-time", why: "It costs more than sockets at any meaningful scale and feels worse." },
    ],
    weight: "Medium",
  },
  {
    id: "ai-app",
    label: "AI / LLM application",
    blurb:
      "A model in the loop. Prompt and retrieval quality decide whether it works; the surrounding app is ordinary web work.",
    signals: [
      "\"Can it summarise / draft / answer questions about…\"",
      "A pile of documents to search",
      "Chat interface requested",
      "Replacing manual reading or writing",
    ],
    questions: [
      "What does a wrong answer cost the client?",
      "Where does the source material live, and is it allowed to leave the building?",
      "Who reviews output before it reaches a customer?",
      "Per-request cost ceiling?",
    ],
    stacks: [
      { language: "TypeScript", framework: "Next.js + Vercel AI SDK", fit: "primary", why: "Streaming UI, tool calling and model swapping without leaving the web stack. Best default for a product with a chat surface." },
      { language: "Python", framework: "FastAPI + LangChain / LlamaIndex", fit: "primary", why: "When retrieval, evaluation and data processing are the hard part, Python's ecosystem is still ahead." },
      { language: "Python", framework: "Streamlit", fit: "alt", why: "For an internal prototype that proves the idea before anyone commits to a product." },
    ],
    avoid: [
      { what: "Fine-tuning before trying retrieval", why: "Retrieval plus a good prompt solves most cases at a fraction of the cost and effort." },
      { what: "No evaluation set", why: "Without one you cannot tell whether a prompt change made things better or worse." },
    ],
    weight: "Medium",
  },
  {
    id: "data-pipeline",
    label: "Data pipeline / ETL",
    blurb:
      "Moving and reshaping data on a schedule. Nobody sees it until it breaks, so observability and idempotency are the product.",
    signals: [
      "Nightly imports",
      "Multiple source systems",
      "\"The numbers don't match\"",
      "CSVs emailed between departments",
    ],
    questions: [
      "How fresh does the data actually need to be?",
      "What is the system of record when sources disagree?",
      "Who gets paged when a run fails?",
      "Can a run be safely re-run?",
    ],
    stacks: [
      { language: "Python", framework: "Airflow / Dagster + Pandas", fit: "primary", why: "The default for scheduled data work — mature operators, retries, backfills and a UI for failures." },
      { language: "SQL", framework: "dbt + PostgreSQL", fit: "primary", why: "When the transformations belong in the warehouse. Version-controlled, tested SQL beats scattered scripts." },
      { language: "TypeScript", framework: "GitHub Actions + Node scripts", fit: "alt", why: "Perfectly adequate for a handful of small nightly jobs. Do not stand up Airflow for three tasks." },
    ],
    avoid: [
      { what: "Cron on a single box with no alerting", why: "It will fail silently for weeks and the client will find out from a customer." },
    ],
    weight: "Medium",
  },
  {
    id: "analytics-dashboard",
    label: "Analytics & reporting dashboard",
    blurb:
      "Turning existing data into decisions. The chart library is trivial; agreeing on metric definitions is the project.",
    signals: [
      "\"We need visibility into…\"",
      "Weekly reports assembled by hand",
      "Multiple stakeholders wanting different cuts",
      "Exports to Excel requested immediately",
    ],
    questions: [
      "What decision does each number change?",
      "Whose definition of 'revenue' are we using?",
      "How far back does history need to go?",
      "Will they want to export it? (They will.)",
    ],
    stacks: [
      { language: "TypeScript", framework: "Next.js + Recharts", fit: "primary", why: "Custom dashboards inside an existing app, styled to the brand, with data already in reach." },
      { language: "SQL", framework: "Metabase / Power BI", fit: "primary", why: "When the client wants to build their own views. Do not custom-build what a BI tool gives away." },
      { language: "Python", framework: "Streamlit / Plotly Dash", fit: "alt", why: "For analyst-built internal dashboards where Python already holds the data." },
      { language: "R", framework: "Shiny", fit: "alt", why: "When statisticians own the analysis and the model is the point." },
    ],
    avoid: [
      { what: "Querying production directly on every page load", why: "One dashboard can take down the app it reports on. Read from a replica or a rollup table." },
    ],
    weight: "Medium",
  },
  {
    id: "automation",
    label: "Scheduled automation / bots",
    blurb:
      "Work that used to be someone's Tuesday. High return, low glamour — the trick is knowing when not to write code at all.",
    signals: [
      "\"Every week someone manually…\"",
      "Copying between two SaaS tools",
      "Reminder emails sent by hand",
      "Reports assembled and forwarded",
    ],
    questions: [
      "How many minutes a week does this actually save?",
      "Does an off-the-shelf tool already do it?",
      "What is the blast radius if it runs twice?",
      "Who owns it when we're gone?",
    ],
    stacks: [
      { language: "TypeScript", framework: "GitHub Actions + Node", fit: "primary", why: "Free scheduling, versioned in the repo, visible logs. The right size for most studio automations." },
      { language: "Python", framework: "Cloud Functions / Lambda", fit: "primary", why: "When the job needs Python libraries or must react to an event rather than a clock." },
      { language: "No-code", framework: "n8n / Make / Zapier", fit: "alt", why: "Genuinely the correct answer when the client will need to change it themselves and volume is low." },
    ],
    avoid: [
      { what: "Automating a broken process", why: "Fix the process first or you will have made the wrong thing faster." },
    ],
    weight: "Small",
  },
  {
    id: "document-gen",
    label: "Document generation & reporting",
    blurb:
      "Producing PDFs, contracts, invoices or decks from data. Layout fidelity and template maintenance are where the time goes.",
    signals: [
      "Quotes, proposals, invoices",
      "\"It has to look exactly like this Word file\"",
      "Signatures required",
      "Batch printing or mailing",
    ],
    questions: [
      "Who owns the template when the branding changes?",
      "Does it need to be legally signable?",
      "Batch of one, or batch of ten thousand?",
      "Must it match an existing document pixel for pixel?",
    ],
    stacks: [
      { language: "TypeScript", framework: "React + Puppeteer (HTML to PDF)", fit: "primary", why: "Templates are just web pages — designers can edit them, and layout is predictable." },
      { language: "Python", framework: "ReportLab / WeasyPrint", fit: "primary", why: "Precise programmatic control for invoices and reports with strict layout requirements." },
      { language: "TypeScript", framework: "DocuSign / Dropbox Sign API", fit: "alt", why: "When signature legality is in scope, integrate rather than build." },
    ],
    avoid: [
      { what: "Editing .docx programmatically as a long-term plan", why: "It works until the client changes the template, then it never works again." },
    ],
    weight: "Medium",
  },
  {
    id: "iot",
    label: "IoT / embedded device",
    blurb:
      "Software on hardware you cannot easily reach. Firmware update strategy and connectivity failure modes decide the project.",
    signals: [
      "Sensors, gateways, controllers",
      "Devices in the field",
      "MQTT or serial mentioned",
      "\"It needs to report back to a dashboard\"",
    ],
    questions: [
      "How do we update firmware after deployment?",
      "What does the device do when the network is gone for a week?",
      "Power budget — mains, or battery?",
      "Who is liable if it fails in the field?",
    ],
    stacks: [
      { language: "C++", framework: "Arduino / ESP-IDF + MQTT", fit: "primary", why: "The pragmatic default for ESP32-class hardware, with a huge library ecosystem." },
      { language: "Python", framework: "MicroPython", fit: "primary", why: "Much faster iteration on prototypes and low-volume devices where the power budget allows it." },
      { language: "Rust", framework: "Embassy / embedded-hal", fit: "alt", why: "When a memory-safety failure in the field is unacceptable and the team can absorb the learning curve." },
      { language: "Structured Text", framework: "IEC 61131-3 PLC", fit: "alt", why: "Industrial control on existing plant hardware — this is the electrician's world, not the web developer's." },
    ],
    avoid: [
      { what: "Devices with no over-the-air update path", why: "The first security fix will require physically visiting every unit." },
    ],
    weight: "Large",
  },
  {
    id: "game",
    label: "Game / interactive 3D",
    blurb:
      "Real-time rendering and input. Engine choice locks in the whole toolchain, the hiring pool and the platforms you can ship to.",
    signals: [
      "\"Like a game, but for training\"",
      "3D product configurator",
      "VR or AR headset",
      "Physics or simulation",
    ],
    questions: [
      "Which platforms, and is console certification in scope?",
      "Is this a game or a simulation with a game engine?",
      "Who makes the art?",
      "Does it need to run in a browser?",
    ],
    stacks: [
      { language: "C#", framework: "Unity", fit: "primary", why: "Widest platform reach, largest asset ecosystem, strong for AR/VR and training simulations." },
      { language: "GDScript", framework: "Godot", fit: "primary", why: "Free, small, no revenue share, and fast for 2D and mid-scale 3D. Excellent for indie and client work." },
      { language: "C++", framework: "Unreal Engine", fit: "alt", why: "When visual fidelity is the selling point — architectural visualisation, virtual production, high-end 3D." },
      { language: "TypeScript", framework: "Three.js / React Three Fiber", fit: "alt", why: "For 3D inside a website — configurators and product viewers with no install." },
    ],
    avoid: [
      { what: "Writing your own engine", why: "Unless the engine is the product, this is years of work that a free engine already did." },
    ],
    weight: "Large",
  },
  {
    id: "blockchain",
    label: "Smart contract / on-chain",
    blurb:
      "Immutable code holding value. Audit cost and upgrade strategy dominate — a bug here is not a patch, it is a loss.",
    signals: [
      "Tokens, NFTs, DAO",
      "\"On-chain\" or \"web3\"",
      "Trustless settlement between parties",
      "Wallet connection required",
    ],
    questions: [
      "What genuinely requires a chain rather than a database?",
      "Which chain, and why that one?",
      "What is the audit budget?",
      "How do we fix a bug after deployment?",
    ],
    stacks: [
      { language: "Solidity", framework: "Foundry / Hardhat", fit: "primary", why: "The EVM standard. Deepest tooling, auditor familiarity and library ecosystem." },
      { language: "Rust", framework: "Anchor (Solana)", fit: "alt", why: "When throughput and transaction cost matter more than EVM compatibility." },
      { language: "Move", framework: "Sui / Aptos", fit: "alt", why: "Resource-oriented types make certain asset bugs impossible to express. Smaller ecosystem." },
    ],
    avoid: [
      { what: "Deploying unaudited contracts that hold funds", why: "There is no rollback. Budget the audit or do not hold value." },
      { what: "Using a chain where a Postgres table would do", why: "Most 'web3' requirements are satisfied by a database and a signature." },
    ],
    weight: "Large",
  },
  {
    id: "legacy-integration",
    label: "Legacy modernisation / integration",
    blurb:
      "A system that works, that nobody wants to touch, that must now talk to something modern. Strangle it; do not rewrite it.",
    signals: [
      "AS/400, mainframe, Access, or a 2003 ERP",
      "\"The guy who wrote it retired\"",
      "Data exported as fixed-width files",
      "Vendor will not open the API",
    ],
    questions: [
      "What is the actual failure we are fixing — cost, risk, or a blocked feature?",
      "Is there anyone left who understands the current system?",
      "Can we read the database directly, or only through the UI?",
      "What is the rollback if the new path fails?",
    ],
    stacks: [
      { language: "Python", framework: "FastAPI as an anti-corruption layer", fit: "primary", why: "Wrap the old system in a clean API and build everything new against that. Lets you replace it piece by piece." },
      { language: "C#", framework: "ASP.NET Core", fit: "primary", why: "When the legacy estate is Microsoft — shared auth, shared drivers, shared operational knowledge." },
      { language: "Java", framework: "Spring Boot", fit: "alt", why: "When the legacy system is JVM-based or the client's team already runs Java in production." },
      { language: "SQL", framework: "Direct replication to PostgreSQL", fit: "alt", why: "Sometimes the whole job is nightly replication into a database people can actually query." },
    ],
    avoid: [
      { what: "A big-bang rewrite", why: "It is the single most reliable way to lose a client. Strangle the old system incrementally." },
    ],
    weight: "Large",
  },
  {
    id: "high-throughput",
    label: "High-throughput backend service",
    blurb:
      "Load is the requirement. Before choosing a fast language, confirm the bottleneck is CPU and not the database — it usually is not.",
    signals: [
      "Thousands of requests per second",
      "Latency budgets in milliseconds",
      "Current system falls over at peak",
      "Streaming or event ingestion",
    ],
    questions: [
      "What is the measured bottleneck right now?",
      "Is p99 latency or total throughput the real target?",
      "Can we cache our way out of this?",
      "What is the cost ceiling per month?",
    ],
    stacks: [
      { language: "Go", framework: "net/http / Gin", fit: "primary", why: "Excellent concurrency, tiny memory footprint, single binary deploy, and an easy language for a team to pick up." },
      { language: "Rust", framework: "Axum / Actix Web", fit: "primary", why: "Top-tier throughput with no garbage-collection pauses. Choose when latency tails genuinely matter." },
      { language: "Elixir", framework: "Phoenix", fit: "alt", why: "When the load is many long-lived connections rather than raw request throughput." },
      { language: "Java", framework: "Quarkus / Spring Boot", fit: "alt", why: "When the client's ops team already runs the JVM and knows how to tune it." },
    ],
    avoid: [
      { what: "Rewriting in a fast language before profiling", why: "Most 'slow app' problems are a missing database index, not the language." },
    ],
    weight: "Medium",
  },
];

export const ARCHETYPE_BY_ID: Record<string, ProjectArchetype> = Object.fromEntries(
  ARCHETYPES.map((a) => [a.id, a]),
);

/** Label for an archetype id, tolerating ids recorded before a rename. */
export function archetypeLabel(id: string | null): string {
  if (!id) return "Unclassified";
  return ARCHETYPE_BY_ID[id]?.label ?? id;
}
