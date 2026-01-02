<!-- agent-update:start:agent-feature-developer -->
# Feature Developer Agent Playbook

## Mission
To autonomously implement, test, and integrate new features based on approved specifications, accelerating the development lifecycle from issue to pull request. Engage this agent for well-defined feature tickets that require coding, unit/integration testing, and documentation updates.

## Responsibilities
- Implement new features according to specifications provided in issues or design documents.
- Design clean, maintainable, and scalable code architecture that aligns with existing patterns.
- Integrate new features with the existing codebase, ensuring seamless functionality.
- Write comprehensive unit, integration, and end-to-end tests for all new functionality.
- Update relevant documentation to reflect the new feature's behavior and usage.

## Best Practices
- Follow existing coding patterns, style guides, and conventions found in the repository.
- Consider all edge cases, potential failure modes, and implement robust error handling.
- Write tests alongside implementation (Test-Driven Development is encouraged).
- Understand monorepo structure and how changes in `packages/` can affect multiple `apps/`.
- Keep pull requests small, focused, and tied to a single issue or feature.

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `apps/` — Contains the primary, deployable applications of the project (e.g., web frontends, API servers).
- `docs/` — Houses all project documentation, including architectural diagrams, development guides, and agent playbooks like this one.
- `packages/` — A directory for shared libraries, UI components, and utilities used across different applications in the monorepo.
- `scripts/` — Holds utility and automation scripts for tasks like building, testing, deploying, or database migrations.
- `tests/` — Contains repository-wide end-to-end and integration tests that span multiple packages or apps.

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
- Reduce time-to-merge for feature PRs by 15% quarter-over-quarter.
- Maintain >90% unit test coverage for all new code contributions.
- Ensure all authored PRs pass CI checks on the first attempt with a 95% success rate.

## Troubleshooting Common Issues
Document frequent problems this agent encounters and their solutions:

### Issue: [Common Problem]
**Symptoms:** Describe what indicates this problem
**Root Cause:** Why this happens
**Resolution:** Step-by-step fix
**Prevention:** How to avoid in the future

**Example:**
### Issue: Build Failures Due to Outdated Dependencies
**Symptoms:** CI builds or local tests fail with module resolution errors or type mismatches.
**Root Cause:** Package versions in `package.json` are incompatible with the codebase after a recent update to another package.
**Resolution:**
1. Review `package.json` for version ranges (`^`, `~`).
2. Run `npm install` or `pnpm install` to ensure lockfiles are synchronized.
3. Run local tests to confirm the fix before committing.
**Prevention:** Keep dependencies updated regularly, use and commit lockfiles (`package-lock.json`, `pnpm-lock.yaml`), and run integration tests in CI.

## Hand-off Notes
Summarize outcomes, remaining risks, and suggested follow-up actions after the agent completes its work.

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates.
- Command output or logs that informed recommendations.
- Follow-up items for maintainers or future agent runs.
- Performance metrics and benchmarks where applicable.
<!-- agent-update:end -->
