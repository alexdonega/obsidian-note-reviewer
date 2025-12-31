import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getIdentity, regenerateIdentity } from '../utils/identity';
import { getVaultPath, setVaultPath, getNotePath, setNotePath } from '../utils/storage';

interface SettingsProps {
  onIdentityChange?: (oldIdentity: string, newIdentity: string) => void;
  onVaultPathChange?: (path: string) => void;
  onNotePathChange?: (path: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  onIdentityChange,
  onVaultPathChange,
  onNotePathChange
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const [identity, setIdentity] = useState('');
  const [vaultPath, setVaultPathState] = useState('');
  const [notePath, setNotePathState] = useState('');

  useEffect(() => {
    if (showDialog) {
      setIdentity(getIdentity());
      setVaultPathState(getVaultPath());
      setNotePathState(getNotePath());
    }
  }, [showDialog]);

  const handleRegenerateIdentity = () => {
    const oldIdentity = identity;
    const newIdentity = regenerateIdentity();
    setIdentity(newIdentity);
    onIdentityChange?.(oldIdentity, newIdentity);
  };

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

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        title="Configurações"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {showDialog && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={() => setShowDialog(false)}
        >
          <div
            className="bg-card border border-border rounded-xl w-full max-w-sm shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-sm">Configurações</h3>
              <button
                onClick={() => setShowDialog(false)}
                className="p-1.5 rounded-md bg-muted hover:bg-muted/80 text-foreground transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Identity Section */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Sua Identidade</div>
                <div className="text-xs text-muted-foreground">
                  Usada ao compartilhar anotações com outros
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 bg-muted rounded-lg text-xs font-mono truncate">
                    {identity}
                  </div>
                  <button
                    onClick={handleRegenerateIdentity}
                    className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                    title="Regenerar identidade"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="border-t border-border" />

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
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
