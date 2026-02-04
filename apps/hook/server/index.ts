/**
 * Obsidian Note Reviewer Ephemeral Server (PostToolUse/Write)
 *
 * Triggered by PostToolUse hook on Write tool.
 * Checks if the written file is a draft note in the temp dir.
 * If yes: serves reviewer UI, waits for user decision, returns feedback.
 * If no: exits silently (pass-through).
 *
 * API Endpoints:
 * - GET  /api/content - Returns note content
 * - POST /api/approve - User approved (no changes)
 * - POST /api/deny - User requested changes (with feedback)
 * - POST /api/save - Save note to Obsidian vault
 */

import { $ } from "bun";
import { getHookCSP } from "@obsidian-note-reviewer/security/csp";
import { validatePath, validatePathWithAllowedDirs } from "./pathValidation";

// Embed the built HTML at compile time
import indexHtml from "../dist/index.html" with { type: "text" };

// Temp dir where draft notes are written (must match skill config)
const TEMP_DIR = "C:/dev/tools/obsidian-note-reviewer/.temp";

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

// Normalize path separators for comparison
const normalizedPath = filePath.replace(/\\/g, "/");
const normalizedTempDir = TEMP_DIR.replace(/\\/g, "/");

// Only activate reviewer for files in the temp dir
if (!normalizedPath.startsWith(normalizedTempDir)) {
  // Not a draft note - pass through silently
  process.exit(0);
}

if (!noteContent) {
  console.error("[Server] Draft file has no content, skipping review");
  process.exit(0);
}

// Promise that resolves when user makes a decision
let resolveDecision: (result: { approved: boolean; feedback?: string }) => void;
const decisionPromise = new Promise<{ approved: boolean; feedback?: string }>(
  (resolve) => { resolveDecision = resolve; }
);

const server = Bun.serve({
  port: 0, // Random available port

  async fetch(req) {
    const url = new URL(req.url);

    console.log(`[Server] ${req.method} ${url.pathname}`);

    // API: Get note content
    if (url.pathname === "/api/content") {
      return Response.json(
        { content: noteContent, filePath },
        { headers: getSecurityHeaders() }
      );
    }

    // API: Approve note
    if (url.pathname === "/api/approve" && req.method === "POST") {
      resolveDecision({ approved: true });
      return Response.json({ ok: true }, { headers: getSecurityHeaders() });
    }

    // API: Deny with feedback
    if (url.pathname === "/api/deny" && req.method === "POST") {
      try {
        const body = await req.json() as { feedback?: string };
        resolveDecision({ approved: false, feedback: body.feedback || "Changes requested" });
      } catch {
        resolveDecision({ approved: false, feedback: "Changes requested" });
      }
      return Response.json({ ok: true }, { headers: getSecurityHeaders() });
    }

    // API: Save note to vault
    if (url.pathname === "/api/save" && req.method === "POST") {
      try {
        const body = await req.json() as { content: string; path: string };

        // SECURITY: Validate path to prevent path traversal attacks (CWE-22)
        const allowedPathsEnv = process.env.ALLOWED_SAVE_PATHS;
        let pathValidation;

        if (allowedPathsEnv) {
          // Use allowed directories restriction if configured
          const allowedPaths = allowedPathsEnv.split(",").map((p) => p.trim());
          pathValidation = validatePathWithAllowedDirs(body.path, allowedPaths);
        } else {
          // Use basic validation (blocks traversal but allows any valid path)
          pathValidation = validatePath(body.path);
        }

        if (!pathValidation.valid) {
          console.error(`[Server] ❌ Path validation failed: ${pathValidation.error}`);
          return Response.json(
            { ok: false, error: pathValidation.error },
            { status: 400, headers: getSecurityHeaders() }
          );
        }

        // Use normalized path from validation
        const safePath = pathValidation.normalizedPath || body.path;

        const fs = await import("fs/promises");
        const pathModule = await import("path");

        const dir = pathModule.dirname(safePath);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(safePath, body.content, "utf-8");

        console.log(`[Server] ✅ Nota salva: ${safePath}`);
        return Response.json(
          { ok: true, message: "Nota salva com sucesso", path: safePath },
          { headers: getSecurityHeaders() }
        );
      } catch (error) {
        console.error(`[Server] ❌ Erro ao salvar:`, error);
        return Response.json(
          { ok: false, error: error instanceof Error ? error.message : "Erro ao salvar nota" },
          { status: 500, headers: getSecurityHeaders() }
        );
      }
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

// Open browser
const url = `http://localhost:${server.port}`;
console.error(`[Server] Obsidian Note Reviewer running on ${url}`);

try {
  const platform = process.platform;
  if (platform === "win32") {
    await $`cmd /c start ${url}`.quiet();
  } else if (platform === "darwin") {
    await $`open ${url}`.quiet();
  } else {
    await $`xdg-open ${url}`.quiet();
  }
} catch {
  console.error(`[Server] Open browser manually: ${url}`);
}

// Wait for user decision (blocks until approve/deny)
const result = await decisionPromise;

// Give browser time to receive response
await Bun.sleep(1500);

// Cleanup
server.stop();

// Output for PostToolUse hook
// This output becomes additional context for Claude after the Write tool result
if (result.approved) {
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      result: "REVIEW_APPROVED"
    }
  }));
} else {
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      result: "REVIEW_CHANGES_REQUESTED",
      feedback: result.feedback
    }
  }));
}

process.exit(0);
