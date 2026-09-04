// Where the project is going, and what that costs you for choosing wrong now.
//
// Every other input the atlas collects is present tense — the org today, the
// estate today, the constraints today. That makes every recommendation a
// snapshot, and it leaves the question that actually decides things with
// nowhere to be asked: how do the choices I make at ten users bite me at ten
// thousand?
//
// This file answers it two ways.
//
//   1. A second scoring pass. An option is scored against the destination as
//      well as against today, and the *delta* is the product. A stack that
//      wins now and loses later says so, in a sentence, at the moment of
//      choosing rather than in the retrospective.
//   2. The lock-in ledger. Not every decision costs the same to reverse.
//      Hosting is a weekend. A tenancy model is the rest of the product's
//      life. Rating each door — and naming the scale at which a cheap one
//      becomes expensive — is what makes starting small a decision instead of
//      an accident.
//
// The destination is optional throughout. With none set the atlas behaves
// exactly as it did before this file existed, and says so rather than
// pretending to know.

import type { StackOption } from "@/lib/stack-atlas";

/* ------------------------------ the shape ------------------------------- */

/** What this becomes, not what it is on day one. */
export type Horizon = "tool" | "product" | "platform";

/**
 * What actually scales. The field almost no stack-picker asks, and the one
 * that most changes the answer: more users, more tenants, more data and more
 * automation have four different architectures, and generic advice gives one.
 */
export type GrowthAxis = "users" | "tenants" | "data" | "automation";

/** Order of magnitude, not a forecast. Nobody knows the real number. */
export type Magnitude = 1 | 10 | 100 | 1000 | 10000 | 100000;

/** How much of it runs with nobody watching. */
export type Autonomy = "assisted" | "supervised" | "unattended";

/** Who has to be able to run this when you are not available. */
export type Sovereignty = "studio" | "client" | "portable";

export interface Destination {
  horizon: Horizon;
  growth: GrowthAxis;
  scaleNow: Magnitude;
  scaleThen: Magnitude;
  autonomy: Autonomy;
  sovereignty: Sovereignty;
  years: 1 | 3 | 5;
}

export const DEFAULT_DESTINATION: Destination = {
  horizon: "product",
  growth: "users",
  scaleNow: 10,
  scaleThen: 1000,
  autonomy: "supervised",
  sovereignty: "studio",
  years: 3,
};

export const HORIZON_LABEL: Record<Horizon, string> = {
  tool: "A tool I use",
  product: "A product a team uses",
  platform: "A platform others build on",
};

export const GROWTH_LABEL: Record<GrowthAxis, string> = {
  users: "More users",
  tenants: "More tenants / clients",
  data: "More data",
  automation: "More automation",
};

export const AUTONOMY_LABEL: Record<Autonomy, string> = {
  assisted: "A person drives it",
  supervised: "It runs, a person checks it",
  unattended: "It runs with nobody watching",
};

export const SOVEREIGNTY_LABEL: Record<Sovereignty, string> = {
  studio: "We run it",
  client: "The client runs it",
  portable: "Anyone could run it",
};

export const MAGNITUDES: Magnitude[] = [1, 10, 100, 1000, 10000, 100000];

export function magnitudeLabel(m: Magnitude): string {
  if (m >= 100000) return "100k+";
  if (m >= 1000) return `${m / 1000}k`;
  return String(m);
}

/** How far the project has to travel, in orders of magnitude. */
export function growthFactor(d: Destination): number {
  return Math.max(0, Math.log10(d.scaleThen) - Math.log10(d.scaleNow));
}

/** A one-line restatement, for the context panel and the brief header. */
export function describeDestination(d: Destination): string {
  const unit =
    d.growth === "tenants" ? "tenants" : d.growth === "data" ? "× the data" : d.growth === "automation" ? "× the automation" : "users";
  return `${HORIZON_LABEL[d.horizon]} — ${magnitudeLabel(d.scaleNow)} → ${magnitudeLabel(
    d.scaleThen,
  )} ${unit} over ${d.years} year${d.years === 1 ? "" : "s"}, ${AUTONOMY_LABEL[d.autonomy].toLowerCase()}, ${SOVEREIGNTY_LABEL[
    d.sovereignty
  ].toLowerCase()}.`;
}

/* ------------------------------ the doors ------------------------------- */

/**
 * How expensive a decision is to reverse. The whole point of separating these
 * is that most stack regret is not "we picked a bad framework" — it is "we
 * picked a data model in week one and discovered in year two that it was the
 * one thing we could not change".
 */
export type DoorRating = "two-way" | "one-way-at-scale" | "one-way";

export const DOOR_LABEL: Record<DoorRating, string> = {
  "two-way": "Two-way",
  "one-way-at-scale": "One-way at scale",
  "one-way": "One-way",
};

export const DOOR_BLURB: Record<DoorRating, string> = {
  "two-way": "Reversible in a weekend. Do not spend argument on it.",
  "one-way-at-scale": "Cheap to change now, expensive past a threshold. The threshold is the thing to write down.",
  "one-way": "You live with this. Decide it deliberately or inherit it by accident.",
};

