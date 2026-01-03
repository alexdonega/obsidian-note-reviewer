/**
 * Export Modal with tabs for Share and Raw Diff
 *
 * Share tab (default): Shows shareable URL with copy button
 * Raw Diff tab: Shows human-readable diff output with copy/download
 */

import React, { useState } from 'react';
import { useCopyFeedback } from '../hooks/useCopyFeedback';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  shareUrlSize: string;
  diffOutput: string;
  annotationCount: number;
  taterSprite?: React.ReactNode;
}

type Tab = 'share' | 'diff';

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  shareUrl,
  shareUrlSize,
  diffOutput,
  annotationCount,
  taterSprite,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('share');

  // Copy URL feedback (share tab)
  const {
    copied: urlCopied,
    handleCopy: handleCopyUrl,
    animationClass: urlAnimationClass,
    buttonClass: urlButtonClass,
    iconClass: urlIconClass,
  } = useCopyFeedback();

  // Copy diff feedback (diff tab)
  const {
    copied: diffCopied,
    handleCopy: handleCopyDiff,
    animationClass: diffAnimationClass,
    buttonClass: diffButtonClass,
  } = useCopyFeedback();

  if (!isOpen) return null;

  const handleDownloadDiff = () => {
    const blob = new Blob([diffOutput], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'annotations.diff';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div
        className="bg-card border border-border rounded-xl w-full max-w-2xl flex flex-col max-h-[80vh] shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        {taterSprite}

        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-sm">Exportar</h3>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                {annotationCount} anotaç{annotationCount !== 1 ? 'ões' : 'ão'}
              </span>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
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
          <div className="flex gap-1 bg-muted rounded-lg p-1 mb-4">
            <button
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
              onClick={() => setActiveTab('diff')}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'diff'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Diff Bruto
            </button>
          </div>

          {/* Tab content */}
          {activeTab === 'share' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2">
                  URL Compartilhável
                </label>
                <div className="relative group">
                  <textarea
                    readOnly
                    value={shareUrl}
                    className="w-full h-32 bg-muted rounded-lg p-3 pr-20 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-accent/50"
                    onClick={e => (e.target as HTMLTextAreaElement).select()}
                  />
                  <button
                    onClick={() => handleCopyUrl(shareUrl)}
                    className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium bg-background/80 hover:bg-background border border-border/50 transition-colors flex items-center gap-1 ${urlAnimationClass} ${urlButtonClass}`}
                  >
                    {urlCopied ? (
                      <>
                        <svg className={`w-3 h-3 copy-check-animated ${urlIconClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
                Esta URL contém a nota completa e todas as anotações. Qualquer pessoa com este link pode visualizar e adicionar às suas anotações.
              </p>
            </div>
          ) : (
            <pre className="bg-muted rounded-lg p-4 text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
              {diffOutput}
            </pre>
          )}
        </div>

        {/* Footer actions - only show for Raw Diff tab */}
        {activeTab === 'diff' && (
          <div className="p-4 border-t border-border flex justify-end gap-2">
            <button
              onClick={() => handleCopyDiff(diffOutput)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium bg-muted hover:bg-muted/80 transition-colors ${diffAnimationClass} ${diffButtonClass}`}
            >
              {diffCopied ? 'Copiado!' : 'Copiar'}
            </button>
            <button
              onClick={handleDownloadDiff}
              className="px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Baixar .diff
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
