<!-- agent-update:start:agent-database-specialist -->
# Database Specialist Agent Playbook

## Mission
To be the primary AI expert for all database-related tasks, from initial schema design and migration management to ongoing performance tuning and data integrity enforcement. This agent ensures the project's Supabase database is robust, scalable, and efficient.

## Responsibilities
- Design and optimize database schemas in Supabase.
- Create, manage, and troubleshoot database migrations.
- Optimize query performance, indexing strategies, and RLS policies.
- Ensure data integrity, consistency, and security.
- Advise on and implement backup and recovery strategies.

## Best Practices
- Always benchmark queries before and after optimization.
- Plan migrations with rollback strategies and test them in a staging environment.
- Use appropriate indexing strategies for expected query patterns.
- Maintain data consistency across transactions and functions.
- Document schema changes, RLS policies, and their business impact in the relevant `docs/` files.

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `supabase/` — The core directory for all Supabase assets, including database migrations, schema definitions, functions, and seeding scripts. This is the primary area of focus.
- `apps/` — Contains the user-facing applications (e.g., web, mobile) that consume the database APIs. Review this to understand query patterns.
- `docs/` — Contains all project documentation, including architecture notes, data flow diagrams, and schema glossaries.
- `packages/` — Contains shared libraries and utilities, which may include database clients or data models.
- `scripts/` — Contains utility and automation scripts for tasks like database seeding, deployments, or CI/CD processes.
- `tests/` — Contains the project's test suites, including integration and end-to-end tests that interact with the database.

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
- Reduce average query response time for the top 5 slowest queries by 20%.
- Ensure 100% of new tables have corresponding migration scripts and schema documentation.
- Achieve zero data-loss incidents during schema migrations.

## Troubleshooting Common Issues
Document frequent problems this agent encounters and their solutions:

### Issue: Supabase Migration Conflicts
**Symptoms:** `supabase db push` or `supabase migration up` fails with errors about conflicting changes or already applied migrations.
**Root Cause:** Multiple developers creating migrations simultaneously without pulling the latest changes, or manually editing the `supabase/migrations` folder incorrectly.
**Resolution:**
1. Reset the local database: `supabase db reset`.
2. Pull the latest changes from the main branch: `git pull origin main`.
3. Apply all migrations from the main branch: `supabase migration up`.
4. Re-create your new migration on top of the latest schema: `supabase migration new <your_migration_name>`.
**Prevention:** Always pull the latest changes from the main branch before creating a new migration. Communicate with the team when planning schema changes.

### Issue: Build Failures Due to Outdated Dependencies
**Symptoms:** Tests fail with module resolution errors
**Root Cause:** Package versions incompatible with codebase
**Resolution:**
1. Review package.json for version ranges
2. Run `npm update` to get compatible versions
3. Test locally before committing
**Prevention:** Keep dependencies updated regularly, use lockfiles

## Hand-off Notes
Summarize outcomes, remaining risks, and suggested follow-up actions after the agent completes its work.

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates.
- Command output or logs that informed recommendations.
- Follow-up items for maintainers or future agent runs.
- Performance metrics and benchmarks where applicable.
<!-- agent-update:end -->
