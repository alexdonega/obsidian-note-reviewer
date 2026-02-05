/**
 * Obsidian Plan Reviewer Ephemeral Server (PostToolUse/Write)
 *
 * Triggered by PostToolUse hook on Write tool when plan files are created in Obsidian.
 * Detects plan files in .obsidian/plans/, Plans/, or user-configured directories.
 * If plan file detected: serves reviewer UI, waits for user decision, returns feedback.
 * If no plan file: exits silently (pass-through).
 *
 * API Endpoints:
 * - GET  /api/content - Returns note content and file path
 * - POST /api/approve - User approved (no changes)
 * - POST /api/deny - User requested changes (with feedback)
 */

import { $ } from "bun";
import { getHookCSP } from "@obsidian-note-reviewer/security/csp";
import { validatePath, validatePathWithAllowedDirs } from "./pathValidation";

// Embed the built HTML at compile time
import indexHtml from "../dist/index.html" with { type: "text" };

// Plan directories to watch (Obsidian-specific locations)
// Can be overridden via OBSIDIAN_PLAN_DIRS environment variable (comma-separated)
const DEFAULT_PLAN_DIRS = [
  ".obsidian/plans",  // Obsidian vault config directory
  "Plans",            // User's plan folder in vault root
  "plan",             // Singular variant
];

// Parse plan directories from env or use defaults
const PLAN_DIRS = process.env.OBSIDIAN_PLAN_DIRS
  ? process.env.OBSIDIAN_PLAN_DIRS.split(",").map((d) => d.trim())
  : DEFAULT_PLAN_DIRS;

// Timeout for user decision (25 minutes)
const DECISION_TIMEOUT_MS = 25 * 60 * 1000; // 25 minutes
const WARNING_TIMEOUT_MS = 20 * 60 * 1000; // 20 minutes (warning before timeout)

// CSP header for all responses
const cspHeader = getHookCSP(false);

function getSecurityHeaders(): Record<string, string> {
  return {
    "Content-Security-Policy": cspHeader,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  };
}

/**
 * Check if a file path is within a plan directory
 */
function isPlanDirectory(filePath: string): boolean {
  const normalizedPath = filePath.replace(/\\/g, "/").toLowerCase();

  for (const planDir of PLAN_DIRS) {
    const normalizedPlanDir = planDir.replace(/\\/g, "/").toLowerCase();
    // Check if path contains the plan directory
    if (normalizedPath.includes(normalizedPlanDir)) {
      return true;
    }
  }

  return false;
}

// Read PostToolUse hook event from stdin
const eventJson = await Bun.stdin.text();

let filePath = "";
let noteContent = "";

try {
  const event = JSON.parse(eventJson);
  // PostToolUse Write sends: { tool_input: { file_path, content }, tool_result: ... }
  filePath = event.tool_input?.file_path || "";
  noteContent = event.tool_input?.content || "";
} catch {
  // Not valid JSON, exit silently
  process.exit(0);
}

// Only activate reviewer for files in plan directories
if (!filePath || !isPlanDirectory(filePath)) {
  // Not a plan file - pass through silently
  process.exit(0);
}

if (!noteContent) {
  console.error("[ObsidianHook] Plan file has no content, skipping review");
  process.exit(0);
}

// SECURITY: Validate path to prevent path traversal attacks (CWE-22)
const pathValidation = validatePath(filePath);
if (!pathValidation.valid) {
  console.error(`[ObsidianHook] ❌ Path validation failed: ${pathValidation.error}`);
  process.exit(1);
}

// Use normalized path from validation
const safePath = pathValidation.normalizedPath || filePath;

console.error(`[ObsidianHook] 📝 Plan file detected: ${safePath}`);

// Promise that resolves when user makes a decision
let resolveDecision: (result: { approved: boolean; feedback?: string }) => void;
const decisionPromise = new Promise<{ approved: boolean; feedback?: string }>(
  (resolve) => { resolveDecision = resolve; }
);

// Set up timeout with warning
let timeoutWarning: NodeJS.Timeout | null = null;
let timeoutHandle: NodeJS.Timeout | null = null;

// Warning at 20 minutes
timeoutWarning = setTimeout(() => {
  console.error("[ObsidianHook] ⚠️ 5 minutes remaining before auto-timeout");
}, WARNING_TIMEOUT_MS);

