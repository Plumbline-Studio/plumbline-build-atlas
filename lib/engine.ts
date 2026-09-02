// The context-aware half of the atlas: profile, constraints, scoring, and the
// conflict rules the tray uses to argue back.
//
// Two beliefs are encoded here, both of which exist because generic stack
// advice fails in practice:
//
//   1. WHO the project is for changes the right answer. The same portal ask is
//      ASP.NET Core at an enterprise and Supabase at an SMB, and neither of
//      those is wrong — they are answers to different questions.
//   2. WHAT you already run is a first-class input. A stack that introduces a
//      new runtime to a five-project estate carries a hiring, patching and
//      on-call cost that never appears in the framework's own pitch. The
//      engine prices that in, visibly, and lets you overrule it on purpose.
//
// Every score adjustment carries its reason as a sentence. The ranking is only
// trustworthy if you can see why it moved.

import { destinationReasons, growthFactor, trajectoryNote, type Destination } from "@/lib/destination";
import { ARCHETYPES as ALL_ARCHETYPES_FOR_WEIGHT, type ProjectArchetype, type StackOption } from "@/lib/stack-atlas";
import { STACKS, type StackEntry } from "@/lib/stack-atlas-reference";

/* ------------------------------- profile -------------------------------- */

export type OrgKind = "personal" | "smb" | "midmarket" | "enterprise";

export const ORG_LABEL: Record<OrgKind, string> = {
  personal: "Personal / solo",
  smb: "Small business",
  midmarket: "Mid-market",
  enterprise: "Enterprise",
};

export interface EstateEntry {
  /** Name of a StackEntry from the Full stacks volume. */
  stackName: string;
  count: number;
}

export interface ContextProfile {
  org: OrgKind;
  estate: EstateEntry[];
}

export const DEFAULT_PROFILE: ContextProfile = { org: "smb", estate: [] };

export interface Constraints {
  hosting: "any" | "our-cloud" | "client-windows" | "client-hosted";
  offline: boolean;
  compliance: "none" | "pci" | "hipaa" | "soc2";
  /** Languages the maintaining team already writes. */
  team: string[];
  maintainer: "studio" | "client-tech" | "client-nontech";
  budget: "lean" | "standard" | "premium";
}

export const DEFAULT_CONSTRAINTS: Constraints = {
  hosting: "any",
  offline: false,
  compliance: "none",
  team: [],
  maintainer: "studio",
  budget: "standard",
};

/* -------------------------------- tokens -------------------------------- */

