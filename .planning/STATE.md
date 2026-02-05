# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2025-02-04)

**Core value:** Usuários podem revisar visualmente notas e planos, com integração perfeita com Claude Code e colaboração em tempo real.
**Current focus:** Phase 3 - Claude Code Integration

## Current Position

Phase: 3 of 13 (Claude Code Integration)
Plan: 1a of 5 in current phase
Status: In progress
Last activity: 2026-02-05 — Completed Plan 03-01a: Obsidian Hook Configuration and Handler

Progress: [██████████░] 63%

## Performance Metrics

**Velocity:**
- Total plans completed: 10
- Average duration: 7 min
- Total execution time: 1.1 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01    | 6     | 6     | 7 min    |
| 02    | 5     | 5     | 5 min    |
| 03    | 1     | 1     | 10 min   |

**Recent Trend:**
- Last 5 plans: 02-02 (10 min), 02-03 (3 min), 02-04 (2 min), 02-05 (8 min), 03-01a (10 min)
- Trend: Consistent execution

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

**From 01-01 (Vite SPA Auth Infrastructure):**
- Use @supabase/supabase-js browser client (NOT @supabase/ssr for Next.js)
- Session persisted in localStorage (not httpOnly cookies - SPA pattern)
- Vite env var convention (VITE_* prefix) instead of Next.js (NEXT_PUBLIC_*)
- Auth utilities placed in Security package per existing architecture
- AuthProvider wraps entire Portal app for global auth context

**From 01-02 (Session Management):**
- Window focus listener refreshes session when user returns to tab
- Periodic session refresh every 15 minutes (Supabase tokens last 1 hour)
- Session utilities provide proactive expiry warnings and validation
- Debug hooks verify localStorage persistence works correctly

**From 01-03 (Auth UI):**
- Split-screen layout: branding left, form right (hidden on mobile)
- Google is primary OAuth provider (button appears first)
- OAuth button text: "Entrar com Google" and "Entrar com GitHub"
- Dedicated auth pages at /auth/login and /auth/signup (not modals)
- Toggle between login/signup via links ("Não tem conta? Cadastre-se" / "Já tem conta? Faça login")
- ProtectedRoute wrapper redirects unauthenticated users to /auth/login
- PublicRoute wrapper redirects authenticated users to /dashboard
- Inline error display (not toast notifications) for simpler SPA UX

**From 01-04 (Password Reset and Enhanced OAuth):**
- New vs returning user detection via created_at timestamp (< 5 seconds = new user)
- New users after OAuth redirect to /welcome, returning users to /dashboard
- Dynamic origin for redirect URLs (window.location.origin) to avoid hardcoding issues
- Password reset uses two-page flow: forgot-password → reset-password
- Token validation runs on mount with loading state
- All auth forms use react-router-dom Link for client-side navigation
- Password minimum 6 characters enforced on reset page

**From 01-05 (Welcome/Onboarding with Avatar Upload):**
- Display name is REQUIRED field (validated before submission)
- Skip button available per locked decision (users can complete profile later)
- Returning users skip onboarding (check full_name in metadata, redirect to dashboard)
- Supabase Storage for avatars instead of Gravatar (user-controlled, privacy-friendly)
- User-isolated folders for storage (userId/fileName pattern)
- Avatar URL stored in user_metadata.avatar_url for quick access
- Onboarding detection via metadata check (full_name presence)

**From 02-01 (Enhance Annotation System with Visual Markers):**
- Placed annotation components in packages/ui instead of separate annotation package (consistency with existing structure)
- Extended Annotation interface with visual metadata (markerColor, markerPosition, isHighlighted, targetSelector)
- Marker style determined by AnnotationType (badge, icon, underline, highlight)
- AnnotationMarker component supports 4 visual styles for different annotation types
- Element targeting via CSS selectors for reliable element identification
- Overlay rendering with fixed positioning and z-index management
- Selection-based annotation creation with useAnnotationTargeting hook

**From 02-02 (Build Threaded Comment System):**
- Using react-mentions library for @mention autocomplete with @__userId__ storage format
- Recursive CommentThread component rendering for nested replies with maxDepth (default: 5)
- Depth-based visual indentation using Tailwind (ml-4, ml-6) for visual hierarchy
- MentionsInput searches Supabase users table by email/name for autocomplete
- Portuguese localization for all timestamps using date-fns with pt-BR locale
- Optimistic comment updates with rollback on Supabase error
- Component separation: CommentInput (full form) and QuickCommentInput (lightweight)
- threadHelpers utilities for comment tree building, mention parsing, validation

**From 02-03 (Implement Status Tracking Workflow):**
- Any collaborator can change annotation status (not just author) - collaborative decision model
- Status stored in annotation metadata field for Supabase compatibility without schema migration
- Optimistic updates for better UX with async Supabase persistence
- Both sync and async status update methods for different use cases
- Three-state workflow: OPEN → IN_PROGRESS → RESOLVED with ability to reopen
- Portuguese labels for status display (Aberto, Em Progresso, Resolvido)
- Confirmation dialog for RESOLVED status to prevent accidental resolution

