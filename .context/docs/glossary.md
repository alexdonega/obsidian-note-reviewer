```markdown
<!-- agent-update:start:glossary -->
# Glossary & Domain Concepts

This document lists project-specific terminology, acronyms, domain entities, and user personas to establish a shared language for all contributors.

## Core Terms
- **Supabase** — Our primary Backend-as-a-Service (BaaS) provider. It supplies the project's PostgreSQL database, authentication, object storage, and serverless Edge Functions. Most backend logic and data modeling is configured within the [Supabase Studio](https://supabase.com/dashboard) and managed via migrations in the `supabase/` directory.
- **Monorepo** — The architectural choice for this repository, managing multiple distinct projects (`apps/`) with shared code (`packages/`) in a single place. This simplifies dependency management and encourages code reuse for things like UI components, utility functions, or API types.
- **Project "Transformation"** — The internal name for the initiative this codebase supports, as indicated by the `12-weeks-transformation` directory. It represents a focused effort to deliver a specific set of features or a new product version within a defined timeframe.

## Acronyms & Abbreviations
- **RLS (Row-Level Security)** — A PostgreSQL feature, central to our Supabase data access strategy. RLS policies are database rules that restrict which data rows users can query or modify based on their session context (e.g., their user ID). This ensures users can only access their own data. Policies are defined in `supabase/migrations/`.
- **ADR (Architecture Decision Record)** — A short document describing a technically significant decision made during the project's evolution. ADRs capture the context, trade-offs, and consequences of a choice. See `docs/adr/` for existing records.
- **CI/CD (Continuous Integration/Continuous Deployment)** — The automated process of building, testing, and deploying our applications. Workflows are defined in the `.github/workflows/` directory and handle tasks like running tests, linting code, and deploying changes to staging or production environments.

## Personas / Actors
- **Administrator** — A privileged user responsible for system management, user oversight, and content moderation. Administrators interact with the system through a dedicated admin panel (likely located in `apps/admin/`) to perform tasks that are unavailable to standard users.
- **End User** — The primary consumer of the application. Their goal is to use the core features of the product to solve a specific problem. Their experience is the main driver for our UI/UX and feature development.

## Domain Rules & Invariants
- **User Data Isolation**: Enforced by RLS, a user can *never* view or modify data belonging to another user unless explicitly granted permission through a defined relationship (e.g., team membership).
- **Authentication Requirement**: All API endpoints, except for the public sign-in/sign-up routes, require a valid JSON Web Token (JWT) issued by Supabase Auth. Unauthenticated requests will be rejected with a `401 Unauthorized` error.

<!-- agent-readonly:guidance -->
## AI Update Checklist
1. Harvest terminology from recent PRs, issues, and discussions.
2. Confirm definitions with product or domain experts when uncertain.
3. Link terms to relevant docs or modules for deeper context.
4. Remove or archive outdated concepts; flag unknown terms for follow-up.

<!-- agent-readonly:sources -->
## Acceptable Sources
- Product requirement docs, RFCs, user research, or support tickets.
- Service contracts, API schemas, data dictionaries.
- Conversations with domain experts (summarize outcomes if applicable).

<!-- agent-update:end -->
```
