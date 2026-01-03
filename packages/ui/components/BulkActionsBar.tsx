import React, { useState } from 'react';

export interface BulkActionsBarProps {
  selectedCount: number;
  onDeleteSelected: () => void;
  onExportSelected: () => void;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  onDeleteSelected,
  onExportSelected,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Don't render if nothing is selected
  if (selectedCount === 0) {
    return null;
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDeleteSelected();
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div
        className="absolute bottom-0 left-0 right-0 p-2 border-t border-border/50 bg-card/95 backdrop-blur-sm animate-in slide-in-from-bottom-2 fade-in duration-200"
      >
        <div className="flex items-center justify-between gap-2">
          {/* Selection count */}
          <span className="text-[10px] font-mono bg-primary/20 px-1.5 py-0.5 rounded text-primary flex-shrink-0">
            {selectedCount} selecionado{selectedCount !== 1 ? 's' : ''}
          </span>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            {/* Export Selected */}
            <button
              onClick={onExportSelected}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent hover:border-border/50"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Exportar
            </button>

            {/* Delete Selected */}
            <button
              onClick={handleDeleteClick}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/30 hover:border-destructive/50"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Excluir
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={handleCancelDelete}
        >
          <div
            className="bg-card border border-border rounded-xl w-full max-w-sm shadow-2xl p-6"
            onClick={e => e.stopPropagation()}
          >
            {/* Dialog Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-destructive/10">
                <svg className="w-5 h-5 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="font-semibold text-base text-foreground">Excluir Anotações</h3>
            </div>

            {/* Dialog Content */}
            <p className="text-sm text-muted-foreground mb-6">
              Tem certeza que deseja excluir{' '}
              <span className="font-semibold text-foreground">
                {selectedCount} anotaç{selectedCount !== 1 ? 'ões' : 'ão'}
              </span>
              ? Esta ação não pode ser desfeita.
            </p>

            {/* Dialog Actions */}
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-medium text-destructive-foreground bg-destructive hover:bg-destructive/90 rounded-md transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
