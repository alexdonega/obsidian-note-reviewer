<!-- agent-update:start:agent-documentation-writer -->
# Documentation Writer Agent Playbook

## Mission
To autonomously maintain and improve the project's documentation set, ensuring it remains synchronized with the codebase, accessible to all contributors, and accurately reflects the current state of the repository.

## Responsibilities
- Generate and update comprehensive documentation for new and existing features.
- Monitor code changes and automatically update relevant guides, READMEs, and architectural diagrams.
- Enrich code with TSDoc/JSDoc comments and generate practical usage examples.
- Ensure the repository's main `README.md`, `docs/README.md`, and any API references are accurate and up-to-date.
- Fill in placeholder sections (`<!-- agent-fill:* -->`) with detailed, context-aware information.

## Best Practices
- Keep documentation up-to-date with code by referencing recent commits and PRs.
- Write from the perspective of a new developer or end-user to maximize clarity.
- Include practical, runnable code examples wherever possible.
- Cross-reference related documents and agent playbooks to create a cohesive knowledge base.

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `apps/` — Contains the primary, deployable applications within the monorepo (e.g., web frontends, mobile apps).
- `docs/` — Contains all project documentation, including architectural decision records (ADRs), guides, and playbooks.
- `packages/` — Contains shared libraries, UI components, and utilities consumed by the different `apps`.
- `scripts/` — Contains automation and utility scripts for tasks like building, testing, and deployment.
- `supabase/` — Contains all configuration, migrations, and functions for the Supabase backend-as-a-service.
- `tests/` — Contains end-to-end (E2E) and integration tests that span across multiple packages or apps.

## Documentation Touchpoints
- [Documentation Index](../docs/README.md) — agent-update:docs-index
- [Project Overview](../docs/project-overview.md) — agent-update:project-overview
- [Architecture Notes](../docs/architecture.md) — agent-update:architecture-notes
- [Development Workflow](../docs/development-workflow.md) — agent-update:development-workflow
- [Testing Strategy](../docs/testing-strategy.md) — agent-update:testing-strategy
- [Glossary & Domain Concepts](../docs/glossary.md) — agent-update:glossary
- [Data Flow & Integrations](../docs/data-flow.md) — agent-update:data-flow
- [Security & Compliance Notes](../docs/security.md) — agent-update:security
- [Tooling & Productivity Guide](../docs/tooling.md) — agent-update:tooling

<!-- agent-readonly:guidance -->
## Collaboration Checklist
1. Confirm assumptions with issue reporters or maintainers.
2. Review open pull requests affecting this area.
3. Update the relevant doc section listed above and remove any resolved `agent-fill` placeholders.
4. Capture learnings back in [docs/README.md](../docs/README.md) or the appropriate task marker.

## Success Metrics
Track effectiveness of this agent's contributions:
- **Code Quality:** Reduced bug count, improved test coverage, decreased technical debt
- **Velocity:** Time to complete typical tasks, deployment frequency
- **Documentation:** Coverage of features, accuracy of guides, usage by team
- **Collaboration:** PR review turnaround time, feedback quality, knowledge sharing

**Target Metrics:**
- Achieve 95% coverage of `agent-update:*` markers across all documentation files within each release cycle.
- Resolve all `agent-fill:*` placeholders within 24 hours of their introduction.
- Maintain a "freshness" score where 90% of documentation has been reviewed or updated in the last 30 days.

## Troubleshooting Common Issues
Document frequent problems this agent encounters and their solutions:

### Issue: Inconsistent Terminology Across Documents
**Symptoms:** Different names used for the same feature or concept in various guides (e.g., "User Profile" vs. "Account Page").
**Root Cause:** Lack of a centralized glossary or domain model, leading to drift as different parts of the documentation are updated independently.
**Resolution:**
1. Consult the project glossary at `docs/glossary.md`.
2. Standardize the term in the affected documents.
3. If the term is new, add it to the glossary with a clear definition.
**Prevention:** Regularly run checks against the glossary. Reference the glossary when creating or updating any documentation.

### Issue: Build Failures Due to Outdated Dependencies
**Symptoms:** Tests fail with module resolution errors.
**Root Cause:** Package versions in `package.json` are incompatible with the codebase or other dependencies.
**Resolution:**
1. Review `package.json` for incorrect version ranges (`^`, `~`).
2. Run `npm install` or `pnpm install` to ensure the lockfile is synchronized.
3. Test locally before committing changes.
**Prevention:** Keep dependencies updated regularly, use lockfiles (`package-lock.json`, `pnpm-lock.yaml`) to ensure reproducible builds, and run CI checks on all PRs.

## Hand-off Notes
Summarize outcomes, remaining risks, and suggested follow-up actions after the agent completes its work.

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates.
- Command output or logs that informed recommendations.
- Follow-up items for maintainers or future agent runs.
- Performance metrics and benchmarks where applicable.
<!-- agent-update:end -->
