import React, { useState } from 'react';
import { EditorMode } from '../types';

interface ModeSwitcherProps {
  mode: EditorMode;
  onChange: (mode: EditorMode) => void;
}

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ mode, onChange }) => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
    <div className="inline-flex items-center bg-muted/50 rounded-lg p-0.5 border border-border/30">
      <ModeButton
        active={mode === 'selection'}
        onClick={() => onChange('selection')}
        icon={
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h-1a2 2 0 0 1-2-2 2 2 0 0 1-2 2H6"/>
            <path d="M13 8h7a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-7"/>
            <path d="M5 16H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1"/>
            <path d="M6 4h1a2 2 0 0 1 2 2 2 2 0 0 1 2-2h1"/>
            <path d="M9 6v12"/>
          </svg>
        }
        label="Seleção"
      />
      <ModeButton
        active={mode === 'edit'}
        onClick={() => onChange('edit')}
        icon={
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        }
        label="Editar"
      />
      <ModeButton
        active={mode === 'redline'}
        onClick={() => onChange('redline')}
        icon={
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z" />
          </svg>
        }
        label="Exclusão"
        destructive
      />
    </div>

    {/* Help link */}
    <button
      onClick={() => setShowHelp(true)}
      className="ml-2 text-[10px] text-muted-foreground/60 hover:text-muted-foreground transition-colors rounded focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      como funciona?
    </button>

    {/* Help Video Dialog */}
    {showHelp && (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
        onClick={() => setShowHelp(false)}
      >
        <div
          className="bg-card border border-border rounded-xl w-full max-w-2xl shadow-2xl relative"
          onClick={e => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="help-dialog-title"
        >

          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 id="help-dialog-title" className="font-semibold text-sm">Como o Obsidian Note Reviewer Funciona</h3>
            <button
              onClick={() => setShowHelp(false)}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="aspect-video">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/a_AT7cEN_9I?autoplay=1"
              title="Como o Obsidian Note Reviewer Funciona"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    )}
    </>
  );
};

const ModeButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  destructive?: boolean;
}> = ({ active, onClick, icon, label, destructive }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
      active
        ? destructive
          ? 'bg-destructive/15 text-destructive shadow-sm'
          : 'bg-background text-foreground shadow-sm'
        : 'text-muted-foreground hover:text-foreground'
    }`}
  >
    {icon}
    {label}
  </button>
);
