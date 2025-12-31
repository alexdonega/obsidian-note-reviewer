$server = Get-Content 'C:\Users\Alex\Dev\obsidian-note-reviewer\apps\hook\server\index.ts' -Raw

# Add save endpoint before the SPA route
$saveEndpoint = @'
    // API: Save note to vault
    if (url.pathname === "/api/save" && req.method === "POST") {
      try {
        const body = await req.json() as { content: string; path: string };
        const fs = await import("fs/promises");
        const pathModule = await import("path");

        // Ensure directory exists
        const dir = pathModule.dirname(body.path);
        await fs.mkdir(dir, { recursive: true });

        // Save file
        await fs.writeFile(body.path, body.content, "utf-8");

        return Response.json({ ok: true, message: "Nota salva com sucesso" });
      } catch (error) {
        return Response.json(
          { ok: false, error: error instanceof Error ? error.message : "Erro ao salvar nota" },
          { status: 500 }
        );
      }
    }

'@

# Insert before the "Serve embedded HTML" comment
$server = $server -replace '(\s+// Serve embedded HTML for all other routes)', "$saveEndpoint`$1"

$server | Out-File -FilePath 'C:\Users\Alex\Dev\obsidian-note-reviewer\apps\hook\server\index.ts' -Encoding utf8 -NoNewline
Write-Host 'Save endpoint added to hook server'
