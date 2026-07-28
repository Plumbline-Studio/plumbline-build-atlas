"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";

import { suggestArchetypes, WIZARD } from "@/lib/engine";
import { ALL_ARCHETYPES } from "@/lib/stack-atlas-families";
import { Button } from "@/components/atlas/ui";

/**
 * Five questions, three candidates, human decides. The wizard narrows; it does
 * not conclude — an archetype chosen by a person survives the first client
 * meeting better than one chosen by a scorer.
 */
export function Wizard({
  onPick,
  onBack,
}: {
  onPick: (archetypeId: string) => void;
  onBack: () => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const done = WIZARD.every((q) => answers[q.id]);
  const suggestions = done ? suggestArchetypes(answers) : [];
  const top = suggestions[0]?.score ?? 0;

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to project types
      </button>

      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Not sure what to call it?</h2>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          Five questions. You get two or three candidate project types with the reasoning — you
          make the call.
        </p>
      </div>

      <div className="space-y-5">
        {WIZARD.map((q) => (
          <div key={q.id}>
            <p className="mb-1.5 text-sm font-medium">{q.question}</p>
            <div className="flex flex-wrap gap-1.5">
              {q.options.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setAnswers({ ...answers, [q.id]: o.value })}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    answers[q.id] === o.value
                      ? "border-gold bg-gold/15 text-gold-bright"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {done ? (
        <div className="space-y-2 rounded-lg border border-gold/40 bg-card/60 p-4">
          <p className="eyebrow">Closest matches</p>
          {suggestions.map((s, i) => {
            const a = ALL_ARCHETYPES.find((x) => x.id === s.id);
            if (!a) return null;
            const confidence = i === 0 ? "Best fit" : s.score >= top - 2 ? "Close second" : "Also plausible";
            return (
              <div key={s.id} className="flex flex-wrap items-center gap-3 rounded-md border border-border p-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{a.label}</p>
                  <p className="text-xs text-muted-foreground">{a.blurb}</p>
                </div>
                <span className="kpi-label">{confidence}</span>
                <Button onClick={() => onPick(s.id)}>Start here</Button>
              </div>
            );
          })}
          {suggestions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing scored — pick from the grid instead.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
