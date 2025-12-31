import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const fixes = {
  'Anotacoes': 'Anotações',
  'anotacoes': 'anotações',
  'anotacao': 'anotação',
  'Alteracoes': 'Alterações',
  'alteracoes': 'alterações',
  'Configuracoes': 'Configurações',
  'configuracoes': 'configurações',
  'comentario': 'comentário',
  'sera salva': 'será salva',
  'ira revisar': 'irá revisar',
  'Selecao': 'Seleção',
  'Adicione um comentario': 'Adicione um comentário',
  'comentarios ou sugerir alteracoes': 'comentários ou sugerir alterações',
  'Revisar Alteracoes': 'Revisar Alterações',
  'Nenhuma anotacao': 'Nenhuma anotação',
  'Solicitar Alteracoes': 'Solicitar Alterações',
  'Adicione Anotacoes': 'Adicione Anotações',
  'adicionar anotacoes': 'adicionar anotações',
  'solicitar alteracoes': 'solicitar alterações',
  'Remove Annotation': 'Remover Anotação'
};

const files = [
  'packages/ui/components/AnnotationPanel.tsx',
  'packages/ui/components/AnnotationSidebar.tsx',
  'packages/ui/components/DecisionBar.tsx',
  'packages/ui/components/Settings.tsx',
  'packages/ui/components/Toolbar.tsx',
  'packages/ui/components/Viewer.tsx',
  'packages/ui/components/ModeSwitcher.tsx',
  'packages/editor/App.tsx'
];

files.forEach(file => {
  try {
    let content = readFileSync(file, 'utf8');

    Object.entries(fixes).forEach(([wrong, correct]) => {
      content = content.replaceAll(wrong, correct);
    });

    writeFileSync(file, content, 'utf8');
    console.log(`✓ ${file}`);
  } catch (err) {
    console.error(`✗ ${file}:`, err.message);
  }
});

console.log('\n✅ Acentos corrigidos!');
