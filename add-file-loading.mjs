import { readFileSync, writeFileSync } from 'fs';

console.log('🔄 Adicionando carregamento automático de arquivo no App.tsx...\n');

const appPath = 'packages/editor/App.tsx';
let content = readFileSync(appPath, 'utf8');

// Adicionar useEffect para carregar arquivo da URL
const fileLoadingEffect = `
  // Load file from URL parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const filePath = params.get('file');

    if (filePath) {
      fetch(\`/api/load?path=\${encodeURIComponent(filePath)}\`)
        .then(res => res.json())
        .then(data => {
          if (data.ok && data.content) {
            const newBlocks = parseMarkdownToBlocks(data.content);
            setBlocks(newBlocks);
            console.log('✅ Nota carregada:', filePath);
          } else {
            console.error('❌ Erro ao carregar nota:', data.error);
          }
        })
        .catch(err => {
          console.error('❌ Erro ao carregar nota:', err);
        });
    }
  }, []);
`;

// Encontrar a linha após os outros useEffect (procurar por "useEffect(")
// Vou inserir após o último useEffect existente
const lastUseEffectIndex = content.lastIndexOf('}, [');
if (lastUseEffectIndex !== -1) {
  // Encontrar o final desse useEffect
  const endOfUseEffect = content.indexOf('\n', lastUseEffectIndex + 5);

  content = content.slice(0, endOfUseEffect + 1) +
            fileLoadingEffect +
            content.slice(endOfUseEffect + 1);

  writeFileSync(appPath, content, 'utf8');
  console.log('✅ App.tsx modificado para carregar arquivos via URL!');
  console.log('📝 Agora você pode usar: ?file=/caminho/para/nota.md\n');
} else {
  console.log('❌ Não foi possível encontrar ponto de inserção');
  process.exit(1);
}
