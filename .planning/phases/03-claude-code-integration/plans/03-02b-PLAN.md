---
phase: 03-claude-code-integration
plan: 02b
type: execute
wave: 2
depends_on: ["03-02a"]
files_modified:
  - apps/hook/bin/obsreview-plan.ts
  - apps/hook/package.json
  - apps/hook/server/planModeHook.ts
autonomous: false

must_haves:
  truths:
    - "CLI command obsreview-plan is executable after build"
    - "Hook priority prevents double-opening when both hooks fire"
    - "Hook triggers when plan mode is activated in Claude Code"
  artifacts:
    - path: "apps/hook/bin/obsreview-plan.ts"
      provides: "CLI entry point for obsreview-plan command"
      min_lines: 15
    - path: "apps/hook/package.json"
      provides: "NPM bin entry for command registration"
      contains: '"obsreview-plan"'
    - path: "apps/hook/server/planModeHook.ts"
      provides: "Hook priority logic and inactivity timeout"
      exports: ["checkWriteHookStatus", "handleInactivityTimeout"]
  key_links:
    - from: "apps/hook/bin/obsreview-plan.ts"
      to: "apps/hook/server/planModeHook.ts"
      via: "import"
      pattern: "import.*planModeHook"
    - from: "apps/hook/server/planModeHook.ts"
      to: "apps/hook/server/obsidianHook.ts"
      via: "priority check"
      pattern: "checkWriteHookStatus"
---

<objective>
Complete CLI registration and hook priority logic for plan mode integration.

**Purpose:** Enable executable command registration and prevent double-opening when both Write and ExitPlanMode hooks fire.

**Output:** CLI command entry point, package.json bin entry, and hook priority system.
</objective>

<execution_context>
@C:\Users\Alex\.claude/get-shit-done/workflows/execute-plan.md
@C:\Users\Alex\.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/03-claude-code-integration/03-02a-SUMMARY.md

# Existing patterns
@apps/hook/bin/hook.ts
@apps/hook/server/index.ts
</context>

<tasks>

<task type="auto">
  <name>Create CLI command registration</name>
  <files>apps/hook/bin/obsreview-plan.ts</files>
  <action>
    Create `apps/hook/bin/obsreview-plan.ts` that:
    - Imports handlePlanModeHook from planModeHook.ts
    - Executes the hook handler with stdin input
    - Handles graceful shutdown on SIGTERM
    - Logs startup to stderr ("[PlanModeHook] Starting...")

    Follow existing apps/hook/bin/hook.ts pattern.
  </action>
  <verify>File exists; imports from ../server/planModeHook.ts</verify>
  <done>CLI entry point ready for command execution</done>
</task>

<task type="auto">
  <name>Add package.json bin entry</name>
  <files>apps/hook/package.json</files>
  <action>
    Update `apps/hook/package.json` to:
    - Add to bin section: "obsreview-plan": "dist/planModeHook.js"
    - Ensure file is executable (handled by npm install)

    Preserve existing "hook" and "obsreview-obsidian" entries - this is additive.
  </action>
  <verify>package.json contains "obsreview-plan" in bin object</verify>
  <done>Command registered for npm link/global installation</done>
</task>

<task type="auto">
  <name>Implement hook priority logic</name>
  <files>apps/hook/server/planModeHook.ts</files>
  <action>
    Add priority logic to planModeHook.ts:

    1. **Check Write hook status** - Function checkWriteHookStatus() checks if PostToolUse Write hook is active
    2. **Skip if Write active** - Exit with code 0 if Write hook already opened viewer
    3. **Log priority decision** - Output to stderr for debugging
    4. **Add inactivity timeout** - Same 25-minute timeout from obsidianHook.ts

    Priority prevents double-opening when creating plan file in Obsidian triggers both Write and ExitPlanMode hooks.

    DO NOT use file locks - use simple heuristic (check for running server process).
  </action>
  <verify>TypeScript compiles; priority check logs decision to stderr</verify>
  <done>Hook priority prevents double-opening of reviewer</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Complete plan mode hook integration (config + handler + CLI + priority)</what-built>
  <how-to-verify>
    Manual testing:

    1. Build the project: `cd apps/hook && bun run build`
    2. Activate plan mode in Claude Code: run `/plan` command
    3. Verify hook triggers and viewer opens in browser
    4. Test approve/deny workflows return JSON to stdout
    5. Test hook priority: Create plan in Obsidian, verify only one viewer opens
    6. Verify stderr logs show priority decision

    Expected outcomes:
    - Browser opens automatically with plan content
    - JSON output to stdout on user decision
    - Only one viewer opens when both hooks fire
    - Priority logs visible in stderr
  </how-to-verify>
  <resume-signal>Type "approved" if all tests pass, or describe issues</resume-signal>
</task>

</tasks>

<verification>
- [ ] CLI command file created with proper imports
- [ ] package.json bin entry added
- [ ] Hook priority logic implemented
- [ ] Inactivity timeout added
- [ ] Manual testing confirms hook triggers, viewer opens, no double-opening
</verification>

<success_criteria>
1. Activating plan mode in Claude Code automatically opens reviewer (CLAU-02 complete)
2. Hook processes within 1800s timeout window
3. Hook priority prevents double-opening
</success_criteria>

<output>
After completion, create `.planning/phases/03-claude-code-integration/03-02b-SUMMARY.md`
</output>

---

**Plan created:** 2026-02-05
**Estimated duration:** 15 min
**Complexity:** Medium (CLI + priority + testing)
