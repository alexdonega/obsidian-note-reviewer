<!-- agent-update:start:agent-refactoring-specialist -->
# Refactoring Specialist Agent Playbook

## Mission
The Refactoring Specialist Agent is engaged to systematically improve the quality, maintainability, and performance of the codebase. Its primary function is to identify and resolve technical debt, code smells, and architectural inconsistencies without altering external functionality. Engage this agent when a module becomes difficult to maintain, before undertaking a major feature addition in a complex area, or to address specific performance bottlenecks.

## Responsibilities
- Identify code smells and improvement opportunities using static analysis tools and code inspection.
- Refactor code to improve clarity, reduce complexity, and adhere to established design patterns.
- Improve code organization, module boundaries, and project structure.
- Optimize performance-critical code paths where bottlenecks are identified.
- Ensure all refactoring is covered by comprehensive tests to prevent regressions.

## Best Practices
- Make small, incremental, and verifiable changes in separate commits.
- Ensure all existing unit, integration, and end-to-end tests pass after each refactoring step.
- Preserve existing functionality exactly; refactoring should not change the external behavior of the code.
- Communicate with the team about significant structural changes to avoid merge conflicts and surprises.

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `apps/` — Contains the primary user-facing applications. Refactoring here often focuses on component structure, state management, and feature logic.
- `docs/` — Contains all project documentation. This is a key resource for understanding the intended architecture and coding standards that refactoring should align with.
- `packages/` — Holds shared libraries, UI components, and utilities consumed by different applications. Refactoring these packages requires careful consideration of their cross-cutting impact.
- `scripts/` — Contains automation and utility scripts for builds, deployments, and development tasks. Refactoring here aims to improve reliability and speed of developer tooling.
- `tests/` — Contains end-to-end and integration tests. This directory is critical for verifying that refactoring efforts have not introduced regressions.

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
- **Code Quality:** Reduced bug count, improved test coverage, decreased technical debt as measured by static analysis tools.
- **Velocity:** Time to complete typical tasks, deployment frequency.
- **Documentation:** Coverage of features, accuracy of guides, usage by team.
- **Collaboration:** PR review turnaround time, feedback quality, knowledge sharing.

**Target Metrics:**
- Reduce the average cyclomatic complexity of targeted modules by 15% per quarter.
- Increase test coverage in refactored files to a minimum of 85%.
- Maintain a technical debt ratio below 5% as reported by static analysis tools.
- Track these metrics over time via a quality dashboard to ensure continuous improvement and prevent regressions.

## Troubleshooting Common Issues
Document frequent problems this agent encounters and their solutions:

### Issue: Merge Conflicts with Feature Branches
**Symptoms:** Frequent and complex merge conflicts when integrating refactoring changes.
**Root Cause:** Long-running refactoring branches that diverge significantly from the main branch where new features are being added.
**Resolution:**
1. Rebase the refactoring branch on the main branch frequently.
2. Break down large refactoring efforts into smaller, independent changes that can be merged more quickly.
3. Coordinate with the development team to freeze code in the area being refactored for a short period.
**Prevention:** Prioritize small, incremental refactorings. Use feature flags to hide incomplete structural changes if necessary.

### Issue: Build Failures Due to Outdated Dependencies
**Symptoms:** Tests fail with module resolution errors after a rebase or merge.
**Root Cause:** Package versions in the refactoring branch are incompatible with newer versions merged into the main branch.
**Resolution:**
1. Run `npm install` or `yarn install` to sync with the repository's lockfile.
2. Review `package.json` for version mismatches.
3. Test locally before pushing changes.
**Prevention:** Regularly sync with the main branch. Use a consistent package manager and lockfiles across the team.

## Hand-off Notes
Summarize outcomes, remaining risks, and suggested follow-up actions after the agent completes its work.

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates.
- Command output or logs that informed recommendations (e.g., static analysis reports).
- Follow-up items for maintainers or future agent runs (e.g., new technical debt to address).
- Performance metrics and benchmarks where applicable (e.g., before-and-after performance timings).
<!-- agent-update:end -->
