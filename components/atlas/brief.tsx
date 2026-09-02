"use client";

import { useState } from "react";
import { ArrowLeft, Check, Copy, Printer } from "lucide-react";

import {
  DOOR_BLURB,
  DOOR_LABEL,
  describeDestination,
  doorsFor,
  type Destination,
} from "@/lib/destination";
import {
  trayConflicts,
  ORG_LABEL,
  type Constraints,
  type ContextProfile,
  type Tray,
} from "@/lib/engine";
import { chainSummary, deliveryChain } from "@/lib/delivery-engine";
import { ALL_ARCHETYPES } from "@/lib/stack-atlas-families";
import { Button, SectionLabel } from "@/components/atlas/ui";

function briefMarkdown(
  tray: Tray,
  profile: ContextProfile,
  constraints: Constraints,
  destination: Destination | null,
): string {
  const a = ALL_ARCHETYPES.find((x) => x.id === tray.archetypeId);
  const conflicts = trayConflicts(tray, profile, constraints, destination);
  const estate = profile.estate.filter((e) => e.count > 0);

  const lines: string[] = [
    `# Stack brief — ${a?.label ?? "Untitled project"}`,
    "",
    `*Prepared with the Plumbline Build Atlas.*`,
    "",
    "## Context",
    destination
      ? `- Destination: ${describeDestination(destination)}`
      : "- Destination: not set — everything below is argued from the project as it is today",
    `- Building for: ${ORG_LABEL[profile.org]}`,
    `- Maintained after handoff by: ${
      { studio: "the studio (retainer)", "client-tech": "the client's technical team", "client-nontech": "the client (no developers on staff)" }[constraints.maintainer]
    }`,
    `- Hosting constraint: ${
      { any: "none", "our-cloud": "studio-managed cloud", "client-windows": "client's Windows / Microsoft estate", "client-hosted": "client-hosted" }[constraints.hosting]
    }`,
    `- Compliance in scope: ${constraints.compliance === "none" ? "none known" : constraints.compliance.toUpperCase()}`,
    `- Budget posture: ${constraints.budget}`,
    constraints.offline ? "- Must work offline (field conditions)" : "",
    estate.length
      ? `- Existing estate: ${estate.map((e) => `${e.stackName} ×${e.count}`).join(", ")}`
      : "- Existing estate: none recorded",
    "",
    "## The stack",
    `| Slot | Choice |`,
    `| --- | --- |`,
    `| Language | ${tray.language ?? "—"} |`,
    `| Framework | ${tray.framework ?? "—"} |`,
    `| Data | ${tray.data ?? "—"} |`,
    `| Hosting | ${tray.hosting ?? "—"} |`,
    `| Auth | ${tray.auth ?? "—"} |`,
    `| Integrations | ${tray.integrations.length ? tray.integrations.join(", ") : "—"} |`,
    `| Delivery | ${tray.delivery.length ? tray.delivery.join(", ") : "—"} |`,
    "",
  ];

  // The delivery chain, including the stages deliberately left empty. A brief
  // that says "no orchestration layer, and here is the condition under which
  // that changes" is defensible; one that is silent about it is not.
  {
    const a2 = ALL_ARCHETYPES.find((x) => x.id === tray.archetypeId) ?? null;
    const chain = deliveryChain(a2, profile, constraints, tray, destination);
    lines.push("## How it ships", `*${chainSummary(chain)}*`, "", "| Stage | Verdict | Answer |", "| --- | --- | --- |");
    for (const s2 of chain) {
      const answer =
        s2.verdict === "covered"
          ? `Covered by ${s2.coveredBy}`
          : s2.chosen.length
            ? s2.chosen.map((c) => c.name).join(", ")
            : s2.recommended
              ? `${s2.recommended.name} (recommended, not yet chosen)`
              : "—";
      const verdict = s2.verdict === "not-yet" ? "Not yet" : s2.verdict === "covered" ? "Covered" : "Needed";
      lines.push(`| ${s2.label} — ${s2.question} | ${verdict} | ${answer} |`);
    }
    lines.push("");
    const deferred = chain.filter((x) => x.verdict === "not-yet");
    if (deferred.length) {
      lines.push("### Deliberately not yet", "");
      for (const x of deferred) {
        lines.push(`- **${x.label}.** ${x.reasons.map((r) => r.text).join(" ")}`);
      }
      lines.push("");
    }
  }

  if (tray.rationale.trim()) {
    lines.push("## Why this stack", tray.rationale.trim(), "");
  }

  // The ledger is the point of setting a destination: which doors this stack
  // closes, at what scale, and what the exit costs.
  if (destination) {
    const doors = doorsFor(destination);
    lines.push(
      "## Lock-in ledger",
      "*Not every decision costs the same to reverse. These are rated against the destination above.*",
      "",
      "| Decision | Door | Becomes expensive | Exit cost |",
      "| --- | --- | --- | --- |",
    );
    for (const d of doors) {
      lines.push(`| ${d.axis} | ${DOOR_LABEL[d.rating]} | ${d.threshold ?? "—"} | ${d.exit} |`);
    }
    lines.push("");
  }

  if (conflicts.length) {
    lines.push("## Flags to resolve before quoting");
    for (const c of conflicts) lines.push(`- **${c.severity === "finding" ? "Finding" : "Caution"}:** ${c.text}`);
    lines.push("");
  }

  if (a) {
    lines.push("## Questions still open");
    for (const q of a.questions) lines.push(`- ${q}`);
    lines.push("", "## Do not do this");
    for (const v of a.avoid) lines.push(`- **${v.what}** — ${v.why}`);
    lines.push("");
  }

  return lines.filter((l) => l !== null).join("\n");
}

