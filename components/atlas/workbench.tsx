"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Compass, HelpCircle, Home } from "lucide-react";

import {
  DEFAULT_CONSTRAINTS,
  DEFAULT_PROFILE,
  EMPTY_TRAY,
  load,
  rankOptions,
  save,
  type Constraints,
  type ContextProfile,
  type Tray,
} from "@/lib/engine";
import { describeDestination, type Destination } from "@/lib/destination";
import type { ProjectArchetype } from "@/lib/stack-atlas";
import { WEIGHT_ACCENT } from "@/lib/stack-atlas";
import {
  ALL_ARCHETYPES,
  ESTATE_CHECKLIST,
  FAMILIES,
  familyOf,
} from "@/lib/stack-atlas-families";
import { Brief } from "@/components/atlas/brief";
import { ContextPanel } from "@/components/atlas/context-panel";
import { DestinationStep } from "@/components/atlas/destination";
import { Mark } from "@/components/atlas/mark";
import { TrayRail } from "@/components/atlas/tray";
import { Badge, Button, SectionLabel } from "@/components/atlas/ui";
import { REFERENCE_TOTAL, VOLUMES, VolumeBrowser } from "@/components/atlas/volumes";
import { Wizard } from "@/components/atlas/wizard";

type View =
  | { kind: "destination" }
  | { kind: "start" }
  | { kind: "wizard" }
  | { kind: "archetype"; id: string }
  | { kind: "volume"; key: string }
  | { kind: "brief" };

