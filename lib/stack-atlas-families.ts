import { ARCHETYPES, type ProjectArchetype } from "@/lib/stack-atlas";

/**
 * Grouping and the estate-audit archetype, kept beside stack-atlas.ts rather
 * than inside it so the archetype data file stays a pure catalogue.
 */

export const FAMILIES = [
  "Client-facing web",
  "Applications & portals",
  "Services & integration",
  "Data & intelligence",
  "Specialised & embedded",
] as const;

export type ArchetypeFamily = (typeof FAMILIES)[number];

/** Archetype id to family. Ids missing here fall into the last family. */
export const FAMILY_OF: Record<string, ArchetypeFamily> = {
  "marketing-site": "Client-facing web",
  "content-site": "Client-facing web",
  ecommerce: "Client-facing web",
  marketplace: "Client-facing web",
  "client-portal": "Applications & portals",
  "internal-tool": "Applications & portals",
  "mobile-app": "Applications & portals",
  pwa: "Applications & portals",
  "api-service": "Services & integration",
  realtime: "Services & integration",
  automation: "Services & integration",
  "high-throughput": "Services & integration",
  "legacy-integration": "Services & integration",
  "legacy-audit": "Services & integration",
  "ai-app": "Data & intelligence",
  "data-pipeline": "Data & intelligence",
  "analytics-dashboard": "Data & intelligence",
  "document-gen": "Data & intelligence",
  iot: "Specialised & embedded",
  game: "Specialised & embedded",
  blockchain: "Specialised & embedded",
};

export interface ChecklistItem {
  /** Which reference volume this question sends you to. */
  area: string;
  ask: string;
}

/**
 * The estate survey. Ordered deliberately: how data moves, then what it looks
 * like, then who can touch it. Compliance is last because the answer to it
 * changes the shape of everything above, and you want the facts first.
 */
export const ESTATE_CHECKLIST: ChecklistItem[] = [
  {
    area: "Protocols",
    ask: "How does data move in and out — FTP, SFTP, AS2, a shared folder, or someone emailing a spreadsheet? Note anything unencrypted.",
  },
  {
    area: "Formats",
    ask: "What do the files actually look like? Get a real sample plus the record layout. Fixed-width and EDI without a spec is a red flag.",
  },
  {
    area: "Auth & identity",
    ask: "How do people sign in, who provisions accounts, and what happens when someone leaves? List every account with admin rights.",
  },
  {
    area: "Databases",
    ask: "Which engine, which version, and is it still supported? Unsupported versions are a stated risk, not a preference.",
  },
  {
    area: "Hosting & runtime",
    ask: "Where does it physically run, who owns that machine or account, and when was it last patched?",
  },
  {
    area: "Integrations",
    ask: "What else touches it? Every downstream consumer is a stakeholder in any change you propose.",
  },
  {
    area: "Backups & recovery",
    ask: 'When was a restore last actually tested? "We have backups" and "we can recover" are different claims.',
  },
  {
    area: "Compliance",
    ask: "Does the data bring PCI, HIPAA, GDPR or contractual obligations with it? That decides the shape of everything after.",
  },
];

/**
 * The estate audit. Its "stacks" are approaches rather than technology choices —
 * most of the time the right one produces a document, not software.
 */
export const LEGACY_AUDIT: ProjectArchetype = {
  id: "legacy-audit",
  label: "Legacy estate audit",
  blurb:
    "Before anyone quotes a modernisation, someone has to walk the estate and write down what is actually running. Cheap to do, and it is what makes every later number defensible.",
  signals: [
    '"We\'re not sure what we have"',
    "The person who set it up has left",
    "A vendor quoted a rewrite and nobody can check the number",
    "An insurer, auditor or acquirer has started asking questions",
  ],
  questions: [
    "What is the one system that, if it stopped, stops the business?",
    "Who currently has credentials — including former vendors?",
    "Is there a support contract on any of it, and when does it lapse?",
    "What is driving this now — cost, risk, an audit, or a blocked feature?",
  ],
  stacks: [
    {
      language: "No-code",
      framework: "Written survey + diagram",
      fit: "primary",
      why: "The deliverable is a document, not software: an inventory, a risk list, and a costed sequence. Often the most valuable thing you sell a client all year.",
    },
    {
      language: "SQL",
      framework: "Read-only replica to PostgreSQL",
      fit: "primary",
      why: 'Get a queryable copy of the data without touching the live system. Turns "we think" into numbers within a day.',
    },
    {
      language: "Python",
      framework: "FastAPI as an anti-corruption layer",
      fit: "alt",
      why: "When the audit is going to become work, wrap the old system in a clean API first so everything new builds against that.",
    },
    {
      language: "SQL",
      framework: "Scheduled extract to Parquet",
      fit: "alt",
      why: "For estates where live access will never be granted, a nightly extract is enough to prove the case for change.",
    },
  ],
  avoid: [
    {
      what: "Quoting a rewrite off the back of a demo",
      why: "The demo shows the happy path. The cost is in the twenty exceptions nobody mentioned.",
    },
    {
      what: "Touching production during discovery",
      why: "If anything breaks in the fortnight after you visit, it will be attributed to you. Read-only, and put that in writing.",
    },
    {
      what: "Auditing without asking who holds credentials",
      why: "Former vendors with live access are the single most common finding, and the easiest one to act on.",
    },
  ],
  weight: "Small",
};

/** Every archetype including the estate audit, in the order the picker shows them. */
export const ALL_ARCHETYPES: ProjectArchetype[] = [...ARCHETYPES, LEGACY_AUDIT];

export function familyOf(id: string): ArchetypeFamily {
  return FAMILY_OF[id] ?? FAMILIES[FAMILIES.length - 1];
}
