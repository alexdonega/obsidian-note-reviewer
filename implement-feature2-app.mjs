import { readFileSync, writeFileSync } from 'fs';

const filePath = 'packages/editor/App.tsx';

try {
  let content = readFileSync(filePath, 'utf8');

  // 1. Add imports for storage functions
  const oldImports = `import { storage } from '@plannotator/ui/utils/storage';`;
  const newImports = `import { storage, getVaultPath, getNotePath, setVaultPath, setNotePath } from '@plannotator/ui/utils/storage';`;

  content = content.replace(oldImports, newImports);

  // 2. Update savePath initialization to use storage
  const oldSavePath = `  const [savePath, setSavePath] = useState<string>('');`;
  const newSavePath = `  const [savePath, setSavePath] = useState<string>(() => {
    const vault = getVaultPath();
    const note = getNotePath();
    return vault && note ? \`\${vault}/\${note}\` : '';
  });`;

  content = content.replace(oldSavePath, newSavePath);

  // 3. Add path change handlers before handleIdentityChange
  const handlersInsert = `  const handleVaultPathChange = (vaultPath: string) => {
    const notePath = getNotePath();
    if (vaultPath && notePath) {
      setSavePath(\`\${vaultPath}/\${notePath}\`);
    } else {
      setSavePath('');
    }
  };

  const handleNotePathChange = (notePath: string) => {
    const vaultPath = getVaultPath();
    if (vaultPath && notePath) {
      setSavePath(\`\${vaultPath}/\${notePath}\`);
    } else {
      setSavePath('');
    }
  };

`;

  const beforeHandleIdentity = `  const handleIdentityChange = (oldIdentity: string, newIdentity: string) => {`;
  content = content.replace(beforeHandleIdentity, handlersInsert + beforeHandleIdentity);

  // 4. Update Settings component to include new props
  const oldSettings = `            <Settings onIdentityChange={handleIdentityChange} />`;
  const newSettings = `            <Settings
              onIdentityChange={handleIdentityChange}
              onVaultPathChange={handleVaultPathChange}
              onNotePathChange={handleNotePathChange}
            />`;

  content = content.replace(oldSettings, newSettings);

  writeFileSync(filePath, content, 'utf8');
  console.log('✓ App.tsx conectado ao Settings com handlers de path');
  console.log('  - Imports de storage adicionados');
  console.log('  - savePath inicializado com valores do storage');
  console.log('  - Handlers de vault e note path criados');
  console.log('  - Settings component atualizado com props');
} catch (err) {
  console.error('✗ Erro:', err.message);
  process.exit(1);
}