export function Workbench() {
  const [view, setView] = useState<View>({ kind: "start" });
  const [profile, setProfile] = useState<ContextProfile>(DEFAULT_PROFILE);
  const [constraints, setConstraints] = useState<Constraints>(DEFAULT_CONSTRAINTS);
  const [tray, setTray] = useState<Tray>(EMPTY_TRAY);
  // null is a first-class value here: "no destination set" is a real state the
  // ranking reads, not an empty form waiting to be filled.
  const [destination, setDestination] = useState<Destination | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // localStorage round-trip after mount, so SSR markup stays deterministic.
  useEffect(() => {
    setProfile(load("profile", DEFAULT_PROFILE));
    setConstraints(load("constraints", DEFAULT_CONSTRAINTS));
    setTray(load("tray", EMPTY_TRAY));
    setDestination(load<Destination | null>("destination", null));
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated) save("profile", profile);
  }, [profile, hydrated]);
  useEffect(() => {
    if (hydrated) save("constraints", constraints);
  }, [constraints, hydrated]);
  useEffect(() => {
    if (hydrated) save("tray", tray);
  }, [tray, hydrated]);
  useEffect(() => {
    if (hydrated) save("destination", destination);
  }, [destination, hydrated]);

  function openArchetype(id: string) {
    setView({ kind: "archetype", id });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20">
      <header className="flex items-center gap-3 border-b border-border/70 py-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-gold bg-gold/5">
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
            <path d="M8 1.4 L14.6 8 L8 14.6 L1.4 8 Z" fill="#c8a878" />
          </svg>
        </span>
        <div>
          <p className="font-display text-xl font-semibold leading-tight">Plumbline</p>
          <p className="eyebrow">Build it true.</p>
        </div>
        <nav className="ml-auto flex items-center gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setView({ kind: "destination" })}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm ${view.kind === "destination" ? "bg-gold/15 text-gold-bright" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Compass className="h-3.5 w-3.5" />
            {destination ? "Destination" : "Set destination"}
          </button>
          <button
            type="button"
            onClick={() => setView({ kind: "start" })}
            className={`rounded-md px-3 py-1.5 text-sm ${view.kind === "start" || view.kind === "archetype" || view.kind === "wizard" ? "bg-gold/15 text-gold-bright" : "text-muted-foreground hover:text-foreground"}`}
          >
            Workbench
          </button>
          {VOLUMES.map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => setView({ kind: "volume", key: v.key })}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm ${view.kind === "volume" && view.key === v.key ? "bg-gold/15 text-gold-bright" : "text-muted-foreground hover:text-foreground"}`}
            >
              {v.label}
            </button>
          ))}
        </nav>
      </header>

      {view.kind === "brief" ? (
        <main className="pt-6">
          <Brief
            tray={tray}
            profile={profile}
            constraints={constraints}
            destination={destination}
            onBack={() => setView(tray.archetypeId ? { kind: "archetype", id: tray.archetypeId } : { kind: "start" })}
          />
        </main>
      ) : (
        <>
          <div className="pt-5">
            <ContextPanel
              profile={profile}
              setProfile={setProfile}
              constraints={constraints}
              setConstraints={setConstraints}
            />
          </div>

          <main className="grid gap-6 pt-6 lg:grid-cols-[1fr,20rem]">
            <div className="min-w-0">
              {view.kind === "destination" ? (
                <DestinationStep
                  initial={destination}
                  onDone={(d) => {
                    setDestination(d);
                    setView({ kind: "start" });
                  }}
                  onSkip={() => {
                    setDestination(null);
                    setView({ kind: "start" });
                  }}
                />
              ) : view.kind === "start" ? (
                <StartGrid onOpen={openArchetype} onWizard={() => setView({ kind: "wizard" })} />
              ) : view.kind === "wizard" ? (
                <Wizard onPick={openArchetype} onBack={() => setView({ kind: "start" })} />
              ) : view.kind === "archetype" ? (
                <ArchetypeView
                  id={view.id}
                  profile={profile}
                  constraints={constraints}
                  destination={destination}
                  onDestination={() => setView({ kind: "destination" })}
                  tray={tray}
                  setTray={setTray}
                  onBack={() => setView({ kind: "start" })}
                  onVolume={(key) => setView({ kind: "volume", key })}
                />
              ) : (
                <VolumeBrowser volumeKey={view.key} tray={tray} setTray={setTray} />
              )}
            </div>

            <div className="lg:sticky lg:top-4 lg:self-start">
              <TrayRail
                tray={tray}
                setTray={setTray}
                profile={profile}
                constraints={constraints}
                destination={destination}
                onBrief={() => setView({ kind: "brief" })}
              />
            </div>
          </main>
        </>
      )}

      <footer className="mt-16 border-t border-border/70 pt-6 text-center">
        <p className="mb-2 text-[10px] tracking-[0.3em] text-gold">◆ &nbsp;BUILD IT TRUE.&nbsp; ◆</p>
        <p className="text-xs text-muted-foreground">
          <b className="text-foreground">Plumbline</b> · {ALL_ARCHETYPES.length} project types ·{" "}
          {REFERENCE_TOTAL} reference entries · recommendations are ranked against your context and
          estate, and every adjustment shows its reason.
        </p>
      </footer>
    </div>
  );
}

/* -------------------------------- start --------------------------------- */

function StartGrid({ onOpen, onWizard }: { onOpen: (id: string) => void; onWizard: () => void }) {
  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Start here</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
          What are you <em className="italic text-gold">building</em>?
        </h1>
        <p className="mt-2 max-w-prose text-sm text-muted-foreground">
          Pick the project type and the atlas assembles a stack against your context — org type,
          constraints, and what you already run. Or, if it doesn&apos;t have a name yet:
        </p>
        <div className="mt-3">
          <Button variant="outline" onClick={onWizard}>
            <HelpCircle className="h-4 w-4" /> Not sure? Answer five questions
          </Button>
        </div>
      </div>

      {FAMILIES.map((family) => {
        const items = ALL_ARCHETYPES.filter((a) => familyOf(a.id) === family);
        if (!items.length) return null;
        return (
          <section key={family}>
            <h2 className="mb-3 border-l-2 border-gold pl-3 text-lg">
              {family} <span className="eyebrow">{items.length}</span>
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => onOpen(a.id)}
                  className="flex flex-col gap-2 rounded-lg border border-border bg-card/60 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-gold"
                >
                  <h3 className="text-base font-semibold">{a.label}</h3>
                  <p className="text-[13px] leading-snug text-muted-foreground">{a.blurb}</p>
                  <div className="mt-auto flex items-center gap-1.5 pt-1.5">
                    {a.stacks.slice(0, 4).map((s, i) => (
                      <Mark key={i} name={s.framework} />
                    ))}
                    <Badge className={`ml-auto ${WEIGHT_ACCENT[a.weight]}`}>{a.weight}</Badge>
                  </div>
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/* ------------------------------ archetype ------------------------------- */

function ArchetypeView({
  id,
  profile,
  constraints,
  destination,
  onDestination,
  tray,
  setTray,
  onBack,
  onVolume,
}: {
  id: string;
  profile: ContextProfile;
  constraints: Constraints;
  destination: Destination | null;
  onDestination: () => void;
  tray: Tray;
  setTray: (t: Tray) => void;
  onBack: () => void;
  onVolume: (key: string) => void;
}) {
  const archetype = ALL_ARCHETYPES.find((a) => a.id === id);
  if (!archetype) return null;
  const isAudit = archetype.id === "legacy-audit";
  const ranked = rankOptions(archetype, profile, constraints, destination);
  const contextActive =
    profile.estate.length > 0 ||
    constraints.team.length > 0 ||
    constraints.hosting !== "any" ||
    constraints.compliance !== "none" ||
    constraints.maintainer !== "studio" ||
    constraints.budget !== "standard" ||
    constraints.offline;

  function useOption(option: ProjectArchetype["stacks"][number]) {
    setTray({
      ...tray,
      archetypeId: archetype!.id,
      language: option.language,
      framework: option.framework,
    });
  }

  return (
    <div className="space-y-7">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All project types
      </button>

      <div>
        <p className="eyebrow">{familyOf(archetype.id)}</p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight">{archetype.label}</h2>
        <p className="mt-2 max-w-prose text-sm text-muted-foreground">{archetype.blurb}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section>
          <SectionLabel>You are hearing this</SectionLabel>
          <ul className="diamond-list space-y-1.5 text-sm text-muted-foreground">
            {archetype.signals.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </section>
        <section>
          <SectionLabel>Ask before quoting</SectionLabel>
          <ul className="diamond-list space-y-1.5 text-sm text-muted-foreground">
            {archetype.questions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </section>
      </div>

      {isAudit ? (
        <section>
          <SectionLabel>Estate survey — walk these in order</SectionLabel>
          <div className="rounded-lg border border-border bg-card/60 px-4">
            {ESTATE_CHECKLIST.map((c) => (
              <div
                key={c.area}
                className="flex flex-col gap-1 border-b border-border/60 py-3 last:border-b-0 sm:flex-row sm:gap-4"
              >
                <p className="w-40 shrink-0 pt-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-gold">
                  {c.area}
                </p>
                <p className="text-sm text-muted-foreground">{c.ask}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <SectionLabel>
          {isAudit ? "How to approach it" : "Stack options, ranked for your context"}
        </SectionLabel>
        {!contextActive && !isAudit ? (
          <p className="mb-2 text-xs text-muted-foreground">
            No context set yet — this is the atlas&apos;s neutral ranking. Open{" "}
            <b className="text-foreground">Context</b> above and the order re-argues itself.
          </p>
        ) : null}
        {!isAudit ? (
          destination ? (
            <p className="mb-2.5 rounded-md border border-gold/30 bg-gold/5 px-3 py-2 text-xs text-muted-foreground">
              <b className="text-gold-bright">Ranked for the destination.</b>{" "}
              {describeDestination(destination)}{" "}
              <button type="button" onClick={onDestination} className="text-gold-bright hover:underline">
                Change
              </button>
            </p>
          ) : (
            <p className="mb-2.5 text-xs text-muted-foreground">
              Ranked on today only —{" "}
              <button type="button" onClick={onDestination} className="text-gold-bright hover:underline">
                set a destination
              </button>{" "}
              and each option also gets scored against where this has to end up.
            </p>
          )
        ) : null}
        <div className="space-y-2.5">
          {ranked.map(({ option, score, reasons, houseStack, scoreThen, destinationReasons: destReasons, trajectory }, idx) => {
            const inTray =
              tray.language === option.language && tray.framework === option.framework;
            return (
              <div
                key={`${option.language}-${option.framework}`}
                className={`rounded-lg border bg-card/60 p-4 ${idx === 0 ? "border-gold/60" : "border-border"}`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Mark name={option.language} size="md" />
                  <span className="font-semibold">{option.language}</span>
                  <span className="text-muted-foreground/60">/</span>
                  <Mark name={option.framework} size="md" />
                  <span className="font-semibold">{option.framework}</span>
                  {houseStack ? (
                    <Badge className="border-gold/50 bg-gold/10 text-gold-bright">
                      <Home className="mr-1 h-3 w-3" /> House stack
                    </Badge>
                  ) : null}
                  <span className="ml-auto flex items-baseline gap-1.5 font-mono text-xs text-muted-foreground">
                    <span title="Scored against the project today">
                      {score > 0 ? "+" : ""}
                      {score}
                    </span>
                    {scoreThen !== null ? (
                      <>
                        <span aria-hidden className="opacity-50">&rarr;</span>
                        <span
                          title="Scored against the destination"
                          className={
                            scoreThen < score - 4
                              ? "text-rose-400"
                              : scoreThen > score + 4
                                ? "text-emerald-400"
                                : "text-muted-foreground"
                          }
                        >
                          {scoreThen > 0 ? "+" : ""}
                          {scoreThen}
                        </span>
                      </>
                    ) : null}
                  </span>
                  <Button
                    variant={idx === 0 ? "solid" : "outline"}
                    onClick={() => useOption(option)}
                    disabled={inTray}
                  >
                    {inTray ? "In your stack" : "Use this stack"}
                  </Button>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{option.why}</p>
                <ul className="mt-2 space-y-0.5">
                  {reasons.slice(0, 5).map((r, i) => (
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
                {destReasons.length > 0 ? (
                  <div className="mt-2.5 border-t border-border/60 pt-2">
                    <p className="mb-1 font-mono text-[0.6rem] uppercase tracking-wider text-gold">
                      At the destination
                    </p>
                    <ul className="space-y-0.5">
                      {destReasons.slice(0, 4).map((r, i) => (
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
                ) : null}
                {trajectory ? (
                  <p className="mt-2 text-xs italic text-muted-foreground">{trajectory}</p>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <SectionLabel>Do not do this</SectionLabel>
        <div className="space-y-2">
          {archetype.avoid.map((v) => (
            <div
              key={v.what}
              className="rounded-lg border border-border border-l-2 border-l-rose-500/70 bg-card/60 p-3"
            >
              <p className="text-sm font-medium">{v.what}</p>
              <p className="text-sm text-muted-foreground">{v.why}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card/40 p-4 text-sm text-muted-foreground">
        Language and framework are set — now fill the rest of the tray from the volumes:{" "}
        <button type="button" onClick={() => onVolume("infra")} className="text-gold-bright hover:underline">
          data &amp; hosting
        </button>
        ,{" "}
        <button type="button" onClick={() => onVolume("auth")} className="text-gold-bright hover:underline">
          auth
        </button>
        , and{" "}
        <button type="button" onClick={() => onVolume("protocols")} className="text-gold-bright hover:underline">
          the protocols and formats
        </button>{" "}
        this project has to speak.
      </section>
    </div>
  );
}
