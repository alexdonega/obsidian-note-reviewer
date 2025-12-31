import { readFileSync, writeFileSync } from 'fs';

console.log('🔄 Carregando sample-note.md no App.tsx...\n');

// Ler a nota de exemplo
const sampleNote = readFileSync('sample-note.md', 'utf8');

// Ler o App.tsx
const appPath = 'packages/editor/App.tsx';
let appContent = readFileSync(appPath, 'utf8');

// Escapar o conteúdo da nota para usar como string JavaScript
const escapedNote = sampleNote
  .replace(/\\/g, '\\\\')
  .replace(/`/g, '\\`')
  .replace(/\$/g, '\\$');

// Encontrar e substituir PLAN_CONTENT
const planContentRegex = /const PLAN_CONTENT = `[\s\S]*?`;/;

const newPlanContent = `const PLAN_CONTENT = \`${escapedNote}\`;`;

if (appContent.match(planContentRegex)) {
  appContent = appContent.replace(planContentRegex, newPlanContent);
  writeFileSync(appPath, appContent, 'utf8');
  console.log('✅ App.tsx atualizado com sample-note.md!');
  console.log('📝 A nota "Obsidian Note Reviewer - Guia de Teste" será carregada automaticamente\n');
} else {
  console.log('❌ Não foi possível encontrar PLAN_CONTENT no App.tsx');
  process.exit(1);
}
