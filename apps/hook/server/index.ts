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
import path from 'path';
import os from 'os';

// Embed the built HTML at compile time
import indexHtml from "../dist/index.html" with { type: "text" };

// Security: Allowed directories for file operations
const ALLOWED_DIRS = [
  path.join(os.homedir(), 'Documents'),
  path.join(os.homedir(), 'Obsidian'),
  path.join(os.homedir(), 'ObsidianVault'),
  process.env.VAULT_PATH || path.join(os.homedir(), 'vault')
].filter(Boolean);

/**
 * Security check: Prevents path traversal attacks
 * Only allows writing to specific whitelisted directories
 */
function isPathSafe(userPath: string): boolean {
  try {
    const resolved = path.resolve(userPath);
    return ALLOWED_DIRS.some(dir => resolved.startsWith(path.resolve(dir)));
  } catch {
    return false;
  }
}

/**
 * Security: Add comprehensive security headers to responses
 * Protects against XSS, clickjacking, MIME sniffing, and other attacks
 */
function addSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);

  // Content Security Policy - prevents XSS attacks
  headers.set('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " + // Mermaid + React need inline/eval
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self'; " +
    "connect-src 'self' http://localhost:* ws://localhost:*; " + // Dev + WebSocket
    "frame-ancestors 'none';"
  );

  // Prevent clickjacking attacks
  headers.set('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  headers.set('X-Content-Type-Options', 'nosniff');

  // Enable XSS filter in older browsers
  headers.set('X-XSS-Protection', '1; mode=block');

  // Control referrer information
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Disable dangerous browser features
  headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // HSTS - Force HTTPS (only in production)
  if (process.env.NODE_ENV === 'production') {
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

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
      return addSecurityHeaders(Response.json({ content: noteContent, plan: noteContent }));
    }

    // API: Approve note
    if (url.pathname === "/api/approve" && req.method === "POST") {
      resolveDecision({ approved: true });
      return addSecurityHeaders(Response.json({ ok: true }));
    }

    // API: Deny with feedback
    if (url.pathname === "/api/deny" && req.method === "POST") {
      try {
        const body = await req.json() as { feedback?: string };
        resolveDecision({ approved: false, feedback: body.feedback || "Plan rejected by user" });
      } catch {
        resolveDecision({ approved: false, feedback: "Plan rejected by user" });
      }
      return addSecurityHeaders(Response.json({ ok: true }));
    }

    // API: Save note to vault
    if (url.pathname === "/api/save" && req.method === "POST") {
      try {
        const body = await req.json() as { content: string; path: string };

        // Security: Validate path to prevent path traversal
        if (!isPathSafe(body.path)) {
          console.warn(`[Server] 🚨 Path traversal attempt blocked: ${body.path}`);
          return addSecurityHeaders(Response.json(
            { ok: false, error: "Invalid path: access denied" },
            { status: 403 }
          ));
        }

        const fs = await import("fs/promises");
        const pathModule = await import("path");

        // Ensure directory exists
        const dir = pathModule.dirname(body.path);
        await fs.mkdir(dir, { recursive: true });

        // Save file
        await fs.writeFile(body.path, body.content, "utf-8");

        console.log(`[Server] ✅ Nota salva: ${body.path}`);
        return addSecurityHeaders(Response.json({ ok: true, message: "Nota salva com sucesso", path: body.path }));
      } catch (error) {
        console.error(`[Server] ❌ Erro ao salvar:`, error);
        return addSecurityHeaders(Response.json(
          { ok: false, error: error instanceof Error ? error.message : "Erro ao salvar nota" },
          { status: 500 }
        ));
      }
    }

    // API: List configuration files
    if (url.pathname === "/api/config/list" && req.method === "GET") {
      try {
        const fs = await import("fs/promises");
        const pathModule = await import("path");

        // Get project root (2 levels up from server directory)
        const projectRoot = pathModule.join(import.meta.dir, "../..");
        const configDir = pathModule.join(projectRoot, "references");

        // Ensure directory exists
        try {
          await fs.access(configDir);
        } catch {
          return Response.json({ ok: true, files: [] });
        }

        const files = await fs.readdir(configDir);
        const mdFiles = files
          .filter(f => f.endsWith('.md'))
          .map(f => ({
            name: f,
            displayName: f.replace('.md', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            path: pathModule.join(configDir, f)
          }));

        return Response.json({ ok: true, files: mdFiles });
      } catch (error) {
        return Response.json(
          { ok: false, error: error instanceof Error ? error.message : "Erro ao listar configurações" },
          { status: 500 }
        );
      }
    }

    // API: Read configuration file
    if (url.pathname === "/api/config/read" && req.method === "GET") {
      try {
        const fileName = url.searchParams.get("file");
        if (!fileName) {
          return Response.json(
            { ok: false, error: "Parâmetro 'file' é obrigatório" },
            { status: 400 }
          );
        }

        const fs = await import("fs/promises");
        const pathModule = await import("path");

        const projectRoot = pathModule.join(import.meta.dir, "../..");
        const configDir = pathModule.join(projectRoot, "references");
        const filePath = pathModule.join(configDir, fileName);

        // Security: Ensure file is within references directory
        if (!filePath.startsWith(configDir)) {
          return Response.json(
            { ok: false, error: "Caminho de arquivo inválido" },
            { status: 403 }
          );
        }

        const content = await fs.readFile(filePath, "utf-8");

        return Response.json({ ok: true, content, fileName });
      } catch (error) {
        return Response.json(
          { ok: false, error: error instanceof Error ? error.message : "Erro ao ler configuração" },
          { status: 500 }
        );
      }
    }

    // API: Save configuration file
    if (url.pathname === "/api/config/save" && req.method === "POST") {
      try {
        const body = await req.json() as { fileName: string; content: string };

        if (!body.fileName || body.content === undefined) {
          return Response.json(
            { ok: false, error: "Parâmetros 'fileName' e 'content' são obrigatórios" },
            { status: 400 }
          );
        }

        const fs = await import("fs/promises");
        const pathModule = await import("path");

        const projectRoot = pathModule.join(import.meta.dir, "../..");
        const configDir = pathModule.join(projectRoot, "references");
        const filePath = pathModule.join(configDir, body.fileName);

        // Security: Ensure file is within references directory
        if (!filePath.startsWith(configDir)) {
          return Response.json(
            { ok: false, error: "Caminho de arquivo inválido" },
            { status: 403 }
          );
        }

        // Ensure directory exists
        await fs.mkdir(configDir, { recursive: true });

        // Create backup before saving
        const backupPath = `${filePath}.bak`;
        try {
          await fs.access(filePath);
          await fs.copyFile(filePath, backupPath);
        } catch {
          // File doesn't exist yet, skip backup
        }

        // Save file
        await fs.writeFile(filePath, body.content, "utf-8");

        return Response.json({ ok: true, message: "Configuração salva com sucesso" });
      } catch (error) {
        return Response.json(
          { ok: false, error: error instanceof Error ? error.message : "Erro ao salvar configuração" },
          { status: 500 }
        );
      }
    }

    // API: Validate config paths
    if (url.pathname === "/api/config/validate-paths" && req.method === "POST") {
      try {
        const body = await req.json() as { content: string };
        const fs = await import("fs/promises");

        // Extract paths from content
        const pathRegex = /(?:template|Template|pasta|Pasta|Atlas|Work)[^\n]*?([A-Z]:[\\\/][^\s`"'\n]+(?:\.md)?)/g;
        const matches = [...body.content.matchAll(pathRegex)];

        const validationResults: { path: string; exists: boolean }[] = [];

        for (const match of matches) {
          const path = match[1].replace(/`$/, '');
          try {
            await fs.access(path);
            validationResults.push({ path, exists: true });
          } catch {
            validationResults.push({ path, exists: false });
          }
        }

        return Response.json({ ok: true, validationResults });
      } catch (error) {
        return Response.json(
          { ok: false, error: error instanceof Error ? error.message : "Erro na validação" },
          { status: 500 }
        );
      }
    }

    // Serve embedded HTML for all other routes (SPA)
    return addSecurityHeaders(new Response(indexHtml, {
      headers: { "Content-Type": "text/html" }
    }));
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
