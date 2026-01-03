/**
 * Export Modal with tabs for Share and Raw Diff
 *
 * Share tab (default): Shows shareable URL with copy button
 * Raw Diff tab: Shows human-readable diff output with copy/download
 */

import React, { useState, useMemo } from 'react';
import { Annotation } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  shareUrlSize: string;
  diffOutput: string;
  annotationCount: number;
  annotations: Annotation[];
  taterSprite?: React.ReactNode;
}

type Tab = 'share' | 'diff' | 'json';

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  shareUrl,
  shareUrlSize,
  diffOutput,
  annotationCount,
  annotations,
  taterSprite,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('share');
  const [copied, setCopied] = useState(false);

  const jsonOutput = useMemo(() => {
    const exportData = annotations.map(annotation => {
      const entry: {
        type: string;
        originalText: string;
        text?: string;
        author?: string;
      } = {
        type: annotation.type,
        originalText: annotation.originalText,
      };
      if (annotation.text) {
        entry.text = annotation.text;
      }
      if (annotation.author) {
        entry.author = annotation.author;
      }
      return entry;
    });
    return JSON.stringify(exportData, null, 2);
  }, [annotations]);

  if (!isOpen) return null;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  };

  const handleCopyDiff = async () => {
    try {
      await navigator.clipboard.writeText(diffOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  };

  const handleDownloadDiff = () => {
    const blob = new Blob([diffOutput], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'annotations.diff';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  };

  const handleDownloadJson = () => {
    const blob = new Blob([jsonOutput], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'annotations.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-modal-title"
        className="bg-card border border-border rounded-xl w-full max-w-2xl flex flex-col max-h-[80vh] shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        {taterSprite}

        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex justify-between items-center">
<<<<<<< HEAD
            <h3 className="font-semibold text-sm">Exportar</h3>
=======
            <h3 id="export-modal-title" className="font-semibold text-sm">Export</h3>
>>>>>>> auto-claude/006-add-comprehensive-aria-labels-and-roles-for-access
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                {annotationCount} anotaç{annotationCount !== 1 ? 'ões' : 'ão'}
              </span>
              <button
                onClick={onClose}
<<<<<<< HEAD
                className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
=======
                aria-label="Fechar modal de exportação"
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
>>>>>>> auto-claude/006-add-comprehensive-aria-labels-and-roles-for-access
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-4">
          {/* Tabs */}
          <div role="tablist" aria-label="Opções de exportação" className="flex gap-1 bg-muted rounded-lg p-1 mb-4">
            <button
              id="export-share-tab"
              role="tab"
              aria-selected={activeTab === 'share'}
              aria-controls="export-share-panel"
              onClick={() => setActiveTab('share')}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'share'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Compartilhar
            </button>
            <button
              id="export-diff-tab"
              role="tab"
              aria-selected={activeTab === 'diff'}
              aria-controls="export-diff-panel"
              onClick={() => setActiveTab('diff')}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'diff'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Diff Bruto
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'json'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              JSON
            </button>
          </div>

          {/* Tab content */}
<<<<<<< HEAD
          {activeTab === 'share' && (
            <div className="space-y-4">
=======
          {activeTab === 'share' ? (
            <div id="export-share-panel" role="tabpanel" aria-labelledby="export-share-tab" className="space-y-4">
>>>>>>> auto-claude/006-add-comprehensive-aria-labels-and-roles-for-access
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2">
                  URL Compartilhável
                </label>
                <div className="relative group">
                  <textarea
                    readOnly
                    value={shareUrl}
                    aria-label="URL de compartilhamento"
                    className="w-full h-32 bg-muted rounded-lg p-3 pr-20 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-accent/50"
                    onClick={e => (e.target as HTMLTextAreaElement).select()}
                  />
                  <button
                    onClick={handleCopyUrl}
                    aria-label="Copiar URL de compartilhamento"
                    className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium bg-background/80 hover:bg-background border border-border/50 transition-colors flex items-center gap-1"
                  >
                    {copied ? (
                      <>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Copiado
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copiar
                      </>
                    )}
                  </button>
                  <div className="absolute bottom-2 right-2 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {shareUrlSize}
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Esta URL contém o plano completo e todas as anotações. Qualquer pessoa com este link pode visualizar e adicionar às suas anotações.
              </p>
            </div>
<<<<<<< HEAD
          )}
          {activeTab === 'diff' && (
            <pre className="bg-muted rounded-lg p-4 text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
              {diffOutput}
            </pre>
=======
          ) : (
            <div id="export-diff-panel" role="tabpanel" aria-labelledby="export-diff-tab">
              <pre className="bg-muted rounded-lg p-4 text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
                {diffOutput}
              </pre>
            </div>
>>>>>>> auto-claude/006-add-comprehensive-aria-labels-and-roles-for-access
          )}
          {activeTab === 'json' && (
            <pre className="bg-muted rounded-lg p-4 text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
              {jsonOutput}
            </pre>
          )}
        </div>

        {/* Footer actions - only show for Raw Diff tab */}
        {activeTab === 'diff' && (
          <div className="p-4 border-t border-border flex justify-end gap-2">
            <button
              onClick={handleCopyDiff}
              aria-label="Copiar diff para área de transferência"
              className="px-3 py-1.5 rounded-md text-xs font-medium bg-muted hover:bg-muted/80 transition-colors"
            >
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
            <button
              onClick={handleDownloadDiff}
              aria-label="Baixar arquivo de diff"
              className="px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Baixar .diff
            </button>
          </div>
        )}

        {/* Footer actions - only show for JSON tab */}
        {activeTab === 'json' && (
          <div className="p-4 border-t border-border flex justify-end gap-2">
            <button
              onClick={handleCopyJson}
              className="px-3 py-1.5 rounded-md text-xs font-medium bg-muted hover:bg-muted/80 transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleDownloadJson}
              className="px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Download .json
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
