import { readFileSync, writeFileSync } from 'fs';

console.log('⌨️  Implementando Ctrl+Z para desfazer anotações...\n');

const appPath = 'packages/editor/App.tsx';
let content = readFileSync(appPath, 'utf8');

// Adicionar estado para histórico de anotações
const historyState = `
  // History for undo (Ctrl+Z)
  const [annotationHistory, setAnnotationHistory] = useState<string[]>([]);
`;

// Adicionar useEffect para Ctrl+Z
const ctrlZEffect = `
  // Ctrl+Z to undo last annotation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (annotationHistory.length > 0) {
          const lastAnnotationId = annotationHistory[annotationHistory.length - 1];
          // Remove annotation
          setAnnotations(prev => prev.filter(a => a.id !== lastAnnotationId));
          // Remove from history
          setAnnotationHistory(prev => prev.slice(0, -1));
          // Remove highlight from viewer
          viewerRef.current?.removeHighlight(lastAnnotationId);
          console.log('↶ Anotação desfeita:', lastAnnotationId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [annotationHistory]);
`;

// Modificar handleAddAnnotation para registrar no histórico
const addToHistory = `
    // Add to history for undo
    setAnnotationHistory(prev => [...prev, newAnnotation.id]);
`;

// Procurar onde inserir o estado
const stateInsertPoint = content.indexOf('const [annotations, setAnnotations]');
if (stateInsertPoint !== -1) {
  const lineEnd = content.indexOf('\n', stateInsertPoint);
  content = content.slice(0, lineEnd + 1) + historyState + content.slice(lineEnd + 1);
  console.log('✅ Estado de histórico adicionado');
} else {
  console.log('❌ Ponto de inserção de estado não encontrado');
  process.exit(1);
}

// Procurar onde inserir o useEffect
const lastUseEffectIndex = content.lastIndexOf('}, [');
if (lastUseEffectIndex !== -1) {
  const endOfUseEffect = content.indexOf('\n', lastUseEffectIndex + 5);
  content = content.slice(0, endOfUseEffect + 1) + ctrlZEffect + content.slice(endOfUseEffect + 1);
  console.log('✅ useEffect Ctrl+Z adicionado');
} else {
  console.log('❌ Ponto de inserção de useEffect não encontrado');
  process.exit(1);
}

// Procurar handleAddAnnotation e adicionar registro de histórico
const handleAddAnnotationIndex = content.indexOf('const handleAddAnnotation');
if (handleAddAnnotationIndex !== -1) {
  const setAnnotationsIndex = content.indexOf('setAnnotations(prev => [...prev, newAnnotation])', handleAddAnnotationIndex);
  if (setAnnotationsIndex !== -1) {
    const lineEnd = content.indexOf(';', setAnnotationsIndex);
    content = content.slice(0, lineEnd + 1) + '\n' + addToHistory + content.slice(lineEnd + 1);
    console.log('✅ Registro de histórico adicionado em handleAddAnnotation');
  }
}

writeFileSync(appPath, content, 'utf8');
console.log('\n✅ Ctrl+Z implementado com sucesso!');
console.log('   Agora você pode desfazer a última anotação com Ctrl+Z\n');
