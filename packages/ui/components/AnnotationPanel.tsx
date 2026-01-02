import React, { useState } from 'react';
import { Annotation, AnnotationType, Block } from '../types';
import { isCurrentUser } from '../utils/identity';
import { ConfirmationDialog } from './ConfirmationDialog';

interface PanelProps {
  isOpen: boolean;
  annotations: Annotation[];
  blocks: Block[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  selectedId: string | null;
  shareUrl?: string;
}

export const AnnotationPanel: React.FC<PanelProps> = ({
  isOpen,
  annotations,
  blocks,
  onSelect,
  onDelete,
  selectedId,
  shareUrl
}) => {
  const [copied, setCopied] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const sortedAnnotations = [...annotations].sort((a, b) => a.createdA - b.createdA);

  // Separate global comments from text annotations
  const globalComments = sortedAnnotations.filter(ann => ann.isGlobal);
  const textAnnotations = sortedAnnotations.filter(ann => !ann.isGlobal);

  // Get the annotation pending deletion (for dialog display)
  const pendingDeleteAnnotation = pendingDeleteId
    ? annotations.find(ann => ann.id === pendingDeleteId) ?? null
    : null;

  const handleDeleteClick = (id: string) => {
    setPendingDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (pendingDeleteId) {
      onDelete(pendingDeleteId);
      setPendingDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setPendingDeleteId(null);
  };

  const handleQuickShare = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  };

  if (!isOpen) return null;

  return (
    <aside className="w-72 border-l border-border/50 bg-card/30 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Anotações
          </h2>
          <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
            {annotations.length}
          </span>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {sortedAnnotations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center px-4">
            <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <p className="text-xs text-muted-foreground">
              Selecione texto para adicionar anotações
            </p>
          </div>
        ) : (
          <>
            {/* Global Comments Section */}
            {globalComments.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 px-1 mb-1">
                  <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-blue-500">
                    Comentários Globais
                  </h3>
                  <span className="text-[10px] font-mono bg-blue-500/20 px-1.5 py-0.5 rounded text-blue-600">
                    {globalComments.length}
                  </span>
                </div>
                {globalComments.map(ann => (
                  <AnnotationCard
                    key={ann.id}
                    annotation={ann}
                    isSelected={selectedId === ann.id}
                    onSelect={() => onSelect(ann.id)}
                    onDelete={() => handleDeleteClick(ann.id)}
                  />
                ))}
              </div>
            )}

            {/* Text Annotations Section */}
            {textAnnotations.length > 0 && (
              <div className="space-y-1.5">
                {globalComments.length > 0 && (
                  <div className="flex items-center gap-1.5 px-1 mb-1 pt-2 border-t border-border/50">
                    <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Anotações no Texto
                    </h3>
                    <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                      {textAnnotations.length}
                    </span>
                  </div>
                )}
                {textAnnotations.map(ann => (
                  <AnnotationCard
                    key={ann.id}
                    annotation={ann}
                    isSelected={selectedId === ann.id}
                    onSelect={() => onSelect(ann.id)}
                    onDelete={() => handleDeleteClick(ann.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Quick Share Footer */}
      {shareUrl && annotations.length > 0 && (
        <div className="p-2 border-t border-border/50">
          <button
            onClick={handleQuickShare}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Copiado
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Compartilhar
              </>
            )}
          </button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={pendingDeleteId !== null}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Excluir anotação"
        message="Tem certeza que deseja excluir esta anotação? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        destructive
      />
    </aside>
  );
};

function formatTimestamp(ts: number): string {
  const now = Date.now();
  const diff = now - ts;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;

  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const AnnotationCard: React.FC<{
  annotation: Annotation;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}> = ({ annotation, isSelected, onSelect, onDelete }) => {
  const typeConfig = {
    [AnnotationType.DELETION]: {
      label: 'Excluir',
      color: 'text-destructive',
      bg: 'bg-destructive/10',
      icon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      )
    },
    [AnnotationType.INSERTION]: {
      label: 'Inserir',
      color: 'text-secondary',
      bg: 'bg-secondary/10',
      icon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      )
    },
    [AnnotationType.REPLACEMENT]: {
      label: 'Substituir',
      color: 'text-primary',
      bg: 'bg-primary/10',
      icon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      )
    },
    [AnnotationType.COMMENT]: {
      label: 'Comentario',
      color: 'text-accent',
      bg: 'bg-accent/10',
      icon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      )
    },
    [AnnotationType.GLOBAL_COMMENT]: {
      label: 'Global',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      icon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  };

  const config = typeConfig[annotation.type];
  const isGlobal = annotation.isGlobal;

  return (
    <div
      onClick={onSelect}
      className={`
        group relative p-2.5 rounded-lg border cursor-pointer transition-all
        ${isGlobal
          ? isSelected
            ? 'bg-blue-500/10 border-blue-500/40 shadow-sm'
            : 'bg-blue-500/5 border-blue-500/20 hover:bg-blue-500/10 hover:border-blue-500/30'
          : isSelected
            ? 'bg-primary/5 border-primary/30 shadow-sm'
            : 'border-transparent hover:bg-muted/50 hover:border-border/50'
        }
      `}
    >
      {/* Author */}
      {annotation.author && (
        <div className={`flex items-center gap-1.5 text-[10px] font-mono truncate mb-1.5 ${isCurrentUser(annotation.author) ? 'text-muted-foreground/60' : 'text-muted-foreground'}`}>
          <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="truncate">{annotation.author}{isCurrentUser(annotation.author) && ' (eu)'}</span>
        </div>
      )}

      {/* Type Badge + Timestamp + Delete */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 ${config.color}`}>
            <span className={`p-1 rounded ${config.bg}`}>
              {config.icon}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wide">
              {config.label}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground/50">
            {formatTimestamp(annotation.createdA)}
          </span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Original Text - Only show for non-global annotations */}
      {!isGlobal && annotation.originalText && (
        <div className="text-[11px] font-mono text-muted-foreground bg-muted/50 rounded px-2 py-1.5 truncate">
          "{annotation.originalText}"
        </div>
      )}

      {/* Comment/Replacement Text */}
      {annotation.text && annotation.type !== AnnotationType.DELETION && (
        <div className={`${!isGlobal && annotation.originalText ? 'mt-2' : ''} text-xs text-foreground/90 ${isGlobal ? '' : 'pl-2 border-l-2 border-primary/50'}`}>
          {annotation.text}
        </div>
      )}
    </div>
  );
};
