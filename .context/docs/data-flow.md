<!-- agent-update:start:data-flow -->
# Data Flow & Integrations

Explain how data enters, moves through, and exits the system, including interactions with external services.

## High-level Flow
- Summarize the primary pipeline from input to output. Reference diagrams or embed Mermaid definitions when available.

## Internal Movement
- Describe how modules within `apps`, `bun.lock`, `bunfig.toml`, `CONFIGURACAO.md`, `CONTRIBUTING.md`, `docs`, `LICENSE`, `LICENSE_PT_BR`, `obsidian-note-reviewer.exe`, `obsreview.exe`, `package.json`, `packages`, `README.md`, `references`, `scripts`, `test-setup.ts`, `vercel.json` collaborate (queues, events, RPC calls, shared databases).

## External Integrations
- <!-- agent-fill:integration -->**Integration** — Purpose, authentication, payload shapes, retry strategy.<!-- /agent-fill -->

## Observability & Failure Modes
- Metrics, traces, or logs that monitor the flow.
- Backoff, dead-letter, or compensating actions when downstream systems fail.

<!-- agent-readonly:guidance -->
## AI Update Checklist
1. Validate flows against the latest integration contracts or diagrams.
2. Update authentication, scopes, or rate limits when they change.
3. Capture recent incidents or lessons learned that influenced reliability.
4. Link to runbooks or dashboards used during triage.

<!-- agent-readonly:sources -->
## Acceptable Sources
- Architecture diagrams, ADRs, integration playbooks.
- API specs, queue/topic definitions, infrastructure code.
- Postmortems or incident reviews impacting data movement.

<!-- agent-update:end -->
