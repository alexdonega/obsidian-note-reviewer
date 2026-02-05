/**
 * MarkdownRenderer Component
 *
 * Renders markdown content with syntax highlighting, security, and standard syntax support.
 * Uses react-markdown with rehype-sanitize for security and react-syntax-highlighter for code blocks.
 */

import React, { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { validateMarkdownContent } from '../utils/markdownSanitizer';
import { MarkdownConfig, defaultMarkdownConfig } from '../types/MarkdownConfig';

export interface MarkdownRendererProps {
  content: string;
  config?: Partial<MarkdownConfig>;
  className?: string;
}

/**
 * Custom link component that opens links in new tab for security
 */
const LinkComponent = ({
  href,
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      {...props}
    >
      {children}
    </a>
  );
};

/**
 * Custom image component with alt text support and error handling
 */
const ImageComponent = ({
  src,
  alt,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) => {
  const [hasError, setHasError] = React.useState(false);

  if (hasError || !src) {
    return (
      <span className="inline-block bg-muted text-muted-foreground px-2 py-1 rounded text-sm">
        {alt || 'Imagem'}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt || ''}
      onError={() => setHasError(true)}
      loading="lazy"
      className="max-w-full h-auto rounded-md"
      {...props}
    />
  );
};

/**
 * Code block component with syntax highlighting
 */
const CodeBlock = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) => {
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const codeContent = String(children).replace(/\n$/, '');

  return match ? (
    <SyntaxHighlighter
      style={vscDarkPlus}
      language={language}
      PreTag="div"
      className="rounded-md my-4"
      {...props}
    >
      {codeContent}
    </SyntaxHighlighter>
  ) : (
    <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
      {children}
    </code>
  );
};

/**
 * Main MarkdownRenderer component
 *
 * Renders markdown content with:
 * - Standard syntax support (headings, lists, emphasis, links)
 * - Code blocks with syntax highlighting
 * - Image rendering with alt text
 * - HTML sanitization to prevent XSS
 * - Links open in new tab
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  config = {},
  className = ''
}) => {
  const finalConfig = { ...defaultMarkdownConfig, ...config };

  // Validate content before rendering if security is enabled
  if (finalConfig.security.enableValidation) {
    const validation = validateMarkdownContent(content);
    if (!validation.isValid) {
      console.warn('Markdown content validation failed:', validation.errors);
    }
  }

  // Combine custom renderers with default renderers
  const components = {
    ...finalConfig.customRenderers,
    a: finalConfig.customRenderers?.a || LinkComponent,
    img: finalConfig.customRenderers?.img || ImageComponent,
    code: finalConfig.customRenderers?.code || CodeBlock,
  };

  // Build rehype-sanitize schema based on security level
  const getSchema = () => {
    if (finalConfig.security.sanitizationLevel === 'none') {
      return undefined;
    }

    if (finalConfig.security.sanitizationLevel === 'permissive') {
      // Allow more HTML tags for flexibility
      return {
        ...defaultSchema,
        attributes: {
          ...defaultSchema.attributes,
          '*': [
            ...(defaultSchema.attributes?.['*'] || []),
            'className',
            'style',
          ],
        },
      };
    }

    // Default strict mode
    return defaultSchema;
  };

  return (
    <div className={`markdown-renderer prose dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={
          finalConfig.security.sanitizationLevel !== 'none'
            ? [[rehypeSanitize, getSchema()]]
            : []
        }
        components={components as Record<string, ReactNode>}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
