import { readFileSync, writeFileSync } from 'fs';

console.log('📝 Adicionando registro de histórico em handleAddAnnotation...\n');

const appPath = 'packages/editor/App.tsx';
let content = readFileSync(appPath, 'utf8');

// Encontrar e substituir handleAddAnnotation
const oldHandler = `  const handleAddAnnotation = (ann: Annotation) => {
    setAnnotations(prev => [...prev, ann]);
    setSelectedAnnotationId(ann.id);
    setIsPanelOpen(true);
  };`;

const newHandler = `  const handleAddAnnotation = (ann: Annotation) => {
    setAnnotations(prev => [...prev, ann]);
    setSelectedAnnotationId(ann.id);
    setIsPanelOpen(true);
    // Add to history for undo (Ctrl+Z)
    setAnnotationHistory(prev => [...prev, ann.id]);
  };`;

if (content.includes(oldHandler)) {
  content = content.replace(oldHandler, newHandler);
  writeFileSync(appPath, content, 'utf8');
  console.log('✅ Registro de histórico adicionado em handleAddAnnotation!');
} else {
  console.log('⚠️  Handler não encontrado exatamente como esperado');
  console.log('   Tentando abordagem alternativa...');

  // Abordagem alternativa: procurar por setIsPanelOpen(true) e adicionar depois
  const pattern = /setIsPanelOpen\(true\);/g;
  let matches = 0;
  content = content.replace(pattern, (match) => {
    matches++;
    if (matches === 1) { // Primeira ocorrência (em handleAddAnnotation)
      return `${match}\n    // Add to history for undo (Ctrl+Z)\n    setAnnotationHistory(prev => [...prev, ann.id]);`;
    }
    return match;
  });

  writeFileSync(appPath, content, 'utf8');
  console.log('✅ Registro adicionado via abordagem alternativa!');
}

console.log();
