# CASCADE Project Status

## Current phase

**Planning only — no CASCADE application implementation has started.**

The workspace inspection and MVP architecture plan are complete. Implementation must not begin until the user explicitly requests it.

## Completed work

- Inspected the current workspace.
- Confirmed the workspace contains starter infrastructure rather than an existing CASCADE product.
- Confirmed the API server is a minimal Express 5 health-check service.
- Confirmed the OpenAPI contract contains only the health endpoint.
- Confirmed the Drizzle schema is empty.
- Confirmed the React artifact currently present is a component-preview sandbox, not the CASCADE frontend.
- Defined a credit-conscious MVP scope centered on:
  - decision intake
  - validated graph extraction
  - deterministic scenario simulation
  - cascade paths
  - timeline visualization
  - risk and recommendation output
- Created `PROJECT_PLAN.md`.

## Remaining work

1. User approval to begin implementation.
2. Create the CASCADE web application artifact and initial API contract.
3. Add authentication and authorization.
4. Add PostgreSQL schema and persistent analysis history.
5. Add structured AI extraction with validated outputs.
6. Add the deterministic cascade engine and scenario templates.
7. Add graph, path, and timeline visualizations.
8. Add risk scoring, recommendations, and report generation.
9. Add focused tests, hardening, and deployment configuration.

## Known issues

- No CASCADE UI exists yet.
- No CASCADE domain API endpoints exist yet.
- No database tables or migrations exist yet.
- No authentication or authorization exists yet.
- No AI integration has been connected yet.
- No graph, simulation, timeline, report, or history data exists yet.
- Existing artifacts are starter/design infrastructure and should not be mistaken for a deployable CASCADE product.

## Important decisions

- Build a convincing hackathon MVP before enterprise functionality.
- Use React/Vite for the frontend and extend the existing Express API server.
- Use Replit PostgreSQL with Drizzle; do not introduce a graph database for the MVP.
- Use Clerk through the Replit-managed integration for authentication rather than local password/JWT code.
- Use Replit AI Integration for structured extraction; do not require the user's own AI API key.
- Treat AI output as a validated proposal, not authoritative state.
- Keep cascade propagation deterministic, bounded, explainable, and server-side.
- Represent the graph with relational node/edge tables plus JSONB metadata.
- Represent time as discrete horizons and causal events rather than unsupported exact forecasts.
- Avoid vector search, object storage, paid data providers, billing, teams, and other infrastructure until the core flow proves its value.
- Work in seven small milestones and stop after each milestone for explicit user direction.
