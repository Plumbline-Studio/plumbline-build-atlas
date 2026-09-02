// The agentic axis: how AI work gets coordinated, and what it costs.
//
// This is a parallel spine to delivery, not a section of it. Delivery answers
// how code reaches production; this answers where an agent's knowledge lives,
// how a task finds it, who runs the loop, how concurrent agents avoid
// colliding, what persists between runs, what caps the spend, and how you know
// any of it worked.
//
// The argument encoded here — see the "Two Regimes" decision record — is that
// almost nobody needs a bespoke orchestrator:
//
//   Regime A, sequential work with a human between stages, needs no
//   orchestration at all. Numbered folders carry the sequencing and markdown
//   carries the state. On LongMemEval this measured statistically
//   indistinguishable from long-context at 97% fewer tokens and 95% less cost.
//
//   Regime B, genuine concurrency, is a hosted product with per-session dollar
//   caps. What you own there is the roster, the schedule and the budget — not
//   the loop.
//
// And the rule that spans both: agents collide over SHARED MUTABLE STATE, not
// over time. One writer per artefact, canonical sources, one-way references.
// An orchestrator does not fix a two-writer problem; it makes the corruption
// intermittent, which is worse.

import type { DoorRating } from "@/lib/destination";
import type { DeliveryScale } from "@/lib/stack-atlas-delivery";
import type { Standing } from "@/lib/stack-atlas-reference";

export type AgenticStage =
  | "context"
  | "routing"
  | "execution"
  | "coordination"
  | "scheduling"
  | "memory"
  | "governance"
  | "evaluation";

export const AGENTIC_STAGES: { key: AgenticStage; label: string; question: string }[] = [
  { key: "context", label: "Context", question: "Where does the agent's knowledge live?" },
  { key: "routing", label: "Routing", question: "How does a task find the context it needs?" },
  { key: "execution", label: "Execution", question: "Who runs the loop?" },
  { key: "coordination", label: "Coordination", question: "How do concurrent agents avoid collision?" },
  { key: "scheduling", label: "Scheduling", question: "What makes it run when nobody asks?" },
  { key: "memory", label: "Memory", question: "What survives between runs?" },
  { key: "governance", label: "Governance", question: "What caps the spend and gates the risk?" },
  { key: "evaluation", label: "Evaluation", question: "How do you know it still works?" },
];

export interface AgenticEntry {
  name: string;
  group: string;
  stage: AgenticStage;
  standing: Standing;
  scale: DeliveryScale;
  door: DoorRating;
  /** Which regime this belongs to, or "both" for the rules that always hold. */
  regime: "sequential" | "concurrent" | "both";
  whatItIs: string;
  whereYouMeetIt: string;
  watchFor: string;
  needs: string[];
  feeds: string[];
  instead: string[];
  whenYouNeedIt: string;
  notYet: string;
}

export const AGENTIC_GROUPS: string[] = [
  "Context & structure",
  "Execution surfaces",
  "Coordination & state",
  "Scheduling & autonomy",
  "Memory",
  "Cost & governance",
  "Evaluation",
];

