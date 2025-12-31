#!/usr/bin/env node

import { writeFileSync } from 'fs';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Cria uma nota Obsidian e abre automaticamente no Plannotator
 *
 * @param {string} filename - Nome do arquivo (ex: "minha-nota.md")
 * @param {string} content - Conteúdo markdown da nota
 * @param {number} port - Porta do servidor Plannotator (padrão: 3000)
 */
export function createAndOpenNote(filename, content, port = 3000) {
  const projectRoot = __dirname;
  const filePath = resolve(projectRoot, filename);

  console.log('\n📝 Criando nota Obsidian...');
  console.log(`   Arquivo: ${filename}`);

  // Criar a nota
  try {
    writeFileSync(filePath, content, 'utf8');
    console.log('   ✅ Nota criada com sucesso!\n');
  } catch (error) {
    console.error('   ❌ Erro ao criar nota:', error.message);
    process.exit(1);
  }

  // Abrir no Plannotator
  const url = `http://localhost:${port}?file=${encodeURIComponent(filePath)}`;
  console.log('🚀 Abrindo no Plannotator...');
  console.log(`   URL: ${url}\n`);

  // Cross-platform open
  const command = process.platform === 'win32' ? 'start' :
                  process.platform === 'darwin' ? 'open' : 'xdg-open';

  exec(`${command} "${url}"`, (error) => {
    if (error) {
      console.error('   ❌ Erro ao abrir navegador:', error.message);
      console.log('   💡 Abra manualmente:', url);
    } else {
      console.log('   ✅ Navegador aberto!\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('   Agora você pode:');
      console.log('   • Visualizar a nota no Plannotator');
      console.log('   • Adicionar anotações e comentários');
      console.log('   • Aprovar ou solicitar edições');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }
  });
}

// Se executado diretamente (não importado)
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(`
Uso: node create-and-open-note.mjs <filename> <content> [port]

Exemplos:
  node create-and-open-note.mjs "teste.md" "# Título\\n\\nConteúdo"
  node create-and-open-note.mjs "nota.md" "$(cat sample-note.md)" 3000
`);
    process.exit(1);
  }

  const [filename, content, port] = args;
  createAndOpenNote(filename, content, port ? parseInt(port) : 3000);
}
