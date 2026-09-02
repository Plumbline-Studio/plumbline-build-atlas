// The delivery volume: how the thing ships, and how you know it is alive.
//
// The other six volumes answer "what do we build it with". None of them answer
// what happens after the code is written, which is where most of a client's
// actual risk lives — the estate checklist could ask where a system runs and
// when it was last patched, but never how a change reaches production or
// whether a rollback has ever been performed.
//
// Two things make this volume different from the reference volumes:
//
//   1. Entries carry EDGES. `needs`, `feeds` and `instead` are what turn a
//      list of tools into a picture: Logstash feeds Elasticsearch, Ansible
//      needs machines Terraform created, OpenTofu goes instead of Terraform.
//      The map is drawn from these, so it cannot drift from the entries.
//   2. Entries carry a SIZE. Most of what follows is the wrong size for a
//      five-project studio, and `whenYouNeedIt` / `notYet` say so with the
//      trigger attached. "Not yet, and here is what changes it" is the most
//      useful sentence this volume can produce.
//
// Docker and Kubernetes also appear in the infrastructure volume. That is
// deliberate, not an oversight: there they are things you FIND on a client's
// estate and have to assess, here they are things you CHOOSE and have to wire
// to their neighbours. Neither entry is a stub, and scripts/check-delivery-
// edges.mjs fails the build if the two ever start contradicting each other.

import type { DoorRating } from "@/lib/destination";
import type { Standing } from "@/lib/stack-atlas-reference";

/** The spine. Each stage is a question, which is what makes it guidance. */
export type DeliveryStage =
  | "source"
  | "review"
  | "integrate"
  | "assure"
  | "package"
  | "provision"
  | "configure"
  | "orchestrate"
  | "secure"
  | "observe";

export const DELIVERY_STAGES: { key: DeliveryStage; label: string; question: string }[] = [
  { key: "source", label: "Source", question: "Where does the code live, and who has a copy?" },
  { key: "review", label: "Review", question: "Who checks a change before it lands?" },
  { key: "integrate", label: "Integrate", question: "What runs automatically on every push?" },
  { key: "assure", label: "Assure", question: "What stops bad code from landing at all?" },
  { key: "package", label: "Package", question: "How does it become a runnable artefact?" },
  { key: "provision", label: "Provision", question: "Who creates the machines?" },
  { key: "configure", label: "Configure", question: "Who sets them up once they exist?" },
  { key: "orchestrate", label: "Orchestrate", question: "Who runs and scales them?" },
  { key: "secure", label: "Secure", question: "Where do the secrets live?" },
  { key: "observe", label: "Observe", question: "How do you know it's alive?" },
];

/** The smallest organisation at which the piece earns its keep. */
export type DeliveryScale = "solo" | "team" | "platform";

export const SCALE_LABEL: Record<DeliveryScale, string> = {
  solo: "Solo",
  team: "Team",
  platform: "Platform team",
};

export interface DeliveryEntry {
  name: string;
  group: string;
  stage: DeliveryStage;
  standing: Standing;
  scale: DeliveryScale;
  door: DoorRating;
  whatItIs: string;
  whereYouMeetIt: string;
  watchFor: string;
  /** Entry names that must exist upstream. Validated at build time. */
  needs: string[];
  /** Entry names this hands off to. */
  feeds: string[];
  /** Entry names this substitutes for. */
  instead: string[];
  whenYouNeedIt: string;
  notYet: string;
}

export const DELIVERY_GROUPS: string[] = [
  "Source & collaboration",
  "Pipelines & CI/CD",
  "Code quality & supply chain",
  "Packaging & registries",
  "Orchestration & runtime",
  "Provisioning",
  "Configuration",
  "Secrets & service networking",
  "Observability",
];