// A token is a coarse technology identity used for continuity and constraint
// matching. Coarse on purpose: "react" and "nextjs" are different tokens, but
// Express vs Fastify is not a distinction worth scoring.
const TOKEN_PATTERNS: [string, RegExp][] = [
  ["typescript", /typescript|\bts\b/i],
  ["javascript", /javascript|\bjs\b|node/i],
  ["nextjs", /next\.js|nextjs/i],
  ["react", /\breact\b(?!\s*native)/i],
  ["reactnative", /react\s*native|expo/i],
  ["supabase", /supabase/i],
  ["postgres", /postgres|pgvector|plpgsql|rls|row-level/i],
  ["mysql", /mysql|mariadb/i],
  ["sqlserver", /sql\s*server/i],
  ["mongo", /mongo/i],
  ["firebase", /firebase|firestore/i],
  ["astro", /astro/i],
  ["svelte", /svelte/i],
  ["php", /\bphp\b|laravel|livewire|symfony/i],
  ["wordpress", /wordpress|woocommerce/i],
  ["python", /python|django|fastapi|flask|streamlit|airflow|micropython|lambda/i],
  ["django", /django/i],
  ["fastapi", /fastapi/i],
  ["ruby", /\bruby\b|rails/i],
  ["java", /\bjava\b|spring|quarkus|kotlin|ktor/i],
  ["dotnet", /asp\.net|\.net|c#|blazor|razor/i],
  ["elixir", /elixir|phoenix|liveview/i],
  ["go", /\bgo\b|golang|\bgin\b|\bchi\b/i],
  ["rust", /\brust\b|axum|actix|embassy|anchor/i],
  ["dart", /\bdart\b|flutter|drift|serverpod/i],
  ["swift", /swift/i],
  ["shopify", /shopify|liquid|hydrogen/i],
  ["stripe", /stripe/i],
  ["vercel", /vercel/i],
  ["cloudflare", /cloudflare|workers|\bd1\b/i],
  ["aws", /\baws\b|lambda|dynamodb|redshift/i],
  ["streamlit", /streamlit|plotly dash/i],
  ["nocode", /no-code|n8n|zapier|make\b|written survey/i],
  ["htmx", /htmx|hotwire|alpine/i],
  ["sql", /\bsql\b|dbt|snowflake|bigquery/i],
  ["unity", /unity/i],
  ["godot", /godot|gdscript/i],
  ["unreal", /unreal/i],
  ["solidity", /solidity|hardhat|foundry|evm/i],
  ["embedded", /arduino|esp-idf|esp32|plc|iec 61131|mqtt|micropython/i],
];

/** Runtime-level tokens: introducing one of these to an estate is the cost. */
const RUNTIME_TOKENS = new Set([
  "typescript", "javascript", "php", "python", "ruby", "java", "dotnet",
  "elixir", "go", "rust", "dart", "swift", "solidity",
]);

export function tokensOf(text: string): Set<string> {
  const found = new Set<string>();
  for (const [token, re] of TOKEN_PATTERNS) if (re.test(text)) found.add(token);
  // Anything in the TS orbit is also in the JS orbit.
  if (found.has("typescript") || found.has("nextjs") || found.has("react") || found.has("reactnative")) {
    found.add("javascript");
    found.add("typescript");
  }
  return found;
}

function stackEntryTokens(s: StackEntry): Set<string> {
  return tokensOf([s.name, s.frontEnd, s.backEnd, s.data, s.hosting].join(" "));
}

function optionTokens(o: StackOption): Set<string> {
  return tokensOf(`${o.language} ${o.framework}`);
}

export function estateTokens(profile: ContextProfile): Map<string, { count: number; via: string[] }> {
  const out = new Map<string, { count: number; via: string[] }>();
  for (const e of profile.estate) {
    const entry = STACKS.find((s) => s.name === e.stackName);
    if (!entry) continue;
    for (const t of stackEntryTokens(entry)) {
      const cur = out.get(t) ?? { count: 0, via: [] };
      cur.count += e.count;
      if (!cur.via.includes(entry.name)) cur.via.push(entry.name);
      out.set(t, cur);
    }
  }
  return out;
}

/* ------------------------------- scoring -------------------------------- */

export interface Reason {
  delta: number;
  text: string;
}

export interface ScoredOption {
  option: StackOption;
  /**
   * Score against the project as it is today. Still called `score` because it
   * is what every existing caller means, and because with no destination set
   * it is the only score there is.
   */
  score: number;
  reasons: Reason[];
  houseStack: boolean;
  /**
   * The second pass: the same option scored against where the project is
   * going. Null when no destination is set — the atlas does not guess at a
   * trajectory nobody gave it.
   */
  scoreThen: number | null;
  destinationReasons: Reason[];
  /** One sentence on what the gap between the two passes means. */
  trajectory: string | null;
}

// Org-fit adjustments per token. Sparse by design: only where the org type
// genuinely changes the answer, with the argument attached.
const ORG_FIT: Record<string, Partial<Record<OrgKind, [number, string]>>> = {
  dotnet: {
    enterprise: [14, "Enterprise IT already runs Windows, Entra ID and a DBA team — this lands inside their operating model"],
    midmarket: [6, "Mid-market shops often already license the Microsoft stack"],
    smb: [-4, "Heavier licensing and ops than a small business needs"],
    personal: [-6, "Licensing and ceremony with no one to share it with"],
  },
  java: {
    enterprise: [10, "Governance that expects the JVM will approve this without a fight"],
    smb: [-6, "JVM ceremony is cost without benefit at this size"],
    personal: [-6, "Heavy for a solo maintainer"],
  },
  supabase: {
    personal: [8, "Auth, storage and a real database with no ops function"],
    smb: [8, "Production-grade without hiring for infrastructure"],
    enterprise: [-5, "Procurement and compliance review often exclude BaaS holding core data"],
  },
  firebase: {
    personal: [6, "Fastest path to a working app"],
    enterprise: [-6, "Data-residency and vendor-review friction; security rules rarely survive an audit unscarred"],
  },
  wordpress: {
    smb: [6, "The admin the client may already know"],
    enterprise: [-6, "Plugin surface and patch cadence rarely pass enterprise security review"],
  },
  shopify: {
    smb: [8, "Tax, fraud and fulfilment become someone else's problem"],
    personal: [6, "Selling this week instead of building for a month"],
  },
  nocode: {
    smb: [6, "The client can change it without calling you"],
    enterprise: [-5, "Shadow-IT risk; enterprises want it in the platform, not in Zapier"],
  },
  streamlit: {
    enterprise: [-4, "Fine internally; not something to put in front of an enterprise customer"],
  },
  elixir: {
    enterprise: [-5, "Ops teams rarely staff the BEAM — brilliant runtime, orphaned on handoff"],
    midmarket: [-3, "Check who runs it after you leave"],
  },
  rust: {
    smb: [-4, "Hiring pool and iteration speed cost more than the performance buys here"],
    personal: [-3, "Slow iteration unless it is already your language"],
  },
  cloudflare: {
    personal: [5, "Generous free tier, tiny ops surface"],
    smb: [4, "Near-zero hosting cost at small scale"],
  },
  vercel: {
    smb: [3, "Preview deployments and zero-config hosting"],
    enterprise: [-2, "Enterprise contracts change the price math — check before assuming"],
  },
};

// Constraint adjustments: applied when the constraint is active and the
// option carries one of the tokens.
type ConstraintRule = { tokens: string[]; delta: number; text: string };

const HOSTING_RULES: Record<Constraints["hosting"], ConstraintRule[]> = {
  any: [],
  "our-cloud": [
    { tokens: ["vercel", "supabase", "cloudflare", "aws"], delta: 4, text: "Fits hosting we run and bill for" },
  ],
  "client-windows": [
    { tokens: ["dotnet", "sqlserver"], delta: 14, text: "Runs on the Windows estate the client already operates" },
    { tokens: ["supabase", "firebase", "vercel", "cloudflare", "shopify"], delta: -10, text: "Hosted elsewhere — conflicts with the client's on-premise mandate" },
    { tokens: ["elixir", "rust", "go"], delta: -4, text: "Deployable on Windows, but foreign to a Windows ops team" },
  ],
  "client-hosted": [
    { tokens: ["supabase", "firebase", "vercel", "shopify"], delta: -8, text: "Platform-hosted by design — hard to hand to client infrastructure" },
    { tokens: ["php", "wordpress", "django", "dotnet", "java"], delta: 5, text: "Conventional server deployment their host can run" },
  ],
};

const COMPLIANCE_RULES: Record<Constraints["compliance"], ConstraintRule[]> = {
  none: [],
  pci: [
    { tokens: ["stripe", "shopify"], delta: 8, text: "Keeps card data on the processor — smallest possible PCI scope" },
  ],
  hipaa: [
    { tokens: ["postgres", "supabase"], delta: 5, text: "Row-level security and a BAA path exist" },
    { tokens: ["firebase", "mongo"], delta: -7, text: "Access rules outside the database make a HIPAA audit harder to survive" },
  ],
  soc2: [
    { tokens: ["postgres", "dotnet", "java"], delta: 3, text: "Audit-familiar components shorten the evidence conversation" },
    { tokens: ["nocode"], delta: -4, text: "Automation platforms holding customer data complicate the SOC 2 story" },
  ],
};

const TEAM_TOKEN: Record<string, string[]> = {
  "TypeScript / JavaScript": ["typescript", "javascript", "nextjs", "react", "reactnative"],
  PHP: ["php", "wordpress"],
  Python: ["python", "django", "fastapi", "streamlit"],
  Ruby: ["ruby"],
  "Java / Kotlin": ["java"],
  "C# / .NET": ["dotnet"],
};

export const TEAM_CHOICES = Object.keys(TEAM_TOKEN);

const MAINTAINER_RULES: Record<Constraints["maintainer"], ConstraintRule[]> = {
  studio: [],
  "client-tech": [
    { tokens: ["nextjs", "python", "dotnet", "java", "php"], delta: 3, text: "Mainstream enough for their team to hire against" },
    { tokens: ["elixir", "rust", "svelte"], delta: -5, text: "Their next hire probably does not know it" },
  ],
  "client-nontech": [
    { tokens: ["wordpress", "shopify", "nocode"], delta: 8, text: "The client can operate it without a developer on staff" },
    { tokens: ["rust", "go", "elixir", "java"], delta: -6, text: "Nobody at the client can touch this after handoff" },
  ],
};

const BUDGET_RULES: Record<Constraints["budget"], ConstraintRule[]> = {
  lean: [
    { tokens: ["astro", "shopify", "nocode", "supabase", "cloudflare"], delta: 6, text: "Low build and near-zero run cost" },
    { tokens: ["dotnet", "sqlserver", "java"], delta: -7, text: "Licensing and ops weight a lean budget cannot carry" },
  ],
  standard: [],
  premium: [],
};

function applyRules(tokens: Set<string>, rules: ConstraintRule[], reasons: Reason[]) {
  for (const rule of rules) {
    if (rule.tokens.some((t) => tokens.has(t))) {
      reasons.push({ delta: rule.delta, text: rule.text });
    }
  }
}

/**
 * Score one archetype's stack options against the profile and constraints.
 * Returns options re-ranked, each with the reasons that moved it.
 */
export function rankOptions(
  archetype: ProjectArchetype,
  profile: ContextProfile,
  constraints: Constraints,
  destination: Destination | null = null,
): ScoredOption[] {
  const estate = estateTokens(profile);
  const estateRuntimes = new Set([...estate.keys()].filter((t) => RUNTIME_TOKENS.has(t)));

  // The estate's dominant stack, for the house-stack badge.
  const majority = [...profile.estate].sort((a, b) => b.count - a.count)[0];
  const majorityTokens = majority
    ? stackEntryTokens(STACKS.find((s) => s.name === majority.stackName) ?? ({} as StackEntry))
    : new Set<string>();

  const scored = archetype.stacks.map((option) => {
    const tokens = optionTokens(option);
    const reasons: Reason[] = [];

    // Base: the atlas's own judgement for this archetype still anchors.
    reasons.push({
      delta: option.fit === "primary" ? 30 : 15,
      text: option.fit === "primary" ? "Atlas default for this project type" : "Atlas alternate for this project type",
    });

    // Org fit.
    for (const t of tokens) {
      const fit = ORG_FIT[t]?.[profile.org];
      if (fit) reasons.push({ delta: fit[0], text: fit[1] });
    }

    // Constraints.
    applyRules(tokens, HOSTING_RULES[constraints.hosting], reasons);
    applyRules(tokens, COMPLIANCE_RULES[constraints.compliance], reasons);
    applyRules(tokens, MAINTAINER_RULES[constraints.maintainer], reasons);
    applyRules(tokens, BUDGET_RULES[constraints.budget], reasons);
    if (constraints.offline) {
      applyRules(
        tokens,
        [
          { tokens: ["reactnative", "dart"], delta: 8, text: "Real local storage and background sync for offline work" },
          { tokens: ["htmx", "elixir"], delta: -6, text: "Server-round-trip UI degrades hard without a connection" },
        ],
        reasons,
      );
    }
    for (const team of constraints.team) {
      const teamTokens = TEAM_TOKEN[team] ?? [];
      if (teamTokens.some((t) => tokens.has(t))) {
        reasons.push({ delta: 10, text: `The maintaining team already writes ${team}` });
      }
    }

    // Estate continuity — the input most tools ignore.
    if (profile.estate.length > 0) {
      let overlaps = 0;
      for (const t of tokens) {
        const hit = estate.get(t);
        if (hit && overlaps < 3) {
          overlaps++;
          reasons.push({
            delta: 6,
            text: `Continuity: already in your estate via ${hit.via.join(", ")} (×${hit.count})`,
          });
        }
      }
      const optionRuntimes = [...tokens].filter((t) => RUNTIME_TOKENS.has(t));
      if (optionRuntimes.length > 0 && !optionRuntimes.some((t) => estateRuntimes.has(t))) {
        reasons.push({
          delta: -8,
          text: "Introduces a new runtime to your estate — one more thing to staff, patch and monitor",
        });
      }
    }

    const score = reasons.reduce((n, r) => n + r.delta, 0);
    const houseStack =
      majorityTokens.size > 0 && [...tokens].filter((t) => majorityTokens.has(t)).length >= 2;

    // Second pass. The destination's reasons are *added* to the present-tense
    // ones rather than replacing them: the question is not "what would we pick
    // if we were already there", it is "what does today's answer cost us on the
    // way". Sorting still uses the present-tense score, so an unset destination
    // changes nothing about the order.
    const destReasons = destinationReasons(option, destination, tokens);
    const scoreThen = destination ? score + destReasons.reduce((n, r) => n + r.delta, 0) : null;

    return {
      option,
      score,
      houseStack,
      reasons: reasons.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)),
      scoreThen,
      destinationReasons: destReasons.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)),
      trajectory: scoreThen === null ? null : trajectoryNote(score, scoreThen, destination),
    };
  });

  // Ranked by where the project is going when a destination is set, and by
  // today when it is not. This is the whole behavioural change: the same
  // archetype can now surface a different winner because the answer to
  // "for how long" changed.
  return scored.sort((a, b) =>
    a.scoreThen !== null && b.scoreThen !== null ? b.scoreThen - a.scoreThen : b.score - a.score,
  );
}

