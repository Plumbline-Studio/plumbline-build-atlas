"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import {
  ORG_LABEL,
  TEAM_CHOICES,
  type Constraints,
  type ContextProfile,
  type OrgKind,
} from "@/lib/engine";
import { STACKS } from "@/lib/stack-atlas-reference";
import { Chip, Select } from "@/components/atlas/ui";

/**
 * The context layer. Always visible as a one-line summary; expands to edit.
 * This is what keeps the engine from recommending a startup stack to an
 * enterprise, or a sixth runtime to a five-project estate.
 */
export function ContextPanel({
  profile,
  setProfile,
  constraints,
  setConstraints,
}: {
  profile: ContextProfile;
  setProfile: (p: ContextProfile) => void;
  constraints: Constraints;
  setConstraints: (c: Constraints) => void;
}) {
  const [open, setOpen] = useState(false);

  const estateSummary =
    profile.estate.length === 0
      ? "no existing projects recorded"
      : profile.estate
          .filter((e) => e.count > 0)
          .map((e) => `${e.stackName} ×${e.count}`)
          .join(" · ");

  return (
    <div className="rounded-lg border border-border bg-card/60">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-left"
      >
        <span className="eyebrow">Context</span>
        <span className="text-sm">
          Building for <b className="text-gold-bright">{ORG_LABEL[profile.org]}</b>
        </span>
        <span className="hidden text-sm text-muted-foreground sm:inline">
          · Estate: {estateSummary}
        </span>
        <span className="ml-auto text-muted-foreground">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>

      {open ? (
        <div className="space-y-5 border-t border-border px-4 py-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Select
              label="Who is this project for?"
              value={profile.org}
              onChange={(v) => setProfile({ ...profile, org: v as OrgKind })}
              options={Object.entries(ORG_LABEL).map(([value, label]) => ({ value, label }))}
            />
            <Select
              label="Hosting constraint"
              value={constraints.hosting}
              onChange={(v) => setConstraints({ ...constraints, hosting: v as Constraints["hosting"] })}
              options={[
                { value: "any", label: "No constraint" },
                { value: "our-cloud", label: "We host it (our cloud)" },
                { value: "client-windows", label: "Client's Windows / Microsoft estate" },
                { value: "client-hosted", label: "Client hosts it themselves" },
              ]}
            />
            <Select
              label="Compliance in scope"
              value={constraints.compliance}
              onChange={(v) => setConstraints({ ...constraints, compliance: v as Constraints["compliance"] })}
              options={[
                { value: "none", label: "None known" },
                { value: "pci", label: "PCI (card data)" },
                { value: "hipaa", label: "HIPAA (health data)" },
                { value: "soc2", label: "SOC 2" },
              ]}
            />
            <Select
              label="Who maintains it after handoff?"
              value={constraints.maintainer}
              onChange={(v) => setConstraints({ ...constraints, maintainer: v as Constraints["maintainer"] })}
              options={[
                { value: "studio", label: "We do (retainer)" },
                { value: "client-tech", label: "Client's technical team" },
                { value: "client-nontech", label: "Client, no developers" },
              ]}
            />
            <Select
              label="Budget posture"
              value={constraints.budget}
              onChange={(v) => setConstraints({ ...constraints, budget: v as Constraints["budget"] })}
              options={[
                { value: "lean", label: "Lean" },
                { value: "standard", label: "Standard" },
                { value: "premium", label: "Premium" },
              ]}
            />
            <label className="flex flex-col gap-1">
              <span className="kpi-label">Must work offline?</span>
              <div className="flex h-9 items-center gap-2">
                <Chip
                  active={!constraints.offline}
                  onClick={() => setConstraints({ ...constraints, offline: false })}
                >
                  No
                </Chip>
                <Chip
                  active={constraints.offline}
                  onClick={() => setConstraints({ ...constraints, offline: true })}
                >
                  Yes — field conditions
                </Chip>
              </div>
            </label>
          </div>

          <div>
            <p className="kpi-label mb-1.5">Maintaining team already writes</p>
            <div className="flex flex-wrap gap-1.5">
              {TEAM_CHOICES.map((t) => (
                <Chip
                  key={t}
                  active={constraints.team.includes(t)}
                  onClick={() =>
                    setConstraints({
                      ...constraints,
                      team: constraints.team.includes(t)
                        ? constraints.team.filter((x) => x !== t)
                        : [...constraints.team, t],
                    })
                  }
                >
                  {t}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <p className="kpi-label mb-1.5">
              Your existing estate — what already runs in production
            </p>
            <p className="mb-2 text-xs text-muted-foreground">
              This is a scoring input, not decoration. A recommendation that adds a new runtime to
              your estate gets penalised and says so; one that matches your house stack gets credit.
            </p>
            <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
              {STACKS.map((s) => {
                const entry = profile.estate.find((e) => e.stackName === s.name);
                const count = entry?.count ?? 0;
                return (
                  <div
                    key={s.name}
                    className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm ${
                      count > 0 ? "border-gold/50 bg-gold/5" : "border-border"
                    }`}
                  >
                    <span className="min-w-0 flex-1 truncate">{s.name}</span>
                    <button
                      type="button"
                      aria-label={`Remove one ${s.name} project`}
                      className="px-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                      disabled={count === 0}
                      onClick={() =>
                        setProfile({
                          ...profile,
                          estate: profile.estate
                            .map((e) => (e.stackName === s.name ? { ...e, count: e.count - 1 } : e))
                            .filter((e) => e.count > 0),
                        })
                      }
                    >
                      −
                    </button>
                    <span className={`w-5 text-center font-mono text-xs ${count > 0 ? "text-gold-bright" : "text-muted-foreground"}`}>
                      {count}
                    </span>
                    <button
                      type="button"
                      aria-label={`Add one ${s.name} project`}
                      className="px-1 text-muted-foreground hover:text-foreground"
                      onClick={() =>
                        setProfile({
                          ...profile,
                          estate: entry
                            ? profile.estate.map((e) =>
                                e.stackName === s.name ? { ...e, count: e.count + 1 } : e,
                              )
                            : [...profile.estate, { stackName: s.name, count: 1 }],
                        })
                      }
                    >
                      +
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
