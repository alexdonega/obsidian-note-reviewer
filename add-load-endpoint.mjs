import { readFileSync, writeFileSync } from 'fs';

console.log('📥 Adicionando endpoint /api/load...\n');

const serverPath = 'apps/hook/server/index.ts';
let content = readFileSync(serverPath, 'utf8');

// Adicionar endpoint /api/load após o /api/save
const loadEndpoint = `
    // API: Load note from filesystem
    if (url.pathname === "/api/load" && req.method === "GET") {
      try {
        const filePath = url.searchParams.get("path");
        if (!filePath) {
          return Response.json(
            { ok: false, error: "Parâmetro 'path' é obrigatório" },
            { status: 400 }
          );
        }

        const fs = await import("fs/promises");
        const content = await fs.readFile(filePath, "utf-8");

        return Response.json({ ok: true, content });
      } catch (error) {
        return Response.json(
          { ok: false, error: error instanceof Error ? error.message : "Erro ao carregar nota" },
          { status: 500 }
        );
      }
    }
`;

// Inserir após o endpoint /api/save
const insertPoint = content.indexOf('    // Serve embedded HTML for all other routes (SPA)');

if (insertPoint !== -1) {
  content = content.slice(0, insertPoint) + loadEndpoint + '\n\n' + content.slice(insertPoint);
  writeFileSync(serverPath, content, 'utf8');
  console.log('✅ Endpoint /api/load adicionado com sucesso!');
} else {
  console.log('❌ Ponto de inserção não encontrado');
  process.exit(1);
}
