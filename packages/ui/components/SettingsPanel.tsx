import React, { useState, useEffect, useRef } from 'react';
import { getIdentity, regenerateIdentity } from '../utils/identity';
import {
  getNoteTypePath,
  setNoteTypePath,
  getNoteTypeTemplate,
  setNoteTypeTemplate,
  getNotePath,
  setNotePath,
  exportAllSettings,
  validateSettingsImport,
  importAllSettings,
  getAllNoteTypePaths,
  getAllNoteTypeTemplates
} from '../utils/storage';
import {
  getNoteTypesByCategory,
  getDefaultConfigs,
  type TipoNota
} from '../utils/notePaths';
import { ConfigEditor } from './ConfigEditor';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose?: () => void;
  onIdentityChange?: (oldIdentity: string, newIdentity: string) => void;
  onNoteTypeChange?: (tipo: TipoNota) => void;
  onNoteNameChange?: (name: string) => void;
  onNotePathChange?: (path: string) => void;
}

type CategoryTab = 'atomica' | 'terceiros' | 'organizacional' | 'alex' | 'regras';

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  onIdentityChange,
  onNotePathChange
}) => {
  const [identity, setIdentity] = useState('');
  const [notePaths, setNotePaths] = useState<Record<string, string>>({});
  const [noteTemplates, setNoteTemplates] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<CategoryTab>('regras');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved configuration on mount and when panel opens
  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen, onNotePathChange]);

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

  const handleExportSettings = () => {
    const settings = exportAllSettings();
    const json = JSON.stringify(settings, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'note-reviewer-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        // Validate the imported settings
        const validation = validateSettingsImport(data);
        if (!validation.valid) {
          alert(`Erro ao importar configurações: ${validation.error}`);
          return;
        }

        // Apply the settings
        importAllSettings(data);

        // Refresh local state from storage
        setIdentity(getIdentity());
        setNotePaths(getAllNoteTypePaths());
        setNoteTemplates(getAllNoteTypeTemplates());

        // Update general note path with the first path available
        const paths = getAllNoteTypePaths();
        const firstPath = Object.values(paths)[0];
        if (firstPath) {
          setNotePath(firstPath);
          onNotePathChange?.(firstPath);
        }

        alert('Configurações importadas com sucesso!');
      } catch (err) {
        alert('Erro ao importar configurações: arquivo JSON inválido');
      }
    };

    reader.onerror = () => {
      alert('Erro ao ler o arquivo');
    };

    reader.readAsText(file);

    // Clear the file input to allow re-selecting the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
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

  console.log('[SettingsPanel] Rendering - isOpen:', isOpen, 'activeTab:', activeTab);

  return (
    <div className="w-full h-full bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-card/50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-foreground">Configurações</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportSettings}
              className="px-2 py-1 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors flex items-center gap-1"
              title="Exportar configurações"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Exportar
            </button>
            <button
              onClick={handleImportClick}
              className="px-2 py-1 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors flex items-center gap-1"
              title="Importar configurações"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m4-8l-4-4m0 0l-4 4m4-4v12" />
              </svg>
              Importar
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportSettings}
              className="hidden"
            />
            <button
              onClick={handleLoadDefaults}
              className="px-2 py-1 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors flex items-center gap-1"
              title="Carregar valores padrão"
              aria-label="Carregar valores padrão"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Padrões
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                title="Fechar configurações"
                aria-label="Fechar configurações"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Configure caminhos e templates</p>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-border bg-muted/20 overflow-x-auto">
        <div role="tablist" aria-label="Categorias de tipos de nota" className="flex px-2 min-w-max">
          {tabs.map(({ id, emoji, label }) => (
            <button
              key={id}
              id={`settings-panel-tab-${id}`}
              role="tab"
              aria-selected={activeTab === id}
              aria-controls={`settings-panel-content-${id}`}
              onClick={() => setActiveTab(id)}
              className={`
                flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-all relative whitespace-nowrap
                ${activeTab === id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <span className="text-sm">{emoji}</span>
              <span className="hidden md:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div
        id={`settings-panel-content-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`settings-panel-tab-${activeTab}`}
        className={`${activeTab === 'regras' ? '' : 'p-4'} overflow-y-auto flex-1`}
      >
        {activeTab === 'regras' ? (
          <ConfigEditor />
        ) : (
          <CategoryContent category={activeTab} />
        )}

        {activeTab !== 'regras' && (
          <>
            <div className="border-t border-border mt-4 pt-4" />

            {/* Seção: Identidade */}
            <section>
              <h4 className="text-xs font-semibold mb-2 text-primary">👤 Identidade do Revisor</h4>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">
                    Seu ID único
                  </label>
                  <div className="px-2 py-1.5 bg-muted rounded-md text-xs font-mono text-muted-foreground break-all">
                    {identity}
                  </div>
                </div>
                <button
                  onClick={handleRegenerateIdentity}
                  className="w-full px-2 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors"
                  aria-label="Gerar nova identidade de revisor"
                >
                  Gerar Nova Identidade
                </button>
                <p className="text-xs text-muted-foreground">
                  Esta identidade será incluída nas anotações que você criar.
                </p>
              </div>
            </section>

            <div className="mt-3 p-3 bg-muted/50 rounded-md">
              <p className="text-xs text-muted-foreground">
                <strong>💡 Dica:</strong> Você pode usar URLs do Obsidian (obsidian://...) ou caminhos completos de arquivo
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