**From 02-04 (Create Version History with Diff Viewing):**
- Document version history system using react-diff-viewer-continued for side-by-side comparison
- Supabase document_versions table with soft delete and 50-version retention policy
- Zustand store (useVersionStore) with createVersion, getVersionsForDocument, restoreVersion, compareVersions actions
- VersionHistory component with timeline, pagination (20 per page), compare modal, restore dialog
- DiffViewer component with word-level diff, custom dark/light themes, size warning for >10k lines
- diffGenerator utilities for line-by-line diff generation with normalization
- Portuguese localization for timestamps using date-fns with pt-BR locale
- Database types added to supabase.ts for document_versions table

**From 02-05 (Verify Markdown Rendering Supports Standard Syntax):**
- MarkdownRenderer component using react-markdown with rehype-sanitize for security
- react-syntax-highlighter with vscDarkPlus theme for code blocks
- DOMPurify hooks for additional XSS protection (event handlers, dangerous protocols)
- CodeBlock component with copy-to-clipboard, language labels, and optional line numbers
- MarkdownConfig types with preset configurations (strict, permissive, default)
- 40+ test cases covering syntax, security, and edge cases
- Default security: strict sanitization, links open in new tab with rel="noopener noreferrer"
- Image rendering with alt text fallback and error handling

**From 03-01a (Obsidian Hook Configuration and Handler):**
- Use bun build --target bun for server files (not Vite) to avoid HTML import circular dependency
- Plan directory detection via configurable OBSIDIAN_PLAN_DIRS env var (default: .obsidian/plans/, Plans/, plan/)
- 25-minute timeout with warning at 20 minutes (stays within Claude Code's 30-minute hook timeout)
- PostToolUse Write hook event parsing from stdin with JSON validation
- Ephemeral Bun.serve server on random port (1024-65535) with automatic browser opening
- Platform-specific browser opening: win32 (cmd /c start), darwin (open), linux (xdg-open)
- Structured JSON output via hookSpecificOutput for Claude Code context
- Path validation reused from apps/hook/server/pathValidation.ts for CWE-22 protection

### Pending Todos

None yet.

### Blockers/Concerns

**Action required:** User must create "avatars" bucket in Supabase Dashboard before avatar upload works:
1. Go to Supabase Dashboard → Storage → New bucket
2. Name: `avatars`, make it Public
3. Add RLS policy allowing users to upload to their own folder

**Action required:** User must create document_versions table in Supabase for version history:
1. Run SQL from .planning/phases/02-annotation-system/02-04-SUMMARY.md
2. Creates table with: id, document_id, content, created_by, change_description, annotation_ids, version_number, metadata, deleted, created_at
3. Adds indexes on document_id, created_at, deleted for performance
4. Enables RLS with policies for viewing/creating versions within organization

**Potential concerns from 02-01:**
- Marker positioning may need fine-tuning for complex markdown layouts (nested lists, tables)
- Cross-block selection handling implemented but may need testing with edge cases
- Performance with many annotations should be monitored (may need virtualization)

**From 02-03:**
- Status tracking stores data in metadata JSONB field to avoid database migration
- AnnotationPanel needs integration with StatusBadge component (future task)
- Notification system (Phase 5) can use status changes for triggers

**From 02-02:**
- CommentThread component ready for integration into AnnotationPanel
- CSS styling for mention-highlight class may need refinement (currently inline styles)
- Real-time subscription for new comments (Supabase realtime) - future enhancement
- Comment editing/deletion permissions currently owner-only (may need refinement)

**From 02-05:**
- MarkdownRenderer ready for integration into CommentThread for markdown comment support
- CodeBlock component ready for integration into annotation display
- Test cases defined but automated test runner not yet created (manual verification for now)
- Markdown test cases can be integrated into Vitest test suite when needed

**From 02-04:**
- VersionHistory component ready for integration into AnnotationPanel or editor toolbar
- createVersion() should be called after significant document edits (trigger on save button)
- Database setup required: document_versions table must be created in Supabase
- Real-time subscriptions for version updates - future enhancement (Supabase realtime)
- Auto-save workflow needs to be defined (interval, on blur, explicit save button)

**From 03-01a:**
- obsidianHook.js is ready to be registered as a Claude Code hook command
- obsidian-hooks.json configuration needs to be loaded by Claude Code
- Command "obsreview-obsidian" needs to be registered in Claude Code's command registry
- Next: Register obsidianHook.js as Claude Code command and configure hook loading

## Session Continuity

Last session: 2026-02-05
Stopped at: Completed 03-01a - Obsidian Hook Configuration and Handler
Resume file: None
