"use client";

import { AlertTriangle, FileText, X } from "lucide-react";

import type { Destination } from "@/lib/destination";
import {
  trayConflicts,
  type Constraints,
  type ContextProfile,
  type Tray,
} from "@/lib/engine";
import { ALL_ARCHETYPES } from "@/lib/stack-atlas-families";
import { Mark } from "@/components/atlas/mark";
import { Button } from "@/components/atlas/ui";

const SLOTS: { key: keyof Tray; label: string }[] = [
  { key: "language", label: "Language" },
  { key: "framework", label: "Framework" },
  { key: "data", label: "Data" },
  { key: "hosting", label: "Hosting" },
  { key: "auth", label: "Auth" },
];

/**
 * The accumulating stack. Always in view, because the whole point of the flow
 * is that browsing turns into assembling — and the tray argues back when a
 * combination is going to cost money.
 */
export function TrayRail({
  tray,
  setTray,
  profile,
  constraints,
  destination,
  onBrief,
}: {
  tray: Tray;
  setTray: (t: Tray) => void;
  profile: ContextProfile;
  constraints: Constraints;
  destination: Destination | null;
  onBrief: () => void;
}) {
  const archetype = tray.archetypeId
    ? ALL_ARCHETYPES.find((a) => a.id === tray.archetypeId)
    : null;
  const conflicts = trayConflicts(tray, profile, constraints, destination);
  const filled = SLOTS.filter((s) => tray[s.key]).length + (tray.integrations.length > 0 ? 1 : 0);

  return (
    <aside className="space-y-3 rounded-lg border border-border bg-card/60 p-4">
      <div className="flex items-baseline justify-between">
        <p className="eyebrow">Your stack</p>
        {filled > 0 || archetype ? (
          <button
            type="button"
            onClick={() =>
              setTray({
                archetypeId: null,
                language: null,
                framework: null,
                data: null,
                hosting: null,
                auth: null,
                integrations: [],
                rationale: "",
              })
            }
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        ) : null}
      </div>

      {archetype ? (
        <p className="text-sm">
          <span className="kpi-label">Project type</span> {archetype.label}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Pick a project type to begin — the atlas pre-fills its default stack, and everything in
          the reference volumes gets an &ldquo;add&rdquo; button.
        </p>
      )}

      <div className="space-y-1.5">
        {SLOTS.map(({ key, label }) => {
          const value = tray[key] as string | null;
          return (
            <div key={key} className="flex items-center gap-2 rounded-md border border-border/70 px-2.5 py-1.5">
              <span className="kpi-label w-20 shrink-0">{label}</span>
              {value ? (
                <>
                  <Mark name={value} />
                  <span className="min-w-0 flex-1 truncate text-sm">{value}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${label}`}
                    onClick={() => setTray({ ...tray, [key]: null })}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                <span className="text-sm text-muted-foreground/60">—</span>
              )}
            </div>
          );
        })}

        <div className="rounded-md border border-border/70 px-2.5 py-1.5">
          <span className="kpi-label">Integrations</span>
          {tray.integrations.length === 0 ? (
            <p className="text-sm text-muted-foreground/60">—</p>
          ) : (
            <div className="mt-1 flex flex-wrap gap-1">
              {tray.integrations.map((i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs"
                >
                  {i}
                  <button
                    type="button"
                    aria-label={`Remove ${i}`}
                    onClick={() =>
                      setTray({ ...tray, integrations: tray.integrations.filter((x) => x !== i) })
                    }
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {conflicts.length > 0 ? (
        <div className="space-y-1.5">
          {conflicts.map((c, i) => (
            <div
              key={i}
              className={`flex gap-2 rounded-md border p-2.5 text-xs ${
                c.severity === "finding"
                  ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
                  : "border-gold-bright/40 bg-gold-bright/10 text-gold-bright"
              }`}
            >
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{c.text}</span>
            </div>
          ))}
        </div>
      ) : null}

      <textarea
        value={tray.rationale}
        onChange={(e) => setTray({ ...tray, rationale: e.target.value })}
        rows={2}
        placeholder="The constraint that decided it…"
        className="w-full rounded-md border border-border bg-navy/40 px-2.5 py-2 text-sm placeholder:text-muted-foreground/60"
      />

      <Button onClick={onBrief} disabled={!archetype} className="w-full justify-center">
        <FileText className="h-4 w-4" /> Build the brief
      </Button>
    </aside>
  );
}
