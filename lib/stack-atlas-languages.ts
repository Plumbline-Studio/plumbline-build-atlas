// GENERATED REFERENCE DATA — edit the source of truth, not the shape.
// The full language reference: every language we might plausibly meet on a
// client system, the backend frameworks it runs on, and what it is chosen for.
// Framework lists are the most-used options, not an exhaustive catalogue.

export type LanguageCategory =
  | "Web & Application"
  | "Systems & Low-Level"
  | "JVM"
  | ".NET"
  | "Functional"
  | "Data & Scientific"
  | "Mobile"
  | "Query & Data Language"
  | "Shell & Automation"
  | "Infrastructure & Config"
  | "Enterprise & Mainframe"
  | "Blockchain"
  | "Game & Graphics"
  | "Hardware & Embedded"
  | "Education & Historic";

export type LanguageStanding =
  | "Mainstream"
  | "Growing"
  | "Niche"
  | "Specialist"
  | "Experimental"
  | "Academic"
  | "Legacy"
  | "Declining"
  | "Historic";

export interface LanguageEntry {
  /** Display name. */
  name: string;
  category: LanguageCategory;
  /** Year of first public appearance. */
  year: number;
  /** Typing discipline and dominant paradigm. */
  typing: string;
  /** Backend frameworks, comma separated. Parenthesised text means "none". */
  frameworks: string;
  useCases: string;
  standing: LanguageStanding;
  /**
   * Optional pre-resolved MARKS key. Omitted throughout: Mark() resolves by
   * name via MARK_FOR, so the data stays free of presentation detail.
   */
  mark?: string | null;
}

export const LANGUAGE_CATEGORIES: LanguageCategory[] = ["Web & Application", "Systems & Low-Level", "JVM", ".NET", "Functional", "Data & Scientific", "Mobile", "Query & Data Language", "Shell & Automation", "Infrastructure & Config", "Enterprise & Mainframe", "Blockchain", "Game & Graphics", "Hardware & Embedded", "Education & Historic"];

export const STANDING_ACCENT: Record<LanguageStanding, string> = {
  Mainstream: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Growing: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  Niche: "bg-gold-bright/15 text-gold-bright border-gold-bright/30",
  Specialist: "bg-primary/12 text-primary border-primary/25",
  Experimental: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  Academic: "bg-slate/15 text-slate border-slate/25",
  Legacy: "bg-rose-500/12 text-rose-400 border-rose-500/25",
  Declining: "bg-rose-500/12 text-rose-400 border-rose-500/25",
  Historic: "bg-muted text-muted-foreground border-border",
};

