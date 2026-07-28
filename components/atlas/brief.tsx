"use client";

import { useState } from "react";
import { ArrowLeft, Check, Copy, Printer } from "lucide-react";

import {
  trayConflicts,
  ORG_LABEL,
  type Constraints,
  type ContextProfile,
  type Tray,
} from "@/lib/engine";
import { ALL_ARCHETYPES } from "@/lib/stack-atlas-families";
import { Button, SectionLabel } from "@/components/atlas/ui";

function briefMarkdown(
  tray: Tray,
  profile: ContextProfile,
  constraints: Constraints,
): string {
  const a = ALL_ARCHETYPES.find((x) => x.id === tray.archetypeId);
  const conflicts = trayConflicts(tray, profile, constraints);
  const estate = profile.estate.filter((e) => e.count > 0);

  const lines: string[] = [
    `# Stack brief — ${a?.label ?? "Untitled project"}`,
    "",
    `*Prepared with the Plumbline Build Atlas.*`,
    "",
    "## Context",
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
    "",
  ];

  if (tray.rationale.trim()) {
    lines.push("## Why this stack", tray.rationale.trim(), "");
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
  onBack,
}: {
  tray: Tray;
  profile: ContextProfile;
  constraints: Constraints;
  onBack: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const md = briefMarkdown(tray, profile, constraints);
  const a = ALL_ARCHETYPES.find((x) => x.id === tray.archetypeId);
  const conflicts = trayConflicts(tray, profile, constraints);

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