export const AGENTIC: AgenticEntry[] = [
  /* -------------------------- Context & structure ----------------------- */
  {
    name: "ICM workspace", group: "Context & structure", stage: "context", standing: "Current", scale: "solo", door: "two-way", regime: "sequential",
    whatItIs: "Interpretable Context Methodology: numbered folders carry the sequencing, hierarchy carries context scoping, and plain markdown carries state. Each stage has a CONTEXT.md naming its inputs, process and outputs.",
    whereYouMeetIt: "Van Clief & McDermott, arXiv 2603.16021 (MIT licence). Best fit for sequential work with a human review between steps — content production, research, reporting, curriculum.",
    watchFor: "The measured claim is strong and narrow: on LongMemEval, filesystem memory matched long-context accuracy at 97% fewer tokens and 95% less cost. The authors' own caveats are single-user, synthetic history, one ingestion pass. It is explicitly not for real-time collaboration or high concurrency.",
    needs: [], feeds: ["Stage contracts", "Filesystem memory", "Human checkpoints"], instead: ["Agent frameworks"],
    whenYouNeedIt: "The first process you have run by hand more than twice. The structure is the whole implementation, so the cost of trying it is a folder tree.",
    notYet: "A one-off task does not need a workspace. This pays back on repetition, not on ambition.",
  },
  {
    name: "Stage contracts", group: "Context & structure", stage: "context", standing: "Current", scale: "solo", door: "two-way", regime: "sequential",
    whatItIs: "Every stage declares Inputs, Process and Outputs explicitly, so an agent with no memory can orient from the files alone — the 'walk test'.",
    whereYouMeetIt: "The load-bearing convention inside an ICM workspace, and good practice in any prompt pipeline.",
    watchFor: "This is the piece that makes the difference between a folder of prompts and an architecture. Without explicit contracts, stages quietly start depending on each other's side effects.",
    needs: ["ICM workspace"], feeds: ["Human checkpoints"], instead: [],
    whenYouNeedIt: "Immediately, alongside the workspace. Contracts written later are archaeology.",
    notYet: "No threshold.",
  },
  {
    name: "Canonical sources", group: "Context & structure", stage: "context", standing: "Current", scale: "solo", door: "one-way", regime: "both",
    whatItIs: "Every fact lives in exactly one place; other files point at it and never copy it.",
    whereYouMeetIt: "The rule that prevents two agents being simultaneously 'correct' and in disagreement.",
    watchFor: "Copies are the cheapest thing to make and the most expensive thing to reconcile. This is a one-way door because retrofitting canonical sources means finding every copy, and by then nobody knows which one is true.",
    needs: [], feeds: ["One-way references"], instead: [],
    whenYouNeedIt: "Before the second agent, and ideally before the second document.",
    notYet: "No threshold — this costs nothing to adopt early and a great deal to adopt late.",
  },
  {
    name: "Selective section routing", group: "Context & structure", stage: "routing", standing: "Current", scale: "solo", door: "two-way", regime: "both",
    whatItIs: "A routing table naming which sections of which files a task needs, rather than loading a whole knowledge base into every conversation.",
    whereYouMeetIt: "CONTEXT.md routing tables; the same idea as a database view applied to context windows.",
    watchFor: "Loading everything is not thoroughness, it is noise — agents blend unrelated rules and hallucinate. Reported token reductions of 60–75% are the secondary benefit; the quality improvement is the point.",
    needs: ["ICM workspace"], feeds: [], instead: [],
    whenYouNeedIt: "As soon as the reference material outgrows what you would happily paste into one message.",
    notYet: "With one small context file there is nothing to route.",
  },
  {
    name: "MCP", group: "Context & structure", stage: "routing", standing: "Current", scale: "solo", door: "two-way", regime: "both",
    whatItIs: "Model Context Protocol: a standard interface letting an agent reach tools and data — Linear, Drive, Supabase, a database — without bespoke glue per client.",
    whereYouMeetIt: "Claude, and increasingly every other agent surface. The thing that made ChatGPT and Claude both able to read the same Linear project.",
    watchFor: "An MCP server is an authorisation surface. Whatever it can reach, the agent can reach — scope the credential to the job, not to the account.",
    needs: [], feeds: ["Managed Agents", "Claude Agent SDK"], instead: [],
    whenYouNeedIt: "The moment an agent needs to read or write a system rather than just talk about one.",
    notYet: "Pure text-in, text-out work does not need tools.",
  },
  {
    name: "Tool search", group: "Context & structure", stage: "routing", standing: "Current", scale: "team", door: "two-way", regime: "both",
    whatItIs: "Deferred tool loading: the agent searches a large tool catalogue and loads only the definitions it needs, instead of carrying every schema in every request.",
    whereYouMeetIt: "Any agent wired to more than a couple of dozen tools.",
    watchFor: "The same separation-of-concerns idea as routing, applied to tools. Below roughly twenty tools it is overhead.",
    needs: ["MCP"], feeds: [], instead: [],
    whenYouNeedIt: "When the tool definitions themselves become a meaningful share of the prompt.",
    notYet: "A handful of tools should just be loaded.",
  },

  /* --------------------------- Execution surfaces ----------------------- */
  {
    name: "Manual tool loop", group: "Execution surfaces", stage: "execution", standing: "Current", scale: "solo", door: "two-way", regime: "sequential",
    whatItIs: "You write the request/execute/repeat loop yourself against the Messages API.",
    whereYouMeetIt: "Anywhere the control flow is unusual enough that a helper gets in the way.",
    watchFor: "Reach for this when you genuinely want to own the loop, not by default. Most people who write one end up reimplementing the helper badly.",
    needs: [], feeds: [], instead: ["Tool Runner", "Claude Agent SDK", "Managed Agents"],
    whenYouNeedIt: "A control flow the standard helpers do not fit.",
    notYet: "If you cannot name the thing the helper stops you doing, use the helper.",
  },
  {
    name: "Tool Runner", group: "Execution surfaces", stage: "execution", standing: "Current", scale: "solo", door: "two-way", regime: "sequential",
    whatItIs: "The SDK drives the tool-call loop for tools you define, with per-turn hooks for approval gates, error interception and retries. You still host it.",
    whereYouMeetIt: "The default for a custom-tool agent that runs on your own infrastructure.",
    watchFor: "Harness only — it supplies the loop, not the deployment. Confusing it with the Agent SDK is the most common mix-up on this stage.",
    needs: [], feeds: [], instead: ["Manual tool loop", "Claude Agent SDK", "Managed Agents"],
    whenYouNeedIt: "A custom agent where you own the compute and want approval gates in the loop.",
    notYet: "For filesystem and coding work the Agent SDK already ships the tools you would be writing.",
  },
  {
    name: "Claude Agent SDK", group: "Execution surfaces", stage: "execution", standing: "Current", scale: "solo", door: "two-way", regime: "sequential",
    whatItIs: "Claude Code packaged as a library: built-in file, bash, search and web tools, the full agent loop, context management, hooks, subagents and sessions. You host it.",
    whereYouMeetIt: "Batteries-included coding and filesystem agents running on your own infrastructure.",
    watchFor: "Also harness-only. Its built-in tools are its reason to exist — if you are not doing filesystem or code work, you are carrying a lot you will not use.",
    needs: [], feeds: ["Filesystem memory"], instead: ["Tool Runner", "Manual tool loop", "Managed Agents"],
    whenYouNeedIt: "Agentic work over a repository or a directory tree, on your own machine or runner.",
    notYet: "If you want somebody else to host the sandbox, this is the wrong half of the choice.",
  },
  {
    name: "Managed Agents", group: "Execution surfaces", stage: "execution", standing: "Current", scale: "team", door: "one-way-at-scale", regime: "concurrent",
    whatItIs: "Anthropic runs the loop AND hosts a per-session container. Persisted, versioned agent configs; sessions reference them; bash, file and code execution happen in the workspace.",
    whereYouMeetIt: "The answer whenever the honest requirement is 'this should run without me, reliably, on somebody else's machine'.",
    watchFor: "The only option that supplies harness and deployment together. That is also the lock-in: agent configs and session semantics are its own, so the door is one-way once real workflows depend on it.",
    needs: ["MCP"], feeds: ["Multiagent rosters", "Scheduled deployments", "Session budgets"], instead: ["Claude Agent SDK", "Tool Runner", "Manual tool loop"],
    whenYouNeedIt: "Long-running or scheduled work, or when hosting a per-session sandbox yourself is the part you do not want to own.",
    notYet: "Work that finishes inside one conversation with a person watching does not need a hosted loop.",
  },
  {
    name: "Agent frameworks", group: "Execution surfaces", stage: "execution", standing: "Current", scale: "team", door: "one-way-at-scale", regime: "concurrent",
    whatItIs: "LangGraph, CrewAI, AutoGen and similar: graphs, roles and message passing between agents you define.",
    whereYouMeetIt: "The default answer in most 'multi-agent' writing, and in most conference talks.",
    watchFor: "They work within their own structures, and changing those structures is development work. For sequential workflows with human review, the ICM result is that this whole layer is unnecessary — and unnecessary orchestration is the most expensive thing on this axis, because it must be maintained forever.",
    needs: [], feeds: [], instead: ["ICM workspace", "Managed Agents"],
    whenYouNeedIt: "Genuinely branching, stateful graphs that neither a folder structure nor a hosted roster can express.",
    notYet: "Before you have hit a concrete limit of the two simpler answers, this is complexity bought on credit.",
  },

  /* -------------------------- Coordination & state ---------------------- */
  {
    name: "One writer per artefact", group: "Coordination & state", stage: "coordination", standing: "Current", scale: "solo", door: "one-way", regime: "both",
    whatItIs: "Every file or record has exactly one agent permitted to write it. Everyone else reads.",
    whereYouMeetIt: "The actual answer to 'how do I stop agents overstepping each other'. Not a scheduler — an ownership rule.",
    watchFor: "This is declarable, and therefore checkable: a writes[] column with a uniqueness constraint turns the rule into something the database enforces rather than something everyone remembers. An orchestrator does not solve a two-writer problem, it just makes the corruption intermittent.",
    needs: [], feeds: ["Agent registry"], instead: [],
    whenYouNeedIt: "Before the second agent exists. Retrofitting ownership means auditing every write that already happened.",
    notYet: "No threshold. This is the cheapest rule here and the most expensive to adopt late.",
  },
  {
    name: "One-way references", group: "Coordination & state", stage: "coordination", standing: "Current", scale: "solo", door: "one-way", regime: "both",
    whatItIs: "If A references B, B does not reference A.",
    whereYouMeetIt: "The convention that keeps a growing set of context files from becoming an O(n²) maintenance problem.",
    watchFor: "Cycles feel harmless with three files and are unfixable with thirty. The cost curve is the whole argument.",
    needs: ["Canonical sources"], feeds: [], instead: [],
    whenYouNeedIt: "From the first cross-reference.",
    notYet: "No threshold.",
  },
  {
    name: "Agent registry", group: "Coordination & state", stage: "coordination", standing: "Current", scale: "team", door: "two-way", regime: "both",
    whatItIs: "One row per agent or workspace recording what it writes, what it reads, when it runs and what it may spend — with a constraint that refuses two agents claiming the same artefact.",
    whereYouMeetIt: "Plumbline's own `agent_registry` table. This is the coordination layer, and it is roughly one table plus a check.",
    watchFor: "A rule nobody can check is a preference. If the registry cannot fail, it is documentation rather than a control.",
    needs: ["One writer per artefact"], feeds: ["Session budgets"], instead: ["Agent frameworks"],
    whenYouNeedIt: "The second agent, or the first scheduled one — whichever arrives first.",
    notYet: "One agent, one workspace, one writer: the rule holds trivially and the table is bookkeeping.",
  },
  {
    name: "Multiagent rosters", group: "Coordination & state", stage: "coordination", standing: "Current", scale: "team", door: "two-way", regime: "concurrent",
    whatItIs: "A session delegates to copies of itself or to named cheaper worker agents, fanning work out and gathering results.",
    whereYouMeetIt: "Research across many sources, per-record processing, anything where one loop would fill its context with reading.",
    watchFor: "Start the roster with self-delegation only, then move reading-heavy sub-tasks to a cheaper model. Fan-out multiplies cost linearly and quality not at all unless the sub-tasks are genuinely independent.",
    needs: ["Managed Agents"], feeds: [], instead: ["Agent frameworks"],
    whenYouNeedIt: "When the work is a list of independent items and the list is long enough that serial is too slow.",
    notYet: "If the sub-tasks need each other's output, this is the wrong shape — that is a pipeline, and pipelines are Regime A.",
  },
  {
    name: "Human checkpoints", group: "Coordination & state", stage: "coordination", standing: "Current", scale: "solo", door: "two-way", regime: "sequential",
    whatItIs: "Every stage's output is a file a person can open, read, edit and save before the next stage runs.",
    whereYouMeetIt: "The steering mechanism in a sequential workspace, and the reason it needs no orchestration.",
    watchFor: "This looks like a bottleneck and is actually the quality mechanism. Removing it is the decision that moves you into Regime B, with all the governance that implies — do it deliberately.",
    needs: ["Stage contracts"], feeds: [], instead: [],
    whenYouNeedIt: "Any output that carries Plumbline's name to a client.",
    notYet: "High-volume, low-stakes, reversible work does not need a person in the loop.",
  },

  /* ------------------------- Scheduling & autonomy ---------------------- */
  {
    name: "Scheduled deployments", group: "Scheduling & autonomy", stage: "scheduling", standing: "Current", scale: "team", door: "two-way", regime: "concurrent",
    whatItIs: "A cron cadence that fires agent sessions autonomously, with a run record per firing and pause/resume controls — no client-side scheduler.",
    whereYouMeetIt: "Nightly passes, weekly reports, the morning brief.",
    watchFor: "An unattended agent with no budget cap is the one genuinely expensive failure mode on this axis. Set the cap in the same change that sets the schedule, not after the first surprise.",
    needs: ["Managed Agents"], feeds: ["Session budgets"], instead: ["Worker cron"],
    whenYouNeedIt: "When real work is waiting on a person who is asleep.",
    notYet: "If nobody is blocked overnight, a schedule adds cost and removes the review step.",
  },
  {
    name: "Worker cron", group: "Scheduling & autonomy", stage: "scheduling", standing: "Current", scale: "solo", door: "two-way", regime: "sequential",
    whatItIs: "A Cloudflare Worker (or Lambda, or GitHub Actions schedule) firing on a cron trigger and calling a model directly.",
    whereYouMeetIt: "Plumbline's own recurring jobs, including the drive-sorter pass.",
    watchFor: "Cheap, boring and entirely adequate for a single sequential job. It gives you no session state, so anything needing memory between runs has to write it down itself.",
    needs: [], feeds: ["Filesystem memory"], instead: ["Scheduled deployments"],
    whenYouNeedIt: "The first recurring job. Start here.",
    notYet: "It stops being enough when the job needs a workspace, a container, or to survive its own failures.",
  },

  /* -------------------------------- Memory ------------------------------ */
  {
    name: "Filesystem memory", group: "Memory", stage: "memory", standing: "Current", scale: "solo", door: "two-way", regime: "sequential",
    whatItIs: "The agent files notes into a structured directory and navigates back to them, instead of carrying the whole history in context.",
    whereYouMeetIt: "ICM workspaces, Claude Code's own working style, and Plumbline's K Drive by accident of good filing.",
    watchFor: "The measured result — indistinguishable accuracy at 97% fewer tokens — is the strongest argument on this axis, and its caveats are real: single-user, synthetic, one pass. Treat it as very strong evidence, not as settled science.",
    needs: [], feeds: [], instead: ["Long context", "Memory stores"],
    whenYouNeedIt: "As soon as a conversation's useful history outlives the conversation.",
    notYet: "A single-turn task has nothing to remember.",
  },
  {
    name: "Long context", group: "Memory", stage: "memory", standing: "Current", scale: "solo", door: "two-way", regime: "both",
    whatItIs: "Keep the whole history in the context window and let the model find what it needs.",
    whereYouMeetIt: "The default, because it requires no design.",
    watchFor: "It works, and it is roughly twenty to thirty times more expensive per question than filing the same information. That ratio is the reason to design anything at all.",
    needs: [], feeds: [], instead: ["Filesystem memory", "Memory stores"],
    whenYouNeedIt: "Short-lived work where the design effort exceeds the token bill.",
    notYet: "Once a workflow repeats daily, the arithmetic reverses hard.",
  },
  {
    name: "Memory stores", group: "Memory", stage: "memory", standing: "Current", scale: "team", door: "two-way", regime: "concurrent",
    whatItIs: "A hosted store the agent reads and writes across sessions, managed by the platform rather than by your filesystem.",
    whereYouMeetIt: "Managed Agents deployments that need continuity between scheduled runs.",
    watchFor: "Convenient, and it puts your durable state inside the platform. If the state matters more than the convenience, keep it somewhere you can read without the platform.",
    needs: ["Managed Agents"], feeds: [], instead: ["Filesystem memory", "Long context"],
    whenYouNeedIt: "Hosted agents that must remember across runs you do not control.",
    notYet: "If the agent runs on your machine, the filesystem is already the store.",
  },
  {
    name: "Retrieval (pgvector)", group: "Memory", stage: "memory", standing: "Current", scale: "team", door: "one-way-at-scale", regime: "both",
    whatItIs: "Embedding search over a document corpus, returning passages with citations rather than whole files.",
    whereYouMeetIt: "Question-answering over a vault, a client's documents, or a knowledge base too large to file by hand.",
    watchFor: "Reach for it when the corpus is genuinely too large to route to by name. A well-structured folder tree answers a surprising share of what people reach for retrieval to solve, and it is debuggable.",
    needs: [], feeds: [], instead: ["Filesystem memory"],
    whenYouNeedIt: "When you cannot predict which document answers the question.",
    notYet: "If a routing table can name the right file, this is machinery in front of a lookup.",
  },

  /* ---------------------------- Cost & governance ----------------------- */
  {
    name: "Session budgets", group: "Cost & governance", stage: "governance", standing: "Current", scale: "team", door: "two-way", regime: "concurrent",
    whatItIs: "Hard, dollar-denominated caps on a single agent session, enforced by the platform rather than by your own accounting.",
    whereYouMeetIt: "Managed Agents sessions, and the thing that makes unattended work safe to leave running.",
    watchFor: "This is the difference between an experiment and a liability. A cap you enforce yourself is a cap that fails exactly when the loop misbehaves.",
    needs: ["Managed Agents"], feeds: [], instead: [],
    whenYouNeedIt: "The first session that runs without a person watching it.",
    notYet: "Interactive work is capped by the person's attention.",
  },
  {
    name: "Prompt caching", group: "Cost & governance", stage: "governance", standing: "Current", scale: "solo", door: "two-way", regime: "both",
    whatItIs: "A stable prefix — system prompt, tool definitions, reference material — is cached and re-read at a fraction of its input cost.",
    whereYouMeetIt: "Every repeated call with shared context, which is most production agent traffic.",
    watchFor: "It is a prefix match, so one changing byte early invalidates everything after it. A timestamp or a UUID in the system prompt silently costs you the entire saving — verify with the cache-read counter rather than assuming.",
    needs: [], feeds: [], instead: [],
    whenYouNeedIt: "The moment the same context is sent twice. This is the largest free saving available.",
    notYet: "No threshold — but measure that it is actually hitting.",
  },
  {
    name: "Batch processing", group: "Cost & governance", stage: "governance", standing: "Current", scale: "solo", door: "two-way", regime: "both",
    whatItIs: "Submit many requests asynchronously and collect results later, at half the per-token price.",
    whereYouMeetIt: "Anything not latency-sensitive: overnight classification, bulk extraction, backfills.",
    watchFor: "Results come back in any order — key by your own id, never by position. Half price for work nobody is waiting on is close to a free lunch.",
    needs: [], feeds: [], instead: [],
    whenYouNeedIt: "The first bulk job where nobody is watching the clock.",
    notYet: "Interactive work cannot use it.",
  },
  {
    name: "Model tiering", group: "Cost & governance", stage: "governance", standing: "Current", scale: "solo", door: "two-way", regime: "both",
    whatItIs: "Reserving the most capable model for judgement, and giving reading-heavy or mechanical sub-tasks to a cheaper one.",
    whereYouMeetIt: "Any fan-out where workers read a lot and decide little.",
    watchFor: "Judge cost per completed task, not per request — a cheaper model that needs three attempts is not cheaper. And caches are model-scoped, so a cascade forfeits cache reuse across its models. Measure the capable model at lower effort before building a cascade.",
    needs: [], feeds: [], instead: [],
    whenYouNeedIt: "When worker sessions outnumber lead sessions by an order of magnitude.",
    notYet: "Below real volume, the complexity costs more than the tokens.",
  },
  {
    name: "Approval gates", group: "Cost & governance", stage: "governance", standing: "Current", scale: "solo", door: "two-way", regime: "both",
    whatItIs: "A person confirms before the agent takes an irreversible or outward-facing action — sending, publishing, deleting, paying.",
    whereYouMeetIt: "Per-turn hooks in a tool loop, tool-confirmation round-trips in a hosted session, or simply a stage boundary.",
    watchFor: "Scope the gate to irreversibility, not to importance. Gating everything trains people to click through, which is worse than not gating.",
    needs: [], feeds: [], instead: [],
    whenYouNeedIt: "The first action an agent can take that you cannot undo.",
    notYet: "Reversible, internal, low-stakes work does not need a gate.",
  },

  /* ------------------------------- Evaluation --------------------------- */
  {
    name: "Eval harness", group: "Evaluation", stage: "evaluation", standing: "Current", scale: "solo", door: "two-way", regime: "both",
    whatItIs: "A fixed set of test cases run against a prompt, printing pass/fail counts — so a prompt change is a measured change rather than a vibe.",
    whereYouMeetIt: "Any prompt that has been edited more than twice and matters.",
    watchFor: "Ten real cases beat a hundred synthetic ones. The hard part is not the harness, it is writing down what 'correct' means — which is also the part that pays back.",
    needs: [], feeds: ["LLM-as-judge"], instead: [],
    whenYouNeedIt: "The second time you change a prompt and are not sure whether you improved it.",
    notYet: "A prompt you will run once needs no regression suite.",
  },
  {
    name: "LLM-as-judge", group: "Evaluation", stage: "evaluation", standing: "Current", scale: "team", door: "two-way", regime: "both",
    whatItIs: "A model scores outputs against a rubric, so open-ended quality can be tracked without a human reading every result.",
    whereYouMeetIt: "Evals where the right answer is a paragraph rather than a value.",
    watchFor: "The judge needs its own calibration against human ratings, or you are measuring the judge. Spot-check it on a sample you have scored yourself before trusting a trend.",
    needs: ["Eval harness"], feeds: [], instead: [],
    whenYouNeedIt: "When correctness is a judgement and the volume is past hand-reading.",
    notYet: "If the output is checkable by an assertion, assert it — cheaper, faster, and not itself a model.",
  },
  {
    name: "Cost & latency logging", group: "Evaluation", stage: "evaluation", standing: "Current", scale: "solo", door: "two-way", regime: "both",
    whatItIs: "Recording tokens, dollars and wall-clock per run, attributed to the feature that spent them.",
    whereYouMeetIt: "The usage figures on each response, accumulated somewhere you can read a trend from.",
    watchFor: "Without attribution, a rising bill tells you nothing about which change caused it. Log the feature name alongside the number from the first run.",
    needs: [], feeds: [], instead: [],
    whenYouNeedIt: "Before the first AI feature reaches a real user, not after the first invoice.",
    notYet: "No threshold worth waiting for.",
  },
];
