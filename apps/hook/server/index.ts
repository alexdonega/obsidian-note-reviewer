/**
 * Obsidian Note Reviewer Ephemeral Server (Sistema Unificado)
 *
 * Spawned by hook to serve Obsidian Note Reviewer UI and handle approve/deny decisions.
 * Uses random port to support multiple concurrent Claude Code sessions.
 *
 * Reads hook event from stdin, extracts note content, serves UI, returns decision.
 *
 * API Endpoints (ONLY 4):
 * - GET  /api/content - Returns note content from hook event
 * - POST /api/approve - User approved (no changes)
 * - POST /api/deny - User requested changes (with feedback)
 * - POST /api/save - Save note to Obsidian vault
 */

import { $ } from "bun";
import { validatePath } from "./pathValidation";

// Embed the built HTML at compile time
import indexHtml from "../dist/index.html" with { type: "text" };

// Read hook event from stdin
const eventJson = await Bun.stdin.text();

let noteContent = "";
try {
  const event = JSON.parse(eventJson);
  noteContent = event.tool_input?.content || event.tool_input?.plan || "";
} catch {
  console.error("Failed to parse hook event from stdin");
  process.exit(1);
}

if (!noteContent) {
  console.error("No note content in hook event");
  process.exit(1);
}

// Promise that resolves when user makes a decision
let resolveDecision: (result: { approved: boolean; feedback?: string }) => void;
const decisionPromise = new Promise<{ approved: boolean; feedback?: string }>(
  (resolve) => { resolveDecision = resolve; }
);

const server = Bun.serve({
  port: 0, // Random available port - critical for multi-instance support

  async fetch(req) {
    const url = new URL(req.url);

    console.log(`[Server] ${req.method} ${url.pathname}`);

    // API: Get note content
    if (url.pathname === "/api/content" || url.pathname === "/api/plan") {
      return Response.json({ content: noteContent, plan: noteContent });
    }

    // API: Approve note
    if (url.pathname === "/api/approve" && req.method === "POST") {
      resolveDecision({ approved: true });
      return Response.json({ ok: true });
    }

    // API: Deny with feedback
    if (url.pathname === "/api/deny" && req.method === "POST") {
      try {
        const body = await req.json() as { feedback?: string };
        resolveDecision({ approved: false, feedback: body.feedback || "Plan rejected by user" });
      } catch {
        resolveDecision({ approved: false, feedback: "Plan rejected by user" });
      }
      return Response.json({ ok: true });
    }

    // API: Save note to vault
    if (url.pathname === "/api/save" && req.method === "POST") {
      try {
        const body = await req.json() as { content: string; path: string };

        // Security: Validate path to prevent path traversal attacks (CWE-22)
        const pathValidation = validatePath(body.path);
        if (!pathValidation.valid) {
          console.error(`[Server] [SECURITY] Path validation failed for path: ${pathValidation.error}`);
          return Response.json(
            { ok: false, error: pathValidation.error || "Invalid path" },
            { status: 400 }
          );
        }

        const fs = await import("fs/promises");
        const pathModule = await import("path");

        // Use the normalized path for file operations
        const safePath = pathValidation.normalizedPath!;

        // Ensure directory exists
        const dir = pathModule.dirname(safePath);
        await fs.mkdir(dir, { recursive: true });

        // Save file
        await fs.writeFile(safePath, body.content, "utf-8");

        console.log(`[Server] ✅ Nota salva: ${safePath}`);
        return Response.json({ ok: true, message: "Nota salva com sucesso", path: safePath });
      } catch (error) {
        console.error(`[Server] ❌ Erro ao salvar:`, error);
        return Response.json(
          { ok: false, error: error instanceof Error ? error.message : "Erro ao salvar nota" },
          { status: 500 }
        );
      }
    }

    // Serve embedded HTML for all other routes (SPA)
    return new Response(indexHtml, {
      headers: { "Content-Type": "text/html" }
    });
  },
});

// Open browser - cross-platform support
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

// Give browser time to receive response and update UI
await Bun.sleep(1500);

// Cleanup
server.stop();

// Output JSON for PermissionRequest hook decision control
if (result.approved) {
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PermissionRequest",
      decision: {
        behavior: "allow"
      }
    }
  }));
} else {
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PermissionRequest",
      decision: {
        behavior: "deny",
        message: result.feedback || "Plan changes requested"
      }
    }
  }));
}

process.exit(0);
