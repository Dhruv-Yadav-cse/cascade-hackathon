# CASCADE Project Plan

## 1. Product goal

CASCADE is a professional decision-consequence analysis tool. Its MVP must make one idea unmistakable:

> A decision creates changes in connected obligations and entities; those changes propagate through scenarios over time and produce explainable actions.

The first release should optimize for one complete, convincing analysis rather than broad enterprise coverage.

## 2. Current workspace assessment

- The workspace is **not empty**, but CASCADE application code does not exist yet.
- Existing files are reusable starter infrastructure:
  - Minimal Express 5 API server under `artifacts/api-server`.
  - OpenAPI health-check contract under `lib/api-spec`.
  - Empty Drizzle schema under `lib/db`.
  - React component-preview sandbox under `artifacts/mockup-sandbox`.
- No CASCADE frontend, backend domain routes, database tables, authentication, analysis engine, or production UI has been implemented.
- The first real application should be a new React/Vite web artifact, while the existing API server and shared libraries can be extended.

## 3. Recommended stack

| Area | Recommendation | Reason |
|---|---|---|
| Frontend | React + Vite + TypeScript | Already aligned with the workspace and fast to build. |
| UI | Existing Radix/shadcn-style primitives, Tailwind, Lucide, Framer Motion only where useful | Avoids unnecessary dependencies while supporting a polished professional interface. |
| Routing/data | Wouter or React Router plus generated React Query hooks | Lightweight routing and consistent API caching/loading states. |
| Backend | Existing Express 5 + TypeScript API server | Already scaffolded; no second server is needed. |
| API contract | OpenAPI first, then generated client/Zod types | Keeps frontend and backend aligned and reduces duplicate validation code. |
| Database | Replit PostgreSQL + Drizzle ORM | Relational integrity for users, analyses, graph records, scenarios, events, and reports. |
| Auth | Clerk via the Replit-managed Clerk integration | Avoids implementing password storage, sessions, and identity security locally. |
| AI | Replit AI Integration using structured JSON outputs | No user-owned API key required; provider/model can change without rewriting CASCADE. |
| Testing | Vitest for engine/API units; a small number of browser smoke tests later | Test the deterministic core first and conserve credits. |
| Deployment | Replit deployment after the MVP is stable | Defer deployment configuration until a working vertical slice exists. |

## 4. Architecture

### Request flow

1. The user creates a decision and adds context/evidence.
2. The API stores the draft and sends a bounded, sanitized analysis request to the AI integration.
3. The AI returns a versioned, structured proposal: entities, obligations, dependencies, assumptions, scenarios, and candidate consequences.
4. The API validates the proposal with Zod and persists only valid records.
5. The deterministic cascade engine runs against the normalized graph and scenario parameters.
6. The API stores graph paths, simulated events, severity scores, and recommendations.
7. The frontend renders the analysis workspace, graph, timeline, and report from persisted API data.

### Trust boundary

- AI is an analyst/mapper, not the source of truth.
- The server validates every AI response and user input.
- The cascade engine is deterministic and auditable.
- Every generated conclusion should retain source evidence, assumptions, confidence, and causal parent references where available.
- Analysis ownership and authorization are enforced in the API on every non-public endpoint.

## 5. Obligation graph representation

Use PostgreSQL tables, not a graph database, for the MVP:

- `graph_nodes`: typed nodes such as `decision`, `person`, `organization`, `contract`, `asset`, `obligation`, `dependency`, `event`, and `assumption`.
- `graph_edges`: directed relationships with `edge_type`, `weight`, `status`, `confidence`, `source_reference`, and optional rule metadata.
- `graph_nodes.attributes` and `graph_edges.metadata`: JSONB for domain-specific properties that do not justify new columns yet.
- Stable UUIDs and an `analysis_id` on every graph record keep each analysis isolated and reproducible.

The frontend receives a normalized graph DTO:

```text
nodes: [{ id, type, label, attributes, confidence }]
edges: [{ id, source, target, type, weight, confidence, rationale }]
```

The MVP should keep node/edge types intentionally small. New types should be added only when a real analysis requires them.

## 6. MVP scenario simulation

Start with scenario templates rather than a general-purpose simulator:

- **Execute as planned**: the decision occurs with expected assumptions.
- **Delayed/partial execution**: one or more obligations or dependencies are delayed.
- **Adverse condition**: a selected risk or assumption fails.