/* --------------------------------- tray --------------------------------- */

export interface Tray {
  archetypeId: string | null;
  language: string | null;
  framework: string | null;
  data: string | null;
  hosting: string | null;
  auth: string | null;
  integrations: string[];
  /** How it ships and how you watch it — names from the delivery volume. */
  delivery: string[];
  /** Free-text: the constraint that decided it. */
  rationale: string;
}

export const EMPTY_TRAY: Tray = {
  archetypeId: null,
  language: null,
  framework: null,
  data: null,
  hosting: null,
  auth: null,
  integrations: [],
  delivery: [],
  rationale: "",
};

export interface Conflict {
  severity: "finding" | "caution";
  text: string;
}

const AVOID_PROTOCOLS = ["FTP", "Telnet", "TFTP", "HTTP/1.1", "XML-RPC", "LDAP", "HTTP Basic auth", "NTLM"];

/** Archetypes the atlas itself weights Small — computed once, not hand-listed. */
const SMALL_ARCHETYPES = new Set(
  ALL_ARCHETYPES_FOR_WEIGHT.filter((a) => a.weight === "Small").map((a) => a.id),
);

/** The tray argues back. Rules only fire on data the tray actually holds. */
export function trayConflicts(
  tray: Tray,
  profile: ContextProfile,
  constraints: Constraints,
  destination: Destination | null = null,
): Conflict[] {
  const out: Conflict[] = [];
  const all = tokensOf(
    [tray.language, tray.framework, tray.data, tray.hosting, tray.auth, ...tray.integrations, ...tray.delivery]
      .filter(Boolean)
      .join(" "),
  );

  for (const bad of AVOID_PROTOCOLS) {
    if (tray.integrations.includes(bad) || tray.auth === bad) {
      out.push({
        severity: "finding",
        text: `${bad} is on the Avoid list — carrying it forward is a documented risk, not a default. If it is a trading-partner requirement, say so in the brief.`,
      });
    }
  }

  if ((all.has("mongo") || all.has("firebase")) && ["client-portal", "marketplace", "pwa"].includes(tray.archetypeId ?? "")) {
    out.push({
      severity: "caution",
      text: "Multi-tenant isolation with no row-level security: every tenant boundary lives in application code. One missed filter is a breach.",
    });
  }

  if (all.has("cloudflare")) {
    out.push({
      severity: "caution",
      text: "Workers are not Node — verify every dependency runs there before committing.",
    });
  }

  if (constraints.budget === "lean" && (all.has("sqlserver") || all.has("dotnet"))) {
    out.push({
      severity: "caution",
      text: "Per-core SQL Server / Windows licensing on a lean budget — confirm the client already owns the licences.",
    });
  }

  if (constraints.compliance === "pci" && tray.archetypeId === "ecommerce" && !all.has("stripe") && !all.has("shopify")) {
    out.push({
      severity: "caution",
      text: "PCI scope with no processor in the stack — add Stripe or a platform, or budget a QSA.",
    });
  }

  // Delivery rules. The tray argues about how the thing ships, not just what
  // it is made of — which is the half that used to be invisible.
  {
    const d = new Set(tray.delivery);
    const has = (...names: string[]) => names.some((n) => d.has(n));

    // The recording's own car-dashboard line, made mechanical.
    if (d.has("Grafana") && !has("Prometheus", "Loki", "ELK / OpenSearch", "OpenTelemetry")) {
      out.push({
        severity: "finding",
        text: "Grafana collects nothing — it is the dashboard in a car, and the engine and sensors produce the data. With no Prometheus, Loki or OpenTelemetry in the chain this is an empty screen.",
      });
    }

    const INTEGRATE = ["GitHub Actions", "GitLab CI/CD", "Jenkins", "CircleCI", "Azure Pipelines", "Argo CD"];
    if (tray.delivery.length > 0 && !INTEGRATE.some((n) => d.has(n))) {
      out.push({
        severity: "finding",
        text: "Nothing runs on push. Without a pipeline there is no rollback and no record of what shipped — which is the finding an auditor writes down, and the reason a bad Friday becomes a bad weekend.",
      });
    }

    if (has("Kubernetes", "Managed Kubernetes", "Helm", "Argo CD")) {
      if (constraints.maintainer === "client-nontech") {
        out.push({
          severity: "finding",
          text: "Kubernetes with nobody technical at the client: this hands over a platform team's job to people who do not have one. Say what happens on day one after the engagement ends.",
        });
      } else if (tray.archetypeId && SMALL_ARCHETYPES.has(tray.archetypeId)) {
        out.push({
          severity: "caution",
          text: "Cluster operations on a Small project is more machine than the problem needs. If it is a deliberate investment in the next three projects, write that down — otherwise a platform runtime does this for free.",
        });
      }
    }

    if (has("Terraform", "Vault", "Consul", "Packer", "Nomad")) {
      out.push({
        severity: "caution",
        text: "HashiCorp tooling is BUSL-1.1 and IBM-owned since 2025. Free for internal use; wrapping it in something you sell is a licensing conversation. OpenTofu and OpenBao are the MPL forks under the Linux Foundation.",
      });
    }

    if (d.has("ELK / OpenSearch") && constraints.budget === "lean") {
      out.push({
        severity: "caution",
        text: "Elasticsearch is memory- and storage-hungry, and the bill grows with log volume rather than traffic. On a lean budget this is the line item that outgrows the application it watches — Loki indexes labels instead and costs a fraction.",
      });
    }

    if (d.has("Jenkins")) {
      out.push({
        severity: "caution",
        text: "Jenkins is losing share every year and the cost is the plugin surface — teams leave when a plugin breaks an upgrade, or when the one person who understood the controller resigns. Fine to inherit; choosing it new needs an argument.",
      });
    }
  }

  // Destination rules. These can only fire once someone has said where the
  // project is going, which is exactly why they were impossible before.
  if (destination) {
    if (destination.horizon === "platform" && (all.has("mongo") || all.has("firebase"))) {
      out.push({
        severity: "finding",
        text: "A platform horizon on a database with no row-level security: every tenant boundary is application code, and a platform has thousands of them. This is the one to change while changing it is still cheap.",
      });
    }
    if (destination.horizon === "platform" && (all.has("nocode") || all.has("wordpress") || all.has("shopify"))) {
      out.push({
        severity: "finding",
        text: "Nobody builds on top of this. If others are meant to extend it, a hosted site builder is the wrong foundation — say so now rather than after the first integration request.",
      });
    }
    if (destination.autonomy === "unattended" && all.has("nocode")) {
      out.push({
        severity: "finding",
        text: "Unattended and unobservable. When an automation canvas fails at 3am there is no stack trace and no test to write — pick something you can debug asleep.",
      });
    }
    if (destination.sovereignty === "portable" && (all.has("supabase") || all.has("firebase") || all.has("vercel") || all.has("shopify"))) {
      out.push({
        severity: "caution",
        text: "Portable is the stated destination, and core data or core behaviour sits inside one vendor. That is a fine trade — but it is a trade, and it belongs in the brief.",
      });
    }
    if (destination.growth === "tenants" && all.has("sqlite")) {
      out.push({
        severity: "caution",
        text: "One writer at a time, and tenants are the growth axis. The ceiling arrives without warning and it arrives during business hours.",
      });
    }
    if (growthFactor(destination) >= 3 && (all.has("nocode") || all.has("sqlite"))) {
      out.push({
        severity: "caution",
        text: `A ${Math.round(growthFactor(destination))}-order-of-magnitude climb on this foundation is a rebuild, not a scale-up. Budget it deliberately or choose differently now.`,
      });
    }
  }

  if (profile.estate.length > 0 && tray.language) {
    const estate = estateTokens(profile);
    const runtimes = [...tokensOf(`${tray.language} ${tray.framework ?? ""}`)].filter((t) =>
      RUNTIME_TOKENS.has(t),
    );
    if (runtimes.length > 0 && !runtimes.some((t) => estate.has(t))) {
      out.push({
        severity: "caution",
        text: `${tray.language} would be the only project in its runtime across your estate. Diverging can be right — but write down why, because you will maintain the exception.`,
      });
    }
  }

  return out;
}

