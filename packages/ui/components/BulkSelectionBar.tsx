import React, { useRef, useEffect } from 'react';

export interface BulkSelectionBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
}

export const BulkSelectionBar: React.FC<BulkSelectionBarProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
}) => {
  const checkboxRef = useRef<HTMLInputElement>(null);

  const isAllSelected = totalCount > 0 && selectedCount === totalCount;
  const isIndeterminate = selectedCount > 0 && selectedCount < totalCount;
  const hasSelection = selectedCount > 0;

  // Set indeterminate state via ref (can't be set via attribute)
  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const handleCheckboxChange = () => {
    if (isAllSelected || isIndeterminate) {
      onClearSelection();
    } else {
      onSelectAll();
    }
  };

  // Don't render if there are no items
  if (totalCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50 bg-muted/30">
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          ref={checkboxRef}
          type="checkbox"
          checked={isAllSelected}
          onChange={handleCheckboxChange}
          aria-label={isAllSelected ? 'Deselect all annotations' : 'Select all annotations'}
          className="w-3.5 h-3.5 rounded border-border/50 text-primary focus:ring-primary/30 focus:ring-offset-0 cursor-pointer"
        />
        <span className="text-[11px] text-muted-foreground">
          {isAllSelected ? 'Limpar seleção' : 'Selecionar tudo'}
        </span>
      </label>

      {hasSelection && (
        <span className="text-[10px] font-mono bg-primary/20 px-1.5 py-0.5 rounded text-primary">
          {selectedCount} selecionado{selectedCount !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
};
