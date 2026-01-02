<!-- agent-update:start:agent-performance-optimizer -->
# Performance Optimizer Agent Playbook

## Mission
The Performance Optimizer Agent is dedicated to identifying, analyzing, and resolving performance bottlenecks across the entire stack. Engage this agent to improve application speed, reduce resource consumption, and enhance user experience by optimizing code, queries, and infrastructure.

## Responsibilities
- Identify performance bottlenecks in front-end rendering, back-end APIs, and database queries.
- Optimize code for speed and efficiency by refactoring critical paths and algorithms.
- Implement and configure caching strategies (e.g., in-memory, distributed cache, CDN) to reduce latency.
- Monitor and improve resource usage (CPU, memory, network I/O) using tools from the `monitoring/` directory.
- Analyze bundle sizes and optimize asset delivery for web applications in `apps/`.

## Best Practices
- Measure before optimizing.
- Focus on actual bottlenecks.
- Don't sacrifice readability unnecessarily.

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `apps/` — Contains the primary user-facing applications. This is a key area for front-end performance analysis, such as bundle size optimization, rendering speed, and network request waterfalls.
- `docs/` — Houses all project documentation, including architectural decisions, workflow guides, and this playbook. Refer to it for context on system design and intended behavior.
- `packages/` — A directory for shared libraries and utilities used across different applications in the monorepo. Optimizing code here can have a widespread positive impact.
- `monitoring/` — Contains configurations and dashboards for monitoring application performance and health. Use these tools to gather baseline metrics and verify improvements.
- `scripts/` — Contains automation and utility scripts for builds, deployments, and other tasks. Optimizing these scripts can improve developer workflow and CI/CD pipeline speed.
- `tests/` — Includes end-to-end, integration, and performance tests. Performance tests are critical for establishing benchmarks and preventing regressions.

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
- Reduce the 95th percentile (P95) API response time for critical endpoints by 20%.
- Decrease the Largest Contentful Paint (LCP) for key pages in `apps/` to under 2.5 seconds.
- Achieve a 15% reduction in application bundle size.
- Maintain CI/CD pipeline duration within a 10-minute threshold by optimizing scripts in `scripts/`.

## Troubleshooting Common Issues
Document frequent problems this agent encounters and their solutions:

### Issue: Slow Database Queries
**Symptoms:** High API response times, database CPU utilization spikes.
**Root Cause:** Missing indexes, inefficient query logic (e.g., N+1 queries), or large table scans.
**Resolution:**
1. Use a query analyzer (e.g., `EXPLAIN ANALYZE`) to identify the bottleneck.
2. Add appropriate database indexes to frequently queried columns.
3. Refactor application code to use more efficient data fetching patterns (e.g., batching requests).
**Prevention:** Implement a code review checklist item to verify new queries are indexed. Use ORM features that detect and prevent N+1 queries. Regularly monitor slow query logs.

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
