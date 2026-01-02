<!-- agent-update:start:agent-code-reviewer -->
# Code Reviewer Agent Playbook

## Mission
To ensure all code merged into the main branch adheres to the project's quality, style, and security standards by providing automated, consistent, and constructive feedback on every pull request.

## Responsibilities
- Review code changes for quality, style, and best practices
- Identify potential bugs and security issues
- Ensure code follows project conventions
- Provide constructive feedback and suggestions

## Best Practices
- Focus on maintainability and readability
- Consider the broader impact of changes
- Be constructive and specific in feedback

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `apps/` — Contains the primary, deployable applications of the project. Code changes here often impact user-facing features directly.
- `docs/` — Houses all project documentation, including architectural decisions, development workflows, and glossaries. The code reviewer should ensure any code changes are reflected in the documentation.
- `packages/` — Contains shared libraries, UI components, and utilities consumed by different applications within the monorepo. Changes here have a broad impact and require careful review.
- `supabase/` — Contains database migrations, edge functions, and configuration for the Supabase backend. Reviews must scrutinize for data integrity, performance, and security.
- `scripts/` — Holds automation scripts for builds, deployments, testing, and other development tasks. Reviews should focus on reliability and efficiency.
- `tests/` — Contains end-to-end (E2E) and integration tests that span multiple packages or applications. The reviewer should ensure test coverage is adequate for new features and bug fixes.

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
- Increase code test coverage by 10% each quarter by flagging PRs with insufficient tests.
- Maintain an average PR review turnaround time of under 4 hours for 90% of submissions.
- Reduce the number of post-deployment hotfixes related to code quality issues by 50% over six months.
- Ensure all critical security vulnerabilities identified by static analysis are addressed before merging.

## Troubleshooting Common Issues
Document frequent problems this agent encounters and their solutions:

### Issue: [Common Problem]
**Symptoms:** Describe what indicates this problem
**Root Cause:** Why this happens
**Resolution:** Step-by-step fix
**Prevention:** How to avoid in the future

**Example:**
### Issue: Build Failures Due to Outdated Dependencies
**Symptoms:** CI builds fail with module resolution errors or type mismatches.
**Root Cause:** A dependency in one package is incompatible with another package's version requirements in the monorepo.
**Resolution:**
1. Run `npm outdated` to identify which packages are behind.
2. Use `npm update <package-name>` to update specific dependencies.
3. If conflicts persist, inspect `package-lock.json` or `pnpm-lock.yaml` to trace version conflicts.
4. Test locally across all affected apps and packages before committing.
**Prevention:** Regularly run `npm update` and rely on lockfiles to ensure consistent dependency resolution across all environments.

## Hand-off Notes
Summarize outcomes, remaining risks, and suggested follow-up actions after the agent completes its work.

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates.
- Command output or logs that informed recommendations.
- Follow-up items for maintainers or future agent runs.
- Performance metrics and benchmarks where applicable.
<!-- agent-update:end -->