Each scenario contains parameter overrides and an initial event set. The engine advances through a small number of discrete time horizons (for example, immediate, 30 days, 90 days, and 12 months) rather than pretending to predict exact dates.

Each generated event includes:

- scenario and time horizon
- event type and description
- source node/edge
- causal parent event
- affected node/edge
- severity, likelihood, confidence
- rationale and assumptions
- status: projected, confirmed input, or unresolved

This is enough to demonstrate consequence propagation without building an expensive probabilistic or agent-based simulator.

## 7. Cascade engine

Implement a deterministic, explainable propagation engine:

1. Seed the queue with the decision's direct effects.
2. Traverse outgoing graph edges in priority order.
3. Apply typed propagation rules, such as:
   - obligation breach affects dependent obligations;
   - dependency delay shifts downstream events;
   - entity impact raises exposure on linked obligations;
   - failed assumption activates an adverse branch.
4. Emit an event whenever a rule changes a node's state.
5. Continue until the horizon, maximum depth, or no new state changes remain.
6. Merge duplicate states and prevent infinite cycles using `(scenario, node, state, horizon)` keys.
7. Aggregate severity and likelihood into a transparent risk score.

The output must preserve the causal path, for example:

```text
Decision
→ delayed supplier obligation
→ missed delivery dependency
→ customer commitment at risk
→ financial/reputational consequence
```

Do not use an LLM inside the propagation loop. AI may suggest rules, labels, and explanations, but repeatable simulation belongs in server-side code.

## 8. Timeline visualization

The timeline is a projection of persisted simulation events, not a second source of truth.

- Horizontal time bands for the selected scenario.
- Events grouped by horizon and ordered by causal depth.
- Severity shown with accessible color plus text/icon labels.
- Selecting an event highlights its causal path in the graph and opens its evidence/rationale.
- Mobile view becomes a vertical chronological list.
- The first MVP should use a custom React/SVG or CSS visualization; do not add a specialized timeline library unless the native implementation proves insufficient.

## 9. Main screens

1. **Sign in / account entry** — Clerk-managed authentication.
2. **Analysis history** — previous analyses, status, date, and risk summary.
3. **New decision intake** — decision statement, objective, time horizon, and known constraints.
4. **Context & evidence** — notes, links, uploaded text later, evidence source labels, and assumptions.
5. **Analysis workspace** — step progress, AI processing state, validation warnings, and rerun controls.
6. **Graph explorer** — interactive obligation/entity/dependency graph with filters and node detail.
7. **Scenario comparison** — select a scenario and compare projected outcomes.
8. **Cascade paths** — ranked consequence paths with causal explanations.
9. **Timeline** — projected events over time, linked to graph paths.
10. **Risk & recommendations** — severity, confidence, key assumptions, and recommended actions.
11. **Final report** — professional, shareable/read-only analysis summary.
12. **Settings** — profile, workspace preferences, and data deletion/export later.

The workspace should feel like one guided analysis flow, with history and settings supporting it rather than competing with it.

## 10. Initial database entities

- `users` / Clerk identity mapping
- `analyses`: title, decision statement, objective, status, owner, timestamps
- `evidence_items`: analysis, type, content/reference, source, reliability, timestamp
- `assumptions`: analysis, statement, status, confidence, source
- `graph_nodes`
- `graph_edges`
- `scenarios`: name, type, description, parameters, selected flag
- `simulation_runs`: analysis, scenario, engine version, status, timestamps
- `simulation_events`: run, time horizon, causal parent, source/affected graph records, scores, rationale
- `recommendations`: analysis/run, action, priority, rationale, linked event/path
- `reports`: analysis, version, generated content/structured sections, status

Defer teams, billing, audit exports, vector search, attachments/object storage, and graph analytics tables until usage proves they are needed.

## 11. Initial API endpoints

All endpoints require authentication except health:

### Analyses

- `GET /api/analyses`
- `POST /api/analyses`
- `GET /api/analyses/:analysisId`
- `PATCH /api/analyses/:analysisId`
- `DELETE /api/analyses/:analysisId`

### Evidence and assumptions

- `GET /api/analyses/:analysisId/evidence`
- `POST /api/analyses/:analysisId/evidence`
- `PATCH /api/evidence/:evidenceId`
- `DELETE /api/evidence/:evidenceId`
- `GET /api/analyses/:analysisId/assumptions`
- `POST /api/analyses/:analysisId/assumptions`

### Analysis and graph

