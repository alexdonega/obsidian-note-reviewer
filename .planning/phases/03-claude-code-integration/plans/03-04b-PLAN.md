---
phase: 03-claude-code-integration
plan: 04b
type: execute
wave: 4
depends_on: ["03-04a"]
files_modified:
  - apps/portal/src/pages/review.tsx
  - apps/portal/src/components/PromptEditor.tsx
autonomous: false

must_haves:
  truths:
    - "Send button triggers API call with formatted prompt"
    - "Keyboard shortcuts work (Ctrl/Cmd+Enter to send, R to reset)"
    - "Reviewer integrates PromptEditor in hook mode"
  artifacts:
    - path: "apps/portal/src/pages/review.tsx"
      provides: "Review page with PromptEditor integration"
      exports: ["ReviewPage"]
    - path: "apps/portal/src/components/PromptEditor.tsx"
      provides: "PromptEditor with send button and keyboard shortcuts"
      exports: ["PromptEditor"]
  key_links:
    - from: "apps/portal/src/pages/review.tsx"
      to: "apps/portal/src/components/PromptEditor.tsx"
      via: "import and render"
      pattern: "import.*PromptEditor|<PromptEditor"
    - from: "apps/portal/src/components/PromptEditor.tsx"
      to: "/api/send-annotations"
      via: "fetch call"
      pattern: "fetch.*api/send-annotations"
---

<objective>
Integrate PromptEditor into review page and add send functionality.

**Purpose:** Complete CLAU-04 and CLAU-05 with send button and keyboard shortcuts.

**Output:** Review page integration with send functionality and keyboard shortcuts.
</objective>

<execution_context>
@C:\Users\Alex\.claude/get-shit-done/workflows/execute-plan.md
@C:\Users\Alex\.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/03-claude-code-integration/03-04a-SUMMARY.md

# Existing patterns
@apps/portal/src/pages/review.tsx
@packages/ui/store/useAnnotationStore.ts
</context>

<tasks>

<task type="auto">
  <name>Add send to Claude Code button</name>
  <files>apps/portal/src/components/PromptEditor.tsx</files>
  <action>
    Add send button to PromptEditor component:

    1. **Validation** - Check prompt is not empty before sending
    2. **Format prompt** - Call formatPrompt() with variable substitution
    3. **API call** - POST to `/api/send-annotations` endpoint
       - Body: { prompt: string, annotations: ClaudeAnnotationExport }
    4. **Loading state** - Disable button and show loading indicator during request
    5. **Success/error feedback** - Show toast notification using sonner
    6. **Error handling** - Display error message on failure

    Use existing API patterns from apps/portal/src/ for consistency.

    DO NOT hardcode endpoint URL - use relative path for proxy compatibility.
  </action>
  <verify>Component has send button with loading state and error handling</verify>
  <done>Send button triggers API call with formatted prompt</done>
</task>

<task type="auto">
  <name>Add keyboard shortcuts</name>
  <files>apps/portal/src/components/PromptEditor.tsx</files>
  <action>
    Add keyboard shortcuts to PromptEditor using useEffect:

    1. **Ctrl/Cmd + Enter** - Send prompt (trigger send button)
    2. **Ctrl/Cmd + R** - Reset to default template
    3. **Escape** - Close/dismiss (if in modal)

    Display shortcuts in tooltip or help text for discoverability.

    Use useEffect with addEventListener for keyboard handling.
    Clean up event listener on unmount.

    DO NOT override browser shortcuts - check modifiers (Ctrl/Cmd) to avoid conflicts.
  </action>
  <verify>Keyboard event listeners added with proper cleanup</verify>
  <done>Keyboard shortcuts work for send, reset, and close</done>
</task>

<task type="auto">
  <name>Integrate into review page</name>
  <files>apps/portal/src/pages/review.tsx</files>
  <action>
    Update `apps/portal/src/pages/review.tsx` to:

    1. **Import components** - PromptEditor and AnnotationExport
    2. **Add "Send to Claude Code" section** - Near existing annotation tools
    3. **Pass annotations** - From useAnnotationStore exportForClaude()
    4. **Conditional display** - Show only when hook mode detected (URL param ?hook=1 or state)
    5. **Positioning** - Place at bottom or side of review UI

    Use existing review page layout patterns for consistency.

    DO NOT break existing review UI - this is additive.
  </action>
  <verify>Review page imports and renders PromptEditor component</verify>
  <done>Send to Claude Code section integrated into review UI</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Complete prompt editor with send functionality (template + editor + send + shortcuts + integration)</what-built>
  <how-to-verify>
    Manual testing:

    1. Start dev server: `cd apps/portal && bun run dev`
    2. Open reviewer with hook mode (add ?hook=1 to URL)
    3. Create sample annotations (different types)
    4. Verify default prompt appears in Portuguese
    5. Edit prompt template and verify preview updates
    6. Test keyboard shortcuts:
       - Ctrl/Cmd+Enter to send
       - Ctrl/Cmd+R to reset
    7. Test localStorage persistence:
       - Edit template, refresh page, verify custom template loads
    8. Verify send button shows loading state and toast notifications

    Expected outcomes:
    - Default prompt in Portuguese with placeholders
    - Preview updates in real-time as template is edited
    - Keyboard shortcuts work
    - Custom template persists across refresh
    - Send button shows loading and success/error states
  </how-to-verify>
  <resume-signal>Type "approved" if all tests pass, or describe issues</resume-signal>
</task>

</tasks>

<verification>
- [ ] Send button calls /api/send-annotations with formatted prompt
- [ ] Keyboard shortcuts registered and working
- [ ] Review page shows PromptEditor in hook mode
- [ ] Loading states and toast notifications working
- [ ] Manual testing confirms full workflow
</verification>

<success_criteria>
1. Default prompt automatically formats revisions (CLAU-04 complete)
2. Editable field allows customization (CLAU-05 complete)
3. Keyboard shortcuts improve usability
4. Integration seamless with existing review UI
</success_criteria>

<output>
After completion, create `.planning/phases/03-claude-code-integration/03-04b-SUMMARY.md`
</output>

---

**Plan created:** 2026-02-05
**Estimated duration:** 15 min
**Complexity:** Medium (integration + keyboard shortcuts + testing)
