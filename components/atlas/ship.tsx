"use client";

import { useMemo, useState } from "react";
import { Check, Plus } from "lucide-react";

import { chainSummary, deliveryChain, type StageAdvice } from "@/lib/delivery-engine";
import type { Destination } from "@/lib/destination";
import type { Constraints, ContextProfile, Tray } from "@/lib/engine";
import { ALL_ARCHETYPES } from "@/lib/stack-atlas-families";
import { SCALE_LABEL } from "@/lib/stack-atlas-delivery";
import { CompositionMap, StageSpine } from "@/components/atlas/delivery-map";
import { Mark } from "@/components/atlas/mark";
import { Badge, SectionLabel, toneClass } from "@/components/atlas/ui";

/**
 * The step the atlas was missing: having chosen what to build it with, decide
 * how it ships and how you will know it is alive.
 *
 * Every stage gets a verdict rather than a recommendation, because for a
 * studio-sized project most of the honest answers are "not yet, and here is
 * what changes that". A tool that only ever recommends is a tool that always
 * recommends too much.
 */
export function ShipView({
  tray,
  setTray,
  profile,
  constraints,
  destination,
}: {
  tray: Tray;
  setTray: (t: Tray) => void;
  profile: ContextProfile;
  constraints: Constraints;
  destination: Destination | null;
}) {
  const archetype = tray.archetypeId ? ALL_ARCHETYPES.find((a) => a.id === tray.archetypeId) ?? null : null;
  const chain = useMemo(
    () => deliveryChain(archetype, profile, constraints, tray, destination),
    [archetype, profile, constraints, tray, destination],
  );
  const [open, setOpen] = useState<string | null>(chain.find((s) => s.verdict === "needed")?.stage ?? null);

  const detail = chain.find((s) => s.stage === open) ?? null;

  function add(name: string) {
    if (tray.delivery.includes(name)) return;
    setTray({ ...tray, delivery: [...tray.delivery, name] });
  }
  function remove(name: string) {
    setTray({ ...tray, delivery: tray.delivery.filter((d) => d !== name) });
  }

  return (
    <div className="space-y-7">
      <div>
        <p className="eyebrow">Ship</p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight">
          How it <em className="italic text-gold">ships</em>, and how you know it&rsquo;s alive
        </h2>
        <p className="mt-2 max-w-prose text-sm text-muted-foreground">
          Ten stages, each a question rather than a category. The atlas argues a verdict for each one
          from what it already knows about this project — you answer nothing new here.
        </p>
        <p className="mt-2 font-mono text-xs text-gold-bright">{chainSummary(chain)}</p>
        {!archetype ? (
          <p className="mt-2 rounded-md border border-border/70 bg-card/40 px-3 py-2 text-xs text-muted-foreground">
            No project type picked yet, so this is argued from your context alone. Choose one on the
            Workbench and the sizing sharpens considerably.
          </p>
        ) : null}
      </div>

      <section>
        <SectionLabel>The spine</SectionLabel>
        <StageSpine chain={chain} selected={open} onSelect={(s) => setOpen(s === open ? null : s)} />
      </section>

      {detail ? <StageDetail advice={detail} inTray={tray.delivery} onAdd={add} onRemove={remove} /> : null}

      <section>
        <SectionLabel>How the pieces hand off</SectionLabel>
        <CompositionMap chain={chain} />
      </section>
    </div>
  );
}

