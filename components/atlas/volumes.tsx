"use client";

import { useMemo, useState } from "react";
import { Plus, Search, X } from "lucide-react";

import type { Tray } from "@/lib/engine";
import {
  LANGUAGES,
  LANGUAGE_CATEGORIES,
} from "@/lib/stack-atlas-languages";
import {
  DELIVERY,
  DELIVERY_GROUPS,
  SCALE_LABEL,
} from "@/lib/stack-atlas-delivery";
import {
  AUTH,
  AUTH_GROUPS,
  FORMATS,
  FORMAT_GROUPS,
  INFRA,
  INFRA_GROUPS,
  PROTOCOLS,
  PROTOCOL_GROUPS,
  STACKS,
  STACK_GROUPS,
} from "@/lib/stack-atlas-reference";
import { Mark } from "@/components/atlas/mark";
import { Badge, Chip, toneClass } from "@/components/atlas/ui";

/** Which tray slot an entry lands in when added. */
type SlotAction =
  | { slot: "language" | "data" | "hosting" | "auth"; value: string }
  | { slot: "integrations"; value: string }
  | { slot: "delivery"; value: string }
  | { slot: "base"; stackName: string };

interface RefRow {
  name: string;
  group: string;
  toneLabel: string;
  chip?: string;
  what?: string;
  pairs: [string, string][];
  risk?: string;
  layers?: [string, string][];
  marked?: boolean;
  action?: SlotAction;
}

interface Volume {
  key: string;
  label: string;
  placeholder: string;
  groups: readonly string[];
  rows: RefRow[];
}

function infraAction(group: string, name: string): SlotAction {
  if (["Relational databases", "NoSQL & search", "Analytics & warehouse", "Managed platforms"].includes(group))
    return { slot: "data", value: name };
  if (["Web & app servers", "Hosting & runtime"].includes(group)) return { slot: "hosting", value: name };
  return { slot: "integrations", value: name };
}

export const VOLUMES: Volume[] = [
  {
    key: "languages",
    label: "Languages",
    placeholder: "Language, framework, or use case…",
    groups: LANGUAGE_CATEGORIES,
    rows: LANGUAGES.map((l) => ({
      name: l.name,
      group: l.category,
      toneLabel: l.standing,
      chip: `${l.year} · ${l.typing}`,
      pairs: [
        ["Backends", l.frameworks],
        ["Used for", l.useCases],
      ] as [string, string][],
      marked: true,
      action: { slot: "language", value: l.name },
    })),
  },
  {
    key: "stacks",
    label: "Full stacks",
    placeholder: "Stack, framework, or what it's good for…",
    groups: STACK_GROUPS,
    rows: STACKS.map((s) => ({
      name: s.name,
      group: s.group,
      toneLabel: s.standing,
      pairs: [["Best for", s.bestFor]] as [string, string][],
      risk: s.watchOutFor,
      layers: [
        ["Front end", s.frontEnd],
        ["Back end", s.backEnd],
        ["Data", s.data],
        ["Hosting", s.hosting],
      ] as [string, string][],
      marked: true,
      action: { slot: "base", stackName: s.name },
    })),
  },
  {
    key: "protocols",
    label: "Protocols",
    placeholder: "Protocol, port, or where you meet it…",
    groups: PROTOCOL_GROUPS,
    rows: PROTOCOLS.map((p) => ({
      name: p.name,
      group: p.group,
      toneLabel: p.posture,
      chip: p.port,
      what: p.whatItIs,
      pairs: [["Where you meet it", p.whereYouMeetIt]] as [string, string][],
      risk: p.watchFor,
      action: { slot: "integrations", value: p.name },
    })),
  },
  {
    key: "formats",
    label: "Formats",
    placeholder: "Format, standard, or industry…",
    groups: FORMAT_GROUPS,
    rows: FORMATS.map((x) => ({
      name: x.name,
      group: x.group,
      toneLabel: `${x.effort} effort`,
      what: x.whatItIs,
      pairs: [["Where you meet it", x.whereYouMeetIt]] as [string, string][],
      risk: x.watchFor,
      action: { slot: "integrations", value: x.name },
    })),
  },
  {
    key: "auth",
    label: "Auth",
    placeholder: "Standard, flow, or failure mode…",
    groups: AUTH_GROUPS,
    rows: AUTH.map((a) => ({
      name: a.name,
      group: a.group,
      toneLabel: a.posture,
      what: a.whatItIs,
      pairs: [["Where you meet it", a.whereYouMeetIt]] as [string, string][],
      risk: a.watchFor,
      action: { slot: "auth", value: a.name },
    })),
  },
  {
    key: "infra",
    label: "Infrastructure",
    placeholder: "Database, server, or middleware…",
    groups: INFRA_GROUPS,
    rows: INFRA.map((i) => ({
      name: i.name,
      group: i.group,
      toneLabel: i.standing,
      what: i.whatItIs,
      pairs: [["Where you meet it", i.whereYouMeetIt]] as [string, string][],
      risk: i.watchFor,
      marked: true,
      action: infraAction(i.group, i.name),
    })),
  },
  {
    key: "delivery",
    label: "Delivery",
    placeholder: "Pipeline, container, secret store, dashboard…",
    groups: DELIVERY_GROUPS,
    rows: DELIVERY.map((d) => ({
      name: d.name,
      group: d.group,
      toneLabel: d.standing,
      chip: SCALE_LABEL[d.scale],
      what: d.whatItIs,
      pairs: [
        ["Where you meet it", d.whereYouMeetIt],
        ["When you need it", d.whenYouNeedIt],
        ["Not yet, if", d.notYet],
        [
          "Fits with",
          [
            d.needs.length ? `needs ${d.needs.join(", ")}` : "",
            d.feeds.length ? `feeds ${d.feeds.join(", ")}` : "",
            d.instead.length ? `instead of ${d.instead.join(", ")}` : "",
          ]
            .filter(Boolean)
            .join(" · ") || "stands alone",
        ],
      ] as [string, string][],
      risk: d.watchFor,
      marked: true,
      action: { slot: "delivery", value: d.name },
    })),
  },
];

