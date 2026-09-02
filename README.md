# The Build Atlas

Plumbline's stack workbench: start from what you're building, shape it with
your real context — org type, constraints, and the estate you already run —
and leave with a stack brief you can defend.

**How it thinks.** Every recommendation is scored, and every adjustment shows
its reason. Two inputs most stack-pickers ignore are first-class here:

- **Who it's for.** The same "client portal" ask ranks ASP.NET Core first at an
  enterprise with a Windows estate, and Next.js + Supabase first at an SMB.
- **What you already run.** An option matching your existing estate earns
  continuity credit ("already in your estate via Next.js + Supabase ×4"); one
  that introduces a new runtime is penalised and says so. Diverging is allowed
  — the point is that it happens on purpose, in writing.

Behind the workbench: 21 project archetypes and 438 reference entries across
seven volumes (languages, full stacks, protocols, formats, auth, infrastructure,
delivery), each answering *what is it, where do you meet it, what should you
watch for* — with an "add to stack" action so the reference is a parts bin, not
trivia.

**Two inputs that are not about today.** A *destination* (what this becomes,
what actually grows, how far it travels, who has to be able to run it) scores
every option a second time and prints a **lock-in ledger**: which doors this
stack closes, at what scale, and what the exit costs. And the *delivery* volume
answers the question the other six never did — how does it ship, and how do you
know it's alive — as a guided pass over ten stages, each of which can come back
"not yet" with the trigger attached.

## The flow

1. **Destination** — where this has to be in three years. Skippable, and
   skipping is a real answer: without one the atlas ranks on today alone and
   says so.
2. **Start** — pick a project type, answer five questions if it has no name
   yet, or open the Legacy estate audit.
3. **Context** — org type, hosting/compliance/team/budget constraints, and
   your existing estate. The ranking re-argues itself as you change these.
4. **Assemble** — "Use this stack" fills the tray; the reference volumes fill
   the remaining slots (data, hosting, auth, integrations).
5. **The tray argues back** — FTP is called a finding, Mongo under a
   multi-tenant portal a caution, a new-runtime divergence gets flagged.
6. **Ship** — the ten delivery stages, each argued to *needed*, *covered* (your
   host already owns it) or *not yet* (with what changes that). The map is drawn
   from each entry's own `needs`/`feeds`/`instead`, so it cannot drift from the
   reasoning.
7. **Brief** — one page out: picks, reasons, flags, the delivery chain including
   what was deliberately deferred, the lock-in ledger, and the open questions.
   Copy as Markdown or print.

## Deploy

Zero-config Vercel (same stack as `dashboard.toolwright.dev`):

1. [vercel.com/new](https://vercel.com/new) → Import
   `Plumbline-Studio/plumbline-build-atlas` → accept defaults → **Deploy**.
2. You get `plumbline-build-atlas-<hash>.vercel.app` immediately. Add
   `atlas.toolwright.dev` under Domains whenever you want the real name.

Brand logos are inlined at build time (`prebuild` runs
`scripts/build-stack-marks.mjs` against the `simple-icons` package), so the
repo stays free of generated SVG path data and the site makes no runtime
CDN requests. `prebuild` also runs `scripts/check-delivery-edges.mjs`, which
fails the build on a delivery entry referencing a name that does not exist —
a typo there would silently drop a line from the map rather than erroring.

## Local

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # inlines brand marks, typechecks, builds
```

## Layout

```
lib/engine.ts                 scoring, context profile, conflicts, wizard
lib/destination.ts            trajectory, dual scoring, the lock-in ledger
lib/delivery-engine.ts        the ten-stage chain and its verdicts
lib/stack-atlas.ts            20 project archetypes
lib/stack-atlas-families.ts   family grouping + the legacy estate audit
lib/stack-atlas-languages.ts  168 languages
lib/stack-atlas-reference.ts  protocols / formats / auth / infra / stacks (226)
lib/stack-atlas-delivery.ts   delivery & operations (44, with edges)
lib/stack-atlas-marks.ts      name → Simple Icons slug map (MARKS generated)
components/atlas/             workbench, destination, context panel, wizard,
                              tray, volumes, ship, delivery map, brief
scripts/                      brand marks + delivery edge validation (prebuild)
```

## Weaving into the Plumbline Console

**This repo is the source of truth for the atlas's data and engines.** Where
the output goes has changed, and the previous version of this section was
stale in three ways — recorded here rather than quietly rewritten, because
anyone who read it before would otherwise repeat the mistake:

- The `plumbline-dashboard` **app is retired**. The Command Board — a Supabase
  Edge Function rendering live from the database on every load — replaced it.
  There is no longer a Next.js app to copy component files into.
- There is **no `engagement_stack_evals` table**. There never was, in the
  current project.
- There is **no `recordStackEval` server action**, because the app that would
  have held it is gone.

`repos.language` *does* exist, so the derive-don't-ask idea was half right.

### What actually integrates

The atlas writes to Supabase (`ghddsckqbwrjsjvbjwya`) and the board picks it up
on the next load. **Nothing is republished** — if the board looks stale, the fix
is a database write.

| Table / view | Holds |
|---|---|
| `stack_destinations` | One row per engagement or venture: the trajectory the Destination step captures |
| `stack_evals` | The finished brief — picks, reasons, flags, the delivery chain, and the lock-in ledger |
| `stack_context` (view) | What the atlas should **derive rather than ask**: estate from `repos.language` grouped by venture, org posture from `engagements.client_posture`, horizon and growth hints from `ventures.kind` / `audience` / `stage` |
| `agent_registry` | One row per agent, with a trigger refusing two enabled agents that claim the same artefact in `writes[]` — one writer per artefact, as a constraint rather than advice |

`board_payload()` carries a `stack` object per engagement — the destination and
the open one-way doors — added additively, with every pre-existing key
untouched.

### Two things the Console should still do differently, by design

- **Derive context instead of asking.** `ContextProfile.estate` and the
  destination's opening guesses should come from `stack_context`; the dashboard
  already knows the estate, and asking Kyle to retype it is asking him to
  restate what the database can answer.
- **Persist the brief.** The standalone site keeps profile, destination and
  tray in `localStorage`. Attached to an engagement, the finished decision
  belongs in `stack_evals`, and the delivery chain can additionally be emitted
  into `op_flows` as a Mermaid diagram with a sign-off — which is what that
  table exists for.

Components still copy across as before: `lib/*.ts` verbatim (no dependencies
beyond each other), `components/atlas/*` with the local primitives in
`components/atlas/ui.tsx` swapped for the real `@/components/ui/*`. The
Tailwind token vocabulary is already identical.