- `POST /api/analyses/:analysisId/analyze`
- `GET /api/analyses/:analysisId/graph`
- `GET /api/analyses/:analysisId/scenarios`
- `POST /api/analyses/:analysisId/scenarios`
- `POST /api/scenarios/:scenarioId/simulate`
- `GET /api/simulation-runs/:runId`
- `GET /api/simulation-runs/:runId/paths`
- `GET /api/simulation-runs/:runId/timeline`
- `GET /api/analyses/:analysisId/recommendations`
- `POST /api/analyses/:analysisId/report`
- `GET /api/analyses/:analysisId/report`

For the first vertical slice, implement only the endpoints needed to create one analysis, run one analysis, fetch graph/scenario/run/timeline/recommendations, and list history. Add CRUD breadth after the wow moment works.

## 12. External services

### Actually necessary for the MVP

- Replit PostgreSQL.
- Replit-managed Clerk integration for authentication.
- Replit AI Integration for structured AI analysis.

### Not necessary initially

- Neo4j or another graph database.
- A vector database or retrieval service.
- Separate workflow/orchestration infrastructure.
- Paid data providers.
- Object storage, unless evidence uploads are explicitly required in the first demo.
- Separate analytics, billing, email, or messaging services.

### Free/open-source coverage

The frontend, API, schema, graph model, deterministic simulator, timeline, validation, report assembly, and tests can be implemented with the existing TypeScript ecosystem and free/open-source packages. Hosted auth, hosted PostgreSQL, and hosted AI access are the only platform capabilities to plan for; no user-owned API key should be required.

## 13. Recommended folder structure

```text
artifacts/
  cascade/
    src/
      App.tsx
      main.tsx
      index.css
      routes/
      components/
        analysis/
        graph/
        timeline/
        report/
        ui/
      lib/
        api.ts
        auth.ts
        formatters.ts
      hooks/
lib/
  api-spec/
    openapi.yaml
  api-client-react/
  api-zod/
  db/
    src/
      schema/
      index.ts
artifacts/
  api-server/
    src/
      routes/
      services/
        ai/
        cascade/
        reports/
      middleware/
      lib/
```

Keep domain logic in backend services/libs rather than React components. Keep generated API files generated and avoid hand-editing them.

## 14. Credit-conscious implementation milestones

Each milestone is intentionally small. Stop after each one and wait for explicit approval before starting the next.

### Milestone 1 — Product contract and vertical-slice skeleton

- Confirm the MVP decision-to-cascade path and terminology.
- Create the CASCADE web artifact.
- Define the first OpenAPI contract and regenerate client types.
- Add Clerk integration only if the user wants auth enabled in this slice.
- Deliver: navigable shell with real loading/error/empty states and no fake analysis results.

### Milestone 2 — Persistence and analysis intake

- Add the smallest schema for users, analyses, evidence, assumptions, and scenarios.
- Add authenticated CRUD endpoints.
- Build intake/context screens and persistent history.
- Deliver: a user can create, save, reopen, and delete an analysis.

### Milestone 3 — Structured AI extraction

- Add bounded AI prompt templates and Zod response schemas.
- Convert decision/context into a validated graph proposal.
- Persist the proposal with evidence and confidence references.
- Deliver: a real analysis produces a reviewable graph draft.

### Milestone 4 — Deterministic cascade simulation

- Add graph/scenario/run/event tables and the rule-based engine.
- Implement the three MVP scenario templates.
- Add unit tests for propagation, cycles, depth, scoring, and reproducibility.
- Deliver: one analysis produces real consequence paths and events.

### Milestone 5 — Graph, paths, and timeline experience

- Build the interactive graph explorer.
- Connect path selection to event highlighting.
- Build responsive timeline and scenario comparison.
- Deliver: the core visual wow moment is usable on desktop and mobile.

### Milestone 6 — Risk, recommendations, and report

- Add transparent risk aggregation.
- Generate recommendations from simulated events and evidence.
- Assemble a professional report from stored structured data.
- Deliver: the complete decision-to-recommendation flow.

### Milestone 7 — Hardening and release readiness

- Complete authorization checks, validation, error handling, retries, and empty states.
- Add focused API/engine tests and a small smoke test.
- Add observability, environment validation, deployment configuration, and a short user guide.
- Deliver: a stable hackathon MVP ready to publish.

## 15. First build recommendation

Build **Milestone 1** first, but keep it narrow: establish the CASCADE artifact, contract, and coherent shell before adding database or AI work. The first implementation session should not attempt simulation, reports, or enterprise features.
