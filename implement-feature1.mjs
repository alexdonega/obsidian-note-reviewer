import { readFileSync, writeFileSync } from 'fs';

const filePath = 'packages/editor/App.tsx';

try {
  let content = readFileSync(filePath, 'utf8');

  // 1. Add states after editorMode (line ~221-223)
  const statesOld = `  const [editorMode, setEditorMode] = useState<EditorMode>('selection');

  const [isApiMode, setIsApiMode] = useState(false);`;

  const statesNew = `  const [editorMode, setEditorMode] = useState<EditorMode>('selection');
  const [savePath, setSavePath] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [isApiMode, setIsApiMode] = useState(false);`;

  content = content.replace(statesOld, statesNew);

  // 2. Add functions before diffOutput (line ~332)
  const functionsInsert = `
  const reconstructMarkdownFromBlocks = (blocks: Block[]): string => {
    return blocks.map(block => {
      if (block.type === 'frontmatter') {
        return \`---\\n\${block.content}\\n---\`;
      }
      return block.content;
    }).join('\\n\\n');
  };

  const handleSaveToVault = async () => {
    if (!savePath.trim()) {
      setSaveError('Configure o caminho do arquivo nas configurações');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const content = reconstructMarkdownFromBlocks(blocks);
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          path: savePath
        })
      });

      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Erro ao salvar');
      }

      console.log('Nota salva com sucesso:', savePath);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsSaving(false);
    }
  };
`;

  const beforeDiffOutput = `  const diffOutput = useMemo(() => exportDiff(blocks, annotations), [blocks, annotations]);`;
  content = content.replace(beforeDiffOutput, functionsInsert + '\n' + beforeDiffOutput);

  // 3. Add button before ModeToggle (line ~392)
  const beforeModeToggle = `            <ModeToggle />
            <Settings onIdentityChange={handleIdentityChange} />`;

  const withSaveButton = `            {/* Botão Salvar no Vault */}
            <button
              onClick={handleSaveToVault}
              disabled={isSaving || !savePath}
              className={\`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                \${isSaving || !savePath
                  ? 'opacity-50 cursor-not-allowed bg-muted text-muted-foreground'
                  : 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30'
                }
              \`}
              title={!savePath ? 'Configure o caminho nas configurações' : 'Salvar nota no vault'}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              {isSaving ? 'Salvando...' : 'Salvar no Vault'}
            </button>

            {/* Mensagem de erro se houver */}
            {saveError && (
              <div className="absolute top-full mt-2 right-0 p-2 bg-destructive/10 border border-destructive/30 rounded-lg text-xs text-destructive max-w-xs">
                {saveError}
              </div>
            )}

            <div className="w-px h-5 bg-border/50 mx-1 hidden md:block" />

            <ModeToggle />
            <Settings onIdentityChange={handleIdentityChange} />`;

  content = content.replace(beforeModeToggle, withSaveButton);

  writeFileSync(filePath, content, 'utf8');
  console.log('✓ App.tsx atualizado com Feature 1');
  console.log('  - Estados adicionados (savePath, isSaving, saveError)');
  console.log('  - Funções criadas (handleSaveToVault, reconstructMarkdownFromBlocks)');
  console.log('  - Botão "Salvar no Vault" adicionado no header');
} catch (err) {
  console.error('✗ Erro:', err.message);
  process.exit(1);
}