export function Brief({
  tray,
  profile,
  constraints,
  destination,
  onBack,
}: {
  tray: Tray;
  profile: ContextProfile;
  constraints: Constraints;
  destination: Destination | null;
  onBack: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const md = briefMarkdown(tray, profile, constraints, destination);
  const a = ALL_ARCHETYPES.find((x) => x.id === tray.archetypeId);
  const conflicts = trayConflicts(tray, profile, constraints, destination);
  const doors = destination ? doorsFor(destination) : [];
  const chain = deliveryChain(a ?? null, profile, constraints, tray, destination);

  async function copy() {
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — the textarea below still allows manual copy */
    }
  }

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to the workbench
        </button>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={copy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy as Markdown"}
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print / PDF
          </Button>
        </div>
      </div>

      <div className="space-y-6 rounded-lg border border-border bg-card/60 p-6 print:border-0 print:bg-white">
        <div>
          <p className="eyebrow">Stack brief</p>
          <h2 className="text-3xl font-semibold tracking-tight">{a?.label ?? "Untitled project"}</h2>
          <p className="mt-1.5 max-w-prose text-sm text-muted-foreground">
            {destination ? (
              <>
                <b className="text-foreground">Destination:</b> {describeDestination(destination)}
              </>
            ) : (
              <>No destination set — everything below is argued from the project as it is today.</>
            )}
          </p>
        </div>

        <div>
          <SectionLabel>The stack</SectionLabel>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {(
              [
                ["Language", tray.language],
                ["Framework", tray.framework],
                ["Data", tray.data],
                ["Hosting", tray.hosting],
                ["Auth", tray.auth],
                ["Integrations", tray.integrations.join(", ") || null],
                ["Delivery", tray.delivery.join(", ") || null],
              ] as [string, string | null][]
            ).map(([label, value]) => (
              <div key={label} className="rounded-md border border-border/70 p-3">
                <p className="kpi-label">{label}</p>
                <p className="text-sm">{value ?? "—"}</p>
              </div>
            ))}
          </div>
        </div>

        {tray.rationale.trim() ? (
          <div>
            <SectionLabel>Why this stack</SectionLabel>
            <p className="text-sm opacity-90">{tray.rationale}</p>
          </div>
        ) : null}

        <div>
          <SectionLabel>How it ships</SectionLabel>
          <p className="mb-2.5 text-sm text-muted-foreground">{chainSummary(chain)}</p>
          <div className="overflow-x-auto rounded-md border border-border/70">
            <table className="w-full min-w-[34rem] border-collapse text-sm">
              <tbody>
                {chain.map((s2) => (
                  <tr key={s2.stage} className="border-b border-border/50 align-baseline last:border-b-0">
                    <td className="px-3 py-2 font-medium">{s2.label}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider ${
                          s2.verdict === "needed"
                            ? "border-gold/50 bg-gold/15 text-gold-bright"
                            : s2.verdict === "covered"
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                              : "border-border text-muted-foreground"
                        }`}
                      >
                        {s2.verdict === "not-yet" ? "Not yet" : s2.verdict === "covered" ? "Covered" : "Needed"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {s2.verdict === "covered"
                        ? `Covered by ${s2.coveredBy}`
                        : s2.chosen.length
                          ? s2.chosen.map((c) => c.name).join(", ")
                          : s2.recommended
                            ? `${s2.recommended.name} — recommended, not yet chosen`
                            : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {doors.length ? (
          <div>
            <SectionLabel>Lock-in ledger</SectionLabel>
            <p className="mb-2.5 max-w-prose text-sm text-muted-foreground">
              Which doors this stack closes, and what walking back through one costs. A small start is
              defensible when the one-way doors were chosen on purpose.
            </p>
            <div className="overflow-x-auto rounded-md border border-border/70">
              <table className="w-full min-w-[38rem] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border/70">
                    <th className="px-3 py-2 text-left font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">
                      Decision
                    </th>
                    <th className="px-3 py-2 text-left font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">
                      Door
                    </th>
                    <th className="px-3 py-2 text-left font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">
                      Exit cost
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {doors.map((d) => (
                    <tr key={d.axis} className="border-b border-border/50 last:border-b-0 align-baseline">
                      <td className="px-3 py-2.5 font-medium">{d.axis}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider ${
                            d.rating === "one-way"
                              ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                              : d.rating === "one-way-at-scale"
                                ? "border-gold-bright/40 bg-gold-bright/10 text-gold-bright"
                                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          }`}
                          title={DOOR_BLURB[d.rating]}
                        >
                          {DOOR_LABEL[d.rating]}
                        </span>
                        {d.threshold ? (
                          <span className="mt-1 block text-xs text-muted-foreground">{d.threshold}</span>
                        ) : null}
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">{d.exit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {conflicts.length ? (
          <div>
            <SectionLabel>Flags to resolve before quoting</SectionLabel>
            <ul className="diamond-list space-y-1.5 text-sm text-muted-foreground">
              {conflicts.map((c, i) => (
                <li key={i}>
                  <b className="text-foreground">{c.severity === "finding" ? "Finding: " : "Caution: "}</b>
                  {c.text}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {a ? (
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <SectionLabel>Questions still open</SectionLabel>
              <ul className="diamond-list space-y-1.5 text-sm text-muted-foreground">
                {a.questions.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
            </div>
            <div>
              <SectionLabel>Do not do this</SectionLabel>
              <ul className="diamond-list space-y-1.5 text-sm text-muted-foreground">
                {a.avoid.map((v) => (
                  <li key={v.what}>
                    <b className="text-foreground">{v.what}</b> — {v.why}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>

      <details className="no-print rounded-lg border border-border bg-card/40 p-4">
        <summary className="cursor-pointer text-sm text-muted-foreground">Raw Markdown</summary>
        <textarea
          readOnly
          value={md}
          rows={16}
          className="mt-3 w-full rounded-md border border-border bg-navy/40 p-3 font-mono text-xs"
        />
      </details>
    </div>
  );
}
