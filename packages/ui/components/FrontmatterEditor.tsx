import React, { useState, useEffect } from 'react';
import YAML from 'js-yaml';

interface FrontmatterEditorProps {
  content: string;
  onChange: (newContent: string) => void;
  blockId: string;
}

export const FrontmatterEditor: React.FC<FrontmatterEditorProps> = ({
  content,
  onChange,
  blockId
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(content);
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    try {
      const obj = YAML.load(content) as Record<string, any>;
      setParsed(obj);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao parsear YAML');
    }
  }, [content]);

  const handleSave = () => {
    try {
      // Validar YAML antes de salvar
      YAML.load(editValue);
      onChange(editValue);
      setIsEditing(false);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'YAML inválido');
    }
  };

  const handleCancel = () => {
    setEditValue(content);
    setIsEditing(false);
    setError(null);
  };

  if (isEditing) {
    return (
      <div className="mb-6 p-4 bg-muted/30 border border-primary/30 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] uppercase tracking-wider text-primary font-semibold">
            Editando Frontmatter YAML
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Salvar
            </button>
            <button
              onClick={handleCancel}
              className="px-2 py-1 text-xs bg-muted text-foreground rounded hover:bg-muted/80"
            >
              Cancelar
            </button>
          </div>
        </div>

        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="w-full min-h-[120px] p-2 bg-background border border-border rounded text-xs font-mono focus:border-primary focus:outline-none"
        />

        {error && (
          <div className="mt-2 p-2 bg-destructive/10 border border-destructive/30 rounded text-xs text-destructive">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mb-6 p-4 bg-muted/30 border border-border/30 rounded-lg group">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          Frontmatter YAML
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="opacity-0 group-hover:opacity-100 px-2 py-1 text-xs bg-primary/10 text-primary rounded hover:bg-primary/20 transition-all"
        >
          Editar
        </button>
      </div>

      <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap">
        {content}
      </pre>

      {error && (
        <div className="mt-2 p-2 bg-destructive/10 border border-destructive/30 rounded text-xs text-destructive">
          ⚠ {error}
        </div>
      )}
    </div>
  );
};
