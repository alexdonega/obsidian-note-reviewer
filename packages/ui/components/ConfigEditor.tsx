import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ConfigFile {
  name: string;
  displayName: string;
  path: string;
}

export const ConfigEditor: React.FC = () => {
  const [files, setFiles] = useState<ConfigFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');
  const [originalContent, setOriginalContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [pathValidation, setPathValidation] = useState<{ path: string; exists: boolean }[]>([]);
  const [validating, setValidating] = useState(false);

  // Load list of configuration files on mount
  useEffect(() => {
    loadFileList();
  }, []);

  const loadFileList = async () => {
    try {
      console.log('[ConfigEditor] Fetching /api/config/list...');
      const response = await fetch('/api/config/list');
      console.log('[ConfigEditor] Response status:', response.status);
      const data = await response.json();
      console.log('[ConfigEditor] Data received:', data);
      if (data.ok) {
        console.log('[ConfigEditor] Setting files:', data.files);
        setFiles(data.files);
        // Auto-select first file if available
        if (data.files.length > 0 && !selectedFile) {
          console.log('[ConfigEditor] Auto-selecting first file:', data.files[0].name);
          setSelectedFile(data.files[0].name);
        }
      } else {
        console.error('[ConfigEditor] Response not OK:', data);
      }
    } catch (error) {
      console.error('[ConfigEditor] Erro ao carregar lista de arquivos:', error);
    }
  };

  // Load file content when selected file changes
  useEffect(() => {
    if (selectedFile) {
      loadFileContent(selectedFile);
    }
  }, [selectedFile]);

  const loadFileContent = async (fileName: string) => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/config/read?file=${encodeURIComponent(fileName)}`);
      const data = await response.json();
      if (data.ok) {
        setContent(data.content);
        setOriginalContent(data.content);
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao carregar arquivo' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao carregar arquivo' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedFile) return;

    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch('/api/config/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: selectedFile,
          content: content
        })
      });

      const data = await response.json();
      if (data.ok) {
        setOriginalContent(content);
        setMessage({ type: 'success', text: 'Configuração salva com sucesso!' });
        // Auto-hide success message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao salvar' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar arquivo' });
    } finally {
      setSaving(false);
    }
  };

  // Validate paths in content
  useEffect(() => {
    if (!content) return;

    const validatePaths = async () => {
      setValidating(true);
      try {
        const response = await fetch('/api/config/validate-paths', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content })
        });
        const data = await response.json();
        if (data.ok) {
          setPathValidation(data.validationResults || []);
        }
      } catch (error) {
        console.error('Erro ao validar paths:', error);
      } finally {
        setValidating(false);
      }
    };

    // Debounce validation
    const timeoutId = setTimeout(validatePaths, 500);
    return () => clearTimeout(timeoutId);
  }, [content]);

  const hasChanges = content !== originalContent;
  const invalidPaths = pathValidation.filter(p => !p.exists);

  console.log('[ConfigEditor] Rendering - files:', files.length, 'selectedFile:', selectedFile);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Message Banner */}
      {message && (
        <div className={`px-4 py-3 text-sm ${
          message.type === 'success'
            ? 'bg-green-500/10 text-green-600 border-b border-green-500/20'
            : 'bg-red-500/10 text-red-600 border-b border-red-500/20'
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* File List Sidebar */}
        <div className="w-64 border-r border-border bg-muted/20 overflow-y-auto">
          <div className="p-4 border-b border-border">
            <h4 className="text-sm font-semibold text-foreground">📝 Arquivos de Configuração</h4>
            <p className="text-xs text-muted-foreground mt-1">Clique para editar</p>
          </div>
          <div className="p-2" role="tablist" aria-label="Arquivos de configuração disponíveis">
            {files.map((file) => (
              <button
                key={file.name}
                onClick={() => setSelectedFile(file.name)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors mb-1 ${selectedFile === file.name ? 'bg-primary/20 text-primary font-medium' : 'text-foreground/80 hover:bg-muted hover:text-foreground'}`}
                role="tab"
                aria-selected={selectedFile === file.name}
                aria-controls="config-editor-panel"
                id={`config-tab-${file.name}`}
                aria-label={`Editar arquivo ${file.displayName}`}
              >
                {file.displayName}
              </button>
            ))}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          {selectedFile ? (
            <div
              className="flex-1 flex flex-col"
              role="tabpanel"
              id="config-editor-panel"
              aria-labelledby={`config-tab-${selectedFile}`}
            >
              {/* Editor Header */}
              <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-background">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    {files.find(f => f.name === selectedFile)?.displayName || selectedFile}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {hasChanges ? '✏️ Modificado - não salvo' : '✅ Salvo'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="px-3 py-1.5 text-xs font-medium text-foreground/80 hover:text-foreground hover:bg-muted rounded-md transition-colors flex items-center gap-1.5"
                    title={showPreview ? "Esconder Preview" : "Mostrar Preview"}
                    aria-label={showPreview ? "Esconder preview do markdown" : "Mostrar preview do markdown"}
                    aria-pressed={showPreview}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      {showPreview ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      )}
                    </svg>
                    {showPreview ? "Esconder" : "Preview"}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!hasChanges || saving}
                    className={`px-4 py-2 text-xs font-medium rounded-md transition-colors flex items-center gap-2 ${hasChanges && !saving ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
                    aria-label="Salvar alterações no arquivo de configuração"
                  >
                    {saving ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        Salvar
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Markdown Editor + Preview */}
              <div className="flex-1 overflow-hidden flex">
                {loading ? (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                ) : (
                  <>
                    {/* Editor Pane */}
                    <div className={`${showPreview ? 'w-1/2' : 'w-full'} p-4 overflow-hidden flex flex-col`}>
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Editor</h5>
                      </div>
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="flex-1 w-full px-4 py-3 bg-background border border-border rounded-lg font-mono text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="Edite o conteúdo do arquivo aqui..."
                        spellCheck={false}
                        aria-label="Editor de conteúdo do arquivo de configuração"
                      />
                    </div>

                    {/* Preview Pane */}
                    {showPreview && (
                      <>
                        <div className="w-px bg-border" />
                        <div className="w-1/2 p-4 overflow-y-auto">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Preview</h5>
                          </div>
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {content}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Editor Footer with Tips + Validation */}
              <div className="border-t border-border">
                {/* Path Validation Warnings */}
                {invalidPaths.length > 0 && (
                  <div className="px-4 py-3 bg-red-500/10 border-b border-red-500/20">
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-red-600 mb-1">⚠️ Paths Inválidos Detectados:</p>
                        <ul className="text-xs text-red-600/90 space-y-0.5">
                          {invalidPaths.slice(0, 3).map((item, idx) => (
                            <li key={idx} className="font-mono truncate">• {item.path}</li>
                          ))}
                          {invalidPaths.length > 3 && (
                            <li className="text-red-600/70">... e mais {invalidPaths.length - 3} path(s)</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tips */}
                <div className="px-4 py-3 bg-muted/10">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-foreground">Dica:</strong> Edite as regras e workflows diretamente aqui.
                      {validating && <span className="ml-2 text-primary">Validando paths...</span>}
                      {!validating && pathValidation.length > 0 && invalidPaths.length === 0 && (
                        <span className="ml-2 text-green-600">✓ Todos os paths válidos</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm">Selecione um arquivo para editar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
