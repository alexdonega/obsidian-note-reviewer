import React, { useState } from 'react';
import { Annotation, AnnotationType, Block } from '../types';
import { ConfirmationDialog } from './ConfirmationDialog';

interface SidebarProps {
  annotations: Annotation[];
  blocks: Block[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  selectedId: string | null;
}

export const AnnotationSidebar: React.FC<SidebarProps> = ({
  annotations,
  blocks,
  onSelect,
  onDelete,
  selectedId
}) => {
  const sortedAnnotations = [...annotations].sort((a, b) => {
    const blockA = blocks.findIndex(blk => blk.id === a.blockId);
    const blockB = blocks.findIndex(blk => blk.id === b.blockId);
    if (blockA !== blockB) return blockA - blockB;
    return a.startOffset - b.startOffset;
  });

  // State for tracking which annotation is pending deletion
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

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

  return (
    <div className="w-80 border-l border-border/50 bg-card/50 backdrop-blur-sm h-full flex flex-col transition-colors">
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Revisar AlteraÃ§Ãµes</h2>
        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
          {annotations.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {sortedAnnotations.length === 0 ? (
          <div className="text-center text-muted-foreground mt-10 text-sm">
            <p>Nenhuma anotaÃ§Ã£o ainda.</p>
            <p className="mt-2 text-xs">Selecione texto no documento para adicionar comentÃ¡rios ou sugerir alteraÃ§Ãµes.</p>
          </div>
        ) : (
          sortedAnnotations.map(ann => (
            <div
              key={ann.id}
              onClick={() => onSelect(ann.id)}
              className={`
                group relative p-3 rounded-lg border transition-all cursor-pointer
                ${selectedId === ann.id
                  ? 'bg-accent/20 border-accent shadow-sm'
                  : 'bg-card border-border hover:border-accent hover:shadow-sm'
                }
              `}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`
                  text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded
                  ${ann.type === AnnotationType.DELETION ? 'bg-destructive/20 text-destructive' :
                    ann.type === AnnotationType.INSERTION ? 'bg-secondary/20 text-secondary' :
                    ann.type === AnnotationType.REPLACEMENT ? 'bg-primary/20 text-primary' :
                    'bg-accent/20 text-accent'}
                `}>
                  {ann.type}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteClick(ann.id); }}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1 rounded hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  title="Remover Anotação"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              <div className="text-sm text-muted-foreground mb-2 font-mono bg-muted p-2 rounded-lg text-xs truncate">
                "{ann.originalText}"
              </div>

              {(ann.text && ann.type !== AnnotationType.DELETION) && (
                <div className="text-sm text-foreground font-medium pl-3 border-l-2 border-primary">
                  {ann.type === AnnotationType.REPLACEMENT ? 'â†’ ' : ''}{ann.text}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={pendingDeleteId !== null}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Excluir anotação"
        message={buildDeleteConfirmationMessage(pendingDeleteAnnotation)}
        confirmLabel="Excluir"
        destructive
      />
    </div>
  );
};

/**
 * Truncates text to a maximum length with ellipsis.
 * @param text The text to truncate
 * @param maxLength Maximum number of characters before truncation (default: 50)
 */
function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Maps annotation type to Portuguese label for display in dialogs.
 */
function getAnnotationTypeLabel(type: AnnotationType): string {
  const labels: Record<AnnotationType, string> = {
    [AnnotationType.DELETION]: 'Excluir',
    [AnnotationType.INSERTION]: 'Inserir',
    [AnnotationType.REPLACEMENT]: 'Substituir',
    [AnnotationType.COMMENT]: 'Comentário',
    [AnnotationType.GLOBAL_COMMENT]: 'Comentário Global',
  };
  return labels[type] ?? 'Anotação';
}

/**
 * Builds a confirmation message for annotation deletion.
 * Shows the annotation type and previews of original text and comment.
 */
function buildDeleteConfirmationMessage(annotation: Annotation | null): React.ReactNode {
  if (!annotation) {
    return 'Tem certeza que deseja excluir esta anotação?';
  }

  const typeLabel = getAnnotationTypeLabel(annotation.type);
  const isGlobal = annotation.isGlobal;
  const hasOriginalText = !isGlobal && annotation.originalText;
  const hasComment = annotation.text && annotation.type !== AnnotationType.DELETION;

  return (
    <div className="space-y-3">
      <p>Tem certeza que deseja excluir esta anotação?</p>

      <div className="p-3 rounded-md bg-muted/50 border border-border/50 space-y-2">
        {/* Annotation Type */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Tipo:</span>
          <span className="text-xs font-medium">{typeLabel}</span>
        </div>

        {/* Original Text Preview */}
        {hasOriginalText && (
          <div>
            <span className="text-xs text-muted-foreground">Texto selecionado:</span>
            <p className="text-xs font-mono mt-0.5 text-foreground/80 truncate">
              "{truncateText(annotation.originalText!, 60)}"
            </p>
          </div>
        )}

        {/* Comment/Replacement Text Preview */}
        {hasComment && (
          <div>
            <span className="text-xs text-muted-foreground">
              {annotation.type === AnnotationType.REPLACEMENT ? 'Substituição:' : 'Comentário:'}
            </span>
            <p className="text-xs mt-0.5 text-foreground/80 truncate">
              {truncateText(annotation.text!, 60)}
            </p>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">Esta ação não pode ser desfeita.</p>
    </div>
  );
}
