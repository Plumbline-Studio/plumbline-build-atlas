"use client";

import { useMemo } from "react";

import type { StageAdvice } from "@/lib/delivery-engine";
import { DELIVERY, type DeliveryEntry } from "@/lib/stack-atlas-delivery";

/**
 * The puzzle, drawn from the data.
 *
 * Two halves, because they are two different jobs. The stage spine is a grid of
 * real buttons — it has to be responsive, keyboard-reachable and clickable, all
 * of which HTML does better than SVG. The composition graph underneath is a
 * genuine drawing: which piece hands off to which is the thing prose cannot say
 * quickly, and it is generated from `feeds`, so it can never disagree with the
 * entries it describes.
 */

const VERDICT_TONE: Record<StageAdvice["verdict"], string> = {
  needed: "border-gold/60 bg-gold/10",
  "not-yet": "border-border/60 bg-transparent border-dashed",
  covered: "border-emerald-500/30 bg-emerald-500/5",
};

const VERDICT_LABEL: Record<StageAdvice["verdict"], string> = {
  needed: "Needed",
  "not-yet": "Not yet",
  covered: "Covered",
};

const VERDICT_PILL: Record<StageAdvice["verdict"], string> = {
  needed: "border-gold/50 bg-gold/15 text-gold-bright",
  "not-yet": "border-border text-muted-foreground",
  covered: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
};

