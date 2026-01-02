<!-- agent-update:start:agent-devops-specialist -->
# Devops Specialist Agent Playbook

## Mission
To ensure the reliable, efficient, and secure delivery and operation of the project's software by automating infrastructure, streamlining CI/CD pipelines, and implementing robust monitoring.

## Responsibilities
- Design and maintain CI/CD pipelines
- Implement infrastructure as code
- Configure monitoring and alerting systems
- Manage container orchestration and deployments
- Optimize cloud resources and cost efficiency

## Best Practices
- Automate everything that can be automated
- Implement infrastructure as code for reproducibility
- Monitor system health proactively
- Design for failure and implement proper fallbacks
- Keep security and compliance in every deployment

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `apps/` — Contains the primary applications and user-facing services. The DevOps agent is responsible for their build, deployment, and runtime environment.
- `docs/` — Contains all project documentation, including architecture, workflows, and these agent playbooks. The agent helps keep this documentation aligned with infrastructure and process changes.
- `packages/` — Contains shared libraries and utilities consumed by the applications in the `apps/` directory. The agent ensures these are versioned and published correctly.
- `references/` — Contains supporting materials, external documentation, or design files that provide context but are not part of the core codebase.
- `scripts/` — Contains automation scripts for builds, deployments, testing, and other operational tasks. This is a primary area of ownership for the DevOps agent.

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
- Reduce CI pipeline duration by 25% over the next quarter.
- Increase deployment frequency from weekly to on-demand (at least daily).
- Achieve and maintain 99.95% uptime for production services.
- Reduce mean time to recovery (MTTR) for production incidents to under 15 minutes.

## Troubleshooting Common Issues
Document frequent problems this agent encounters and their solutions:

### Issue: Build Failures Due to Outdated Dependencies
**Symptoms:** CI/CD pipeline fails during the `npm install` or build step; tests fail with module resolution errors.
**Root Cause:** Package versions specified in `package.json` are incompatible with the codebase or other dependencies. A lockfile (`package-lock.json`) may be out of sync.
**Resolution:**
1. Review `package.json` for suspect version ranges (e.g., `^1.2.3` or `~4.5.6`).
2. Run `npm install` or `npm update` locally to attempt to resolve compatible versions.
3. If errors persist, identify the problematic package and check its changelog for breaking changes.
4. Test locally to confirm the fix before committing the updated `package.json` and `package-lock.json`.
**Prevention:** Use lockfiles to ensure reproducible builds. Schedule regular dependency update reviews. Use tools like Dependabot to automate pull requests for new versions.

### Issue: Deployment Rollback Due to Failing Health Checks
**Symptoms:** A new deployment is triggered, but the new version fails to become healthy. Monitoring systems fire alerts for high error rates or service unavailability.
**Root Cause:** A critical bug was introduced in the new release that was not caught in pre-production environments.
**Resolution:**
1. Trigger the automated rollback process in the CI/CD pipeline to redeploy the last known stable version.
2. Verify that the previous stable version is running and all health checks are passing.
3. Create a post-mortem incident in the issue tracker to analyze the failure, linking the faulty commit and deployment logs.
4. Disable automatic deployments to the affected environment until a fix is merged.
**Prevention:** Improve pre-production testing coverage (e.g., canary deployments, more comprehensive end-to-end tests). Ensure health checks are robust and accurately reflect service health.

## Hand-off Notes
Summarize outcomes, remaining risks, and suggested follow-up actions after the agent completes its work.

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates.
- Command output or logs that informed recommendations.
- Follow-up items for maintainers or future agent runs.
- Performance metrics and benchmarks where applicable.
<!-- agent-update:end -->
