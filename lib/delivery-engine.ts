// The guided half of the delivery volume.
//
// A browsable list of tools is a parts bin. This is what makes it a practice:
// given the archetype, the org, the estate, the constraints and where the
// project is going, it walks the ten stages and argues a verdict for each —
// with the reasons as sentences, exactly like rankOptions does for stacks.
//
// The verdict that matters most is `not-yet`. Most of this volume is the wrong
// size for a five-project studio, and the honest output is a dated "not yet"
// with the trigger attached rather than a recommendation nobody should follow.
// A tool that tells a solo operator to run Kubernetes is not being helpful; it
// is being fashionable.

import type { Destination } from "@/lib/destination";
import type { Standing } from "@/lib/stack-atlas-reference";
import { growthFactor } from "@/lib/destination";
import {
  DELIVERY,
  DELIVERY_STAGES,
  type DeliveryEntry,
  type DeliveryScale,
  type DeliveryStage,
} from "@/lib/stack-atlas-delivery";
import {
  estateTokens,
  tokensOf,
  type Constraints,
  type ContextProfile,
  type Reason,
  type Tray,
} from "@/lib/engine";
import type { ProjectArchetype, ProjectWeight } from "@/lib/stack-atlas";

export type StageVerdict = "needed" | "not-yet" | "covered";

export interface ScoredDelivery {
  entry: DeliveryEntry;
  score: number;
  reasons: Reason[];
}

export interface StageAdvice {
  stage: DeliveryStage;
  label: string;
  question: string;
  verdict: StageVerdict;
  /** The pick, when there is one worth making. */
  recommended: DeliveryEntry | null;
  /** Runners-up, best first, for the disclosure. */
  alternatives: ScoredDelivery[];
  /** Why this verdict — sentences, not scores. */
  reasons: Reason[];
  /** Entries the tray already holds at this stage. */
  chosen: DeliveryEntry[];
  /** For `covered`: what covers it. */
  coveredBy?: string;
}

/**
 * The shape the scorers actually need. Both the delivery volume and the agentic
 * axis satisfy it, so the sizing, constraint and destination arguments are
 * written once rather than forked per volume.
 */
export interface ScorableEntry {
  name: string;
  stage: string;
  standing: Standing;
  scale: DeliveryScale;
  whatItIs: string;
  whenYouNeedIt: string;
  notYet: string;
  needs: string[];
  feeds: string[];
  instead: string[];
}

/** Platform runtimes take three whole stages off the board. Worth naming. */
const PLATFORM_HOSTS =
  /vercel|netlify|cloudflare|workers|lambda|fly\.io|\bfly\b|railway|render|heroku|app engine|cloud run|amplify/i;

/** How much the project's size argues against a piece built for a bigger one. */
export function scaleFit(entry: ScorableEntry, weight: ProjectWeight | null, profile: ContextProfile): Reason[] {
  const out: Reason[] = [];
  const small = weight === "Small";
  const large = weight === "Large";
  const tiny = profile.org === "personal";
  const big = profile.org === "enterprise" || profile.org === "midmarket";

  const need: Record<DeliveryScale, number> = { solo: 0, team: 1, platform: 2 };
  const have = tiny ? 0 : big ? 2 : 1;
  const gap = need[entry.scale] - have;

  if (gap >= 2) out.push({ delta: -20, text: `Built for a platform team, and there isn't one — ${entry.notYet}` });
  else if (gap === 1) out.push({ delta: -8, text: `A size up from this organisation — ${entry.notYet}` });
  else if (gap <= -1 && entry.scale === "solo") out.push({ delta: 3, text: "Small enough to be worth it even here" });

  if (small && entry.scale === "platform") out.push({ delta: -12, text: "A Small project cannot carry platform-scale operations" });
  if (large && entry.scale === "platform") out.push({ delta: 8, text: "The project is large enough for this to earn its keep" });
  if (entry.standing === "Legacy") out.push({ delta: -8, text: "Fine to inherit, hard to justify choosing new" });

  return out;
}

