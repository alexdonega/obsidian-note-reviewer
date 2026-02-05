/**
 * CodeBlock Component
 *
 * Enhanced code block component with syntax highlighting, copy-to-clipboard,
 * language labels, and line numbers support.
 */

import React, { useState, useCallback } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

export interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  showCopyButton?: boolean;
  className?: string;
  startingLineNumber?: number;
  wrapLongLines?: boolean;
}

/**
 * Get display name for language
 */
function getLanguageDisplay(language: string): string {
  const displayNames: Record<string, string> = {
    js: 'JavaScript',
    jsx: 'JavaScript (React)',
    ts: 'TypeScript',
    tsx: 'TypeScript (React)',
    py: 'Python',
    rb: 'Ruby',
    go: 'Go',
    rs: 'Rust',
    java: 'Java',
    c: 'C',
    cpp: 'C++',
    cs: 'C#',
    php: 'PHP',
    html: 'HTML',
    css: 'CSS',
    scss: 'SCSS',
    json: 'JSON',
    xml: 'XML',
    yaml: 'YAML',
    yml: 'YAML',
    md: 'Markdown',
    sh: 'Shell',
    bash: 'Bash',
    sql: 'SQL',
    dockerfile: 'Dockerfile',
    diff: 'Diff',
    git: 'Git',
    mermaid: 'Mermaid',
  };

  return displayNames[language.toLowerCase()] || language || 'Text';
}

/**
 * CopyButton sub-component
 */
const CopyButton: React.FC<{ code: string; language?: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setError(null);

      // Reset after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy');
      setTimeout(() => setError(null), 2000);
    }
  }, [code]);

  return (
    <button
      onClick={handleCopy}
      className="copy-button absolute top-2 right-2 p-2 rounded-md bg-background/80 hover:bg-background transition-colors"
      title={error || (copied ? 'Copied!' : 'Copy code')}
      aria-label={error || (copied ? 'Copied!' : 'Copy code')}
    >
      {copied ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <Copy className="w-4 h-4 text-muted-foreground" />
      )}
    </button>
  );
};

/**
 * LanguageLabel sub-component
 */
const LanguageLabel: React.FC<{ language?: string }> = ({ language }) => {
  if (!language) return null;

  return (
    <div className="absolute top-2 left-3 px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
      {getLanguageDisplay(language)}
    </div>
  );
};

/**
 * Main CodeBlock component
 *
 * Renders code blocks with:
 * - Syntax highlighting using PrismJS
 * - Copy-to-clipboard functionality
 * - Language label display
 * - Optional line numbers
 * - Responsive design
 */
export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = '',
  showLineNumbers = false,
  showCopyButton = true,
  className = '',
  startingLineNumber = 1,
  wrapLongLines = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Handle async syntax highlighting for large blocks
  React.useEffect(() => {
    if (code.length > 10000) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 0);
      return () => clearTimeout(timer);
    }
  }, [code.length]);

  return (
    <div className={`code-block-wrapper relative my-4 ${className}`}>
      {/* Language Label */}
      {language && <LanguageLabel language={language} />}

      {/* Copy Button */}
      {showCopyButton && <CopyButton code={code} language={language} />}

      {/* Syntax Highlighter */}
      {isLoading ? (
        <div className="bg-muted rounded-md p-4 min-h-[100px] flex items-center justify-center">
          <span className="text-muted-foreground text-sm">Loading code...</span>
        </div>
      ) : (
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          showLineNumbers={showLineNumbers}
          startingLineNumber={startingLineNumber}
          wrapLongLines={wrapLongLines}
          PreTag="div"
          className="rounded-md !mt-0"
          customStyle={{
            margin: 0,
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            maxHeight: '600px',
            overflowY: 'auto',
          }}
          lineNumberStyle={{
            color: '#6b7280',
            fontSize: '0.75rem',
            minWidth: '2.5rem',
            paddingRight: '1rem',
            textAlign: 'right',
            userSelect: 'none',
          }}
        >
          {code}
        </SyntaxHighlighter>
      )}
    </div>
  );
};

/**
 * InlineCode sub-component for single-line code
 */
export const InlineCode: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <code
      className={`inline-code bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground ${className}`}
    >
      {children}
    </code>
  );
};

/**
 * Hook to detect and render code blocks from markdown
 */
export function useCodeDetection(content: string) {
  const codeBlocks = React.useMemo(() => {
    const blockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const blocks: Array<{ language: string; code: string; index: number }> = [];

    let match;
    let index = 0;
    while ((match = blockRegex.exec(content)) !== null) {
      blocks.push({
        language: match[1] || '',
        code: match[2],
        index: match.index,
      });
      index = blockRegex.lastIndex;
    }

    return blocks;
  }, [content]);

  return { codeBlocks };
}

export default CodeBlock;