/* -------------------------------- wizard -------------------------------- */

export interface WizardQuestion {
  id: string;
  question: string;
  options: { value: string; label: string }[];
}

export const WIZARD: WizardQuestion[] = [
  {
    id: "audience",
    question: "Who uses it?",
    options: [
      { value: "public", label: "The public — anyone" },
      { value: "clients", label: "Customers who sign in" },
      { value: "staff", label: "Our own staff" },
      { value: "devices", label: "Machines or devices" },
    ],
  },
  {
    id: "purpose",
    question: "What does it mostly do?",
    options: [
      { value: "present", label: "Present who we are" },
      { value: "sell", label: "Sell things" },
      { value: "manage", label: "Manage records and workflows" },
      { value: "live", label: "Show things changing live" },
      { value: "connect", label: "Move data between systems" },
      { value: "documents", label: "Produce documents or reports" },
    ],
  },
  {
    id: "platform",
    question: "Where does it need to run?",
    options: [
      { value: "web", label: "The browser" },
      { value: "phone", label: "A phone, as an app" },
      { value: "both", label: "Both web and phone" },
      { value: "none", label: "Behind the scenes — no interface" },
    ],
  },
  {
    id: "offline",
    question: "Does it have to work without a connection?",
    options: [
      { value: "no", label: "No — always online" },
      { value: "yes", label: "Yes — field conditions, bad signal" },
    ],
  },
  {
    id: "existing",
    question: "Is there an existing system involved?",
    options: [
      { value: "green", label: "No — starting fresh" },
      { value: "integrate", label: "Yes — we connect to it" },
      { value: "modernise", label: "Yes — we're replacing it" },
      { value: "unknown", label: "Yes, and nobody's sure what it is" },
    ],
  },
];