export interface Door {
  /** The decision itself, named the way a person would say it. */
  axis: string;
  rating: DoorRating;
  /** For one-way-at-scale: the scale at which it stops being cheap. */
  threshold?: string;
  /** What the exit actually costs, in work rather than adjectives. */
  exit: string;
}

/**
 * Doors are properties of the *decision*, not of the option — SQL Server and
 * PostgreSQL are the same door. Ratings and exits are written once here, and
 * thresholds are phrased against the destination's own growth axis so the
 * number means something to the reader.
 */
export function doorsFor(destination: Destination | null): Door[] {
  const d = destination;
  const tenantish = d?.growth === "tenants";

  return [
    {
      axis: "Tenancy model",
      rating: "one-way",
      exit:
        "Retrofitting isolation onto a single-tenant schema is a rewrite of every query plus a data migration you cannot do incrementally. This is the most expensive door on the list.",
    },
    {
      axis: "Data model & database",
      rating: "one-way",
      exit:
        "Migrating engines is a project, not a task: dialect differences, a backfill, and a cutover with real downtime. Assume the schema you ship in month one is the schema you argue with in year three.",
    },
    {
      axis: "Identity & auth model",
      rating: "one-way",
      exit:
        "Changing who a session belongs to reissues every credential and touches every authorisation check. Users notice, and they notice all at once.",
    },
    {
      axis: "Primary ID scheme",
      rating: "one-way",
      exit:
        "Sequential ints leak volume and collide across tenants; changing to UUIDs later rewrites every foreign key and every URL you have already published.",
    },
    {
      axis: "Language & runtime",
      rating: "one-way-at-scale",
      threshold: tenantish
        ? "Past the first engineer who is not you"
        : `Past roughly ${magnitudeLabel(d?.scaleNow ?? 100)}× the current size, or the first hire`,
      exit:
        "Cheap while one person holds the whole thing in their head. The moment you hire, or hand over, the runtime is the hiring pool, the patch cadence and the on-call rota.",
    },
    {
      axis: "Framework",
      rating: "one-way-at-scale",
      threshold: "Once there is more app than you can rewrite in a fortnight",
      exit: "A port, not a migration — but a bounded one, and frameworks inside the same runtime share most of the code that matters.",
    },
    {
      axis: "Multi-tenancy of the file store",
      rating: "one-way-at-scale",
      threshold: "The first client who asks where their documents physically live",
      exit: "Re-pathing an object store is scriptable; re-answering the compliance question after the fact is not.",
    },
    {
      axis: "Hosting & runtime platform",
      rating: "two-way",
      exit: "A weekend, if the app was not written against platform-specific primitives. Keep the escape hatch and this stays cheap.",
    },
    {
      axis: "CI / delivery pipeline",
      rating: "two-way",
      exit: "Config in a repo. Swap it whenever the current one annoys you enough.",
    },
    {
      axis: "Observability stack",
      rating: "two-way",
      exit: "Collectors are swappable and OpenTelemetry makes them more so. Losing the history hurts; losing the ability to change does not happen.",
    },
  ];
}

/* --------------------------- destination fit ---------------------------- */

export interface DestinationRule {
  tokens: string[];
  delta: number;
  text: string;
}

/**
 * Sparse on purpose, exactly like ORG_FIT in engine.ts: an entry earns its
 * place only where the destination genuinely changes the answer, and it
 * carries the argument with it.
 */
const HORIZON_RULES: Record<Horizon, DestinationRule[]> = {
  tool: [
    { tokens: ["nocode", "streamlit", "sqlite"], delta: 8, text: "Right-sized for something one person operates — no ceremony to carry" },
    { tokens: ["java", "dotnet", "kubernetes"], delta: -8, text: "Enterprise weight on a personal tool: all the cost, none of the reason" },
  ],
  product: [
    { tokens: ["nextjs", "supabase", "postgres", "django", "rails"], delta: 5, text: "Conventional enough that a second person can pick it up" },
    { tokens: ["nocode"], delta: -5, text: "Automation platforms stop being the cheap answer once a team depends on the output" },
  ],
  platform: [
    { tokens: ["postgres", "supabase"], delta: 10, text: "Row-level security gives you a tenancy primitive in the database rather than in every query" },
    { tokens: ["kubernetes", "go", "rust"], delta: 4, text: "Built for the day your own service count is the problem" },
    { tokens: ["mongo", "firebase"], delta: -12, text: "Every tenant boundary lives in application code — one missed filter is a breach, and a platform has thousands of filters" },
    { tokens: ["nocode", "wordpress", "shopify"], delta: -14, text: "Nobody builds on top of this. A platform horizon and a hosted site builder are different products" },
    { tokens: ["sqlite"], delta: -10, text: "One writer at a time is a hard ceiling, and a platform is by definition many writers" },
  ],
};

