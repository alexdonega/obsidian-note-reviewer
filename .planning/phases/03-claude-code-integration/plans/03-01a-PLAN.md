---
phase: 03-claude-code-integration
plan: 01a
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/hook/hooks/obsidian-hooks.json
  - apps/hook/server/obsidianHook.ts
autonomous: true

must_haves:
  truths:
    - "Hook triggers when plan file is created in Obsidian (.obsidian/plans/ directory)"
    - "Viewer opens in browser automatically with correct content"
    - "Server outputs structured JSON to stdout on user decision"
    - "Path validation blocks malicious paths (CWE-22 protection)"
  artifacts:
    - path: "apps/hook/hooks/obsidian-hooks.json"
      provides: "PostToolUse hook configuration for Obsidian Write events"
      contains: '"PostToolUse"'
    - path: "apps/hook/server/obsidianHook.ts"
      provides: "Hook handler for Obsidian plan file detection"
      min_lines: 80
      exports: ["handleObsidianHook"]
  key_links:
    - from: "apps/hook/hooks/obsidian-hooks.json"
      to: "apps/hook/server/obsidianHook.ts"
      via: "command field"
      pattern: '"command"[[:space:]]*:[[:space:]]*"obsreview-obsidian"'
    - from: "apps/hook/server/obsidianHook.ts"
      to: "packages/hook/security/pathValidation.ts"
      via: "import"
      pattern: "validatePath"
---

<objective>
Create Obsidian hook configuration and handler for automatic plan review when notes are created in Obsidian.

**Purpose:** Enable CLAU-01 requirement - automatically open reviewer when user creates plan notes in Obsidian.

**Output:** Hook configuration file and TypeScript handler that detects Obsidian plan file writes and launches browser-based reviewer.
</objective>

<execution_context>
@C:\Users\Alex\.claude/get-shit-done/workflows/execute-plan.md
@C:\Users\Alex\.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/03-claude-code-integration/03-CONTEXT.md
@.planning/phases/03-claude-code-integration/03-RESEARCH.md

# Existing patterns
@apps/hook/server/index.ts
@apps/hook/hooks/hooks.json
@packages/hook/security/pathValidation.ts
</context>

<tasks>

<task type="auto">
  <name>Create Obsidian hook configuration</name>
  <files>apps/hook/hooks/obsidian-hooks.json</files>
  <action>
    Create `apps/hook/hooks/obsidian-hooks.json` with PostToolUse hook configuration:
    - Hook type: PostToolUse
    - Matcher: Write (detects file write operations)
    - Command: obsreview-obsidian
    - Timeout: 1800s (30 minutes)
    - Target paths: .obsidian/plans/, Plans/, or user-configured directories

    DO NOT create generic hooks - this must be Obsidian-specific for plan file detection.
  </action>
  <verify>File exists with valid JSON structure containing PostToolUse Write matcher</verify>
  <done>Hook configuration file is ready for Claude Code to load</done>
</task>

<task type="auto">
  <name>Create Obsidian-specific hook handler</name>
  <files>apps/hook/server/obsidianHook.ts</files>
  <action>
    Create `apps/hook/server/obsidianHook.ts` that:

    1. **Read hook event from stdin** - Parse PostToolUse Write event JSON
    2. **Detect Obsidian plan files** - Match paths: .obsidian/plans/, Plans/, or user-configured
    3. **Validate path** - Use existing validatePath() from packages/hook/security/pathValidation.ts
    4. **Spawn Bun.serve server** - Ephemeral server on random port (1024-65535)
    5. **Serve embedded HTML** - From apps/hook/dist/index.html
    6. **Provide /api/content endpoint** - Return note content and file path as JSON
    7. **Open browser automatically** - Platform-specific: win32 (start), darwin (open), linux (xdg-open)
    8. **Wait for user decision** - Promise that resolves on approve/deny/feedback
    9. **Output structured JSON** - Use hookSpecificOutput format to stdout
    10. **Implement 25-minute timeout** - Inactivity countdown with warning at 20 minutes

    DO NOT create new server patterns - extend existing apps/hook/server/index.ts pattern.
  </action>
  <verify>TypeScript compiles without errors; imports validatePath from security package</verify>
  <done>Hook handler can parse events, validate paths, and spawn ephemeral server</done>
</task>

<task type="auto">
  <name>Update Bun build configuration</name>
  <files>apps/hook/vite.config.ts</files>
  <action>
    Update `apps/hook/vite.config.ts` to:
    - Add obsidianHook.ts as separate entry point
    - Output to apps/hook/dist/obsidianHook.js
    - Include in build process alongside existing index.ts

    Preserve existing index.ts entry point - this is additive, not replacement.
  </action>
  <verify>Running `bun run build` produces dist/obsidianHook.js</verify>
  <done>Build configuration compiles both hook handlers</done>
</task>

</tasks>

<verification>
- [ ] Hook configuration file exists with valid JSON
- [ ] obsidianHook.ts compiles without TypeScript errors
- [ ] Path validation imported from existing security package
- [ ] Build output includes obsidianHook.js
- [ ] Command name "obsreview-obsidian" matches configuration
</verification>

<success_criteria>
1. Hook infrastructure ready for Obsidian plan file detection (CLAU-01 foundation)
2. Handler follows existing security patterns (path validation, CSP headers)
3. Build system produces executable JavaScript for hook command
</success_criteria>

<output>
After completion, create `.planning/phases/03-claude-code-integration/03-01a-SUMMARY.md`
</output>

---

**Plan created:** 2026-02-05
**Estimated duration:** 12 min
**Complexity:** Medium (extends proven pattern)