/** Map wizard answers to archetype scores. Deliberately shallow — it narrows
 * to two or three candidates and hands the judgement back to the human. */
export function suggestArchetypes(answers: Record<string, string>): { id: string; score: number }[] {
  const s = new Map<string, number>();
  const add = (id: string, n: number) => s.set(id, (s.get(id) ?? 0) + n);

  const { audience, purpose, platform, offline, existing } = answers;

  if (purpose === "present") { add("marketing-site", 5); add("content-site", 3); }
  if (purpose === "sell") { add("ecommerce", 5); if (audience === "public") add("marketplace", 2); }
  if (purpose === "manage") {
    if (audience === "staff") add("internal-tool", 5);
    if (audience === "clients") add("client-portal", 5);
  }
  if (purpose === "live") { add("realtime", 4); add("analytics-dashboard", 3); }
  if (purpose === "connect") { add("api-service", 4); add("automation", 3); add("data-pipeline", 3); }
  if (purpose === "documents") { add("document-gen", 5); }

  if (audience === "clients") add("client-portal", 2);
  if (audience === "staff") add("internal-tool", 2);
  if (audience === "devices") { add("iot", 5); add("api-service", 2); }

  if (platform === "phone" || platform === "both") add("mobile-app", 4);
  if (platform === "none") { add("api-service", 3); add("automation", 2); }
  if (offline === "yes") { add("pwa", 5); add("mobile-app", 2); }

  if (existing === "integrate") add("legacy-integration", 3);
  if (existing === "modernise") add("legacy-integration", 5);
  if (existing === "unknown") add("legacy-audit", 6);

  return [...s.entries()]
    .map(([id, score]) => ({ id, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

/* ------------------------------ persistence ----------------------------- */

const KEYS = {
  profile: "atlas.profile.v1",
  tray: "atlas.tray.v1",
  constraints: "atlas.constraints.v1",
  destination: "atlas.destination.v1",
};

export function load<T>(key: keyof typeof KEYS, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(KEYS[key]);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

export function save(key: keyof typeof KEYS, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEYS[key], JSON.stringify(value));
  } catch {
    /* storage full or blocked — the session still works, it just won't persist */
  }
}
