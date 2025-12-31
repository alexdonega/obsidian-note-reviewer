import { readFileSync, writeFileSync } from 'fs';

console.log('🔧 Aplicando fix de annotation restoration...\n');

const viewerPath = 'packages/ui/components/Viewer.tsx';
let content = readFileSync(viewerPath, 'utf8');

// 1. Fix removeHighlight function to use querySelectorAll instead of querySelector
console.log('1️⃣ Corrigindo removeHighlight...');

const oldRemoveHighlight = /removeHighlight: \(id: string\) => \{[^}]+highlighterRef\.current\?\.remove\(id\);[^}]+\},/s;

const newRemoveHighlight = `removeHighlight: (id: string) => {
      // Try highlighter first (for regular text selections)
      highlighterRef.current?.remove(id);

      // Handle manually created highlights (may be multiple marks with same ID)
      const manualHighlights = containerRef.current?.querySelectorAll(\`[data-bind-id="\${id}"]\`);
      manualHighlights?.forEach(el => {
        const parent = el.parentNode;
        while (el.firstChild) {
          parent?.insertBefore(el.firstChild, el);
        }
        el.remove();
      });
    },`;

if (content.match(oldRemoveHighlight)) {
  content = content.replace(oldRemoveHighlight, newRemoveHighlight);
  console.log('   ✓ removeHighlight corrigido\n');
} else {
  console.log('   ⚠ removeHighlight não encontrado ou já atualizado\n');
}

// 2. Note: The applySharedAnnotations fix is complex and requires finding the exact location
// For now, we'll add a comment marker where manual intervention may be needed

console.log('2️⃣ Verificando applySharedAnnotations...');

if (content.includes('extractContents()')) {
  console.log('   ⚠ ATENÇÃO: Código usa extractContents() - pode causar quebra de DOM');
  console.log('   ⚠ Verificação manual recomendada na função applySharedAnnotations\n');
} else if (content.includes('Multi-mark approach')) {
  console.log('   ✓ Fix multi-mark já aplicado\n');
} else {
  console.log('   ℹ applySharedAnnotations não identificado claramente\n');
}

writeFileSync(viewerPath, content, 'utf8');

console.log('✅ Fix de removeHighlight aplicado!');
console.log('📝 Nota: applySharedAnnotations pode precisar de atualização manual');