export const DELIVERY: DeliveryEntry[] = [
  /* ------------------------ Source & collaboration ---------------------- */
  {
    name: "Git", group: "Source & collaboration", stage: "source", standing: "Current", scale: "solo", door: "two-way",
    whatItIs: "Distributed version control. Every change is a snapshot; every developer holds the full history locally, with no server required to work.",
    whereYouMeetIt: "Everywhere. The question on a client estate is never whether they use Git, it is whether anything is actually committed.",
    watchFor: "A repository that exists but is six months behind the server it deploys to. That is not version control, that is an archive — and it is a very common finding.",
    needs: [], feeds: ["GitHub", "GitLab", "Bitbucket", "Azure Repos"], instead: [],
    whenYouNeedIt: "The moment more than one version of a file exists, which is immediately.",
    notYet: "There is no 'not yet'. This is the one piece on the whole board with no threshold.",
  },
  {
    name: "GitHub", group: "Source & collaboration", stage: "review", standing: "Current", scale: "solo", door: "two-way",
    whatItIs: "Hosted Git plus the pull request — the review surface where a change gets read, argued with and approved before it merges.",
    whereYouMeetIt: "The default for open source and for most teams under a few hundred engineers.",
    watchFor: "Branch protection off means the review process is a social convention, not a control. Check that before you describe it as one in a SOC 2 conversation.",
    needs: ["Git"], feeds: ["GitHub Actions", "Dependabot / Renovate"], instead: ["GitLab", "Bitbucket", "Azure Repos"],
    whenYouNeedIt: "As soon as a second person reads your code — including future you, six months on.",
    notYet: "Solo and private with no CI ambitions? A bare remote works. You will still end up here.",
  },
  {
    name: "GitLab", group: "Source & collaboration", stage: "review", standing: "Current", scale: "team", door: "two-way",
    whatItIs: "Hosted Git with CI/CD, container registry, security scanning and Kubernetes integration in the same product rather than bolted on.",
    whereYouMeetIt: "Organisations that wanted one vendor for the whole toolchain, and anyone who needed to self-host the lot.",
    watchFor: "Self-managed GitLab is a real system to run — database, Redis, object storage, upgrades. Budget an owner or buy the hosted tier.",
    needs: ["Git"], feeds: ["GitLab CI/CD"], instead: ["GitHub", "Bitbucket", "Azure Repos"],
    whenYouNeedIt: "When you want the pipeline, the registry and the scanner to come from the same place — or when the code cannot leave your building.",
    notYet: "If GitHub Actions already covers the automation, switching hosts to get CI is a large move for a small gain.",
  },
  {
    name: "Bitbucket", group: "Source & collaboration", stage: "review", standing: "Current", scale: "team", door: "two-way",
    whatItIs: "Atlassian's Git hosting, with Jira and Confluence integration as its reason to exist.",
    whereYouMeetIt: "Companies already deep in the Atlassian stack, especially mid-market.",
    watchFor: "Chosen for the Jira link far more often than for its own merits. If the Jira link is the only reason, price the alternative before renewing.",
    needs: ["Git"], feeds: [], instead: ["GitHub", "GitLab", "Azure Repos"],
    whenYouNeedIt: "When Jira is the system of record for work and the traceability actually gets used.",
    notYet: "Outside the Atlassian estate there is no argument for it.",
  },
  {
    name: "Azure Repos", group: "Source & collaboration", stage: "review", standing: "Current", scale: "team", door: "two-way",
    whatItIs: "Git hosting inside Azure DevOps, with Entra ID identity and Azure Boards alongside.",
    whereYouMeetIt: "Microsoft-shop clients, especially where Entra groups already govern who can see what.",
    watchFor: "Microsoft's own investment is in GitHub. Repos is maintained rather than advanced — fine for an existing estate, weak as a new choice.",
    needs: ["Git"], feeds: ["Azure Pipelines"], instead: ["GitHub", "GitLab", "Bitbucket"],
    whenYouNeedIt: "When identity has to come from Entra ID and the client will not federate to anything else.",
    notYet: "New greenfield work on a Microsoft estate is usually better on GitHub with Entra SSO.",
  },

  /* --------------------------- Pipelines & CI/CD ------------------------ */
  {
    name: "GitHub Actions", group: "Pipelines & CI/CD", stage: "integrate", standing: "Current", scale: "solo", door: "two-way",
    whatItIs: "CI/CD defined as YAML workflows in the repository, triggered by pushes, pull requests, schedules or manual dispatch.",
    whereYouMeetIt: "Roughly a third of the CI market and over 85% of pipelines on GitHub. The default for anything already hosted there.",
    watchFor: "A third-party action is code you run with your secrets in scope. Pin to a commit SHA, not a moving tag, and read what you are pinning.",
    needs: ["GitHub"], feeds: ["Container registries", "Argo CD", "Terraform", "Ansible"],
    instead: ["GitLab CI/CD", "Jenkins", "CircleCI", "Azure Pipelines"],
    whenYouNeedIt: "The first time you run a test by hand before deploying and get it wrong. Usually week one.",
    notYet: "Never too early. This is the cheapest ratchet on the board — a five-line workflow beats no workflow.",
  },
  {
    name: "GitLab CI/CD", group: "Pipelines & CI/CD", stage: "integrate", standing: "Current", scale: "team", door: "two-way",
    whatItIs: "Pipelines defined in a single .gitlab-ci.yml, with runners you can host yourself or rent.",
    whereYouMeetIt: "GitLab estates, and the fastest-growing option in enterprise.",
    watchFor: "Self-hosted runners are machines someone has to patch. The pipeline is free; the fleet underneath it is not.",
    needs: ["GitLab"], feeds: ["Container registries", "Argo CD"],
    instead: ["GitHub Actions", "Jenkins", "CircleCI", "Azure Pipelines"],
    whenYouNeedIt: "When you are already on GitLab — using anything else there is friction with no upside.",
    notYet: "Do not move Git hosts to get this. The pipeline is not worth a migration.",
  },
  {
    name: "Jenkins", group: "Pipelines & CI/CD", stage: "integrate", standing: "Legacy", scale: "team", door: "one-way-at-scale",
    whatItIs: "The long-standing automation server. Pipelines in a Jenkinsfile, and roughly 1,800 plugins connecting it to anything that has ever existed.",
    whereYouMeetIt: "Still around 28% of the CI market and inside most of the Fortune 500 — but losing share every year.",
    watchFor: "The plugin surface is the cost. Teams leave Jenkins when a plugin breaks an upgrade, or when the one person who understood the controller resigns.",
    needs: [], feeds: ["Container registries", "Ansible"],
    instead: ["GitHub Actions", "GitLab CI/CD", "CircleCI", "Azure Pipelines"],
    whenYouNeedIt: "When you have inherited it and it works, or when a build genuinely needs hardware no hosted runner offers.",
    notYet: "Choosing Jenkins new in 2026 needs an argument beyond familiarity. Usually there isn't one.",
  },
  {
    name: "CircleCI", group: "Pipelines & CI/CD", stage: "integrate", standing: "Current", scale: "team", door: "two-way",
    whatItIs: "Managed cloud CI/CD with reusable config packages (Orbs) and aggressive layer caching. Linux, macOS and Windows executors.",
    whereYouMeetIt: "About 6% of the market — teams who wanted fast managed CI before Actions was good.",
    watchFor: "A niche pick now rather than a wrong one. The macOS executors remain a genuine reason to be here if you ship iOS.",
    needs: [], feeds: ["Container registries"],
    instead: ["GitHub Actions", "GitLab CI/CD", "Jenkins", "Azure Pipelines"],
    whenYouNeedIt: "macOS builds, or a matrix that hosted runners elsewhere handle badly.",
    notYet: "For a repo already on GitHub, Actions covers the same ground without another vendor.",
  },
  {
    name: "Azure Pipelines", group: "Pipelines & CI/CD", stage: "integrate", standing: "Current", scale: "team", door: "two-way",
    whatItIs: "Azure DevOps' CI/CD, with strong Windows and .NET build support and Entra-governed deployment approvals.",
    whereYouMeetIt: "Microsoft estates, especially where a release needs a named human approval recorded for audit.",
    watchFor: "Classic (UI-defined) pipelines still exist in older tenants and cannot be diffed or reviewed. Convert them to YAML before you rely on them.",
    needs: ["Azure Repos"], feeds: ["Container registries", "CloudFormation / Bicep"],
    instead: ["GitHub Actions", "GitLab CI/CD", "Jenkins", "CircleCI"],
    whenYouNeedIt: "Windows build agents, or an approval gate the client's auditor will ask to see.",
    notYet: "On a Linux stack with no Entra requirement, this is ceremony without benefit.",
  },
  {
    name: "Argo CD", group: "Pipelines & CI/CD", stage: "integrate", standing: "Current", scale: "platform", door: "one-way-at-scale",
    whatItIs: "GitOps for Kubernetes: the cluster continuously reconciles itself against a Git repository, so the repo is the deployment rather than describing it.",
    whereYouMeetIt: "Platform teams running more than a handful of Kubernetes services.",
    watchFor: "It makes drift visible, which is the point — and initially uncomfortable, because the drift was always there.",
    needs: ["Kubernetes", "Helm"], feeds: [], instead: [],
    whenYouNeedIt: "Once 'what is actually deployed right now' stops being answerable from memory.",
    notYet: "Below a cluster, there is nothing for it to reconcile. This is the last piece to add, not an early one.",
  },

  /* --------------------- Code quality & supply chain -------------------- */
  {
    name: "SonarQube", group: "Code quality & supply chain", stage: "assure", standing: "Current", scale: "team", door: "two-way",
    whatItIs: "Static analysis for bugs, vulnerabilities and code smells across 25+ languages, with a quality gate that can fail the pipeline.",
    whereYouMeetIt: "Enterprises with a code-quality mandate; now branded SonarQube Server and SonarQube Cloud.",
    watchFor: "Turned on retroactively against an old codebase it produces thousands of issues and gets ignored within a week. Gate on new code only, and the gate survives.",
    needs: ["GitHub Actions"], feeds: [], instead: [],
    whenYouNeedIt: "When more than one person writes code and 'we all just review carefully' has already failed once.",
    notYet: "Solo, the linter and the type-checker you already run cover most of this for free.",
  },
  {
    name: "Dependabot / Renovate", group: "Code quality & supply chain", stage: "assure", standing: "Current", scale: "solo", door: "two-way",
    whatItIs: "Automated dependency updates — opens pull requests when a package you depend on releases or gets a CVE.",
    whereYouMeetIt: "Built into GitHub; Renovate is the more configurable option and runs anywhere.",
    watchFor: "Without tests in CI these PRs are unmergeable noise and get ignored, which is worse than not having them. Turn it on after the pipeline, not before.",
    needs: ["GitHub Actions"], feeds: [], instead: [],
    whenYouNeedIt: "Any project that will still be running in a year — which is most of them.",
    notYet: "Before you have a test suite worth trusting, the update PRs cannot be merged safely anyway.",
  },
  {
    name: "Trivy / Grype", group: "Code quality & supply chain", stage: "assure", standing: "Current", scale: "team", door: "two-way",
    whatItIs: "Vulnerability scanners for container images, filesystems and dependency manifests. Fast enough to run on every build.",
    whereYouMeetIt: "Any pipeline that produces a container and has to answer for what is inside it.",
    watchFor: "Most findings live in the base image, not your code. Change the base image and the count collapses — fix that before triaging anything else.",
    needs: ["Docker"], feeds: [], instead: [],
    whenYouNeedIt: "When you ship containers to somebody else's infrastructure, or a client asks what is in the image.",
    notYet: "Not shipping containers yet? Nothing to scan.",
  },
  {
    name: "Pre-commit hooks", group: "Code quality & supply chain", stage: "assure", standing: "Current", scale: "solo", door: "two-way",
    whatItIs: "Formatting, linting and secret-detection run on your machine before a commit is created, rather than after it is pushed.",
    whereYouMeetIt: "pre-commit, husky, lint-staged. Cheap, and the fastest feedback loop available.",
    watchFor: "Hooks are skippable with --no-verify by design, so they are a convenience, not a control. The same checks still belong in CI.",
    needs: ["Git"], feeds: ["GitHub Actions"], instead: [],
    whenYouNeedIt: "Immediately. This is a ten-minute setup that prevents the most boring class of review comment forever.",
    notYet: "No threshold — but never let it be the only place a check runs.",
  },
  {
    name: "SBOM & SLSA", group: "Code quality & supply chain", stage: "assure", standing: "Current", scale: "platform", door: "two-way",
    whatItIs: "A machine-readable inventory of everything in a build (SBOM), and a framework for proving how the build happened (SLSA provenance).",
    whereYouMeetIt: "Regulated sectors, government supply chains, and increasingly in enterprise vendor questionnaires.",
    watchFor: "Generating an SBOM is easy and nearly useless on its own. The value is in having something that reads them when a CVE lands at 6pm on a Friday.",
    needs: ["Container registries"], feeds: [], instead: [],
    whenYouNeedIt: "The first time a client's procurement form asks for one — which is happening earlier every year.",
    notYet: "Ahead of that ask, this is paperwork that nobody reads.",
  },

  /* ------------------------ Packaging & registries ---------------------- */
  {
    name: "Docker", group: "Packaging & registries", stage: "package", standing: "Current", scale: "solo", door: "one-way-at-scale",
    whatItIs: "Application plus its libraries, settings and dependencies packaged into one container that runs identically on a laptop, a test box and production.",
    whereYouMeetIt: "Nearly every deployment pipeline built in the last decade, and most local development environments.",
    watchFor: "Containers replaced VMs because they share the host kernel rather than booting their own OS — which is also why a container is not a security boundary. Do not run as root, and pin base image versions.",
    needs: [], feeds: ["Container registries", "Docker Compose", "Kubernetes", "Trivy / Grype"], instead: [],
    whenYouNeedIt: "As soon as 'works on my machine' costs you an afternoon, or a second environment exists.",
    notYet: "A single app on a managed platform that builds from source does not need you to hold the container. Let the platform do it.",
  },
  {
    name: "Dockerfile / BuildKit", group: "Packaging & registries", stage: "package", standing: "Current", scale: "solo", door: "two-way",
    whatItIs: "The build recipe and the modern builder behind it — layer caching, multi-stage builds, parallelism and build secrets that never land in the image.",
    whereYouMeetIt: "Alongside every Docker build, usually without anyone choosing it explicitly.",
    watchFor: "Multi-stage is the difference between a 90 MB image and a 1.2 GB one. And a secret passed as a build ARG is baked into the layer history forever — use build secrets.",
    needs: ["Docker"], feeds: ["Container registries"], instead: [],
    whenYouNeedIt: "The moment you build a container at all.",
    notYet: "No threshold — but resist optimising the build before it is slow.",
  },
  {
    name: "Docker Compose", group: "Packaging & registries", stage: "package", standing: "Current", scale: "solo", door: "two-way",
    whatItIs: "Several containers described in one YAML file and started together — app, database, cache, queue — on a single machine.",
    whereYouMeetIt: "Local development for anything with more than one moving part, and plenty of small production deployments.",
    watchFor: "It is genuinely enough for production on one box, and saying so honestly saves clients a great deal of money. It has no answer for a machine that dies.",
    needs: ["Docker"], feeds: [], instead: ["Kubernetes"],
    whenYouNeedIt: "The second service. A database plus an app is already the threshold.",
    notYet: "Once you need a service to survive its host failing, Compose has nothing to offer and the next question is orchestration.",
  },
  {
    name: "Container registries", group: "Packaging & registries", stage: "package", standing: "Current", scale: "solo", door: "two-way",
    whatItIs: "Where built images are stored and pulled from — Docker Hub, GitHub Container Registry, ECR, GAR, Azure Container Registry.",
    whereYouMeetIt: "Between every build and every deployment.",
    watchFor: "Docker Hub anonymous pulls are limited to 100 per six hours (200 authenticated on the free tier). A CI fleet pulling anonymously will hit that and the failure looks like a network fault, not a quota.",
    needs: ["Dockerfile / BuildKit"], feeds: ["Kubernetes", "Argo CD", "SBOM & SLSA"], instead: [],
    whenYouNeedIt: "As soon as the machine that builds the image is not the machine that runs it.",
    notYet: "Building and running on one box? The local image cache is the registry.",
  },
  {
    name: "Helm", group: "Packaging & registries", stage: "package", standing: "Current", scale: "platform", door: "one-way-at-scale",
    whatItIs: "Templated, versioned, parameterised Kubernetes manifests — the package manager for a cluster.",
    whereYouMeetIt: "Any Kubernetes estate past a couple of services, and as the install path for most third-party cluster software.",
    watchFor: "Templated YAML is hard to read and harder to debug. Rendering the chart and reading the output is a normal part of the workflow, not a sign you did something wrong.",
    needs: ["Kubernetes"], feeds: ["Argo CD"], instead: [],
    whenYouNeedIt: "The second environment. Copy-pasted manifests diverge between staging and production within a fortnight.",
    notYet: "One service in one cluster does not need templating.",
  },
  {
    name: "Packer", group: "Packaging & registries", stage: "package", standing: "Current", scale: "platform", door: "two-way",
    whatItIs: "Builds identical machine images across clouds and hypervisors from one definition, so every instance starts from a known base.",
    whereYouMeetIt: "VM-based estates, golden-image pipelines, and anywhere boot time must be short.",
    watchFor: "BUSL-1.1 and IBM-owned, like the rest of HashiCorp. Also largely displaced by containers — reach for it when you genuinely have VMs, not by habit.",
    needs: [], feeds: ["Terraform", "OpenTofu"], instead: [],
    whenYouNeedIt: "When instances must boot fast and identically, and containers are not on the table.",
    notYet: "If the workload is containerised, this stage is already solved.",
  },

  /* ----------------------- Orchestration & runtime ---------------------- */
  {
    name: "Kubernetes", group: "Orchestration & runtime", stage: "orchestrate", standing: "Current", scale: "platform", door: "one-way-at-scale",
    whatItIs: "Runs many containers across a cluster of machines: placement, replica counts, restarts, rolling updates and scaling, all declared rather than performed.",
    whereYouMeetIt: "Larger estates and platform teams — anything genuinely multi-service at scale.",
    watchFor: "The operational weight is real and permanent. For a studio-sized project it is almost always more machine than the problem needs, and the honest recommendation is to say so.",
    needs: ["Container registries"], feeds: ["Helm", "Argo CD", "Prometheus"],
    instead: ["Docker Compose", "Platform runtimes", "Nomad"],
    whenYouNeedIt: "Roughly a dozen services, or a hard requirement to survive node failure without a person awake.",
    notYet: "Under a dozen services with no platform engineer, this buys you a second full-time job. Managed Kubernetes changes who patches the control plane, not whether you need one.",
  },
  {
    name: "Managed Kubernetes", group: "Orchestration & runtime", stage: "orchestrate", standing: "Current", scale: "platform", door: "one-way-at-scale",
    whatItIs: "EKS, GKE or AKS — the cloud runs the control plane, you still own the nodes, the networking and everything you deploy.",
    whereYouMeetIt: "Almost every Kubernetes estate built in the last five years.",
    watchFor: "It removes maybe a fifth of the operational burden, and the marketing implies it removes most of it. Upgrades, autoscaling behaviour and CNI quirks remain yours.",
    needs: ["Kubernetes"], feeds: [], instead: [],
    whenYouNeedIt: "Whenever you have decided on Kubernetes. Self-managing the control plane needs a specific reason.",
    notYet: "It does not lower the threshold for needing Kubernetes at all.",
  },
  {
    name: "Nomad", group: "Orchestration & runtime", stage: "orchestrate", standing: "Current", scale: "team", door: "one-way-at-scale",
    whatItIs: "A simpler scheduler that runs containers, raw binaries and Java alongside each other, from a single binary.",
    whereYouMeetIt: "Teams who wanted scheduling without the Kubernetes ecosystem, and estates with non-containerised workloads.",
    watchFor: "BUSL-1.1 and IBM-owned. Much smaller ecosystem — you will be writing what Kubernetes would have given you as an off-the-shelf chart.",
    needs: [], feeds: ["Consul"], instead: ["Kubernetes"],
    whenYouNeedIt: "Mixed workloads where much of the estate is not containerised.",
    notYet: "If everything is already containers, the ecosystem argument favours Kubernetes.",
  },
  {
    name: "Platform runtimes", group: "Orchestration & runtime", stage: "orchestrate", standing: "Current", scale: "solo", door: "two-way",
    whatItIs: "Vercel, Cloudflare Workers, AWS Lambda, Fly, Railway — the platform holds the scheduler, the scaling and the rollback, and you deploy code.",
    whereYouMeetIt: "Most modern small-to-mid deployments, and every project where nobody wanted to own a cluster.",
    watchFor: "This is the right answer far more often than the orchestration conversation admits. The real limits are runtime compatibility and cold starts — check both before committing, not after.",
    needs: [], feeds: ["Sentry"], instead: ["Kubernetes", "Managed Kubernetes", "Nomad"],
    whenYouNeedIt: "From day one, for almost everything a studio builds.",
    notYet: "You outgrow this when the workload stops fitting the platform's execution model — long-running processes, unusual runtimes, or per-request costs that stop making sense at volume.",
  },

  /* ----------------------------- Provisioning --------------------------- */
  {
    name: "Terraform", group: "Provisioning", stage: "provision", standing: "Current", scale: "team", door: "one-way-at-scale",
    whatItIs: "Infrastructure as code. Write the configuration, run plan to preview, run apply to build it — across AWS, Azure, GCP and hundreds of providers.",
    whereYouMeetIt: "The default for any team managing cloud infrastructure deliberately rather than by clicking.",
    watchFor: "BUSL-1.1 since 2023 and IBM-owned since the acquisition closed. Free for internal use; wrapping it in a service you sell is a licensing conversation. And the state file is shared mutable state — two people applying at once corrupts it, so remote state with locking is not optional.",
    needs: [], feeds: ["Ansible", "Kubernetes"], instead: ["OpenTofu", "Pulumi", "CloudFormation / Bicep"],
    whenYouNeedIt: "The second environment. Reproducing staging in production by hand is where the drift starts.",
    notYet: "One managed platform and no cloud resources to speak of? There is nothing to provision. Do not write Terraform to create a Vercel project.",
  },
  {
    name: "OpenTofu", group: "Provisioning", stage: "provision", standing: "Current", scale: "team", door: "one-way-at-scale",
    whatItIs: "The MPL-licensed fork of Terraform, under the Linux Foundation. Same language and workflow, with state encryption and provider-defined functions of its own.",
    whereYouMeetIt: "Around 12% of practitioners, and rising — the default recommendation for teams not tied to HCP Terraform.",
    watchFor: "The fork has genuinely diverged since 2025; it is no longer a drop-in in both directions. Migrating to it is easy today, back is less so.",
    needs: [], feeds: ["Ansible", "Kubernetes"], instead: ["Terraform", "Pulumi", "CloudFormation / Bicep"],
    whenYouNeedIt: "Same trigger as Terraform, and the better default when the BUSL terms are a concern.",
    notYet: "Same as Terraform — nothing to provision means nothing to write.",
  },
  {
    name: "Pulumi", group: "Provisioning", stage: "provision", standing: "Current", scale: "team", door: "one-way-at-scale",
    whatItIs: "Infrastructure as code in TypeScript, Python, Go or C# rather than a dedicated configuration language.",
    whereYouMeetIt: "Teams who would rather express infrastructure in the language they already write and test.",
    watchFor: "A real general-purpose language means real general-purpose complexity. Loops and abstractions that felt clever are the hardest infrastructure to review two years later.",
    needs: [], feeds: ["Kubernetes"], instead: ["Terraform", "OpenTofu", "CloudFormation / Bicep"],
    whenYouNeedIt: "When infrastructure logic is genuinely conditional and HCL is fighting you.",
    notYet: "For static infrastructure, a declarative file is easier to read and safer to change.",
  },
  {
    name: "CloudFormation / Bicep", group: "Provisioning", stage: "provision", standing: "Current", scale: "team", door: "one-way-at-scale",
    whatItIs: "The cloud vendors' own infrastructure-as-code — CloudFormation on AWS, Bicep on Azure.",
    whereYouMeetIt: "Single-cloud estates, and anywhere the client's cloud support contract is the deciding factor.",
    watchFor: "Day-one support for new services, which Terraform providers sometimes lag. The price is that it does not travel to another cloud at all.",
    needs: [], feeds: [], instead: ["Terraform", "OpenTofu", "Pulumi"],
    whenYouNeedIt: "Committed to one cloud, and the vendor's own support path matters more than portability.",
    notYet: "Any chance of a second cloud makes this the expensive choice.",
  },

  /* ----------------------------- Configuration -------------------------- */
  {
    name: "Ansible", group: "Configuration", stage: "configure", standing: "Current", scale: "team", door: "two-way",
    whatItIs: "Agentless configuration management over SSH. A playbook describes the state a server should be in; running it repeatedly is safe because the steps are idempotent.",
    whereYouMeetIt: "VM estates, on-premise servers, network devices, and any fleet too large to log into one at a time.",
    watchFor: "Ansible configures machines that already exist; Terraform creates them. Confusing the two is the most common mistake at this stage, and it produces playbooks that half-work.",
    needs: ["Terraform"], feeds: [], instead: ["Chef / Puppet", "cloud-init"],
    whenYouNeedIt: "The third server. Two you will do by hand and get away with it.",
    notYet: "Containerised workloads bake configuration into the image, so this stage is already answered.",
  },
  {
    name: "Chef / Puppet", group: "Configuration", stage: "configure", standing: "Legacy", scale: "platform", door: "two-way",
    whatItIs: "Agent-based configuration management with a central server continuously enforcing declared state.",
    whereYouMeetIt: "Large estates that adopted them before Ansible, especially in finance and telco.",
    watchFor: "Both require an agent on every node and a server to run. Inheriting one is normal; choosing one new needs a reason Ansible cannot meet.",
    needs: [], feeds: [], instead: ["Ansible", "cloud-init"],
    whenYouNeedIt: "Thousands of long-lived nodes needing continuous enforcement rather than periodic runs.",
    notYet: "Below that, the agent fleet costs more than the drift it prevents.",
  },
  {
    name: "cloud-init", group: "Configuration", stage: "configure", standing: "Current", scale: "solo", door: "two-way",
    whatItIs: "The standard first-boot configuration mechanism on cloud instances — users, packages, files and a script, from instance metadata.",
    whereYouMeetIt: "Under almost every Linux cloud VM, usually without anyone noticing.",
    watchFor: "Fine for first boot, wrong for ongoing state: it runs once. Anything that must stay true belongs in Ansible or the image.",
    needs: [], feeds: ["Ansible"], instead: ["Ansible", "Chef / Puppet"],
    whenYouNeedIt: "Any VM that needs to be useful the moment it boots.",
    notYet: "No VMs, no cloud-init.",
  },

  /* -------------------- Secrets & service networking -------------------- */
  {
    name: "Vault", group: "Secrets & service networking", stage: "secure", standing: "Current", scale: "platform", door: "one-way-at-scale",
    whatItIs: "Central secret storage with dynamic, short-lived credentials, encryption as a service, and a full audit trail of who read what.",
    whereYouMeetIt: "Larger estates, regulated environments, and anywhere credentials must expire rather than persist.",
    watchFor: "BUSL-1.1 and IBM-owned. It is also a hard dependency you are adding to production: if Vault is down, nothing starts. Plan the unseal and HA story before the first secret goes in.",
    needs: [], feeds: [], instead: ["OpenBao", "Cloud secret managers"],
    whenYouNeedIt: "When you need credentials that expire on their own, or an auditable record of every secret access.",
    notYet: "For a handful of static secrets, your platform's own secret store is safer because it has no operational failure mode you own.",
  },
  {
    name: "OpenBao", group: "Secrets & service networking", stage: "secure", standing: "Current", scale: "platform", door: "one-way-at-scale",
    whatItIs: "The MPL-2.0 fork of Vault under the Linux Foundation, sharing its API, command surface, secrets engines and auth methods.",
    whereYouMeetIt: "Teams who wanted Vault's capabilities without BUSL terms.",
    watchFor: "Smaller ecosystem and fewer people who have run it in anger. The compatibility is real; the operational community is thinner.",
    needs: [], feeds: [], instead: ["Vault", "Cloud secret managers"],
    whenYouNeedIt: "Same trigger as Vault, where the licence is the deciding factor.",
    notYet: "Same as Vault — below real credential rotation needs, this is a dependency you do not need.",
  },
  {
    name: "Consul", group: "Secrets & service networking", stage: "secure", standing: "Current", scale: "platform", door: "one-way-at-scale",
    whatItIs: "Service discovery, health checking and a service mesh — how services find and securely reach each other across environments.",
    whereYouMeetIt: "Multi-datacentre estates and Nomad deployments.",
    watchFor: "BUSL-1.1 and IBM-owned. Kubernetes already provides service discovery, so on a cluster this often solves a problem you do not have.",
    needs: [], feeds: [], instead: [],
    whenYouNeedIt: "Services spread across environments that Kubernetes DNS does not span.",
    notYet: "Inside one cluster, or on a platform runtime, this stage is already handled.",
  },
  {
    name: "Cloud secret managers", group: "Secrets & service networking", stage: "secure", standing: "Current", scale: "solo", door: "two-way",
    whatItIs: "AWS Secrets Manager, Azure Key Vault, GCP Secret Manager, Doppler, 1Password, or your platform's own encrypted environment variables.",
    whereYouMeetIt: "The overwhelmingly common answer, and usually the correct one.",
    watchFor: "The failure mode here is not the tool, it is the .env file still sitting in someone's home directory and in the repo history. Rotate anything that was ever committed.",
    needs: [], feeds: [], instead: ["Vault", "OpenBao"],
    whenYouNeedIt: "The first secret. There is no project without one.",
    notYet: "No threshold. Start here and only leave when rotation and audit genuinely demand it.",
  },

  /* ----------------------------- Observability -------------------------- */
  {
    name: "Prometheus", group: "Observability", stage: "observe", standing: "Current", scale: "team", door: "two-way",
    whatItIs: "Scrapes numeric metrics from your applications and infrastructure at intervals, stores them as time series, and queries them with PromQL.",
    whereYouMeetIt: "The industry standard for containerised workloads, and the metrics half of nearly every open observability stack.",
    watchFor: "It collects metrics, not logs or traces, and local storage is not long-term storage. Decide retention early or discover the gap during your first incident review.",
    needs: [], feeds: ["Grafana", "Alertmanager"], instead: [],
    whenYouNeedIt: "When 'is it slow?' stops being answerable by looking at it.",
    notYet: "On a platform runtime with built-in metrics, you already have this — check before running your own.",
  },
  {
    name: "Alertmanager", group: "Observability", stage: "observe", standing: "Current", scale: "team", door: "two-way",
    whatItIs: "Takes alerts from Prometheus and decides who gets told, how, and whether this one has already been reported.",
    whereYouMeetIt: "Beside every Prometheus deployment.",
    watchFor: "Grouping, inhibition and silences are the whole job. An alerting setup without them pages twelve times for one incident and gets muted permanently.",
    needs: ["Prometheus"], feeds: [], instead: [],
    whenYouNeedIt: "The moment a metric matters enough to wake someone.",
    notYet: "Collecting metrics nobody has agreed to be woken for? Add the dashboard first and the alerts when you know the threshold.",
  },
  {
    name: "Grafana", group: "Observability", stage: "observe", standing: "Current", scale: "solo", door: "two-way",
    whatItIs: "Dashboards over other people's data — connects to Prometheus, Loki, Elasticsearch and cloud monitoring and turns numbers into something readable.",
    whereYouMeetIt: "The visualisation layer of almost every open observability stack.",
    watchFor: "Grafana collects nothing. It is the dashboard in a car — the engine and sensors produce the data, the dashboard only displays it. Without a collector behind it, this is an empty screen.",
    needs: ["Prometheus"], feeds: [], instead: [],
    whenYouNeedIt: "Once more than one person needs to see the same numbers and agree on what they mean.",
    notYet: "One service on one platform: read the platform's own dashboard rather than building a second one.",
  },
  {
    name: "Loki", group: "Observability", stage: "observe", standing: "Current", scale: "team", door: "two-way",
    whatItIs: "Log aggregation that indexes labels rather than full text, so it is far cheaper to run than a search-engine-based stack.",
    whereYouMeetIt: "Beside Prometheus and Grafana, as the L in the PLG stack.",
    watchFor: "Cheap because it does not index message contents. If your workflow is arbitrary full-text search across everything, this will disappoint you and ELK will not.",
    needs: ["Grafana"], feeds: [], instead: ["ELK / OpenSearch"],
    whenYouNeedIt: "When logs live on more than one machine and grepping has stopped scaling.",
    notYet: "One host? The platform's log viewer is enough, and free.",
  },
  {
    name: "ELK / OpenSearch", group: "Observability", stage: "observe", standing: "Current", scale: "platform", door: "one-way-at-scale",
    whatItIs: "Logstash collects, Elasticsearch indexes, Kibana explores — full-text search across millions of log lines in seconds. OpenSearch is the Apache-2.0 fork.",
    whereYouMeetIt: "Complex estates with many services and a genuine forensic need.",
    watchFor: "Resource-hungry, and the bill grows with log volume rather than with traffic. Licensing also split: Elasticsearch is AGPLv3/ELv2/SSPL since 2024, OpenSearch is Apache-2.0 under the Linux Foundation — check which one is actually installed before advising on either.",
    needs: [], feeds: [], instead: ["Loki"],
    whenYouNeedIt: "When incident investigation genuinely means searching everything, and someone owns the cluster.",
    notYet: "Below that, this outgrows the application it watches. On a lean budget it is the line item that surprises people.",
  },
  {
    name: "OpenTelemetry", group: "Observability", stage: "observe", standing: "Current", scale: "team", door: "two-way",
    whatItIs: "The vendor-neutral standard for emitting metrics, logs and traces — instrument once, send anywhere.",
    whereYouMeetIt: "Roughly half of organisations already, and rising fast. Now the default collection layer rather than a contender.",
    watchFor: "This is what keeps the observability door two-way. Instrument to OTel and changing backend is a config change; instrument to a vendor SDK and it is a re-instrumentation project.",
    needs: [], feeds: ["Prometheus", "Grafana", "Loki"], instead: [],
    whenYouNeedIt: "Before you pick a backend, not after. That ordering is the entire point.",
    notYet: "No threshold worth waiting for — the cost of adopting it later is the thing it exists to prevent.",
  },
  {
    name: "Sentry", group: "Observability", stage: "observe", standing: "Current", scale: "solo", door: "two-way",
    whatItIs: "Error and performance monitoring: catches exceptions with stack traces, request context and release attribution, and groups them into issues.",
    whereYouMeetIt: "Most application teams, because it answers 'what broke for that user' rather than 'what is the CPU doing'.",
    watchFor: "This is usually the first observability tool worth adding and the one most often skipped in favour of dashboards nobody reads. Errors first, metrics second.",
    needs: [], feeds: [], instead: [],
    whenYouNeedIt: "Before the first real user. An unreported exception is an outage you learn about from a phone call.",
    notYet: "No threshold. If exactly one piece of this volume ships on a small project, make it this one.",
  },
];
