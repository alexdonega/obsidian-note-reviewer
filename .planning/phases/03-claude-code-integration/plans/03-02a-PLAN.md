---
phase: 03-claude-code-integration
plan: 02a
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/hook/hooks/claude-hooks.json
  - apps/hook/server/planModeHook.ts
autonomous: true

must_haves:
  truths:
    - "Hook triggers when plan mode is activated in Claude Code"
    - "Viewer opens in browser automatically with plan content"
    - "Server outputs structured JSON to stdout on user decision"
  artifacts:
    - path: "apps/hook/hooks/claude-hooks.json"
      provides: "PermissionRequest hook configuration for plan mode"
      contains: '"PermissionRequest"'
    - path: "apps/hook/server/planModeHook.ts"
      provides: "Hook handler for ExitPlanMode events"
      min_lines: 80
      exports: ["handlePlanModeHook"]
  key_links:
    - from: "apps/hook/hooks/claude-hooks.json"
      to: "apps/hook/server/planModeHook.ts"
      via: "command field"
      pattern: '"command"[[:space:]]*:[[:space:]]*"obsreview-plan"'
    - from: "apps/hook/server/planModeHook.ts"
      to: "packages/hook/security/pathValidation.ts"
      via: "import"
      pattern: "validatePath"
---

<objective>
Create plan mode hook configuration and handler for automatic review when Claude Code plan mode is activated.

**Purpose:** Enable CLAU-02 requirement - automatically open reviewer when user activates plan mode in Claude Code.

**Output:** Hook configuration file and TypeScript handler that detects ExitPlanMode events and launches browser-based reviewer.
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
  <name>Create plan mode hook configuration</name>
  <files>apps/hook/hooks/claude-hooks.json</files>
  <action>
    Create `apps/hook/hooks/claude-hooks.json` with PermissionRequest hook configuration:
    - Hook type: PermissionRequest
    - Matcher: ExitPlanMode (detects plan mode activation)
    - Command: obsreview-plan
    - Timeout: 1800s (30 minutes)

    DO NOT combine with obsidian-hooks.json - this is a separate hook type for Claude Code events.
  </action>
  <verify>File exists with valid JSON containing PermissionRequest ExitPlanMode matcher</verify>
  <done>Hook configuration ready for Claude Code to load</done>
</task>

<task type="auto">
  <name>Create plan mode hook handler</name>
  <files>apps/hook/server/planModeHook.ts</files>
  <action>
    Create `apps/hook/server/planModeHook.ts` that:

    1. **Read hook event from stdin** - Parse PermissionRequest ExitPlanMode event JSON
    2. **Extract plan content** - From event.tool_input or read from active file path
    3. **Validate any file paths** - Use existing validatePath() from packages/hook/security/pathValidation.ts
    4. **Spawn Bun.serve server** - Ephemeral server on random port
    5. **Serve embedded HTML** - From apps/hook/dist/index.html
    6. **Provide /api/content endpoint** - Return plan content and context as JSON
    7. **Open browser automatically** - Platform-specific commands
    8. **Wait for user decision** - Promise that resolves on approve/deny/feedback
    9. **Output structured JSON** - Use hookSpecificOutput format to stdout
    10. **Implement 25-minute timeout** - Inactivity countdown with warning

    DO NOT create new server patterns - extend existing apps/hook/server/index.ts.
  </action>
  <verify>TypeScript compiles without errors; imports validatePath from security package</verify>
  <done>Hook handler can parse ExitPlanMode events and spawn ephemeral server</done>
</task>

<task type="auto">
  <name>Update Bun build configuration</name>
  <files>apps/hook/vite.config.ts</files>
  <action>
    Update `apps/hook/vite.config.ts` to:
    - Add planModeHook.ts as separate entry point
    - Output to apps/hook/dist/planModeHook.js
    - Include in build process

    Preserve existing entry points (index.ts, obsidianHook.ts) - this is additive.
  </action>
  <verify>Running `bun run build` produces dist/planModeHook.js</verify>
  <done>Build configuration compiles all hook handlers</done>
</task>

</tasks>

<verification>
- [ ] Hook configuration file exists with valid JSON
- [ ] planModeHook.ts compiles without TypeScript errors
- [ ] Path validation imported from existing security package
- [ ] Build output includes planModeHook.js
- [ ] Command name "obsreview-plan" matches configuration
</verification>

<success_criteria>
1. Hook infrastructure ready for plan mode detection (CLAU-02 foundation)
2. Handler follows existing security patterns
3. Build system produces executable JavaScript
</success_criteria>

<output>
After completion, create `.planning/phases/03-claude-code-integration/03-02a-SUMMARY.md`
</output>

---

**Plan created:** 2026-02-05
**Estimated duration:** 12 min
**Complexity:** Medium (new hook type, proven server pattern)
