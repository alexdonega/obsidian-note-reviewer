# Architecture

**Analysis Date:** 2026-02-04

## Pattern Overview

**Overall:** Monorepo with Workspace Packages Architecture

**Key Characteristics:**
- Yarn workspaces structure for code sharing
- TypeScript-based with Bun as package manager
- Three main applications: hook (Obsidian plugin), portal (web dashboard), marketing (landing pages)
- Shared packages for common functionality
- Multi-platform support (web, desktop via Obsidian)

## Layers

**Hook Layer (Obsidian Plugin):**
- Purpose: Provides Obsidian plugin functionality for local note processing
- Location: `/apps/hook/`
- Contains: TypeScript plugin code, HTML entry point
- Depends on: Shared packages (ui, editor)
- Used by: Obsidian users for local note processing

**Portal Layer (Web Dashboard):**
- Purpose: Web-based dashboard for managing reviews and notes
- Location: `/apps/portal/`
- Contains: React application, API endpoints, utilities
- Depends on: API package, UI package, Shared package
- Used by: Users for web-based note management

**Marketing Layer:**
- Purpose: Landing pages and sales content
- Location: `/apps/marketing/`
- Contains: Static pages and React components
- Depends on: Shared utilities
- Used by: Prospective customers and users

**API Layer:**
- Purpose: Backend services and data management
- Location: `/packages/api/`
- Contains: API handlers, data models, service logic
- Used by: Portal application

**UI Layer:**
- Purpose: Shared React components and design system
- Location: `/packages/ui/`
- Contains: Reusable UI components, theme system
- Used by: Hook, Portal, Marketing applications

**Editor Layer:**
- Purpose: Note editing functionality and utilities
- Location: `/packages/editor/`
- Contains: Editor components, note processing utilities
- Used by: Hook and Portal applications

**Security Layer:**
- Purpose: Authentication and authorization
- Location: `/packages/security/`
- Contains: Auth handlers, security utilities
- Used by: API and Portal applications

**Shared Layer:**
- Purpose: Common utilities and helpers
- Location: `/packages/shared/`
- Contains: Utility functions, constants, helpers
- Used by: All packages and applications

## Data Flow

**User Login:**
1. User credentials submitted via Portal UI
2. Authentication handled by security package
3. JWT token generated and stored
4. User redirected to dashboard

**Note Processing:**
1. Note created/modified in Obsidian (Hook)
2. Note content sent to Portal via API
3. API processes note using editor package
4. Processed note stored in database
5. Results sent back to UI

**Review Workflow:**
1. User initiates review in Portal
2. API fetches notes from database
3. Editor package prepares note content
4. Review UI displays notes with annotations
5. User feedback sent back to API
6. Review status updated in database

**State Management:**
- Frontend: Zustand for local state
- Backend: Database persistence via Supabase
- Local: IndexedDB for offline support (idb package)

## Key Abstractions

**Note Abstraction:**
- Purpose: Represents a note in the system
- Examples: `/packages/editor/src/note.ts`, `/packages/api/src/models/note.ts`
- Pattern: Repository pattern with data transfer objects

**User Abstraction:**
- Purpose: Represents system users
- Examples: `/packages/api/src/models/user.ts`, `/packages/security/src/auth.ts`
- Pattern: Entity with relationships

**Review Abstraction:**
- Purpose: Represents note review sessions
- Examples: `/packages/api/src/models/review.ts`, `/packages/editor/src/review.ts`
- Pattern: Workflow state machine

**API Abstraction:**
- Purpose: RESTful API endpoints
- Examples: `/packages/api/src/routes/notes.ts`, `/packages/api/src/routes/reviews.ts`
- Pattern: Express.js style routing with middleware

## Entry Points

**Hook Application:**
- Location: `/apps/hook/index.tsx`
- Triggers: Obsidian plugin load
- Responsibilities: Plugin initialization, menu registration, event handling

**Portal Application:**
- Location: `/apps/portal/index.tsx`
- Triggers: Web application load
- Responsibilities: Dashboard rendering, API client initialization

**Marketing Application:**
- Location: `/apps/marketing/`
- Triggers: Static page requests
- Responsibilities: Landing page rendering, content display

**API Server:**
- Location: `/apps/portal/dev-server.ts`
- Triggers: Development server start
- Responsibilities: API endpoint serving, database connection

## Error Handling

**Strategy:** Centralized error handling with Sentry integration

**Patterns:**
- API Error Middleware: `/packages/api/src/middleware/error.ts`
- UI Error Boundaries: `/packages/ui/src/components/ErrorBoundary.tsx`
- Logging: Pino logger withPretty output for development

## Cross-Cutting Concerns

**Logging:**
- Tool: Pino with pino-pretty
- Pattern: Structured logging with request correlation
- Usage: API requests, user actions, error tracking

**Validation:**
- Approach: Zod schemas for request validation
- Pattern: Type-safe validation at API boundaries
- Usage: Input sanitization, data integrity

**Authentication:**
- Approach: JWT with session management
- Pattern: Bearer token authentication
- Usage: API route protection, user state management

---

*Architecture analysis: 2026-02-04*