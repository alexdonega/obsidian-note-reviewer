<!-- agent-update:start:architecture-notes -->
# Architecture Notes

> TODO: Describe how the system is assembled and why the current design exists.

## System Architecture Overview
- Summarize the top-level topology (monolith, modular service, microservices) and deployment model.
- Highlight how requests traverse the system and where control pivots between layers.

## Core System Components
- `apps/` — approximately 34 files
- `bun.lock/` — approximately 1 files
- `bunfig.toml/` — approximately 1 files
- `CONFIGURACAO.md/` — approximately 1 files
- `CONTRIBUTING.md/` — approximately 1 files
- `docs/` — approximately 1 files
- `LICENSE/` — approximately 1 files
- `LICENSE_PT_BR/` — approximately 1 files
- `obsidian-note-reviewer.exe/` — approximately 1 files
- `obsreview.exe/` — approximately 1 files
- `package.json/` — approximately 1 files
- `packages/` — approximately 44 files
- `README.md/` — approximately 1 files
- `references/` — approximately 1 files
- `scripts/` — approximately 3 files
- `test-setup.ts/` — approximately 1 files
- `vercel.json/` — approximately 1 files

## Internal System Boundaries
- Document seams between domains, bounded contexts, or service ownership.
- Note data ownership, synchronization strategies, and shared contract enforcement.

## System Integration Points
- Map inbound interfaces (APIs, events, webhooks) and the modules that own them.
- Capture orchestration touchpoints where this system calls or coordinates other internal services.

## External Service Dependencies
- List SaaS platforms, third-party APIs, or infrastructure services the system relies on.
- Describe authentication methods, rate limits, and failure considerations for each dependency.

## Key Decisions & Trade-offs
- Summarize architectural decisions, experiments, or ADR outcomes that shape the current design.
- Reference supporting documents and explain why selected approaches won over alternatives.

## Diagrams
- Link architectural diagrams or add mermaid definitions here.

## Risks & Constraints
- Document performance constraints, scaling considerations, or external system assumptions.

## Top Directories Snapshot
- `apps/` — approximately 34 files
- `bun.lock/` — approximately 1 files
- `bunfig.toml/` — approximately 1 files
- `CONFIGURACAO.md/` — approximately 1 files
- `CONTRIBUTING.md/` — approximately 1 files
- `docs/` — approximately 1 files
- `LICENSE/` — approximately 1 files
- `LICENSE_PT_BR/` — approximately 1 files
- `obsidian-note-reviewer.exe/` — approximately 1 files
- `obsreview.exe/` — approximately 1 files
- `package.json/` — approximately 1 files
- `packages/` — approximately 44 files
- `README.md/` — approximately 1 files
- `references/` — approximately 1 files
- `scripts/` — approximately 3 files
- `test-setup.ts/` — approximately 1 files
- `vercel.json/` — approximately 1 files

<!-- agent-readonly:guidance -->
## AI Update Checklist
1. Review ADRs, design docs, or major PRs for architectural changes.
2. Verify that each documented decision still holds; mark superseded choices clearly.
3. Capture upstream/downstream impacts (APIs, events, data flows).
4. Update Risks & Constraints with active incident learnings or TODO debt.
5. Link any new diagrams or dashboards referenced in recent work.

<!-- agent-readonly:sources -->
## Acceptable Sources
- ADR folders, `/docs/architecture` notes, or RFC threads.
- Dependency visualisations from build tooling or scripts.
- Issue tracker discussions vetted by maintainers.

## Related Resources
- [Project Overview](./project-overview.md)
- Update [agents/README.md](../agents/README.md) when architecture changes.

<!-- agent-update:end -->
