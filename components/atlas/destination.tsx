"use client";

import { useState } from "react";
import { ArrowRight, Compass, SkipForward } from "lucide-react";

import {
  AUTONOMY_LABEL,
  DEFAULT_DESTINATION,
  GROWTH_LABEL,
  HORIZON_LABEL,
  MAGNITUDES,
  SOVEREIGNTY_LABEL,
  magnitudeLabel,
  type Autonomy,
  type Destination,
  type GrowthAxis,
  type Horizon,
  type Magnitude,
  type Sovereignty,
} from "@/lib/destination";
import { Button, SectionLabel } from "@/components/atlas/ui";

/**
 * The first step, and the only one that asks about the future.
 *
 * Deliberately skippable. A destination nobody actually holds is worse than no
 * destination — it produces confident advice about an imagined project — so the
 * skip is a real option presented at the same weight as finishing.
 */

const HORIZON_WHY: Record<Horizon, string> = {
  tool: "One operator, no handover. Ceremony is pure cost.",
  product: "A team depends on it. Someone other than you has to be able to pick it up.",
  platform: "Others build on top. Tenant isolation and stable interfaces stop being optional.",
};

const GROWTH_WHY: Record<GrowthAxis, string> = {
  users: "More people doing the same thing. Absorbed at the edge, usually cheaply.",
  tenants: "More separate organisations, each of whose data must never touch another's.",
  data: "The same users, far more records. Storage and query cost lead the bill.",
  automation: "More work happening without a person. Code volume, not traffic, is what grows.",
};

const SOVEREIGNTY_WHY: Record<Sovereignty, string> = {
  studio: "We host and operate it. Managed platforms are a cost we control.",
  client: "It gets handed over. Their team has to be able to hire against it.",
  portable: "No vendor holds the keys. Runs anywhere with a database and a process.",
};

function Choice<T extends string>({
  value,
  current,
  label,
  why,
  onPick,
}: {
  value: T;
  current: T;
  label: string;
  why?: string;
  onPick: (v: T) => void;
}) {
  const active = value === current;
  return (
    <button
      type="button"
      onClick={() => onPick(value)}
      aria-pressed={active}
      className={`rounded-lg border px-4 py-3 text-left transition ${
        active
          ? "border-gold bg-gold/10 text-foreground"
          : "border-border/70 bg-card/40 text-muted-foreground hover:border-border hover:text-foreground"
      }`}
    >
      <span className="block text-sm font-medium">{label}</span>
      {why ? <span className="mt-1 block text-xs leading-snug opacity-80">{why}</span> : null}
    </button>
  );
}

export function DestinationStep({
  initial,
  onDone,
  onSkip,
}: {
  initial: Destination | null;
  onDone: (d: Destination) => void;
  onSkip: () => void;
}) {
  const [d, setD] = useState<Destination>(initial ?? DEFAULT_DESTINATION);
  const set = <K extends keyof Destination>(k: K, v: Destination[K]) => setD({ ...d, [k]: v });

  // Only offer "then" magnitudes at or above "now" — a shrinking project is a
  // real thing, but it is not a stack question.
  const thenOptions = MAGNITUDES.filter((m) => m >= d.scaleNow);

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Compass size={16} className="text-gold-bright" />
          <SectionLabel>Destination</SectionLabel>
        </div>
        <h2 className="font-display text-2xl font-semibold leading-tight">Where does this need to be?</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">
          A map only gives you a direction if you have somewhere to be. Everything else the atlas asks is about the
          project today; this is the only part that asks what it becomes — and it is what lets the ranking tell you
          which of today&rsquo;s cheap answers gets expensive later.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm font-medium">What is it, three years in?</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {(Object.keys(HORIZON_LABEL) as Horizon[]).map((h) => (
              <Choice key={h} value={h} current={d.horizon} label={HORIZON_LABEL[h]} why={HORIZON_WHY[h]} onPick={(v) => set("horizon", v)} />
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm font-medium">
            What actually grows?{" "}
            <span className="font-normal text-muted-foreground">
              — the four have different architectures, and generic advice gives one
            </span>
          </legend>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(GROWTH_LABEL) as GrowthAxis[]).map((g) => (
              <Choice key={g} value={g} current={d.growth} label={GROWTH_LABEL[g]} why={GROWTH_WHY[g]} onPick={(v) => set("growth", v)} />
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm font-medium">
            How far does it travel?{" "}
            <span className="font-normal text-muted-foreground">— orders of magnitude, not a forecast</span>
          </legend>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">Today</span>
              <div className="flex flex-wrap gap-1.5">
                {MAGNITUDES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={d.scaleNow === m}
                    onClick={() => setD({ ...d, scaleNow: m, scaleThen: Math.max(m, d.scaleThen) as Magnitude })}
                    className={`rounded-md border px-2.5 py-1 font-mono text-xs tabular-nums transition ${
                      d.scaleNow === m ? "border-gold bg-gold/10 text-gold-bright" : "border-border/70 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {magnitudeLabel(m)}
                  </button>
                ))}
              </div>
            </div>
            <ArrowRight size={16} className="mt-5 shrink-0 text-muted-foreground" aria-hidden />
            <div className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">Destination</span>
              <div className="flex flex-wrap gap-1.5">
                {thenOptions.map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={d.scaleThen === m}
                    onClick={() => set("scaleThen", m)}
                    className={`rounded-md border px-2.5 py-1 font-mono text-xs tabular-nums transition ${
                      d.scaleThen === m ? "border-gold bg-gold/10 text-gold-bright" : "border-border/70 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {magnitudeLabel(m)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">Within</span>
              <div className="flex gap-1.5">
                {([1, 3, 5] as const).map((y) => (
                  <button
                    key={y}
                    type="button"
                    aria-pressed={d.years === y}
                    onClick={() => set("years", y)}
                    className={`rounded-md border px-2.5 py-1 font-mono text-xs tabular-nums transition ${
                      d.years === y ? "border-gold bg-gold/10 text-gold-bright" : "border-border/70 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {y}y
                  </button>
                ))}
              </div>
            </div>
          </div>
        </fieldset>

        <div className="grid gap-6 sm:grid-cols-2">
          <fieldset className="flex flex-col gap-3">
            <legend className="text-sm font-medium">How much runs unattended?</legend>
            <div className="flex flex-col gap-2">
              {(Object.keys(AUTONOMY_LABEL) as Autonomy[]).map((a) => (
                <Choice key={a} value={a} current={d.autonomy} label={AUTONOMY_LABEL[a]} onPick={(v) => set("autonomy", v)} />
              ))}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-3">
            <legend className="text-sm font-medium">Who has to be able to run it?</legend>
            <div className="flex flex-col gap-2">
              {(Object.keys(SOVEREIGNTY_LABEL) as Sovereignty[]).map((s) => (
                <Choice
                  key={s}
                  value={s}
                  current={d.sovereignty}
                  label={SOVEREIGNTY_LABEL[s]}
                  why={SOVEREIGNTY_WHY[s]}
                  onPick={(v) => set("sovereignty", v)}
                />
              ))}
            </div>
          </fieldset>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-border/70 pt-5">
        <Button onClick={() => onDone(d)}>Set the destination</Button>
        <button
          type="button"
          onClick={onSkip}
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <SkipForward size={14} aria-hidden />
          Skip — I don&rsquo;t know yet
        </button>
        <p className="w-full text-xs text-muted-foreground sm:w-auto sm:flex-1">
          Skipping is a real answer. Without a destination the atlas ranks on today alone and says so, rather than
          arguing from a future nobody committed to.
        </p>
      </div>
    </div>
  );
}