function StageDetail({
  advice,
  inTray,
  onAdd,
  onRemove,
}: {
  advice: StageAdvice;
  inTray: string[];
  onAdd: (n: string) => void;
  onRemove: (n: string) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? advice.alternatives : advice.alternatives.slice(0, 3);

  return (
    <section className="rounded-lg border border-gold/40 bg-card/60 p-5">
      <div className="flex flex-wrap items-baseline gap-2">
        <h3 className="text-lg font-semibold">{advice.label}</h3>
        <p className="text-sm text-muted-foreground">{advice.question}</p>
      </div>

      <div className="mt-3 space-y-1.5">
        {advice.reasons.map((r, i) => (
          <p key={i} className="text-sm text-muted-foreground">
            {r.text}
          </p>
        ))}
      </div>

      {advice.verdict === "not-yet" ? (
        <p className="mt-3 rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
          Leaving this empty is a decision, and the brief records it as one. That is the difference
          between not having a thing and not needing it yet.
        </p>
      ) : null}

      {advice.chosen.length || shown.length ? (
        <div className="mt-4 space-y-2">
          {advice.chosen.map((e) => (
            <div key={e.name} className="rounded-lg border border-gold/50 bg-gold/5 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Mark name={e.name} size="md" />
                <span className="font-semibold">{e.name}</span>
                <Badge className={toneClass(e.standing)}>{e.standing}</Badge>
                <Badge className="border-border text-muted-foreground">{SCALE_LABEL[e.scale]}</Badge>
                <button
                  type="button"
                  onClick={() => onRemove(e.name)}
                  className="ml-auto text-xs text-muted-foreground hover:text-foreground"
                >
                  Remove
                </button>
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">{e.whatItIs}</p>
              <p className="mt-1.5 text-sm">
                <b className="text-foreground">Watch for:</b>{" "}
                <span className="text-muted-foreground">{e.watchFor}</span>
              </p>
              <EdgeLine entry={e} />
            </div>
          ))}

          {shown.map(({ entry, score, reasons }) => {
            const held = inTray.includes(entry.name);
            return (
              <div key={entry.name} className="rounded-lg border border-border bg-card/40 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Mark name={entry.name} size="md" />
                  <span className="font-semibold">{entry.name}</span>
                  <Badge className={toneClass(entry.standing)}>{entry.standing}</Badge>
                  <Badge className="border-border text-muted-foreground">{SCALE_LABEL[entry.scale]}</Badge>
                  <span className="ml-auto font-mono text-xs text-muted-foreground">
                    {score > 0 ? "+" : ""}
                    {score}
                  </span>
                  <button
                    type="button"
                    onClick={() => (held ? onRemove(entry.name) : onAdd(entry.name))}
                    className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition ${
                      held
                        ? "border-gold/50 bg-gold/10 text-gold-bright"
                        : "border-border text-muted-foreground hover:border-gold hover:text-foreground"
                    }`}
                  >
                    {held ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                    {held ? "In chain" : "Add to chain"}
                  </button>
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">{entry.whatItIs}</p>
                <p className="mt-1.5 text-sm">
                  <b className="text-foreground">Watch for:</b>{" "}
                  <span className="text-muted-foreground">{entry.watchFor}</span>
                </p>
                <EdgeLine entry={entry} />
                <ul className="mt-2 space-y-0.5">
                  {reasons.slice(0, 3).map((r, i) => (
                    <li key={i} className="flex gap-2 text-xs">
                      <span
                        className={`w-8 shrink-0 text-right font-mono ${r.delta >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                      >
                        {r.delta > 0 ? `+${r.delta}` : r.delta}
                      </span>
                      <span className="text-muted-foreground">{r.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          {advice.alternatives.length > 3 ? (
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="text-xs text-gold-bright hover:underline"
            >
              {showAll ? "Fewer options" : `All ${advice.alternatives.length} options at this stage`}
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

/** The edges, in words. The map draws them; this makes them readable. */
function EdgeLine({ entry }: { entry: { needs: string[]; feeds: string[]; instead: string[] } }) {
  const parts: string[] = [];
  if (entry.needs.length) parts.push(`Needs ${entry.needs.join(", ")}`);
  if (entry.feeds.length) parts.push(`Feeds ${entry.feeds.join(", ")}`);
  if (entry.instead.length) parts.push(`Instead of ${entry.instead.join(", ")}`);
  if (!parts.length) return null;
  return <p className="mt-1.5 font-mono text-[0.7rem] text-muted-foreground/80">{parts.join(" · ")}</p>;
}