// Hard timeout at 25 minutes
timeoutHandle = setTimeout(() => {
  console.error("[ObsidianHook] ⏰ Timeout - no decision received");
  resolveDecision({ approved: false, feedback: "Review timeout - no decision received" });
}, DECISION_TIMEOUT_MS);

const server = Bun.serve({
  port: 0, // Random available port (1024-65535)

  async fetch(req) {
    const url = new URL(req.url);

    console.log(`[ObsidianHook] ${req.method} ${url.pathname}`);

    // API: Get note content
    if (url.pathname === "/api/content") {
      return Response.json(
        { content: noteContent, filePath: safePath },
        { headers: getSecurityHeaders() }
      );
    }

    // API: Approve note
    if (url.pathname === "/api/approve" && req.method === "POST") {
      // Clear timeout handlers
      if (timeoutWarning) clearTimeout(timeoutWarning);
      if (timeoutHandle) clearTimeout(timeoutHandle);
      resolveDecision({ approved: true });
      return Response.json({ ok: true }, { headers: getSecurityHeaders() });
    }

    // API: Deny with feedback
    if (url.pathname === "/api/deny" && req.method === "POST") {
      // Clear timeout handlers
      if (timeoutWarning) clearTimeout(timeoutWarning);
      if (timeoutHandle) clearTimeout(timeoutHandle);
      try {
        const body = await req.json() as { feedback?: string };
        resolveDecision({ approved: false, feedback: body.feedback || "Changes requested" });
      } catch {
        resolveDecision({ approved: false, feedback: "Changes requested" });
      }
      return Response.json({ ok: true }, { headers: getSecurityHeaders() });
    }

    // Serve embedded HTML for all other routes (SPA)
    return new Response(indexHtml, {
      headers: {
        "Content-Type": "text/html",
        ...getSecurityHeaders(),
      }
    });
  },
});

// Open browser automatically
const url = `http://localhost:${server.port}`;
console.error(`[ObsidianHook] Reviewer running on ${url}`);

try {
  const platform = process.platform;
  if (platform === "win32") {
    await $`cmd /c start ${url}`.quiet();
  } else if (platform === "darwin") {
    await $`open ${url}`.quiet();
  } else {
    await $`xdg-open ${url}`.quiet();
  }
  console.error(`[ObsidianHook] Browser opened`);
} catch (error) {
  console.error(`[ObsidianHook] Failed to open browser: ${error}`);
  console.error(`[ObsidianHook] Open manually: ${url}`);
}

// Wait for user decision (blocks until approve/deny/timeout)
const result = await decisionPromise;

console.error(`[ObsidianHook] Decision: ${result.approved ? "✅ APPROVED" : "❌ CHANGES REQUESTED"}`);
if (result.feedback) {
  console.error(`[ObsidianHook] Feedback: ${result.feedback}`);
}

// Give browser time to receive response
await Bun.sleep(1500);

// Cleanup
server.stop();

// Output structured JSON for PostToolUse hook
// This output becomes additional context for Claude after the Write tool result
if (result.approved) {
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      result: "OBSIDIAN_PLAN_APPROVED",
      filePath: safePath
    }
  }));
} else {
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      result: "OBSIDIAN_PLAN_CHANGES_REQUESTED",
      filePath: safePath,
      feedback: result.feedback
    }
  }));
}

process.exit(0);

// Export for testing
export function handleObsidianHook(eventJson: string): { approved: boolean; feedback?: string } | null {
  // This function allows testing the hook logic without actually running the server
  // In production, the main execution flow above is used

  let filePath = "";
  let noteContent = "";

  try {
    const event = JSON.parse(eventJson);
    filePath = event.tool_input?.file_path || "";
    noteContent = event.tool_input?.content || "";
  } catch {
    return null;
  }

  // Only activate for plan directories
  if (!filePath || !isPlanDirectory(filePath)) {
    return null;
  }

  // Validate path
  const pathValidation = validatePath(filePath);
  if (!pathValidation.valid) {
    console.error(`[ObsidianHook] Path validation failed: ${pathValidation.error}`);
    return null;
  }

  return {
    approved: false,
    feedback: "Hook validation passed"
  };
}
