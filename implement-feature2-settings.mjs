import { readFileSync, writeFileSync } from 'fs';

const filePath = 'packages/ui/components/Settings.tsx';

try {
  let content = readFileSync(filePath, 'utf8');

  // 1. Update imports to include storage functions
  const oldImports = `import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getIdentity, regenerateIdentity } from '../utils/identity';`;

  const newImports = `import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getIdentity, regenerateIdentity } from '../utils/identity';
import { getVaultPath, setVaultPath, getNotePath, setNotePath } from '../utils/storage';`;

  content = content.replace(oldImports, newImports);

  // 2. Update interface
  const oldInterface = `interface SettingsProps {
  onIdentityChange?: (oldIdentity: string, newIdentity: string) => void;
}`;

  const newInterface = `interface SettingsProps {
  onIdentityChange?: (oldIdentity: string, newIdentity: string) => void;
  onVaultPathChange?: (path: string) => void;
  onNotePathChange?: (path: string) => void;
}`;

  content = content.replace(oldInterface, newInterface);

  // 3. Update component signature and add new state
  const oldComponentStart = `export const Settings: React.FC<SettingsProps> = ({ onIdentityChange }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [identity, setIdentity] = useState('');`;

  const newComponentStart = `export const Settings: React.FC<SettingsProps> = ({
  onIdentityChange,
  onVaultPathChange,
  onNotePathChange
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const [identity, setIdentity] = useState('');
  const [vaultPath, setVaultPathState] = useState('');
  const [notePath, setNotePathState] = useState('');`;

  content = content.replace(oldComponentStart, newComponentStart);

  // 4. Update useEffect to load vault and note paths
  const oldUseEffect = `  useEffect(() => {
    if (showDialog) {
      setIdentity(getIdentity());
    }
  }, [showDialog]);`;

  const newUseEffect = `  useEffect(() => {
    if (showDialog) {
      setIdentity(getIdentity());
      setVaultPathState(getVaultPath());
      setNotePathState(getNotePath());
    }
  }, [showDialog]);`;

  content = content.replace(oldUseEffect, newUseEffect);

  // 5. Add handlers after handleRegenerateIdentity
  const handlersInsert = `
  const handleVaultPathChange = (newPath: string) => {
    setVaultPathState(newPath);
    setVaultPath(newPath);
    onVaultPathChange?.(newPath);
  };

  const handleNotePathChange = (newPath: string) => {
    setNotePathState(newPath);
    setNotePath(newPath);
    onNotePathChange?.(newPath);
  };
`;

  const afterRegenerateHandler = `  const handleRegenerateIdentity = () => {
    const oldIdentity = identity;
    const newIdentity = regenerateIdentity();
    setIdentity(newIdentity);
    onIdentityChange?.(oldIdentity, newIdentity);
  };`;

  content = content.replace(afterRegenerateHandler, afterRegenerateHandler + handlersInsert);

  // 6. Replace the Modo Tater section with vault path fields
  const modoTaterSection = `              <div className="border-t border-border" />

              {/* Modo Tater */}
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Modo Tater</div>
                <button
                  role="switch"
                  aria-checked={taterMode}
                  onClick={() => onTaterModeChange(!taterMode)}
                  className={\`relative inline-flex h-6 w-11 items-center rounded-full transition-colors \${
                    taterMode ? 'bg-primary' : 'bg-muted'
                  }\`}
                >
                  <span
                    className={\`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform \${
                      taterMode ? 'translate-x-6' : 'translate-x-1'
                    }\`}
                  />
                </button>
              </div>`;

  const vaultPathSections = `              <div className="border-t border-border" />

              {/* Vault Path Section */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Caminho do Vault</div>
                <div className="text-xs text-muted-foreground">
                  Diretório base onde suas notas Obsidian estão armazenadas
                </div>
                <input
                  type="text"
                  value={vaultPath}
                  onChange={(e) => handleVaultPathChange(e.target.value)}
                  placeholder="C:/Users/Nome/Documents/ObsidianVault"
                  className="w-full px-3 py-2 bg-muted rounded-lg text-xs font-mono border border-border focus:border-primary focus:outline-none"
                />
              </div>

              <div className="border-t border-border" />

              {/* Note Path Section */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Caminho da Nota</div>
                <div className="text-xs text-muted-foreground">
                  Caminho relativo dentro do vault (ex: notas/exemplo.md)
                </div>
                <input
                  type="text"
                  value={notePath}
                  onChange={(e) => handleNotePathChange(e.target.value)}
                  placeholder="notas/minha-nota.md"
                  className="w-full px-3 py-2 bg-muted rounded-lg text-xs font-mono border border-border focus:border-primary focus:outline-none"
                />
              </div>`;

  content = content.replace(modoTaterSection, vaultPathSections);

  writeFileSync(filePath, content, 'utf8');
  console.log('✓ Settings.tsx atualizado com campos de vault path');
  console.log('  - Imports atualizados');
  console.log('  - Interface SettingsProps expandida');
  console.log('  - Estados adicionados (vaultPath, notePath)');
  console.log('  - Handlers criados');
  console.log('  - Modo Tater removido e substituído por campos de path');
} catch (err) {
  console.error('✗ Erro:', err.message);
  process.exit(1);
}
