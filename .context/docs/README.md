<!-- agent-update:start:docs-index -->
# Documentation Index

Welcome to the repository knowledge base. Start with the project overview, then dive into specific guides as needed.

## Core Guides
- [Project Overview](./project-overview.md)
- [Architecture Notes](./architecture.md)
- [Development Workflow](./development-workflow.md)
- [Testing Strategy](./testing-strategy.md)
- [Glossary & Domain Concepts](./glossary.md)
- [Data Flow & Integrations](./data-flow.md)
- [Security & Compliance Notes](./security.md)
- [Tooling & Productivity Guide](./tooling.md)

## Repository Snapshot
- Approximate size: 243.81 MB
- Total files scanned: 233

Top-level files and directories:
- `12-weeks-transformation/` — Project plan and transformation resources.
- `apps/` — Contains deployable applications.
- `docs/` — Living documentation produced by this tool.
- `monitoring/` — Infrastructure for monitoring and observability.
- `packages/` — Workspace packages or modules.
- `scripts/` — Helper scripts for development and CI/CD.
- `supabase/` — Supabase-specific configurations and migrations.
- `tests/` — End-to-end and integration tests.
- `package.json` — Project dependencies and scripts.
- `README.md` — Top-level project README.
- `bun.lockb` — Bun lockfile for deterministic installs.

## Document Map
| Guide | File | AI Marker | Primary Inputs |
| --- | --- | --- | --- |
| Project Overview | `project-overview.md` | agent-update:project-overview | Roadmap, README, stakeholder notes |
| Architecture Notes | `architecture.md` | agent-update:architecture-notes | ADRs, service boundaries, dependency graphs |
| Development Workflow | `development-workflow.md` | agent-update:development-workflow | Branching rules, CI config, contributing guide |
| Testing Strategy | `testing-strategy.md` | agent-update:testing-strategy | Test configs, CI gates, known flaky suites |
| Glossary & Domain Concepts | `glossary.md` | agent-update:glossary | Business terminology, user personas, domain rules |
| Data Flow & Integrations | `data-flow.md` | agent-update:data-flow | System diagrams, integration specs, queue topics |
| Security & Compliance Notes | `security.md` | agent-update:security | Auth model, secrets management, compliance requirements |
| Tooling & Productivity Guide | `tooling.md` | agent-update:tooling | CLI scripts, IDE configs, automation workflows |

<!-- agent-readonly:guidance -->
## AI Update Checklist
1. Gather context with `git status -sb` plus the latest commits touching `docs/` or `agents/`.
2. Compare the current directory tree against the table above; add or retire rows accordingly.
3. Update cross-links if guides moved or were renamed; keep anchor text concise.
4. Record sources consulted inside the commit or PR description for traceability.

<!-- agent-readonly:sources -->
## Acceptable Sources
- Repository tree and `package.json` scripts for canonical command names.
- Maintainer-approved issues, RFCs, or product briefs referenced in the repo.
- Release notes or changelog entries that announce documentation changes.

<!-- agent-update:end -->
