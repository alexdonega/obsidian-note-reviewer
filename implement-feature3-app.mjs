import { readFileSync, writeFileSync } from 'fs';

const filePath = 'packages/editor/App.tsx';

try {
  let content = readFileSync(filePath, 'utf8');

  // Find the Viewer component and add onBlockChange prop
  // Look for the Viewer component usage
  const viewerPattern = /(<Viewer\s+ref=\{viewerRef\}\s+blocks=\{blocks\}\s+markdown=\{markdown\}\s+annotations=\{annotations\}\s+onAddAnnotation=\{handleAddAnnotation\}\s+onSelectAnnotation=\{setSelectedAnnotationId\}\s+selectedAnnotationId=\{selectedAnnotationId\}\s+mode=\{editorMode\})\s+(\/?>)/;

  const match = content.match(viewerPattern);
  if (match) {
    const replacement = match[1] + '\n                onBlockChange={setBlocks}' + '\n              ' + match[2];
    content = content.replace(viewerPattern, replacement);
  } else {
    // Try a more flexible pattern
    const flexiblePattern = /(<Viewer[^>]+mode=\{editorMode\}[^>]*)(\/?>)/;
    if (content.match(flexiblePattern)) {
      content = content.replace(flexiblePattern, (m, p1, p2) => {
        return p1 + '\n                onBlockChange={setBlocks}' + '\n              ' + p2;
      });
    } else {
      throw new Error('Não foi possível encontrar o componente Viewer no App.tsx');
    }
  }

  writeFileSync(filePath, content, 'utf8');
  console.log('✓ App.tsx atualizado com prop onBlockChange no Viewer');
} catch (err) {
  console.error('✗ Erro:', err.message);
  console.error(err.stack);
  process.exit(1);
}