const GROWTH_RULES: Record<GrowthAxis, DestinationRule[]> = {
  users: [
    { tokens: ["cloudflare", "vercel", "nextjs"], delta: 5, text: "Scales on someone else's edge — user growth is the cheapest kind to absorb here" },
    { tokens: ["sqlite"], delta: -6, text: "Read-heavy is fine; the first concurrent-write spike is not" },
  ],
  tenants: [
    { tokens: ["postgres", "supabase"], delta: 10, text: "Row-level security is the tenancy model, enforced where the data is rather than where the code is" },
    { tokens: ["mongo", "firebase"], delta: -11, text: "Tenant isolation becomes a code-review problem forever — the exact thing that does not survive growth" },
    { tokens: ["sqlserver", "dotnet"], delta: 3, text: "Schema-per-tenant is well-trodden ground on this stack" },
  ],
  data: [
    { tokens: ["sql", "postgres", "python"], delta: 7, text: "The data grows into tools that already exist here — dbt, Parquet, a warehouse" },
    { tokens: ["firebase"], delta: -9, text: "Document reads priced per document: the bill grows with the data whether or not anyone looks at it" },
    { tokens: ["sqlite"], delta: -5, text: "Fine to a point; the point arrives without warning" },
  ],
  automation: [
    { tokens: ["python", "typescript", "fastapi"], delta: 7, text: "Automation growth is code growth — the libraries, the types and the test story all already live here" },
    { tokens: ["nocode"], delta: -10, text: "Per-task pricing beats a build until volume rises, then reverses sharply. Growth on this axis is exactly that reversal" },
  ],
};

const AUTONOMY_RULES: Record<Autonomy, DestinationRule[]> = {
  assisted: [],
  supervised: [{ tokens: ["nocode"], delta: -2, text: "Debugging someone else's automation canvas is slower than reading your own code" }],
  unattended: [
    { tokens: ["typescript", "go", "rust", "dotnet", "java"], delta: 5, text: "Types catch at build time what nobody is awake to catch at 3am" },
    { tokens: ["nocode"], delta: -9, text: "Unattended and unobservable: when it fails at night there is no stack trace and no test to write" },
    { tokens: ["sqlite"], delta: -4, text: "A locked database with nobody watching is an outage that lasts until morning" },
  ],
};

const SOVEREIGNTY_RULES: Record<Sovereignty, DestinationRule[]> = {
  studio: [{ tokens: ["supabase", "vercel", "cloudflare"], delta: 4, text: "We run it, so managed platforms are a cost we control rather than a dependency we impose" }],
  client: [
    { tokens: ["dotnet", "sqlserver", "php", "wordpress"], delta: 6, text: "The client's own people can plausibly operate this" },
    { tokens: ["elixir", "rust", "kubernetes"], delta: -8, text: "Handing this over means handing over a hiring problem" },
  ],
  portable: [
    { tokens: ["postgres", "django", "php", "python"], delta: 7, text: "Runs anywhere with a database and a process manager — no platform holds the keys" },
    { tokens: ["supabase", "firebase", "vercel", "shopify", "cloudflare"], delta: -9, text: "Core data and core behaviour live inside one vendor. Portable is the one thing this is not" },
  ],
};

/**
 * Score an option against where the project is going. Returns the reasons; the
 * caller sums them, exactly as rankOptions does for the present-tense pass.
 */
export function destinationReasons(
  option: StackOption,
  destination: Destination | null,
  tokens: Set<string>,
): { delta: number; text: string }[] {
  if (!destination) return [];
  const out: { delta: number; text: string }[] = [];

  const apply = (rules: DestinationRule[]) => {
    for (const rule of rules) {
      if (rule.tokens.some((t) => tokens.has(t))) out.push({ delta: rule.delta, text: rule.text });
    }
  };

  apply(HORIZON_RULES[destination.horizon]);
  apply(GROWTH_RULES[destination.growth]);
  apply(AUTONOMY_RULES[destination.autonomy]);
  apply(SOVEREIGNTY_RULES[destination.sovereignty]);

  // Distance itself is an argument, independent of which tokens are involved.
  const factor = growthFactor(destination);
  if (factor >= 3) {
    if (tokens.has("nocode") || tokens.has("sqlite") || tokens.has("wordpress")) {
      out.push({
        delta: -8,
        text: `A ${Math.round(factor)}-order-of-magnitude climb is a rebuild on this foundation, not a scale-up — budget the rewrite now or pick differently`,
      });
    }
    if (tokens.has("postgres") || tokens.has("go") || tokens.has("rust") || tokens.has("kubernetes")) {
      out.push({ delta: 5, text: `Carries a ${Math.round(factor)}-order-of-magnitude climb without changing shape` });
    }
  }

  return out;
}

/** The single sentence that goes under a recommendation when the two passes disagree. */
export function trajectoryNote(scoreNow: number, scoreThen: number, destination: Destination | null): string | null {
  if (!destination) return null;
  const drift = scoreThen - scoreNow;
  if (drift <= -12)
    return "Wins today and loses at the destination — a deliberate starting point, not the answer. Write down what triggers the change.";
  if (drift <= -5) return "Slightly worse at the destination than it is today. Reversible, but know that you will revisit it.";
  if (drift >= 12) return "Stronger at the destination than it is today — this is the choice that stops being re-litigated.";
  if (drift >= 5) return "Holds up as the project grows into it.";
  return "Scores the same today and at the destination — the destination is not what decides this one.";
}