export function constraintFit(entry: ScorableEntry, c: Constraints, profile: ContextProfile): Reason[] {
  const out: Reason[] = [];
  const n = entry.name;

  if (c.hosting === "client-windows") {
    if (n === "Azure Pipelines" || n === "Azure Repos")
      out.push({ delta: 16, text: "Lands inside the Windows and Entra estate the client already operates" });
    if (n === "Platform runtimes") out.push({ delta: -12, text: "Hosted elsewhere — conflicts with the on-premise mandate" });
  }
  if (c.hosting === "client-hosted" && n === "Platform runtimes")
    out.push({ delta: -10, text: "Platform-hosted by design; hard to hand to client infrastructure" });
  if (c.hosting === "our-cloud" && n === "Platform runtimes")
    out.push({ delta: 6, text: "Hosting we run and bill for" });

  if (c.maintainer === "client-nontech") {
    if (entry.scale === "platform")
      out.push({ delta: -14, text: "Nobody at the client can operate this after handoff" });
    if (n === "Platform runtimes" || n === "Cloud secret managers" || n === "Sentry")
      out.push({ delta: 8, text: "Runs without a developer on staff" });
  }

  if (c.budget === "lean") {
    if (n === "ELK / OpenSearch") out.push({ delta: -14, text: "Cost scales with log volume and will outgrow the app it watches" });
    if (n === "Kubernetes" || n === "Managed Kubernetes") out.push({ delta: -10, text: "Cluster cost and cluster time a lean budget cannot carry" });
    if (n === "Platform runtimes" || n === "GitHub Actions" || n === "Loki")
      out.push({ delta: 6, text: "Near-zero run cost at this size" });
  }

  if (c.compliance === "soc2") {
    if (n === "SonarQube" || n === "SBOM & SLSA" || n === "Dependabot / Renovate")
      out.push({ delta: 8, text: "Evidence an auditor will ask for by name" });
    if (n === "Azure Pipelines") out.push({ delta: 4, text: "Named approval gates recorded against each release" });
  }
  if (c.compliance === "hipaa" || c.compliance === "pci") {
    if (n === "Vault" || n === "OpenBao" || n === "Cloud secret managers")
      out.push({ delta: 7, text: "Credential handling is in scope for this regime and gets audited" });
    if (n === "Trivy / Grype") out.push({ delta: 5, text: "Image vulnerability evidence is part of the assessment" });
  }

  // Continuity: the estate is an argument here too.
  const estate = estateTokens(profile);
  const t = tokensOf(`${entry.name} ${entry.whatItIs}`);
  for (const tok of t) {
    const hit = estate.get(tok);
    if (hit) {
      out.push({ delta: 5, text: `Already in your estate via ${hit.via.join(", ")}` });
      break;
    }
  }

  return out;
}

export function destinationFit(entry: ScorableEntry, d: Destination | null): Reason[] {
  if (!d) return [];
  const out: Reason[] = [];
  const n = entry.name;

  if (d.autonomy === "unattended") {
    if (entry.stage === "observe")
      out.push({ delta: 10, text: "Nobody is watching, so the system has to be able to raise its own hand" });
    if (n === "Alertmanager" || n === "Sentry") out.push({ delta: 6, text: "An unattended failure is only an incident once someone is told" });
  }
  if (d.autonomy === "assisted" && entry.stage === "observe" && entry.scale !== "solo")
    out.push({ delta: -5, text: "A person is already driving — heavy observability is answering a question nobody asked" });

  if (d.horizon === "platform") {
    if (entry.stage === "orchestrate" && entry.scale === "platform")
      out.push({ delta: 10, text: "A platform horizon eventually means running many services, and that is this stage's whole job" });
    if (n === "Argo CD" || n === "Helm") out.push({ delta: 6, text: "Others will deploy onto this — the deployment has to be readable and versioned" });
    if (n === "SBOM & SLSA") out.push({ delta: 7, text: "People building on you will ask what is in it" });
  }
  if (d.horizon === "tool" && entry.scale !== "solo")
    out.push({ delta: -10, text: "One operator, no handover — this is ceremony with nobody to serve" });

  if (d.growth === "automation" && entry.stage === "integrate")
    out.push({ delta: 6, text: "Automation growth is code growth, and code growth is caught here or not at all" });
  if (d.growth === "data" && n === "ELK / OpenSearch")
    out.push({ delta: -6, text: "Data is the growth axis, and this is the tool whose bill grows fastest with it" });
  if (d.growth === "tenants" && entry.stage === "secure")
    out.push({ delta: 7, text: "More tenants means more credentials, and rotation stops being optional" });

  const factor = growthFactor(d);
  if (factor >= 3 && entry.scale === "platform")
    out.push({ delta: 8, text: `A ${Math.round(factor)}-order-of-magnitude climb ends somewhere this piece is normal` });
  if (factor <= 1 && entry.scale === "platform")
    out.push({ delta: -8, text: "The destination is close to where you already are — this never becomes necessary" });

  return out;
}

/**
 * A stage nobody has reached yet. Configuration has nothing to configure when
 * no machines were created — that is a property of the spine, not of any one
 * tool, so it lives here rather than being smuggled into an entry.
 */
const STAGE_DEPENDS: Partial<Record<DeliveryStage, DeliveryStage>> = {
  configure: "provision",
};

/**
 * The edges, used as guidance rather than decoration.
 *
 * Recommending a piece whose prerequisite is absent is exactly the incoherence
 * `needs` exists to prevent — Loki without Grafana, Helm without Kubernetes,
 * Ansible without machines. Scoring against what is actually in the chain is
 * what makes the picture and the advice agree.
 */
const STAGE_OF = new Map(DELIVERY.map((e) => [e.name, e.stage]));

/**
 * A need names a concrete entry, but it means "the job that entry does". SonarQube
 * needs a pipeline, not GitHub Actions specifically, so anything filling the same
 * stage satisfies it — which is what `instead` already says about substitutes.
 */
function satisfied(need: string, available: Set<string>, stageOf: Map<string, string>): boolean {
  if (available.has(need)) return true;
  const stage = stageOf.get(need);
  if (!stage) return false;
  for (const a of available) if (stageOf.get(a) === stage) return true;
  return false;
}

