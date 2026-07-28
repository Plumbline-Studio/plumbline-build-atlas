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

Behind the workbench: 21 project archetypes and 394 reference entries across
six volumes (languages, full stacks, protocols, formats, auth, infrastructure),
each answering *what is it, where do you meet it, what should you watch for* —
with an "add to stack" action so the reference is a parts bin, not trivia.

## The flow

1. **Start** — pick a project type, answer five questions if it has no name
   yet, or open the Legacy estate audit.
2. **Context** — org type, hosting/compliance/team/budget constraints, and
   your existing estate. The ranking re-argues itself as you change these.
3. **Assemble** — "Use this stack" fills the tray; the reference volumes fill
   the remaining slots (data, hosting, auth, integrations).
4. **The tray argues back** — FTP is called a finding, Mongo under a
   multi-tenant portal a caution, a new-runtime divergence gets flagged.
5. **Brief** — one page out: picks, reasons, flags, open questions. Copy as
   Markdown or print.

## Deploy

Zero-config Vercel (same stack as `dashboard.toolwright.dev`):

1. [vercel.com/new](https://vercel.com/new) → Import
   `Plumbline-Studio/plumbline-build-atlas` → accept defaults → **Deploy**.
2. You get `plumbline-build-atlas-<hash>.vercel.app` immediately. Add
   `atlas.toolwright.dev` under Domains whenever you want the real name.

Brand logos are inlined at build time (`prebuild` runs
`scripts/build-stack-marks.mjs` against the `simple-icons` package), so the
repo stays free of generated SVG path data and the site makes no runtime
CDN requests.

## Local

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # inlines brand marks, typechecks, builds
```

## Layout

```
lib/engine.ts                 scoring, context profile, conflicts, wizard
lib/stack-atlas.ts            20 project archetypes
lib/stack-atlas-families.ts   family grouping + the legacy estate audit
lib/stack-atlas-languages.ts  168 languages
lib/stack-atlas-reference.ts  protocols / formats / auth / infra / stacks (226)
lib/stack-atlas-marks.ts      name → Simple Icons slug map (MARKS generated)
components/atlas/             workbench, context panel, wizard, tray, volumes, brief
```

## Weaving into the Plumbline Console

**This repo is the source of truth.** The Console (`plumbline-dashboard`)
carries its own copy of the data files and a `/dashboard/stack-atlas` page;
when the atlas changes here, sync by copying:

- `lib/stack-atlas*.ts` and `lib/engine.ts` → the Console's `lib/` (verbatim;
  they have no dependencies beyond each other).
- `components/atlas/*` → the Console, swapping the local primitives in
  `components/atlas/ui.tsx` for the Console's real `@/components/ui/*`. The
  Tailwind token vocabulary is already identical.

Two things the Console should do differently, by design:

- **Derive context instead of asking.** `ContextProfile.estate` should come
  from `engagement_stack_evals` rows and the synced `repos.language` field —
  the dashboard already knows the estate. `profile.org` can come from the
  client record.
- **Persist the brief.** The standalone site keeps profile and tray in
  `localStorage`; the Console records the finished decision through its
  `recordStackEval` server action, attached to an engagement.