export const REFERENCE_TOTAL = VOLUMES.reduce((n, v) => n + v.rows.length, 0);

/** Effort tone for `${effort} effort` labels. */
function tone(label: string) {
  return toneClass(label.replace(" effort", ""));
}

export function VolumeBrowser({
  volumeKey,
  tray,
  setTray,
}: {
  volumeKey: string;
  tray: Tray;
  setTray: (t: Tray) => void;
}) {
  const volume = VOLUMES.find((v) => v.key === volumeKey) ?? VOLUMES[0];
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("All");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return volume.rows.filter((r) => {
      if (group !== "All" && r.group !== group) return false;
      if (!q) return true;
      return [r.name, r.group, r.chip, r.what, r.risk, ...r.pairs.map(([, v]) => v)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [volume, query, group]);

  const grouped = useMemo(
    () =>
      volume.groups
        .map((g) => [g, rows.filter((r) => r.group === g)] as [string, RefRow[]])
        .filter(([, items]) => items.length > 0),
    [volume, rows],
  );

  function apply(action: SlotAction) {
    if (action.slot === "base") {
      const s = STACKS.find((x) => x.name === action.stackName);
      if (!s) return;
      setTray({
        ...tray,
        framework: s.backEnd,
        data: s.data,
        hosting: s.hosting,
      });
      return;
    }
    if (action.slot === "integrations" || action.slot === "delivery") {
      const current = tray[action.slot];
      if (!current.includes(action.value)) {
        setTray({ ...tray, [action.slot]: [...current, action.value] });
      }
      return;
    }
    setTray({ ...tray, [action.slot]: action.value });
  }

  function isInTray(action?: SlotAction): boolean {
    if (!action) return false;
    if (action.slot === "base") return false;
    if (action.slot === "integrations" || action.slot === "delivery")
      return tray[action.slot].includes(action.value);
    return tray[action.slot] === action.value;
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={volume.placeholder}
          aria-label={`Search ${volume.label}`}
          className="h-10 w-full rounded-md border border-border bg-card pl-8 pr-8 text-sm placeholder:text-muted-foreground/60 focus:border-gold focus:outline-none"
        />
        {query ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {["All", ...volume.groups].map((g) => (
          <Chip key={g} active={group === g} onClick={() => setGroup(g)}>
            {g}
          </Chip>
        ))}
      </div>

      <p className="eyebrow">
        {rows.length} of {volume.rows.length} {volume.label.toLowerCase()}
        {query.trim() ? ` · matching "${query.trim()}"` : ""}
      </p>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-border bg-card/60 p-6 text-center text-sm text-muted-foreground">
          Nothing matches that. Try a broader term, or clear the category filter.
        </p>
      ) : (
        grouped.map(([title, items]) => (
          <section key={title} className="space-y-2">
            <h3 className="border-l-2 border-gold pl-3 text-lg">
              {title} <span className="eyebrow">{items.length}</span>
            </h3>
            {items.map((r) => (
              <div key={`${r.group}-${r.name}`} className="rounded-lg border border-border bg-card/60 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  {r.marked ? <Mark name={r.name} /> : null}
                  <span className="font-medium">{r.name}</span>
                  {r.chip ? (
                    <span className="rounded border border-border px-1.5 py-0.5 font-mono text-[0.6rem] text-muted-foreground">
                      {r.chip}
                    </span>
                  ) : null}
                  <Badge className={`ml-auto ${tone(r.toneLabel)}`}>{r.toneLabel}</Badge>
                  {r.action ? (
                    <button
                      type="button"
                      onClick={() => apply(r.action!)}
                      disabled={isInTray(r.action)}
                      className="inline-flex items-center gap-1 rounded-full border border-gold/50 px-2.5 py-1 text-xs text-gold-bright transition-colors hover:bg-gold/10 disabled:opacity-40"
                    >
                      <Plus className="h-3 w-3" />
                      {r.action.slot === "base"
                        ? "Use layers"
                        : isInTray(r.action)
                          ? "In stack"
                          : "Add"}
                    </button>
                  ) : null}
                </div>

                {r.what ? <p className="mt-1.5 text-sm opacity-90">{r.what}</p> : null}

                {r.layers ? (
                  <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {r.layers.map(([label, value]) => (
                      <div key={label} className="rounded border border-border/60 p-2">
                        <p className="kpi-label">{label}</p>
                        <p className="text-sm">{value}</p>
                      </div>
                    ))}
                  </div>
                ) : null}

                {r.pairs.map(([label, value]) => (
                  <p key={label} className="mt-1.5 text-sm text-muted-foreground">
                    <span className="kpi-label">{label}</span> {value}
                  </p>
                ))}

                {r.risk ? (
                  <p className="mt-2 border-l-2 border-gold pl-2.5 text-sm text-muted-foreground">
                    <span className="kpi-label">Watch for</span> {r.risk}
                  </p>
                ) : null}
              </div>
            ))}
          </section>
        ))
      )}
    </div>
  );
}
