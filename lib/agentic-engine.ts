// The two-regime argument, made mechanical.
//
// Reuses the delivery engine's sizing, constraint and destination scorers —
// they are properties of the project, not of the volume — and adds the one
// thing this axis needs that delivery does not: a view on which regime the work
// actually belongs to, and a shared-state check that fires when two agents can
// write the same artefact.
//
// The regime call is the whole point. Sequential work with a person between
// stages needs structure, not orchestration; genuine concurrency needs a hosted
// roster with a dollar cap. Recommending a framework for the first case is the
// expensive mistake, and it is the default answer everywhere else.

import type { Destination } from "@/lib/destination";
import {
  destinationFit,
  needsFit,
  scaleFit,
  constraintFit,
  type ScorableEntry,
  type StageVerdict,
} from "@/lib/delivery-engine";
import type { Constraints, ContextProfile, Reason, Tray } from "@/lib/engine";
import { AGENTIC, AGENTIC_STAGES, type AgenticEntry, type AgenticStage } from "@/lib/stack-atlas-agentic";
import type { ProjectArchetype } from "@/lib/stack-atlas";

export type Regime = "sequential" | "concurrent";

export interface RegimeCall {
  regime: Regime;
  headline: string;
  reasons: Reason[];
}

export interface AgenticAdvice {
  stage: AgenticStage;
  label: string;
  question: string;
  verdict: StageVerdict;
  recommended: AgenticEntry | null;
  alternatives: { entry: AgenticEntry; score: number; reasons: Reason[] }[];
  reasons: Reason[];
  chosen: AgenticEntry[];
}

const STAGE_OF = new Map<string, string>(AGENTIC.map((e) => [e.name, e.stage]));

/**
 * Which regime is this project actually in?
 *
 * Read from the destination rather than asked, because the honest signal is
 * how much runs unattended and what is growing — not what anyone hopes to
 * build. Defaults to sequential: it is both the cheaper answer and the right
 * one far more often.
 */
export function callRegime(destination: Destination | null): RegimeCall {
  const reasons: Reason[] = [];
  let score = 0;

  if (!destination) {
    return {
      regime: "sequential",
      headline: "Sequential — structure, not orchestration",
      reasons: [
        {
          delta: 0,
          text: "No destination set, so this is the default — and the default is right for most work. Sequential steps with a person between them need no orchestration at all.",
        },
      ],
    };
  }

  if (destination.autonomy === "unattended") {
    score += 3;
    reasons.push({ delta: 3, text: "Runs with nobody watching, which is the actual trigger for a hosted loop and a budget cap" });
  } else if (destination.autonomy === "assisted") {
    score -= 3;
    reasons.push({ delta: -3, text: "A person drives it, so the review step between stages is free — that is Regime A by construction" });
  } else {
    reasons.push({ delta: 0, text: "A person checks the output, so stage boundaries are natural checkpoints" });
  }

  if (destination.growth === "automation") {
    score += 2;
    reasons.push({ delta: 2, text: "Automation is the growth axis — the volume of unattended work is what rises" });
  }
  if (destination.horizon === "platform") {
    score += 1;
    reasons.push({ delta: 1, text: "A platform horizon eventually means work arriving faster than a person can shepherd it" });
  }
  if (destination.horizon === "tool") {
    score -= 2;
    reasons.push({ delta: -2, text: "One operator and no handover: concurrency here would be solving a problem you do not have" });
  }
  if (destination.scaleThen >= 10000) {
    score += 1;
    reasons.push({ delta: 1, text: "At the destination's volume, serial processing stops fitting inside a night" });
  }

  const regime: Regime = score >= 3 ? "concurrent" : "sequential";
  return {
    regime,
    headline:
      regime === "concurrent"
        ? "Concurrent — rent the harness, own the roster"
        : "Sequential — structure, not orchestration",
    reasons,
  };
}

/**
 * Escape hatches must never win a tie. Each of these is the right answer when
 * the simpler default genuinely does not fit, and recommending one by default
 * inverts the argument the entry itself makes.
 */
const ESCAPE_HATCHES = new Set(["Manual tool loop", "Agent frameworks", "Long context"]);

/** Regime fit: the sharpest single argument on this axis, so it scores hard. */
function regimeFit(entry: AgenticEntry, regime: Regime): Reason[] {
  if (entry.regime === "both") return [];
  if (entry.regime === regime) return [{ delta: 8, text: `Belongs to the ${regime} regime, which is where this project sits` }];
  return [
    {
      delta: -18,
      text:
        entry.regime === "concurrent"
          ? "Built for genuine concurrency, and this work is sequential with a person between stages — the orchestration would be maintained forever and used never"
          : "A sequential pattern, and this work runs unattended at volume — it has no answer for the night nobody is watching",
    },
  ];
}

