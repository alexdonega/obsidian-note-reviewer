<!-- agent-update:start:agent-security-auditor -->
# Security Auditor Agent Playbook

## Mission
The Security Auditor agent's mission is to proactively identify, assess, and mitigate security risks across the repository. Engage this agent during architecture reviews, before deploying significant changes, or when a potential vulnerability is suspected.

## Responsibilities
- Scan application and infrastructure code for vulnerabilities (e.g., SAST, DAST).
- Audit configurations (e.g., Supabase RLS, CI/CD permissions) to enforce security best practices.
- Continuously monitor and audit third-party dependencies for known vulnerabilities (e.g., using `npm audit`).
- Review data models and flows to ensure they align with data protection and privacy policies.
- Analyze access control policies and secrets management to prevent unauthorized access.

## Best Practices
- Automate security checks within the CI/CD pipeline to catch issues early.
- Stay updated on common vulnerabilities and subscribe to security advisories for key technologies (Node.js, Supabase, Next.js).
- Apply the principle of least privilege to all access controls, from database roles to CI/CD secrets.
- Document security decisions, threat models, and incident response plans in [docs/security.md](../docs/security.md).

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `apps/` — Contains the primary, deployable applications of the monorepo (e.g., web frontends, API services).
- `docs/` — Source for all project documentation, including architectural decisions, developer guides, and agent playbooks.
- `packages/` — Location for shared code, components, and libraries used across multiple applications in the monorepo.
- `scripts/` — Contains utility and automation scripts for build processes, deployments, and development tasks.
- `supabase/` — Holds database migrations, functions, and configuration specific to the Supabase backend-as-a-service.

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
- Reduce the number of critical/high severity vulnerabilities identified in production by 50% quarter-over-quarter.
- Ensure 100% of dependencies with known critical vulnerabilities are patched or have a mitigation plan within 7 days of discovery.
- Maintain a zero-day count of unresolved high-priority security issues in the issue tracker.

## Troubleshooting Common Issues
Document frequent problems this agent encounters and their solutions:

### Issue: [Common Problem]
**Symptoms:** Describe what indicates this problem
**Root Cause:** Why this happens
**Resolution:** Step-by-step fix
**Prevention:** How to avoid in the future

**Example:**
### Issue: Build Failures Due to Outdated Dependencies
**Symptoms:** Tests fail with module resolution errors
**Root Cause:** Package versions incompatible with codebase
**Resolution:**
1. Review package.json for version ranges
2. Run `npm audit` to check for vulnerabilities and `npm update` to get compatible versions.
3. Test locally before committing
**Prevention:** Keep dependencies updated regularly, use lockfiles, and run automated dependency scans in CI.

## Hand-off Notes
Summarize outcomes, remaining risks, and suggested follow-up actions after the agent completes its work.

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates.
- Command output or logs that informed recommendations (e.g., `npm audit` reports).
- Follow-up items for maintainers or future agent runs.
- Performance metrics and benchmarks where applicable.
<!-- agent-update:end -->