export const LANGUAGES: LanguageEntry[] = [
  { name: "CoffeeScript", category: "Web & Application", year: 2009, typing: "Dynamic, transpiled to JS", frameworks: "Express (via JS), Meteor", useCases: "Legacy Rails-era front-ends; largely superseded by modern JS/TS", standing: "Legacy" },
  { name: "ColdFusion (CFML)", category: "Web & Application", year: 1995, typing: "Dynamic, tag/script hybrid", frameworks: "ColdBox, FW/1, Lucee, BoxLang", useCases: "Legacy enterprise intranets, government and insurance web systems", standing: "Legacy" },
  { name: "Crystal", category: "Web & Application", year: 2014, typing: "Static, compiled, Ruby-like", frameworks: "Lucky, Kemal, Amber, Grip", useCases: "High-performance web services with Ruby-style ergonomics, CLIs", standing: "Niche" },
  { name: "Dart", category: "Web & Application", year: 2011, typing: "Static, object-oriented", frameworks: "Shelf, Dart Frog, Serverpod, Angel3", useCases: "Flutter mobile/desktop/web apps, full-stack Dart services", standing: "Growing" },
  { name: "Elixir", category: "Web & Application", year: 2011, typing: "Dynamic, functional (BEAM)", frameworks: "Phoenix, Plug, Ash Framework, Bandit", useCases: "Real-time systems, chat and presence, fault-tolerant distributed services, LiveView UIs", standing: "Growing" },
  { name: "Erlang", category: "Web & Application", year: 1986, typing: "Dynamic, functional, concurrent", frameworks: "Cowboy, Yaws, Nitrogen, MochiWeb, Chicago Boss", useCases: "Telecoms, messaging (WhatsApp), soft real-time systems with extreme uptime requirements", standing: "Niche" },
  { name: "Go", category: "Web & Application", year: 2009, typing: "Static, compiled, concurrent", frameworks: "net/http, Gin, Echo, Fiber, Chi, Buffalo, Beego, Gorilla", useCases: "Cloud infrastructure, microservices, CLIs, networking daemons, Kubernetes ecosystem", standing: "Mainstream" },
  { name: "Hack", category: "Web & Application", year: 2014, typing: "Gradual typing (HHVM)", frameworks: "HHVM built-in server, XHP", useCases: "Meta's internal web stack; typed evolution of a large PHP codebase", standing: "Niche" },
  { name: "Haxe", category: "Web & Application", year: 2005, typing: "Static, cross-compiling", frameworks: "Tink Web, Ufront", useCases: "Cross-platform games, multi-target codebases (JS, C++, Java, PHP, Python)", standing: "Niche" },
  { name: "JavaScript", category: "Web & Application", year: 1995, typing: "Dynamic, multi-paradigm", frameworks: "Express, Fastify, NestJS, Koa, Hapi, AdonisJS, Sails, Hono, Meteor", useCases: "Web front-end and back-end, serverless functions, real-time apps, build tooling, desktop (Electron)", standing: "Mainstream" },
  { name: "Nim", category: "Web & Application", year: 2008, typing: "Static, compiled", frameworks: "Jester, Prologue, HappyX", useCases: "Systems tools, game dev, embedded, compiled scripting replacements", standing: "Niche" },
  { name: "Perl", category: "Web & Application", year: 1987, typing: "Dynamic, multi-paradigm", frameworks: "Mojolicious, Catalyst, Dancer2, Mason, Plack/PSGI", useCases: "Text processing, sysadmin scripting, bioinformatics, legacy CGI web systems", standing: "Declining" },
  { name: "PHP", category: "Web & Application", year: 1995, typing: "Dynamic, multi-paradigm", frameworks: "Laravel, Symfony, CodeIgniter, Slim, Laminas, CakePHP, Yii, Phalcon", useCases: "CMS and e-commerce (WordPress, Drupal, Magento), server-rendered web apps, shared hosting", standing: "Mainstream" },
  { name: "Python", category: "Web & Application", year: 1991, typing: "Dynamic, multi-paradigm", frameworks: "Django, FastAPI, Flask, Litestar, Pyramid, Tornado, Sanic, Starlette, Bottle", useCases: "Web back-ends, data science, ML/AI, automation, scripting, scientific computing", standing: "Mainstream" },
  { name: "Raku", category: "Web & Application", year: 2015, typing: "Dynamic, multi-paradigm", frameworks: "Cro", useCases: "Text and grammar processing, research scripting, successor experiments to Perl", standing: "Niche" },
  { name: "Ruby", category: "Web & Application", year: 1995, typing: "Dynamic, object-oriented", frameworks: "Ruby on Rails, Sinatra, Hanami, Roda, Grape, Padrino", useCases: "Rapid web app development, startup MVPs, internal tools, DevOps scripting", standing: "Mainstream" },
  { name: "TypeScript", category: "Web & Application", year: 2012, typing: "Static (gradual), multi-paradigm", frameworks: "NestJS, tRPC, Next.js route handlers, Hono, Elysia (Bun), Encore.ts, AdonisJS, Express + TS", useCases: "Large-scale web apps, typed APIs, shared client/server contracts, enterprise front-ends", standing: "Mainstream" },
  { name: "V (Vlang)", category: "Web & Application", year: 2019, typing: "Static, compiled", frameworks: "vweb, veb", useCases: "Simple compiled apps, CLIs, experimental systems work", standing: "Experimental" },
  { name: "Vala", category: "Web & Application", year: 2006, typing: "Static, compiles to C", frameworks: "Valum, libsoup", useCases: "GNOME desktop applications, GObject-based Linux software", standing: "Niche" },
  { name: "Ada", category: "Systems & Low-Level", year: 1980, typing: "Static, strongly typed", frameworks: "AWS (Ada Web Server), Gnoga", useCases: "Avionics, defence, rail signalling, space, and other safety-critical real-time systems", standing: "Niche" },
  { name: "Assembly (x86-64 / ARM)", category: "Systems & Low-Level", year: 1949, typing: "Low-level, architecture-specific", frameworks: "(n/a)", useCases: "Bootloaders, kernel internals, cryptographic primitives, reverse engineering, extreme optimisation", standing: "Specialist" },
  { name: "C", category: "Systems & Low-Level", year: 1972, typing: "Static, procedural", frameworks: "Kore, libmicrohttpd, CivetWeb, Ulfius, Onion, Mongoose", useCases: "Operating systems, kernels, embedded firmware, drivers, databases, language runtimes", standing: "Mainstream" },
  { name: "C++", category: "Systems & Low-Level", year: 1985, typing: "Static, multi-paradigm", frameworks: "Drogon, Crow, oat++, Pistache, cpp-httplib, Boost.Beast, Wt, CppCMS", useCases: "Game engines, HFT and trading systems, browsers, CAD, robotics, high-performance services", standing: "Mainstream" },
  { name: "D", category: "Systems & Low-Level", year: 2001, typing: "Static, multi-paradigm", frameworks: "Vibe.d, Hunt Framework", useCases: "Systems and application programming with C++-like performance and modern ergonomics", standing: "Niche" },
  { name: "Forth", category: "Systems & Low-Level", year: 1970, typing: "Stack-based, concatenative", frameworks: "(none)", useCases: "Embedded firmware, boot ROMs, spacecraft controllers, resource-constrained devices", standing: "Niche" },
  { name: "Hare", category: "Systems & Low-Level", year: 2022, typing: "Static, systems", frameworks: "(none standard)", useCases: "Small, stable systems software and operating system components", standing: "Experimental" },
  { name: "Modula-2", category: "Systems & Low-Level", year: 1978, typing: "Static, modular", frameworks: "(none)", useCases: "Historic systems programming and embedded controllers; teaching modular design", standing: "Legacy" },
  { name: "Oberon", category: "Systems & Low-Level", year: 1987, typing: "Static, modular", frameworks: "(none)", useCases: "Research operating systems, compiler and OS teaching", standing: "Legacy" },
  { name: "Odin", category: "Systems & Low-Level", year: 2016, typing: "Static, data-oriented", frameworks: "(no standard web framework)", useCases: "Game development, graphics programming, native systems work", standing: "Experimental" },
  { name: "Pony", category: "Systems & Low-Level", year: 2015, typing: "Static, actor-model, capabilities-secure", frameworks: "(minimal HTTP library)", useCases: "Data-race-free concurrent systems research and high-throughput actor services", standing: "Experimental" },
  { name: "Rust", category: "Systems & Low-Level", year: 2010, typing: "Static, ownership-based memory safety", frameworks: "Axum, Actix Web, Rocket, Warp, Poem, Loco, Salvo", useCases: "Systems programming, WebAssembly, CLIs, infrastructure, safety-critical services, kernels", standing: "Growing" },
  { name: "SPARK", category: "Systems & Low-Level", year: 1988, typing: "Formally verifiable Ada subset", frameworks: "(via Ada)", useCases: "Provably correct software for aerospace, nuclear, and certified safety systems", standing: "Niche" },
  { name: "WebAssembly (WAT)", category: "Systems & Low-Level", year: 2017, typing: "Static, stack-based bytecode", frameworks: "Wasmtime, WasmEdge, Spin, wasmCloud", useCases: "Portable sandboxed compute, edge functions, plugin runtimes, near-native browser code", standing: "Growing" },
  { name: "Zig", category: "Systems & Low-Level", year: 2016, typing: "Static, manual memory, no hidden control flow", frameworks: "http.zig, Zap, Jetzig", useCases: "Low-level systems, C interop and cross-compilation toolchain, embedded, game runtimes", standing: "Growing" },
  { name: "Clojure", category: "JVM", year: 2007, typing: "Dynamic, functional Lisp", frameworks: "Ring, Compojure, Reitit, Pedestal, Luminus", useCases: "Data-heavy back-ends, REPL-driven development, event processing, fintech services", standing: "Niche" },
  { name: "Groovy", category: "JVM", year: 2003, typing: "Dynamic (optionally static)", frameworks: "Grails, Ratpack, Micronaut", useCases: "Build automation (Gradle), Jenkins pipelines, JVM scripting and testing (Spock)", standing: "Niche" },
  { name: "Java", category: "JVM", year: 1995, typing: "Static, object-oriented", frameworks: "Spring Boot, Jakarta EE, Quarkus, Micronaut, Helidon, Vert.x, Dropwizard, Play, Struts", useCases: "Enterprise back-ends, Android (historically), big data (Hadoop, Spark), banking and trading systems", standing: "Mainstream" },
  { name: "JRuby", category: "JVM", year: 2001, typing: "Dynamic (Ruby on JVM)", frameworks: "Rails on JRuby, Sinatra", useCases: "Running Ruby apps on JVM infrastructure with real threads and Java library access", standing: "Niche" },
  { name: "Jython", category: "JVM", year: 1997, typing: "Dynamic (Python on JVM)", frameworks: "(via Java frameworks)", useCases: "Embedding Python scripting inside Java applications and legacy integration layers", standing: "Legacy" },
  { name: "Kotlin", category: "JVM", year: 2011, typing: "Static, multi-paradigm", frameworks: "Ktor, Spring Boot, Javalin, http4k, Micronaut, Quarkus", useCases: "Android development, JVM back-ends, Kotlin Multiplatform mobile/desktop", standing: "Mainstream" },
  { name: "Scala", category: "JVM", year: 2004, typing: "Static, functional + OO", frameworks: "Play, Pekko HTTP (ex-Akka), http4s, ZIO HTTP, Finatra, Scalatra, Lift", useCases: "Data engineering (Apache Spark), streaming pipelines, typed functional back-ends", standing: "Niche" },
  { name: "C#", category: ".NET", year: 2000, typing: "Static, multi-paradigm", frameworks: "ASP.NET Core, Minimal APIs, Blazor, Orleans, ServiceStack, NancyFX (legacy)", useCases: "Enterprise back-ends, Windows desktop, Unity game development, Azure cloud services", standing: "Mainstream" },
  { name: "F#", category: ".NET", year: 2005, typing: "Static, functional-first", frameworks: "Giraffe, Saturn, Falco, Suave, ASP.NET Core", useCases: "Financial modelling, domain modelling, data analysis, correctness-critical .NET services", standing: "Niche" },
  { name: "Visual Basic .NET", category: ".NET", year: 2002, typing: "Static, object-oriented", frameworks: "ASP.NET (Web Forms, MVC)", useCases: "Legacy line-of-business Windows applications and internal enterprise tools", standing: "Legacy" },
  { name: "Agda", category: "Functional", year: 2007, typing: "Dependently typed, proof assistant", frameworks: "(none)", useCases: "Machine-checked mathematics and type theory research", standing: "Academic" },
  { name: "Clojure (ClojureScript)", category: "Functional", year: 2011, typing: "Dynamic, functional, JS target", frameworks: "(pairs with Ring/Node back-ends)", useCases: "Functional single-page apps, Re-frame front-ends, shared full-stack Clojure", standing: "Niche" },
  { name: "Common Lisp", category: "Functional", year: 1984, typing: "Dynamic, multi-paradigm Lisp", frameworks: "Hunchentoot, Clack/Ningle, Caveman2", useCases: "Symbolic AI, rule engines, long-lived research systems, live-image development", standing: "Niche" },
  { name: "Coq / Rocq", category: "Functional", year: 1989, typing: "Dependently typed, proof assistant", frameworks: "(none)", useCases: "Verified compilers (CompCert), cryptographic proofs, formal verification of protocols", standing: "Academic" },
  { name: "Elm", category: "Functional", year: 2012, typing: "Static, pure, front-end only", frameworks: "(front-end only; pairs with any back-end)", useCases: "Reliable single-page web front-ends with no runtime exceptions", standing: "Niche" },
  { name: "F*", category: "Functional", year: 2011, typing: "Dependently typed, effectful", frameworks: "(none)", useCases: "Verified cryptography and protocol implementations (HACL*, EverParse)", standing: "Academic" },
  { name: "Gleam", category: "Functional", year: 2016, typing: "Static, functional (BEAM + JS)", frameworks: "Wisp, Mist", useCases: "Type-safe concurrent services on the Erlang VM; modern alternative to Elixir typing", standing: "Growing" },
  { name: "Haskell", category: "Functional", year: 1990, typing: "Static, pure, lazy", frameworks: "Yesod, Servant, Scotty, IHP, Snap", useCases: "Compilers, formal verification, fintech correctness-critical systems, DSL design", standing: "Niche" },
  { name: "Idris", category: "Functional", year: 2007, typing: "Dependently typed", frameworks: "(none)", useCases: "Type-driven development research, provably correct program construction", standing: "Academic" },
  { name: "Lean 4", category: "Functional", year: 2021, typing: "Dependently typed, proof assistant", frameworks: "(none)", useCases: "Formal mathematics (mathlib), verified software, AI theorem-proving research", standing: "Growing" },
  { name: "OCaml", category: "Functional", year: 1996, typing: "Static, ML-family", frameworks: "Dream, Opium, Eliom (Ocsigen)", useCases: "Compilers and static analysers, financial trading systems (Jane Street), theorem tooling", standing: "Niche" },
  { name: "PureScript", category: "Functional", year: 2013, typing: "Static, pure, Haskell-like", frameworks: "HTTPurple, via Node.js runtimes", useCases: "Strongly typed front-end applications and shared full-stack JS targets", standing: "Niche" },
  { name: "Racket", category: "Functional", year: 1995, typing: "Dynamic, language-oriented", frameworks: "Racket web-server", useCases: "Building domain-specific languages, CS education, research prototypes", standing: "Academic" },
  { name: "ReScript", category: "Functional", year: 2020, typing: "Static, ML-family, JS output", frameworks: "(via Node.js frameworks)", useCases: "Type-safe React front-ends with fast compilation and clean JS interop", standing: "Niche" },
  { name: "Roc", category: "Functional", year: 2019, typing: "Static, pure, platform-based", frameworks: "basic-webserver platform", useCases: "Fast pure-functional applications and embeddable platforms", standing: "Experimental" },
  { name: "Scheme", category: "Functional", year: 1975, typing: "Dynamic, minimal Lisp", frameworks: "Gerbil httpd, Guile web server, Spiffy (CHICKEN)", useCases: "Teaching programming fundamentals, embedded extension languages, research", standing: "Academic" },
  { name: "Standard ML", category: "Functional", year: 1983, typing: "Static, ML-family", frameworks: "(none standard)", useCases: "Programming language research, compiler courses, formal semantics", standing: "Academic" },
  { name: "Unison", category: "Functional", year: 2019, typing: "Static, content-addressed", frameworks: "Unison Cloud", useCases: "Distributed systems where code is addressed by hash; durable, versionless deployment", standing: "Experimental" },
  { name: "APL", category: "Data & Scientific", year: 1966, typing: "Array-oriented, symbolic", frameworks: "(none)", useCases: "Dense array computation, actuarial and financial modelling", standing: "Niche" },
  { name: "BQN", category: "Data & Scientific", year: 2020, typing: "Array-oriented", frameworks: "(none)", useCases: "Modern array programming research and concise numerical work", standing: "Experimental" },
  { name: "Fortran", category: "Data & Scientific", year: 1957, typing: "Static, array-oriented", frameworks: "(none; via C bindings)", useCases: "Climate modelling, computational fluid dynamics, HPC numerical libraries (BLAS, LAPACK)", standing: "Niche" },
  { name: "J", category: "Data & Scientific", year: 1990, typing: "Array-oriented, tacit", frameworks: "(none)", useCases: "Array-first quantitative analysis and mathematical exploration", standing: "Niche" },
  { name: "Julia", category: "Data & Scientific", year: 2012, typing: "Dynamic, JIT-compiled, scientific", frameworks: "Genie.jl, Oxygen.jl, HTTP.jl", useCases: "Numerical computing, differential equations, scientific ML, high-performance simulation", standing: "Growing" },
  { name: "K / q (kdb+)", category: "Data & Scientific", year: 1993, typing: "Array-oriented, vector", frameworks: "kdb+ built-in HTTP server", useCases: "Tick data and time-series analytics in trading firms; ultra-low-latency queries", standing: "Specialist" },
  { name: "MATLAB", category: "Data & Scientific", year: 1984, typing: "Dynamic, matrix-oriented", frameworks: "MATLAB Production Server", useCases: "Control systems, signal and image processing, engineering simulation, academic research", standing: "Mainstream" },
  { name: "Mojo", category: "Data & Scientific", year: 2023, typing: "Static, Python-superset for AI", frameworks: "MAX Serve", useCases: "High-performance AI kernels and inference with Python-like syntax", standing: "Experimental" },
  { name: "R", category: "Data & Scientific", year: 1993, typing: "Dynamic, statistical", frameworks: "Plumber, Shiny, RestRserve", useCases: "Statistical modelling, biostatistics, clinical trials, econometrics, reporting dashboards", standing: "Mainstream" },
  { name: "SAS", category: "Data & Scientific", year: 1976, typing: "Procedural, statistical", frameworks: "SAS Viya REST services", useCases: "Pharmaceutical trials, regulatory reporting, banking risk and government analytics", standing: "Legacy" },
  { name: "SPSS Syntax", category: "Data & Scientific", year: 1968, typing: "Procedural, statistical", frameworks: "(none)", useCases: "Social science research, survey analysis, academic statistics", standing: "Legacy" },
  { name: "Stata", category: "Data & Scientific", year: 1985, typing: "Procedural, statistical", frameworks: "(none)", useCases: "Economics, epidemiology and public policy research", standing: "Niche" },
  { name: "Wolfram Language", category: "Data & Scientific", year: 1988, typing: "Symbolic, multi-paradigm", frameworks: "Wolfram Cloud / WebAPI", useCases: "Symbolic mathematics, computational knowledge, technical computing", standing: "Niche" },
  { name: "Flutter (Dart)", category: "Mobile", year: 2017, typing: "Static, compiled UI toolkit", frameworks: "Serverpod, Dart Frog, Firebase", useCases: "Cross-platform mobile, web and desktop apps with a single rendering engine", standing: "Mainstream" },
  { name: "Java (Android)", category: "Mobile", year: 2008, typing: "Static, object-oriented", frameworks: "(client-side; pairs with Spring Boot)", useCases: "Legacy and maintenance Android application development", standing: "Mainstream" },
  { name: "Kotlin Multiplatform", category: "Mobile", year: 2017, typing: "Static, cross-platform", frameworks: "Ktor (shared client/server)", useCases: "Sharing business logic across Android, iOS, desktop and web", standing: "Growing" },
  { name: "Objective-C", category: "Mobile", year: 1984, typing: "Dynamic, C + Smalltalk messaging", frameworks: "(minimal; legacy WebObjects)", useCases: "Legacy iOS and macOS applications, Apple framework interop", standing: "Legacy" },
  { name: "React Native (JS/TS)", category: "Mobile", year: 2015, typing: "Dynamic/typed JS runtime", frameworks: "(any JS back-end; Expo services)", useCases: "Cross-platform mobile apps from a single JavaScript/TypeScript codebase", standing: "Mainstream" },
  { name: "Swift", category: "Mobile", year: 2014, typing: "Static, multi-paradigm", frameworks: "Vapor, Hummingbird", useCases: "iOS, macOS, watchOS and visionOS apps; increasingly server-side Swift", standing: "Mainstream" },
  { name: "Cypher", category: "Query & Data Language", year: 2011, typing: "Declarative graph query", frameworks: "Neo4j HTTP/Bolt API", useCases: "Graph traversal, fraud detection, recommendation engines, knowledge graphs", standing: "Niche" },
  { name: "Datalog", category: "Query & Data Language", year: 1977, typing: "Declarative logic query", frameworks: "Datomic, XTDB", useCases: "Deductive databases, static program analysis, rules-based reasoning", standing: "Niche" },
  { name: "DAX", category: "Query & Data Language", year: 2009, typing: "Declarative formula language", frameworks: "Power BI service, Analysis Services", useCases: "Power BI measures, tabular models, self-service business intelligence", standing: "Mainstream" },
  { name: "GraphQL", category: "Query & Data Language", year: 2015, typing: "Declarative API query language", frameworks: "Apollo Server, GraphQL Yoga, Hasura, Strawberry, graphql-java", useCases: "Client-driven API contracts, aggregating multiple back-end services, mobile data fetching", standing: "Mainstream" },
  { name: "MDX", category: "Query & Data Language", year: 1997, typing: "Declarative OLAP query", frameworks: "SSAS, Mondrian", useCases: "Multidimensional cube reporting and business intelligence measures", standing: "Legacy" },
  { name: "PL/pgSQL", category: "Query & Data Language", year: 1998, typing: "Procedural SQL extension", frameworks: "PostgREST, pgTAP, PL/Proxy", useCases: "PostgreSQL stored procedures, triggers, row-level security logic", standing: "Mainstream" },
  { name: "PL/SQL", category: "Query & Data Language", year: 1991, typing: "Procedural SQL extension", frameworks: "Oracle APEX, ORDS", useCases: "Oracle stored procedures, ERP business logic, banking and telco batch processing", standing: "Mainstream" },
  { name: "SPARQL", category: "Query & Data Language", year: 2008, typing: "Declarative RDF query", frameworks: "Apache Jena Fuseki, Virtuoso", useCases: "Semantic web, linked open data, ontology and life-sciences knowledge bases", standing: "Niche" },
  { name: "SQL", category: "Query & Data Language", year: 1974, typing: "Declarative query", frameworks: "PostgREST, Hasura, Supabase, Directus", useCases: "Relational data definition and querying across every major database engine", standing: "Mainstream" },
  { name: "T-SQL", category: "Query & Data Language", year: 1989, typing: "Procedural SQL extension", frameworks: "SQL Server + ASP.NET, OData services", useCases: "SQL Server stored procedures, reporting, ETL and enterprise data logic", standing: "Mainstream" },
  { name: "XQuery / XSLT", category: "Query & Data Language", year: 1998, typing: "Declarative XML transformation", frameworks: "BaseX, eXist-db, Saxon", useCases: "XML document transformation, publishing pipelines, financial and legal document formats", standing: "Legacy" },
  { name: "AppleScript", category: "Shell & Automation", year: 1993, typing: "Dynamic, natural-language style", frameworks: "(none)", useCases: "macOS application automation and inter-app workflows", standing: "Niche" },
  { name: "AWK", category: "Shell & Automation", year: 1977, typing: "Pattern-action text processing", frameworks: "(none)", useCases: "Line-oriented log and CSV processing in Unix pipelines", standing: "Niche" },
  { name: "Bash / sh", category: "Shell & Automation", year: 1989, typing: "Dynamic shell scripting", frameworks: "CGI (legacy)", useCases: "Server automation, CI/CD glue, deployment scripts, Unix system administration", standing: "Mainstream" },
  { name: "Batch (CMD)", category: "Shell & Automation", year: 1981, typing: "Procedural shell scripting", frameworks: "(none)", useCases: "Legacy Windows automation, installer scripts, scheduled tasks", standing: "Legacy" },
  { name: "Fish", category: "Shell & Automation", year: 2005, typing: "Dynamic shell scripting", frameworks: "(none)", useCases: "Ergonomic interactive shell use with strong defaults", standing: "Niche" },
  { name: "Lua", category: "Shell & Automation", year: 1993, typing: "Dynamic, embeddable", frameworks: "OpenResty/Lapis, Sailor, Pegasus", useCases: "Game scripting (Roblox, WoW), Nginx/OpenResty edge logic, Redis scripts, Neovim config", standing: "Mainstream" },
  { name: "PowerShell", category: "Shell & Automation", year: 2006, typing: "Dynamic, object-pipeline shell", frameworks: "Pode", useCases: "Windows and Azure administration, CI/CD scripting, infrastructure automation", standing: "Mainstream" },
  { name: "sed", category: "Shell & Automation", year: 1974, typing: "Stream editing DSL", frameworks: "(none)", useCases: "In-place text substitution across files and pipelines", standing: "Niche" },
  { name: "Tcl", category: "Shell & Automation", year: 1988, typing: "Dynamic, embeddable", frameworks: "Tcl Web Server, Rivet, Wub", useCases: "EDA tool scripting (Vivado, Synopsys), network test automation, Expect scripts", standing: "Legacy" },
  { name: "VBA", category: "Shell & Automation", year: 1993, typing: "Dynamic, embedded scripting", frameworks: "(none)", useCases: "Excel, Access and Office automation; finance and operations spreadsheet macros", standing: "Legacy" },
  { name: "Zsh", category: "Shell & Automation", year: 1990, typing: "Dynamic shell scripting", frameworks: "(none)", useCases: "Interactive shell workflows, developer environment configuration", standing: "Mainstream" },
  { name: "Bicep", category: "Infrastructure & Config", year: 2020, typing: "Declarative, ARM-targeted", frameworks: "Azure Resource Manager", useCases: "Azure infrastructure as code with a cleaner syntax than raw ARM templates", standing: "Growing" },
  { name: "CUE", category: "Infrastructure & Config", year: 2018, typing: "Typed constraint-based configuration", frameworks: "(validates YAML/JSON)", useCases: "Schema validation and configuration unification for complex deployments", standing: "Growing" },
  { name: "Dhall", category: "Infrastructure & Config", year: 2017, typing: "Typed, total configuration", frameworks: "(compiles to YAML/JSON)", useCases: "Type-safe configuration generation without arbitrary code execution", standing: "Niche" },
  { name: "Dockerfile", category: "Infrastructure & Config", year: 2013, typing: "Declarative build instructions", frameworks: "Docker, BuildKit, Podman", useCases: "Container image definition and reproducible application packaging", standing: "Mainstream" },
  { name: "HCL (Terraform)", category: "Infrastructure & Config", year: 2014, typing: "Declarative configuration", frameworks: "Terraform, OpenTofu, HCP Terraform", useCases: "Infrastructure as code across AWS, Azure, GCP and hundreds of providers", standing: "Mainstream" },
  { name: "JSON", category: "Infrastructure & Config", year: 2001, typing: "Data interchange format", frameworks: "(universal)", useCases: "API payloads, configuration files, document databases, log structures", standing: "Mainstream" },
  { name: "Jsonnet", category: "Infrastructure & Config", year: 2014, typing: "Templated data configuration", frameworks: "Tanka, Grafana provisioning", useCases: "Generating large Kubernetes and monitoring configurations programmatically", standing: "Niche" },
  { name: "Nix", category: "Infrastructure & Config", year: 2003, typing: "Pure functional configuration", frameworks: "NixOS, nixpkgs", useCases: "Reproducible builds, declarative operating system configuration, dev environments", standing: "Growing" },
  { name: "Puppet DSL", category: "Infrastructure & Config", year: 2005, typing: "Declarative configuration management", frameworks: "Puppet Server", useCases: "Server state enforcement and compliance in large estates", standing: "Legacy" },
  { name: "Starlark", category: "Infrastructure & Config", year: 2017, typing: "Deterministic Python dialect", frameworks: "Bazel, Buck2", useCases: "Hermetic build definitions for large monorepos", standing: "Niche" },
  { name: "TOML", category: "Infrastructure & Config", year: 2013, typing: "Declarative configuration", frameworks: "Cargo, Poetry, Hugo", useCases: "Readable project and package configuration files", standing: "Mainstream" },
  { name: "YAML", category: "Infrastructure & Config", year: 2001, typing: "Declarative data serialisation", frameworks: "Kubernetes, Ansible, GitHub Actions, Helm", useCases: "Container orchestration manifests, CI pipelines, application configuration", standing: "Mainstream" },
  { name: "ABAP", category: "Enterprise & Mainframe", year: 1983, typing: "Procedural + object-oriented 4GL", frameworks: "SAP NetWeaver AS, SAP RAP, OData services", useCases: "SAP ERP customisation, business process extensions, enterprise reporting", standing: "Niche" },
  { name: "Apex", category: "Enterprise & Mainframe", year: 2006, typing: "Static, Java-like, platform-bound", frameworks: "Salesforce Lightning Platform, REST/SOAP APIs", useCases: "Salesforce CRM customisation, triggers, business logic and integrations", standing: "Niche" },
  { name: "Ballerina", category: "Enterprise & Mainframe", year: 2017, typing: "Static, integration-oriented", frameworks: "Ballerina runtime (built-in HTTP/gRPC)", useCases: "API integration, enterprise service composition, cloud-native middleware", standing: "Experimental" },
  { name: "COBOL", category: "Enterprise & Mainframe", year: 1959, typing: "Procedural, business-oriented", frameworks: "CICS, IBM z/OS Connect, Micro Focus Enterprise Server", useCases: "Core banking, insurance policy systems, government benefits, mainframe batch processing", standing: "Legacy" },
  { name: "Delphi / Object Pascal", category: "Enterprise & Mainframe", year: 1995, typing: "Static, object-oriented", frameworks: "DataSnap, Horse, mORMot, Brook", useCases: "Windows desktop line-of-business software, point-of-sale, industrial control front-ends", standing: "Legacy" },
  { name: "Informix 4GL", category: "Enterprise & Mainframe", year: 1986, typing: "Procedural 4GL", frameworks: "Genero Application Server", useCases: "Legacy transactional business systems on Informix databases", standing: "Legacy" },
  { name: "JCL", category: "Enterprise & Mainframe", year: 1964, typing: "Job control scripting", frameworks: "(n/a)", useCases: "Mainframe batch job scheduling and dataset management on z/OS", standing: "Legacy" },
  { name: "MUMPS / M", category: "Enterprise & Mainframe", year: 1966, typing: "Dynamic, integrated database", frameworks: "(built-in), YottaDB, InterSystems IRIS", useCases: "Electronic health records (Epic, VistA), core banking, hierarchical database systems", standing: "Legacy" },
  { name: "Natural", category: "Enterprise & Mainframe", year: 1979, typing: "Procedural, 4GL", frameworks: "Software AG EntireX", useCases: "Adabas database applications in insurance, government and utilities", standing: "Legacy" },
  { name: "Pascal", category: "Enterprise & Mainframe", year: 1970, typing: "Static, procedural", frameworks: "(via Free Pascal / mORMot)", useCases: "Teaching structured programming; legacy application maintenance", standing: "Legacy" },
  { name: "PL/I", category: "Enterprise & Mainframe", year: 1964, typing: "Procedural, general-purpose", frameworks: "CICS", useCases: "Legacy mainframe scientific and commercial applications", standing: "Legacy" },
  { name: "Progress ABL (OpenEdge)", category: "Enterprise & Mainframe", year: 1984, typing: "Procedural 4GL with database", frameworks: "OpenEdge PASOE", useCases: "ERP and distribution systems for mid-market manufacturers and wholesalers", standing: "Legacy" },
  { name: "REXX", category: "Enterprise & Mainframe", year: 1979, typing: "Dynamic scripting", frameworks: "(none)", useCases: "Mainframe and OS/2 automation, TSO/ISPF tooling", standing: "Legacy" },
  { name: "RPG (IBM i)", category: "Enterprise & Mainframe", year: 1959, typing: "Procedural, report-oriented", frameworks: "IBM i Integrated Web Services, Profound.js", useCases: "AS/400 and IBM i business applications in manufacturing, distribution and retail", standing: "Legacy" },
  { name: "Cairo", category: "Blockchain", year: 2020, typing: "Static, provable computation", frameworks: "Starknet, Scarb", useCases: "Zero-knowledge provable programs and Starknet contracts", standing: "Growing" },
  { name: "Clarity", category: "Blockchain", year: 2020, typing: "Decidable, interpreted", frameworks: "Stacks node, Clarinet", useCases: "Predictable Bitcoin-anchored smart contracts on Stacks", standing: "Niche" },
  { name: "Michelson", category: "Blockchain", year: 2018, typing: "Stack-based, formally verifiable", frameworks: "Tezos node", useCases: "Tezos smart contract execution layer, typically compiled from LIGO or SmartPy", standing: "Niche" },
  { name: "Move", category: "Blockchain", year: 2019, typing: "Static, resource-oriented", frameworks: "Sui / Aptos node SDKs", useCases: "Asset-safe smart contracts on Sui, Aptos and Diem-derived chains", standing: "Growing" },
  { name: "Rust (Solana / ink!)", category: "Blockchain", year: 2018, typing: "Static, memory-safe", frameworks: "Anchor (Solana), ink! (Polkadot), CosmWasm", useCases: "High-throughput chain programs, parachain contracts, Cosmos smart contracts", standing: "Growing" },
  { name: "Solidity", category: "Blockchain", year: 2014, typing: "Static, contract-oriented", frameworks: "Hardhat, Foundry (Truffle sunset 2023)", useCases: "Ethereum and EVM smart contracts: DeFi, tokens, NFTs, DAOs", standing: "Mainstream" },
  { name: "Vyper", category: "Blockchain", year: 2017, typing: "Static, Pythonic, security-focused", frameworks: "Titanoboa, Brownie (EVM)", useCases: "Auditable EVM smart contracts where simplicity reduces attack surface", standing: "Niche" },
  { name: "C# (Unity)", category: "Game & Graphics", year: 2005, typing: "Static, object-oriented", frameworks: "Unity Netcode, Photon, Mirror, PlayFab", useCases: "Cross-platform game development, AR/VR, simulation and training software", standing: "Mainstream" },
  { name: "C++ (Unreal)", category: "Game & Graphics", year: 1998, typing: "Static, engine-integrated", frameworks: "Unreal dedicated server, EOS", useCases: "AAA game development, virtual production, real-time architectural visualisation", standing: "Mainstream" },
  { name: "CUDA", category: "Game & Graphics", year: 2007, typing: "C/C++ extension for GPUs", frameworks: "Triton Inference Server, NVIDIA NIM", useCases: "Deep learning training and inference, scientific GPU acceleration, HPC kernels", standing: "Mainstream" },
  { name: "GDScript", category: "Game & Graphics", year: 2014, typing: "Dynamic, Python-like", frameworks: "(Godot multiplayer/high-level networking)", useCases: "Godot Engine game logic, indie 2D/3D games, rapid prototyping", standing: "Growing" },
  { name: "GLSL", category: "Game & Graphics", year: 2004, typing: "Shading language (OpenGL/Vulkan)", frameworks: "(n/a)", useCases: "OpenGL/WebGL/Vulkan shaders for cross-platform real-time graphics", standing: "Mainstream" },
  { name: "HLSL", category: "Game & Graphics", year: 2002, typing: "Shading language (DirectX)", frameworks: "(n/a)", useCases: "DirectX vertex, pixel and compute shaders for Windows and Xbox rendering", standing: "Mainstream" },
  { name: "MSL (Metal)", category: "Game & Graphics", year: 2014, typing: "Shading language (Apple)", frameworks: "(n/a)", useCases: "GPU rendering and compute on Apple silicon devices", standing: "Mainstream" },
  { name: "OpenCL", category: "Game & Graphics", year: 2009, typing: "Vendor-neutral parallel compute", frameworks: "(n/a)", useCases: "Cross-vendor GPU and accelerator compute across CPUs, GPUs and FPGAs", standing: "Niche" },
  { name: "UnrealScript", category: "Game & Graphics", year: 1998, typing: "Dynamic, engine-bound", frameworks: "(legacy Unreal servers)", useCases: "Legacy Unreal Engine 3 game logic; superseded by C++ and Blueprints", standing: "Legacy" },
  { name: "Verse", category: "Game & Graphics", year: 2023, typing: "Static, functional-logic", frameworks: "Epic Online Services", useCases: "UEFN and Fortnite Creative experiences; Epic's metaverse scripting", standing: "Experimental" },
  { name: "WGSL", category: "Game & Graphics", year: 2021, typing: "Shading language (WebGPU)", frameworks: "(n/a)", useCases: "Portable browser GPU compute and rendering via WebGPU", standing: "Growing" },
  { name: "Arduino (C++ subset)", category: "Hardware & Embedded", year: 2005, typing: "Static, embedded C++", frameworks: "ESPAsyncWebServer, WebServer library", useCases: "Hobbyist and prototype electronics, sensors, IoT devices, maker projects", standing: "Mainstream" },
  { name: "Bluespec", category: "Hardware & Embedded", year: 2003, typing: "Rule-based hardware description", frameworks: "(n/a)", useCases: "High-level synthesis and formal hardware design research", standing: "Niche" },
  { name: "Chisel", category: "Hardware & Embedded", year: 2012, typing: "Scala-embedded hardware DSL", frameworks: "(n/a)", useCases: "Agile RISC-V and accelerator hardware generation", standing: "Niche" },
  { name: "LabVIEW (G)", category: "Hardware & Embedded", year: 1986, typing: "Graphical dataflow", frameworks: "NI Web Services", useCases: "Test and measurement systems, laboratory instrument control, data acquisition", standing: "Niche" },
  { name: "Ladder Logic (IEC 61131-3)", category: "Hardware & Embedded", year: 1968, typing: "Graphical, relay-based", frameworks: "(PLC runtimes, OPC UA gateways)", useCases: "Industrial PLC control in factories, water treatment and process automation", standing: "Mainstream" },
  { name: "MicroPython", category: "Hardware & Embedded", year: 2014, typing: "Dynamic, embedded Python", frameworks: "Microdot, Picoweb", useCases: "Microcontroller scripting on ESP32, Raspberry Pi Pico and similar boards", standing: "Growing" },
  { name: "Structured Text (IEC 61131-3)", category: "Hardware & Embedded", year: 1993, typing: "Procedural, Pascal-like", frameworks: "(PLC runtimes, OPC UA)", useCases: "Complex PLC control algorithms and motion control in industrial automation", standing: "Mainstream" },
  { name: "SystemVerilog", category: "Hardware & Embedded", year: 2005, typing: "Hardware description + verification", frameworks: "(n/a)", useCases: "Modern chip design and UVM-based hardware verification", standing: "Mainstream" },
  { name: "Verilog", category: "Hardware & Embedded", year: 1984, typing: "Hardware description", frameworks: "(n/a)", useCases: "ASIC and FPGA digital circuit design and simulation", standing: "Mainstream" },
  { name: "VHDL", category: "Hardware & Embedded", year: 1987, typing: "Hardware description, strongly typed", frameworks: "(n/a)", useCases: "FPGA and ASIC design in aerospace, defence and European industry", standing: "Mainstream" },
  { name: "ALGOL 60", category: "Education & Historic", year: 1960, typing: "Procedural, block-structured", frameworks: "(none)", useCases: "Foundational algorithm publication language; ancestor of most modern syntax", standing: "Historic" },
  { name: "BASIC", category: "Education & Historic", year: 1964, typing: "Procedural, interpreted", frameworks: "(none)", useCases: "Historic microcomputer programming; beginner instruction", standing: "Historic" },
  { name: "Bend", category: "Education & Historic", year: 2024, typing: "High-level parallel functional", frameworks: "(none)", useCases: "Automatically parallelised computation research on GPUs", standing: "Experimental" },
  { name: "Carbon", category: "Education & Historic", year: 2022, typing: "Static, C++ successor experiment", frameworks: "(none yet)", useCases: "Experimental successor path for large existing C++ codebases", standing: "Experimental" },
  { name: "Eiffel", category: "Education & Historic", year: 1986, typing: "Static, design-by-contract", frameworks: "EWF (Eiffel Web Framework)", useCases: "Contract-driven enterprise software; teaching rigorous OO design", standing: "Legacy" },
  { name: "Factor", category: "Education & Historic", year: 2003, typing: "Concatenative, stack-based", frameworks: "Furnace", useCases: "Concatenative language research and exploratory programming", standing: "Experimental" },
  { name: "Logo", category: "Education & Historic", year: 1967, typing: "Dynamic, educational Lisp dialect", frameworks: "(none)", useCases: "Teaching programming concepts to children through turtle graphics", standing: "Historic" },
  { name: "Prolog", category: "Education & Historic", year: 1972, typing: "Logic programming", frameworks: "SWI-Prolog HTTP libraries", useCases: "Rule engines, expert systems, natural language parsing, constraint solving", standing: "Niche" },
  { name: "Scratch", category: "Education & Historic", year: 2007, typing: "Visual block-based", frameworks: "(none)", useCases: "Introductory programming education for children and beginners", standing: "Mainstream" },
  { name: "Simula 67", category: "Education & Historic", year: 1967, typing: "Object-oriented, simulation", frameworks: "(none)", useCases: "First object-oriented language; discrete event simulation research", standing: "Historic" },
  { name: "Smalltalk", category: "Education & Historic", year: 1972, typing: "Dynamic, pure object-oriented", frameworks: "Seaside, Teapot (Pharo)", useCases: "Live-image development, financial back-office systems, OO research heritage", standing: "Niche" },
];
