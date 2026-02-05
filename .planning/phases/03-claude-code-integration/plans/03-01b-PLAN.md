---
phase: 03-claude-code-integration
plan: 01b
type: execute
wave: 2
depends_on: ["03-01a"]
files_modified:
  - apps/hook/bin/obsreview-obsidian.ts
  - apps/hook/package.json
  - apps/hook/server/obsidianHook.ts
autonomous: false

must_haves:
  truths:
    - "CLI command obsreview-obsidian is executable after build"
    - "Inactivity timeout closes server after 25 minutes of no API calls"
    - "Hook triggers when plan file is created in Obsidian"
  artifacts:
    - path: "apps/hook/bin/obsreview-obsidian.ts"
      provides: "CLI entry point for obsreview-obsidian command"
      min_lines: 15
    - path: "apps/hook/package.json"
      provides: "NPM bin entry for command registration"
      contains: '"obsreview-obsidian"'
    - path: "apps/hook/server/obsidianHook.ts"
      provides: "Inactivity timeout implementation"
      exports: ["handleInactivityTimeout"]
  key_links:
    - from: "apps/hook/bin/obsreview-obsidian.ts"
      to: "apps/hook/server/obsidianHook.ts"
      via: "import"
      pattern: "import.*obsidianHook"
    - from: "apps/hook/package.json"
      to: "apps/hook/dist/obsidianHook.js"
      via: "bin field"
      pattern: '"obsreview-obsidian"[[:space:]]*:[[:space:]]*"dist/obsreviewHook\\.js"'
---

<objective>
Complete CLI registration and inactivity timeout for Obsidian hook integration.

**Purpose:** Enable executable command registration and prevent hook hangs from inactivity.

**Output:** CLI command entry point, package.json bin entry, and 25-minute inactivity timeout system.
</objective>

<execution_context>
@C:\Users\Alex\.claude/get-shit-done/workflows/execute-plan.md
@C:\Users\Alex\.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/03-claude-code-integration/03-01a-SUMMARY.md

# Existing patterns
@apps/hook/bin/hook.ts
@apps/hook/server/index.ts
</context>

<tasks>

<task type="auto">
  <name>Create CLI command registration</name>
  <files>apps/hook/bin/obsreview-obsidian.ts</files>
  <action>
    Create `apps/hook/bin/obsreview-obsidian.ts` that:
    - Imports handleObsidianHook from obsidianHook.ts
    - Executes the hook handler with stdin input
    - Handles graceful shutdown on SIGTERM (cleanup, close server)
    - Logs startup to stderr for debugging ("[ObsidianHook] Starting...")

    Follow existing apps/hook/bin/hook.ts pattern for consistency.
  </action>
  <verify>File exists; imports from ../server/obsidianHook.ts</verify>
  <done>CLI entry point ready for command execution</done>
</task>

<task type="auto">
  <name>Add package.json bin entry</name>
  <files>apps/hook/package.json</files>
  <action>
    Update `apps/hook/package.json` to:
    - Add to bin section: "obsreview-obsidian": "dist/obsidianHook.js"
    - Ensure file is executable (chmod +x handled by npm install)

    Preserve existing "hook" bin entry - this is additive.
  </action>
  <verify>package.json contains "obsreview-obsidian" in bin object</verify>
  <done>Command registered for npm link/global installation</done>
</task>

<task type="auto">
  <name>Implement inactivity timeout</name>
  <files>apps/hook/server/obsidianHook.ts</files>
  <action>
    Add inactivity timeout system to obsidianHook.ts:

    1. **Track last activity** - Timestamp updated on each API request
    2. **Start 25-minute timer** - setTimeout after server starts
    3. **Countdown warning** - Log to stderr at 20 minutes remaining
    4. **Close server on timeout** - server.stop() and exit with message
    5. **Keepalive endpoint** - POST /api/keepalive resets timer

    Timeout prevents hook hangs if user abandons review session.

    DO NOT use intervals - use setTimeout reset on activity for efficiency.
  </action>
  <verify>TypeScript compiles; timeout logic uses setTimeout, not setInterval</verify>
  <done>Inactivity timeout prevents indefinite hook hangs</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Complete Obsidian hook integration (config + handler + CLI + timeout)</what-built>
  <how-to-verify>
    Manual testing:

    1. Build the project: `cd apps/hook && bun run build`
    2. Create test plan file: `.obsidian/plans/test-plan.md` via Obsidian
    3. Verify hook triggers and viewer opens in browser
    4. Test approve/deny workflows return JSON to stdout
    5. Test inactivity timeout: wait 25+ minutes, verify server closes
    6. Test path validation: attempt traversal attack, verify blocked

    Expected outcomes:
    - Browser opens automatically with plan content
    - JSON output to stdout on user decision
    - Server closes after 25 minutes of inactivity
    - Malicious paths are rejected
  </how-to-verify>
  <resume-signal>Type "approved" if all tests pass, or describe issues</resume-signal>
</task>

</tasks>

<verification>
- [ ] CLI command file created with proper imports
- [ ] package.json bin entry added
- [ ] Inactivity timeout implemented with setTimeout
- [ ] Manual testing confirms hook triggers, viewer opens, timeout works
- [ ] Path validation blocks traversal attempts
</verification>

<success_criteria>
1. Creating plan file in Obsidian automatically opens reviewer (CLAU-01 complete)
2. Hook processes within 1800s timeout window
3. Inactivity timeout prevents indefinite hangs
</success_criteria>

<output>
After completion, create `.planning/phases/03-claude-code-integration/03-01b-SUMMARY.md`
</output>

---

**Plan created:** 2026-02-05
**Estimated duration:** 18 min
**Complexity:** Medium (CLI + timeout + testing)