export function needsFit(entry: ScorableEntry, available: Set<string>, stageOf: Map<string, string> = STAGE_OF): Reason[] {
  if (entry.needs.length === 0) return [];
  const missing = entry.needs.filter((n) => !satisfied(n, available, stageOf));
  if (missing.length === 0) {
    return [{ delta: 6, text: `Completes the chain from ${entry.needs.join(", ")}` }];
  }
  return [
    {
      delta: -16,
      text: `Needs ${missing.join(", ")}, which ${missing.length === 1 ? "is" : "are"} not in your chain — adding this first gets you a piece that cannot do its job yet`,
    },
  ];
}

/**
 * Walk the ten stages and argue each one. Everything it reads is already
 * collected elsewhere in the atlas; the user answers no new questions.
 */
export function deliveryChain(
  archetype: ProjectArchetype | null,
  profile: ContextProfile,
  constraints: Constraints,
  tray: Tray,
  destination: Destination | null,
): StageAdvice[] {
  const weight = archetype?.weight ?? null;
  const held = new Set(tray.delivery);
  const hostText = `${tray.hosting ?? ""} ${tray.delivery.join(" ")}`;
  const onPlatform = PLATFORM_HOSTS.test(hostText);
  const platformName = tray.hosting && PLATFORM_HOSTS.test(tray.hosting) ? tray.hosting : "a managed platform runtime";

  // Sequential rather than a map: each stage is scored against what the chain
  // already contains, so a recommendation can never depend on a piece the
  // chain does not have.
  const available = new Set<string>(tray.delivery);
  const verdicts = new Map<DeliveryStage, StageVerdict>();
  const out: StageAdvice[] = [];

  for (const { key, label, question } of DELIVERY_STAGES) {
    const pool = DELIVERY.filter((e) => e.stage === key);
    const chosen = pool.filter((e) => held.has(e.name));

    const scored: ScoredDelivery[] = pool
      .map((entry) => {
        const reasons: Reason[] = [
          { delta: entry.standing === "Current" ? 12 : 4, text: entry.whenYouNeedIt },
          ...scaleFit(entry, weight, profile),
          ...constraintFit(entry, constraints, profile),
          ...destinationFit(entry, destination),
          ...needsFit(entry, available),
        ];
        return {
          entry,
          score: reasons.reduce((n, r) => n + r.delta, 0),
          reasons: reasons.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)),
        };
      })
      .sort((a, b) => b.score - a.score);

    const best = scored[0] ?? null;
    const reasons: Reason[] = [];
    let verdict: StageVerdict = "needed";
    let coveredBy: string | undefined;

    const upstream = STAGE_DEPENDS[key];
    const upstreamVerdict = upstream ? verdicts.get(upstream) : undefined;

    if (onPlatform && (key === "orchestrate" || key === "provision" || key === "configure") && chosen.length === 0) {
      verdict = "covered";
      coveredBy = platformName;
      reasons.push({
        delta: 0,
        text: `${platformName} owns this stage — there are no machines to create, configure or schedule. Leaving it empty is the correct answer, not a gap.`,
      });
    } else if (chosen.length > 0) {
      verdict = "needed";
      reasons.push({ delta: 0, text: `In your chain: ${chosen.map((c) => c.name).join(", ")}.` });
    } else if (upstream && (upstreamVerdict === "not-yet" || upstreamVerdict === "covered")) {
      verdict = "not-yet";
      reasons.push({
        delta: 0,
        text: `Nothing to configure — the ${upstream} stage is ${
          upstreamVerdict === "covered" ? "handled by your host" : "not yet in play"
        }, so no machines exist to set up.`,
      });
      reasons.push({ delta: 0, text: `What changes it: the first server you create yourself.` });
    } else if (best && best.score < 0) {
      verdict = "not-yet";
      reasons.push({ delta: 0, text: best.entry.notYet });
      reasons.push({ delta: 0, text: `What changes it: ${best.entry.whenYouNeedIt}` });
    } else if (best) {
      verdict = "needed";
      reasons.push({ delta: 0, text: best.entry.whenYouNeedIt });
    }

    const recommended = verdict === "needed" && chosen.length === 0 ? best?.entry ?? null : null;
    for (const e of chosen) available.add(e.name);
    if (recommended) available.add(recommended.name);
    verdicts.set(key, verdict);

    out.push({
      stage: key,
      label,
      question,
      verdict,
      recommended,
      alternatives: scored.slice(chosen.length > 0 || verdict !== "needed" ? 0 : 1, 6),
      reasons,
      chosen,
      coveredBy,
    });
  }

  return out;
}

/** The one-line summary the Ship step and the brief both open with. */
export function chainSummary(chain: StageAdvice[]): string {
  const needed = chain.filter((s) => s.verdict === "needed").length;
  const notYet = chain.filter((s) => s.verdict === "not-yet").length;
  const covered = chain.filter((s) => s.verdict === "covered").length;
  const parts = [`${needed} stage${needed === 1 ? "" : "s"} to answer`];
  if (covered) parts.push(`${covered} already covered by your host`);
  if (notYet) parts.push(`${notYet} deliberately not yet`);
  return parts.join(" · ");
}