export function agenticChain(
  archetype: ProjectArchetype | null,
  profile: ContextProfile,
  constraints: Constraints,
  tray: Tray,
  destination: Destination | null,
): { call: RegimeCall; stages: AgenticAdvice[] } {
  const call = callRegime(destination);
  const weight = archetype?.weight ?? null;
  const held = new Set(tray.agentic);
  const available = new Set<string>(tray.agentic);
  const stages: AgenticAdvice[] = [];

  for (const { key, label, question } of AGENTIC_STAGES) {
    const pool = AGENTIC.filter((e) => e.stage === key);
    const chosen = pool.filter((e) => held.has(e.name));

    const scored = pool
      .map((entry) => {
        const s: ScorableEntry = entry;
        const reasons: Reason[] = [
          { delta: entry.standing === "Current" ? 12 : 4, text: entry.whenYouNeedIt },
          ...regimeFit(entry, call.regime),
          ...(ESCAPE_HATCHES.has(entry.name)
            ? [
                {
                  delta: -7,
                  text: "An escape hatch, not a default — reach for it when you can name what the simpler answer stops you doing",
                },
              ]
            : []),
          ...scaleFit(s, weight, profile),
          ...constraintFit(s, constraints, profile),
          ...destinationFit(s, destination),
          ...needsFit(s, available, STAGE_OF),
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

    if (chosen.length > 0) {
      reasons.push({ delta: 0, text: `In your chain: ${chosen.map((c) => c.name).join(", ")}.` });
    } else if (best && best.score < 0) {
      verdict = "not-yet";
      reasons.push({ delta: 0, text: best.entry.notYet });
      reasons.push({ delta: 0, text: `What changes it: ${best.entry.whenYouNeedIt}` });
    } else if (best) {
      reasons.push({ delta: 0, text: best.entry.whenYouNeedIt });
    }

    const recommended = verdict === "needed" && chosen.length === 0 ? best?.entry ?? null : null;
    for (const e of chosen) available.add(e.name);
    if (recommended) available.add(recommended.name);

    stages.push({
      stage: key,
      label,
      question,
      verdict,
      recommended,
      alternatives: scored.slice(chosen.length > 0 || verdict !== "needed" ? 0 : 1, 6),
      reasons,
      chosen,
    });
  }

  return { call, stages };
}

/**
 * The shared-state check. Not advice — the specific thing that goes wrong.
 *
 * Concurrency without a declared owner per artefact is the failure everyone
 * describes as "agents overstepping each other", and it is the one problem an
 * orchestrator genuinely does not solve.
 */
export function agenticConflicts(tray: Tray, destination: Destination | null): { severity: "finding" | "caution"; text: string }[] {
  const out: { severity: "finding" | "caution"; text: string }[] = [];
  const held = new Set(tray.agentic);
  const call = callRegime(destination);

  const concurrent = held.has("Multiagent rosters") || held.has("Agent frameworks") || call.regime === "concurrent";
  const owned = held.has("One writer per artefact") || held.has("Agent registry");

  if (concurrent && !owned) {
    out.push({
      severity: "finding",
      text: "Concurrent agents with no declared owner per artefact. This is what 'overstepping each other' actually means — two writers, one artefact, no agreed owner — and scheduling them does not fix it, it makes the corruption intermittent. Declare one writer per artefact before the second agent runs.",
    });
  }

  if (held.has("Scheduled deployments") && !held.has("Session budgets")) {
    out.push({
      severity: "finding",
      text: "Unattended runs with no dollar cap. A per-session budget is platform-enforced and is the only genuinely expensive failure mode on this axis — set it in the same change as the schedule.",
    });
  }

  if (held.has("Agent frameworks") && call.regime === "sequential") {
    out.push({
      severity: "caution",
      text: "An agent framework on sequential work with human review. The measured alternative — numbered folders and markdown — matched long-context accuracy at 97% fewer tokens, and costs nothing to maintain. Name the branching this cannot express before committing to the framework.",
    });
  }

  if (held.has("Long context") && (held.has("Scheduled deployments") || held.has("Worker cron"))) {
    out.push({
      severity: "caution",
      text: "A recurring job carrying its whole history in context. That is the case where filesystem memory measured ~20–30× cheaper per question at indistinguishable accuracy — the arithmetic reverses hard once a workflow repeats daily.",
    });
  }

  return out;
}
