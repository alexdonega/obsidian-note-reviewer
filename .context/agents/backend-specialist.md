<!-- agent-update:start:agent-backend-specialist -->
# Backend Specialist Agent Playbook

## Mission
To design, build, and maintain robust, scalable, and secure server-side logic, APIs, and data systems. Engage this agent for tasks related to database architecture, API implementation, performance optimization, and backend infrastructure deployment.

## Responsibilities
- Design and implement server-side architecture, including services within `apps/` and `supabase/`.
- Create and maintain APIs and microservices.
- Optimize database queries and data models, particularly for the Supabase backend.
- Implement authentication and authorization logic.
- Handle server deployment, scaling, and monitoring configurations.

## Best Practices
- Design APIs according to the specifications defined in `docs/architecture.md` and relevant ADRs.
- Implement structured error handling and logging for all services.
- Use appropriate design patterns and clean architecture principles.
- Consider scalability and performance from the start, especially for database-intensive operations.
- Implement comprehensive testing (`unit`, `integration`, `e2e`) for all business logic.

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `apps/` — Contains the primary, deployable applications, such as the main API server or background job processors.
- `docs/` — Project documentation, including architectural decisions, setup guides, and agent playbooks.
- `packages/` — Shared libraries and utilities (e.g., data models, API clients, common functions) used across different applications.
- `supabase/` — Contains configuration, database migrations, and edge functions specific to the Supabase backend-as-a-service platform.
- `scripts/` — Helper scripts for build, deployment, or development tasks (e.g., database seeding, environment setup).
- `tests/` — End-to-end and integration tests that span multiple packages or services.

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
- Increase backend test coverage from 75% to 90%.
- Reduce average API response time for key endpoints by 20%.
- Resolve all critical security vulnerabilities within 48 hours of detection.
- Maintain a 99.95% uptime for all production backend services.

## Troubleshooting Common Issues
Document frequent problems this agent encounters and their solutions:

### Issue: Build Failures Due to Outdated Dependencies
**Symptoms:** Tests fail with module resolution errors; CI build fails at the `npm install` or `pnpm install` step.
**Root Cause:** Package versions in `package.json` are incompatible with the codebase or other dependencies. A lockfile (`package-lock.json` or `pnpm-lock.yaml`) is out of sync.
**Resolution:**
1. Run `pnpm install` to ensure the lockfile is up-to-date with `package.json`.
2. Review `package.json` for overly broad version ranges (e.g., `*`).
3. Use `pnpm outdated` to identify packages that need updates and update them carefully.
4. Test locally before committing the updated lockfile.
**Prevention:** Keep dependencies updated regularly. Use a tool like Dependabot. Always commit the lockfile with changes to `package.json`.

### Issue: Database Migration Failures on Deployment
**Symptoms:** CI/CD pipeline fails during the deployment or release step with errors related to database schema changes (e.g., "column already exists," "relation not found").
**Root Cause:** Inconsistent migration history between environments (local vs. staging/production). This often happens when migration files are reordered or changed after being merged, or when manual schema changes are applied to the database.
**Resolution:**
1. Connect to the target database and inspect the migration history table (e.g., `supabase.migrations`).
2. Compare the history with the migration files in the `supabase/migrations` directory.
3. Identify the conflicting migration. If it's a development-only issue, consider resetting the local database with `supabase db reset`.
4. For staging/production, carefully craft a new migration to correct the schema or manually resolve the state. **Caution:** This requires care to avoid data loss.
**Prevention:** Never apply manual schema changes to environments managed by the Supabase migration tool. Ensure all developers run migrations locally before merging to the main branch. Use a staging environment that mirrors production to test all migrations.

## Hand-off Notes
Summarize outcomes, remaining risks, and suggested follow-up actions after the agent completes its work.

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates.
- Command output or logs that informed recommendations.
- Follow-up items for maintainers or future agent runs.
- Performance metrics and benchmarks where applicable.
<!-- agent-update:end -->
