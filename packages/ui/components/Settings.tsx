import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getIdentity, regenerateIdentity } from '../utils/identity';
import {
  getNoteTypePath,
  setNoteTypePath,
  getNoteTypeTemplate,
  setNoteTypeTemplate,
  getNotePath,
  setNotePath
} from '../utils/storage';
import {
  getNoteTypesByCategory,
  getDefaultConfigs,
  type TipoNota
} from '../utils/notePaths';
import { ConfigEditor } from './ConfigEditor';

interface SettingsProps {
  onIdentityChange?: (oldIdentity: string, newIdentity: string) => void;
  onNoteTypeChange?: (tipo: TipoNota) => void;
  onNoteNameChange?: (name: string) => void;
  onNotePathChange?: (path: string) => void;
}

type CategoryTab = 'atomica' | 'terceiros' | 'organizacional' | 'alex' | 'regras';

export const Settings: React.FC<SettingsProps> = ({
  onIdentityChange,
  onNotePathChange
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const [identity, setIdentity] = useState('');
  const [notePaths, setNotePaths] = useState<Record<string, string>>({});
  const [noteTemplates, setNoteTemplates] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<CategoryTab>('regras');

  // Load saved configuration on dialog open
  useEffect(() => {
    if (showDialog) {
      setIdentity(getIdentity());

      // Load all saved paths and templates
      const noteTypes = getNoteTypesByCategory();
      const paths: Record<string, string> = {};
      const templates: Record<string, string> = {};

      [...noteTypes.terceiros, ...noteTypes.atomica, ...noteTypes.organizacional, ...noteTypes.alex].forEach(({ tipo }) => {
        paths[tipo] = getNoteTypePath(tipo);
        templates[tipo] = getNoteTypeTemplate(tipo);
      });

      setNotePaths(paths);
      setNoteTemplates(templates);

      // If there's no general note path set, use the first available path
      const currentNotePath = getNotePath();
      if (!currentNotePath || currentNotePath.trim() === '') {
        const firstPath = Object.values(paths).find(p => p.trim() !== '');
        if (firstPath) {
          setNotePath(firstPath);
          onNotePathChange?.(firstPath);
        }
      }
    }
  }, [showDialog, onNotePathChange]);

  const handleRegenerateIdentity = () => {
    const oldIdentity = identity;
    const newIdentity = regenerateIdentity();
    setIdentity(newIdentity);
    onIdentityChange?.(oldIdentity, newIdentity);
  };

  const handlePathChange = (tipo: string, path: string) => {
    setNotePaths(prev => ({ ...prev, [tipo]: path }));
    setNoteTypePath(tipo, path);
    // Also update the general note path for the save button
    setNotePath(path);
    // Notify App.tsx to update savePath
    onNotePathChange?.(path);
  };

  const handleTemplateChange = (tipo: string, templatePath: string) => {
    setNoteTemplates(prev => ({ ...prev, [tipo]: templatePath }));
    setNoteTypeTemplate(tipo, templatePath);
  };

  const handleLoadDefaults = () => {
    const { templates, paths } = getDefaultConfigs();

    // Atualizar estados locais
    setNoteTemplates(templates);
    setNotePaths(paths);

    // Salvar no storage
    Object.entries(templates).forEach(([tipo, templatePath]) => {
      setNoteTypeTemplate(tipo, templatePath);
    });

    Object.entries(paths).forEach(([tipo, path]) => {
      setNoteTypePath(tipo, path);
    });

    // Update general note path with the first path available
    const firstPath = Object.values(paths)[0];
    if (firstPath) {
      setNotePath(firstPath);
      onNotePathChange?.(firstPath);
    }
  };

  const noteTypes = getNoteTypesByCategory();

  const tabs: Array<{ id: CategoryTab; emoji: string; label: string }> = [
    { id: 'regras', emoji: '📋', label: 'Regras e Workflows' },
    { id: 'terceiros', emoji: '📚', label: 'Conteúdo de Terceiros' },
    { id: 'atomica', emoji: '⚛️', label: 'Notas Atômicas' },
    { id: 'organizacional', emoji: '🗺️', label: 'Notas Organizacionais' },
    { id: 'alex', emoji: '✍️', label: 'Conteúdo Próprio' }
  ];

  const CategoryContent = ({ category }: { category: CategoryTab }) => {
    const items = noteTypes[category];

    return (
      <div className="space-y-4">
        {items.map(({ tipo, emoji, label }) => (
          <div key={tipo} className="space-y-2 p-4 bg-muted/30 rounded-lg border border-border/50">
            <div className="flex items-center gap-2">
              <span className="text-lg">{emoji}</span>
              <span className="text-sm font-semibold text-foreground">{label}</span>
            </div>
            <div className="pl-8 space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Template:</label>
                <input
                  type="text"
                  value={noteTemplates[tipo] || ''}
                  onChange={(e) => handleTemplateChange(tipo, e.target.value)}
                  placeholder="C:/caminho/para/template.md"
                  className="w-full px-3 py-2 bg-background rounded-md text-xs border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Destino:</label>
                <input
                  type="text"
                  value={notePaths[tipo] || ''}
                  onChange={(e) => handlePathChange(tipo, e.target.value)}
                  placeholder="C:/caminho/para/pasta/destino"
                  className="w-full px-3 py-2 bg-background rounded-md text-xs border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono transition-all"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-foreground/80 hover:text-foreground hover:bg-muted rounded-md transition-colors"
        title="Configurações"
        aria-label="Abrir configurações"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="hidden sm:inline">Configurações</span>
      </button>

      {showDialog && createPortal(
        <div className="fixed inset-0 bg-background z-50 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">Configurações de Tipos de Nota</h3>
                <p className="text-xs text-muted-foreground mt-1">Configure o caminho/URL para cada tipo de nota</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleLoadDefaults}
                  className="px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors flex items-center gap-2"
                  title="Carregar valores padrão"
                  aria-label="Carregar valores padrão"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Carregar Padrões
                </button>
                <button
                  onClick={() => setShowDialog(false)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Fechar"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-border bg-muted/20">
              <div role="tablist" aria-label="Categorias de tipos de nota" className="flex px-6">
                {tabs.map(({ id, emoji, label }) => (
                  <button
                    key={id}
                    id={`settings-tab-${id}`}
                    role="tab"
                    aria-selected={activeTab === id}
                    aria-controls={`settings-panel-${id}`}
                    onClick={() => setActiveTab(id)}
                    className={`
                      flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative
                      ${activeTab === id
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-muted-foreground hover:text-foreground'
                      }
                    `}
                  >
                    <span className="text-base">{emoji}</span>
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div
              id={`settings-panel-${activeTab}`}
              role="tabpanel"
              aria-labelledby={`settings-tab-${activeTab}`}
              className={`${activeTab === 'regras' ? '' : 'p-6'} overflow-y-auto flex-1`}
            >
              {activeTab === 'regras' ? (
                <ConfigEditor />
              ) : (
                <CategoryContent category={activeTab} />
              )}

              {activeTab !== 'regras' && (
                <>

              <div className="border-t border-border mt-6 pt-6" />

              {/* Seção: Identidade */}
              <section>
                <h4 className="text-sm font-semibold mb-3 text-primary">👤 Identidade do Revisor</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">
                      Seu ID único
                    </label>
                    <div className="px-3 py-2 bg-muted rounded-lg text-xs font-mono text-muted-foreground break-all">
                      {identity}
                    </div>
                  </div>
                  <button
                    onClick={handleRegenerateIdentity}
                    className="w-full px-3 py-2 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                    aria-label="Gerar nova identidade de revisor"
                  >
                    Gerar Nova Identidade
                  </button>
                  <p className="text-xs text-muted-foreground">
                    Esta identidade será incluída nas anotações que você criar.
                  </p>
                </div>
              </section>

              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>💡 Dica:</strong> Você pode usar URLs do Obsidian (obsidian://...) ou caminhos completos de arquivo (C:/caminho/completo.md)
                </p>
              </div>
              </>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border flex justify-end">
              <button
                onClick={() => setShowDialog(false)}
                className="px-4 py-2 text-xs font-medium text-foreground bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                aria-label="Fechar configurações"
              >
                Fechar
              </button>
            </div>
        </div>,
        document.body
      )}
    </>
  );
};
