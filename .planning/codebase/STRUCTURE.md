# Codebase Structure

**Analysis Date:** 2026-02-04

## Directory Layout

```
obsidian-note-reviewer/
├── apps/                  # Applications
│   ├── hook/             # Obsidian plugin
│   │   ├── hooks/        # Plugin hooks
│   │   ├── server/       # Server-side code
│   │   └── .claude-plugin/ # Claude plugin config
│   ├── portal/           # Web dashboard
│   │   ├── api/          # API endpoints
│   │   └── utils/        # Utilities
│   └── marketing/        # Marketing pages
├── packages/             # Shared packages
│   ├── api/              # API services
│   ├── editor/           # Editor components
│   ├── security/         # Security utilities
│   ├── shared/           # Shared utilities
│   └── ui/               # UI components
├── docs/                 # Documentation
├── supabase/             # Database schema
├── tests/                # Test files
├── monitoring/           # Monitoring config
└── scripts/              # Build scripts
```

## Directory Purposes

**apps/hook/ (Obsidian Plugin):**
- Purpose: Obsidian plugin for note processing
- Contains: Plugin hooks, server communication, UI components
- Key files: `index.tsx`, `hooks/`, `server/`
- Build Output: `/dist/` directory for plugin distribution

**apps/portal/ (Web Dashboard):**
- Purpose: Web-based note management dashboard
- Contains: React app, API routes, utilities
- Key files: `index.tsx`, `dev-server.ts`, `api/`, `utils/`
- Environment: `.env` for configuration

**apps/marketing/ (Landing Pages):**
- Purpose: Marketing and sales pages
- Contains: Static React components and pages
- Key files: `SalesPageV1.tsx`, `SalesPageV2.tsx`, `public/`
- Languages: Portuguese and English support

**packages/api/ (Backend Services):**
- Purpose: API endpoints and business logic
- Contains: Controllers, models, routes, middleware
- Key files: `src/routes/`, `src/models/`, `src/middleware/`
- Framework: Express.js style API

**packages/editor/ (Note Editor):**
- Purpose: Note editing and processing utilities
- Contains: Editor components, note processors, formatters
- Key files: `src/note.ts`, `src/editor.ts`, `src/formatters/`
- Features: Markdown processing, annotation support

**packages/security/ (Authentication):**
- Purpose: Authentication and authorization
- Contains: Auth handlers, validators, security utils
- Key files: `src/auth.ts`, `src/validators.ts`, `src/middleware/`
- Features: JWT handling, password hashing

**packages/shared/ (Common Utilities):**
- Purpose: Shared helpers and constants
- Contains: Utility functions, type definitions
- Key files: `src/utils.ts`, `src/types.ts`, `src/constants.ts`
- Usage: All packages and applications

**packages/ui/ (UI Components):**
- Purpose: Shared React components
- Contains: Form components, layout components, theme
- Key files: `src/components/`, `src/theme.ts`, `src/index.ts`
- Framework: React with TypeScript

## Key File Locations

**Entry Points:**
- `/apps/hook/index.tsx`: Obsidian plugin entry
- `/apps/portal/index.tsx`: Web app entry
- `/packages/*/src/index.ts`: Package exports

**Configuration:**
- `/package.json`: Root workspace configuration
- `/vite.config.ts`: Build configuration
- `/tsconfig.json`: TypeScript configuration

**Core Logic:**
- `/apps/portal/dev-server.ts`: API server
- `/packages/api/src/routes/`: API endpoints
- `/packages/security/src/auth.ts`: Authentication

**Testing:**
- `/tests/`: Test files directory
- `/test-setup.ts`: Test configuration

## Naming Conventions

**Files:**
- PascalCase: Components, interfaces, types
  - Example: `NoteEditor.tsx`, `UserTypes.ts`
- camelCase: Functions, variables, exports
  - Example: `processNote.ts`, `userService.ts`
- kebab-case: Configuration files
  - Example: `vite.config.ts`, `tsconfig.json`

**Directories:**
- lowercase with underscores
  - Example: `note_processing/`, `user_auth/`
- Plural for directories containing multiple items
  - Example: `components/`, `utils/`, `hooks/`

**Packages:**
- lowercase with underscores
  - Example: `@obsidian-note-reviewer/api`
- Namespace with `@obsidian-note-reviewer/`

## Where to Add New Code

**New Plugin Feature:**
- Primary code: `/apps/hook/hooks/`
- Tests: `/tests/hook/`
- Types: `/packages/shared/src/types/plugin.ts`

**New API Endpoint:**
- Implementation: `/packages/api/src/routes/`
- Tests: `/tests/api/`
- Models: `/packages/api/src/models/`

**New UI Component:**
- Implementation: `/packages/ui/src/components/`
- Types: `/packages/ui/src/components/types.ts`
- Tests: `/packages/ui/src/components/__tests__/`

**New Utility Function:**
- Shared: `/packages/shared/src/utils.ts`
- Specific: `/apps/*/utils/`
- Tests: `/tests/utils/`

**New Note Processor:**
- Implementation: `/packages/editor/src/processors/`
- Types: `/packages/editor/src/types/processor.ts`
- Tests: `/packages/editor/src/processors/__tests__/`

## Special Directories

**.claude-plugin/ (apps/hook/):**
- Purpose: Claude plugin configuration
- Generated: Yes
- Committed: Yes

**dist/ (apps/*):**
- Purpose: Build output directory
- Generated: Yes
- Committed: No (in .gitignore)

**node_modules/ (apps/*):**
- Purpose: Dependencies
- Generated: Yes
- Committed: No

**public/ (apps/marketing/):**
- Purpose: Static assets
- Generated: No
- Committed: Yes

**supabase/ (root):**
- Purpose: Database schema and migrations
- Generated: No
- Committed: Yes

---

*Structure analysis: 2026-02-04*