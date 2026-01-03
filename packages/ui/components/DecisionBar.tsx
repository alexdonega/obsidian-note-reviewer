import React, { useState } from 'react';

interface DecisionBarProps {
  onApprove: () => Promise<void>;
  onDeny: (feedback: string) => Promise<void>;
  annotationCount: number;
  getFeedback: () => string;
}

export const DecisionBar: React.FC<DecisionBarProps> = ({
  onApprove,
  onDeny,
  annotationCount,
  getFeedback
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<'approved' | 'denied' | null>(null);

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onApprove();
      setSubmitted('approved');
    } catch (error) {
      console.error('Failed to approve:', error);
      setIsSubmitting(false);
    }
  };

  const handleDeny = async () => {
    const feedback = getFeedback();
    setIsSubmitting(true);
    try {
      await onDeny(feedback);
      setSubmitted('denied');
    } catch (error) {
      console.error('Failed to deny:', error);
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md px-8">
          {/* Icon */}
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
            submitted === 'approved'
              ? 'bg-green-500/20 text-green-500'
              : 'bg-accent/20 text-accent'
          }`}>
            {submitted === 'approved' ? (
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              {submitted === 'approved' ? 'Nota Aprovada' : 'Alterações Solicitadas'}
            </h2>
            <p className="text-muted-foreground">
              {submitted === 'approved'
                ? 'A nota será salva no Obsidian.'
                : 'Claude irá revisar a nota com base nas suas anotações.'}
            </p>
          </div>

          {/* Instruction */}
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Retorne ao <span className="text-foreground font-medium">terminal do Claude Code</span> para continuar.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-card/95 backdrop-blur-xl border-t border-border z-50">
      <div className="max-w-3xl mx-auto flex items-center gap-4">
        {/* Status info */}
        <div className="flex-1 text-sm text-muted-foreground">
          {annotationCount > 0 ? (
            <span>{annotationCount} {annotationCount !== 1 ? 'anotações' : 'anotação'} para enviar como feedback</span>
          ) : (
            <span>Revise a nota, depois aprove ou solicite alterações</span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleDeny}
            disabled={isSubmitting}
            aria-label="Solicitar alterações na nota"
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all
              focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none
              ${isSubmitting
                ? 'opacity-50 cursor-not-allowed bg-muted text-muted-foreground'
                : 'bg-accent/15 text-accent hover:bg-accent/25 border border-accent/30'
              }
            `}
          >
            {isSubmitting ? 'Enviando...' : 'Solicitar Alterações'}
          </button>

          <button
            onClick={handleApprove}
            disabled={isSubmitting}
            aria-label="Aprovar nota e salvar no Obsidian"
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all
              focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none
              ${isSubmitting
                ? 'opacity-50 cursor-not-allowed bg-muted text-muted-foreground'
                : 'bg-green-600 text-white hover:bg-green-500'
              }
            `}
          >
            {isSubmitting ? 'Aprovando...' : 'Aprovar Nota'}
          </button>
        </div>
      </div>
    </div>
  );
};
