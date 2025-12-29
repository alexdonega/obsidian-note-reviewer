import React, { useState } from 'react';
import { useUpdateCheck } from '../hooks/useUpdateCheck';

const INSTALL_COMMAND = 'curl -fsSL https://plannotator.ai/install.sh | bash';

export const UpdateBanner: React.FC = () => {
  const updateInfo = useUpdateCheck();
  const [copied, setCopied] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (!updateInfo?.updateAvailable || dismissed) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-2 fade-in duration-300">
      <div className="bg-card border border-border rounded-lg shadow-xl p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-medium text-foreground">
                Update available
              </h4>
              <button
                onClick={() => setDismissed(true)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {updateInfo.latestVersion} is available (you have {updateInfo.currentVersion})
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex-1 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
              >
                {copied ? 'Copied!' : 'Copy install command'}
              </button>
              <a
                href={updateInfo.releaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-md hover:bg-muted transition-colors"
              >
                Notes
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