export function StageSpine({
  chain,
  selected,
  onSelect,
}: {
  chain: StageAdvice[];
  selected: string | null;
  onSelect: (stage: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {chain.map((s, i) => {
        const shown = s.chosen[0] ?? s.recommended;
        const isSel = selected === s.stage;
        return (
          <button
            key={s.stage}
            type="button"
            onClick={() => onSelect(s.stage)}
            aria-pressed={isSel}
            className={`flex flex-col gap-1.5 rounded-lg border p-3 text-left transition ${VERDICT_TONE[s.verdict]} ${
              isSel ? "ring-1 ring-gold" : "hover:border-gold/50"
            }`}
          >
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-[0.6rem] text-muted-foreground tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-sm font-semibold">{s.label}</span>
            </div>
            <p className="text-[0.7rem] leading-snug text-muted-foreground">{s.question}</p>
            <div className="mt-auto flex flex-wrap items-center gap-1 pt-1">
              <span
                className={`inline-flex items-center rounded-full border px-1.5 py-0.5 font-mono text-[0.55rem] uppercase tracking-wider ${VERDICT_PILL[s.verdict]}`}
              >
                {VERDICT_LABEL[s.verdict]}
              </span>
              {s.verdict === "covered" ? (
                <span className="truncate text-[0.7rem] text-muted-foreground">{s.coveredBy}</span>
              ) : shown ? (
                <span
                  className={`truncate text-[0.7rem] ${s.chosen.length ? "text-foreground" : "text-muted-foreground italic"}`}
                >
                  {shown.name}
                </span>
              ) : null}
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* --------------------------- the composition map ------------------------ */

interface Node {
  entry: DeliveryEntry;
  x: number;
  y: number;
  inChain: boolean;
}

const NODE_W = 132;
const NODE_H = 34;
const COL_GAP = 46;
const ROW_GAP = 14;
const PAD = 14;

/**
 * Nodes are placed by stage (left to right, the order work actually happens in)
 * and stacked within a stage. Edges come from `feeds`. Only pieces that are in
 * the chain or recommended for it are drawn — the whole volume at once is an
 * inventory, not an argument.
 */
export function CompositionMap({ chain }: { chain: StageAdvice[] }) {
  const { nodes, edges, width, height } = useMemo(() => {
    const byStage = chain.map((s) => {
      const picks = s.chosen.length ? s.chosen : s.recommended ? [s.recommended] : [];
      return { stage: s, picks: s.verdict === "not-yet" ? [] : picks };
    });

    const live = byStage.filter((c) => c.picks.length > 0);
    const nodes: Node[] = [];
    live.forEach((col, ci) => {
      col.picks.forEach((entry, ri) => {
        nodes.push({
          entry,
          x: PAD + ci * (NODE_W + COL_GAP),
          y: PAD + 20 + ri * (NODE_H + ROW_GAP),
          inChain: col.stage.chosen.some((c) => c.name === entry.name),
        });
      });
    });

    const index = new Map(nodes.map((n) => [n.entry.name, n]));
    const edges: { from: Node; to: Node }[] = [];
    for (const n of nodes) {
      for (const target of n.entry.feeds) {
        const to = index.get(target);
        // Only forward edges: a backwards arrow on a left-to-right spine reads
        // as a mistake even when the relationship is real.
        if (to && to.x > n.x) edges.push({ from: n, to });
      }
    }

    const maxRows = Math.max(1, ...live.map((c) => c.picks.length));
    return {
      nodes,
      edges,
      width: Math.max(320, PAD * 2 + live.length * NODE_W + Math.max(0, live.length - 1) * COL_GAP),
      height: PAD * 2 + 20 + maxRows * NODE_H + Math.max(0, maxRows - 1) * ROW_GAP,
    };
  }, [chain]);

  if (nodes.length < 2) {
    return (
      <p className="rounded-lg border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
        Add a second piece to your chain and the hand-offs between them get drawn here.
      </p>
    );
  }

  const liveStages = chain.filter((s) => (s.chosen.length ? s.chosen : s.recommended ? [s.recommended] : []).length > 0 && s.verdict !== "not-yet");

  return (
    <figure className="m-0 flex flex-col gap-2">
      <div className="overflow-x-auto rounded-lg border border-border bg-card/40 p-1">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
          role="img"
          aria-label={`Hand-offs in the delivery chain: ${edges
            .map((e) => `${e.from.entry.name} feeds ${e.to.entry.name}`)
            .join("; ") || "no hand-offs yet"}.`}
          className="block h-auto max-w-full"
          style={{ minWidth: width }}
        >
          <defs>
            <marker id="dm-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
            </marker>
          </defs>

          {liveStages.map((s, i) => (
            <text
              key={s.stage}
              x={PAD + i * (NODE_W + COL_GAP)}
              y={PAD + 8}
              className="fill-current opacity-50"
              fontSize="9"
              fontFamily="ui-monospace, monospace"
              letterSpacing="1"
            >
              {s.label.toUpperCase()}
            </text>
          ))}

          {edges.map((e, i) => {
            const x1 = e.from.x + NODE_W;
            const y1 = e.from.y + NODE_H / 2;
            const x2 = e.to.x;
            const y2 = e.to.y + NODE_H / 2;
            const mid = (x1 + x2) / 2;
            return (
              <path
                key={i}
                d={`M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.1"
                opacity="0.4"
                markerEnd="url(#dm-arrow)"
              />
            );
          })}

          {nodes.map((n) => (
            <g key={n.entry.name}>
              <rect
                x={n.x}
                y={n.y}
                width={NODE_W}
                height={NODE_H}
                rx="4"
                className={n.inChain ? "fill-current opacity-[0.09]" : "fill-none"}
                stroke="currentColor"
                strokeWidth={n.inChain ? 1.4 : 1}
                strokeDasharray={n.inChain ? undefined : "3 3"}
                opacity={n.inChain ? 1 : 0.55}
              />
              <text
                x={n.x + NODE_W / 2}
                y={n.y + NODE_H / 2 + 3.5}
                textAnchor="middle"
                fontSize="10.5"
                className="fill-current"
                opacity={n.inChain ? 0.95 : 0.6}
              >
                {n.entry.name.length > 20 ? `${n.entry.name.slice(0, 19)}…` : n.entry.name}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <figcaption className="text-xs text-muted-foreground">
        Solid pieces are in your chain; dashed are the atlas&rsquo;s recommendation for a stage you
        haven&rsquo;t filled. Arrows are hand-offs taken from each entry&rsquo;s own data, so the
        picture cannot drift from the reasoning.
      </figcaption>
    </figure>
  );
}

/** Every entry at a stage, for the detail panel. */
export function stageEntries(stage: string): DeliveryEntry[] {
  return DELIVERY.filter((e) => e.stage === stage);
}
