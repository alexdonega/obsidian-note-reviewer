#!/usr/bin/env node

/**
 * WRAPPER AUTOMÁTICO PARA CRIAR NOTAS OBSIDIAN
 *
 * Este script simplifica a criação de notas:
 * 1. Lê os caminhos configurados (ou usa padrões)
 * 2. Cria a nota no vault Obsidian
 * 3. Abre automaticamente no Plannotator para revisão
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { exec } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configurações padrão (podem ser sobrescritas via argumentos)
const DEFAULT_CONFIG = {
  vaultPath: 'C:/Users/Alex/Documents/ObsidianVault',
  noteFolder: 'notas-revisao',
  port: 3000
};

/**
 * Cria uma nota Obsidian e abre no Plannotator
 */
function autoCreateNote({ filename, content, vaultPath, noteFolder, port }) {
  const fullPath = join(vaultPath, noteFolder, filename);

  console.log('\n🔮 Auto Create Note - Sistema Automático\n');
  console.log('📂 Vault:', vaultPath);
  console.log('📁 Pasta:', noteFolder);
  console.log('📝 Arquivo:', filename);
  console.log('━'.repeat(50));

  // Criar diretório se não existir
  const dir = dirname(fullPath);
  try {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  } catch (error) {
    console.error('❌ Erro ao criar diretório:', error.message);
    process.exit(1);
  }

  // Criar nota
  try {
    writeFileSync(fullPath, content, 'utf8');
    console.log('✅ Nota criada:', fullPath);
  } catch (error) {
    console.error('❌ Erro ao criar nota:', error.message);
    process.exit(1);
  }

  // Abrir no Plannotator
  const url = `http://localhost:${port}?file=${encodeURIComponent(fullPath)}`;
  console.log('\n🚀 Abrindo no Plannotator...');

  const command = process.platform === 'win32' ? 'start' :
                  process.platform === 'darwin' ? 'open' : 'xdg-open';

  exec(`${command} "${url}"`, (error) => {
    if (error) {
      console.error('❌ Erro ao abrir navegador');
      console.log('💡 Abra manualmente:', url);
    } else {
      console.log('✅ Navegador aberto!');
      console.log('\n🎯 Agora você pode:');
      console.log('   • Revisar a nota no Plannotator');
      console.log('   • Adicionar anotações');
      console.log('   • Aprovar ou solicitar edições');
      console.log('   • Pressionar Ctrl+Z para desfazer última anotação');
      console.log('\n━'.repeat(50) + '\n');
    }
  });
}

// Exportar para uso programático
export { autoCreateNote };

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  AUTO CREATE NOTE - Criar Notas Automaticamente
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Uso:
  node auto-create-note.mjs <filename> [conteúdo]

Exemplos:
  # Criar nota vazia
  node auto-create-note.mjs "minha-nota.md"

  # Criar com conteúdo inline
  node auto-create-note.mjs "teste.md" "# Título\\n\\nConteúdo"

  # Criar com conteúdo de arquivo
  node auto-create-note.mjs "nova.md" "$(cat template.md)"

Configuração:
  Edite DEFAULT_CONFIG no script para mudar:
  - vaultPath: Caminho do seu vault Obsidian
  - noteFolder: Pasta padrão para notas
  - port: Porta do Plannotator (padrão: 3000)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
    process.exit(1);
  }

  const filename = args[0];
  const content = args[1] || `---
title: ${filename.replace('.md', '')}
created: ${new Date().toISOString().split('T')[0]}
status: draft
---

# ${filename.replace('.md', '')}

Conteúdo da nota criada automaticamente.
`;

  autoCreateNote({
    filename,
    content,
    ...DEFAULT_CONFIG
  });
}
