import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Highlighter from 'web-highlighter';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import { Block, Annotation, AnnotationType, EditorMode } from '../types';
import { Toolbar } from './Toolbar';
import { getIdentity } from '../utils/identity';
import { getCalloutConfig } from '../utils/callouts';
import * as LucideIcons from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';
import DOMPurify from 'dompurify';
import { useCopyFeedback } from '../hooks/useCopyFeedback';
import { ImageAnnotator } from './ImageAnnotator';
import type { Stroke } from '../types/drawing';

interface ViewerProps {
  blocks: Block[];
  markdown: string;
  annotations: Annotation[];
  onAddAnnotation: (ann: Annotation) => void;
  onSelectAnnotation: (id: string | null) => void;
  selectedAnnotationId: string | null;
  mode: EditorMode;
  onBlockChange?: (blocks: Block[]) => void;
}

export interface ViewerHandle {
  removeHighlight: (id: string) => void;
  clearAllHighlights: () => void;
  applySharedAnnotations: (annotations: Annotation[]) => void;
}

export const Viewer = forwardRef<ViewerHandle, ViewerProps>(({
  blocks,
  markdown,
  annotations,
  onAddAnnotation,
  onSelectAnnotation,
  selectedAnnotationId,
  mode,
  onBlockChange
}, ref) => {
  // Copy note button feedback
  const {
    copied: noteCopied,
    handleCopy: handleCopyNote,
    animationClass: noteAnimationClass,
    buttonClass: noteButtonClass,
    iconClass: noteIconClass,
  } = useCopyFeedback();

  const containerRef = useRef<HTMLDivElement>(null);
  const highlighterRef = useRef<Highlighter | null>(null);
  const modeRef = useRef<EditorMode>(mode);
  const onAddAnnotationRef = useRef(onAddAnnotation);
  const pendingSourceRef = useRef<any>(null);
  const [toolbarState, setToolbarState] = useState<{ element: HTMLElement; source: any } | null>(null);
  const [hoveredCodeBlock, setHoveredCodeBlock] = useState<{ block: Block; element: HTMLElement } | null>(null);
  const [isCodeBlockToolbarExiting, setIsCodeBlockToolbarExiting] = useState(false);
  const [focusedBlockIndex, setFocusedBlockIndex] = useState<number | null>(null);
  const [imageAnnotations, setImageAnnotations] = useState<Map<string, Stroke[]>>(new Map());
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const focusedBlockRef = useRef<HTMLDivElement>(null);

  // Keep refs in sync with props
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    onAddAnnotationRef.current = onAddAnnotation;
  }, [onAddAnnotation]);

  // Keyboard navigation (j/k, arrows, Enter, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere with inputs and textareas
      if (e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLInputElement) {
        return;
      }

      // Vim-style navigation: j/down for next, k/up for previous
      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedBlockIndex(prev => {
          if (prev === null) return 0;
          return Math.min(prev + 1, blocks.length - 1);
        });
      }
      if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedBlockIndex(prev => {
          if (prev === null) return 0;
          return Math.max(prev - 1, 0);
        });
      }

      // Enter to focus on block
      if (e.key === 'Enter' && focusedBlockIndex !== null) {
        e.preventDefault();
        const blockElement = document.querySelector(`[data-block-id="${blocks[focusedBlockIndex].id}"]`);
        if (blockElement) {
          blockElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Trigger edit mode if available
          const editButton = blockElement.querySelector('button[title*="Editar"], button[title*="Edit"]');
          if (editButton && mode === 'edit') {
            (editButton as HTMLButtonElement).click();
          }
        }
      }

      // Escape to clear focus
      if (e.key === 'Escape') {
        e.preventDefault();
        setFocusedBlockIndex(null);
      }

      // Number keys for quick navigation (1-9)
      if (/^[1-9]$/.test(e.key)) {
        const index = parseInt(e.key) - 1;
        if (index < blocks.length) {
          e.preventDefault();
          setFocusedBlockIndex(index);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [blocks, focusedBlockIndex, mode]);

  // Scroll focused block into view
  useEffect(() => {
    if (focusedBlockIndex !== null && focusedBlockIndex >= 0 && focusedBlockIndex < blocks.length) {
      const blockElement = document.querySelector(`[data-block-id="${blocks[focusedBlockIndex].id}"]`);
      if (blockElement) {
        blockElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [focusedBlockIndex, blocks]);

  // Helper to create annotation from highlighter source
  const createAnnotationFromSource = (
    highlighter: Highlighter,
    source: any,
    type: AnnotationType,
    text?: string
  ) => {
    const doms = highlighter.getDoms(source.id);
    let blockId = '';
    let startOffset = 0;

    if (doms?.length > 0) {
      const el = doms[0] as HTMLElement;
      let parent = el.parentElement;
      while (parent && !parent.dataset.blockId) {
        parent = parent.parentElement;
      }
      if (parent?.dataset.blockId) {
        blockId = parent.dataset.blockId;
        const blockText = parent.textContent || '';
        const beforeText = blockText.split(source.text)[0];
        startOffset = beforeText?.length || 0;
      }
    }

    const newAnnotation: Annotation = {
      id: source.id,
      blockId,
      startOffset,
      endOffset: startOffset + source.text.length,
      type,
      text,
      originalText: source.text,
      createdA: Date.now(),
      author: getIdentity(),
      startMeta: source.startMeta,
      endMeta: source.endMeta,
    };

    if (type === AnnotationType.DELETION) {
      highlighter.addClass('deletion', source.id);
    } else if (type === AnnotationType.COMMENT) {
      highlighter.addClass('comment', source.id);
    }

    // Add data-bind-id to DOM elements for scroll-to-annotation feature
    if (doms?.length > 0) {
      doms.forEach((dom: HTMLElement) => {
        dom.dataset.bindId = source.id;
      });
    }

    onAddAnnotationRef.current(newAnnotation);
  };

  // Helper to find text in DOM and create a range
  const findTextInDOM = useCallback((searchText: string): Range | null => {
    if (!containerRef.current) return null;

    const walker = document.createTreeWalker(
      containerRef.current,
      NodeFilter.SHOW_TEXT,
      null
    );

    let node: Text | null;
    while ((node = walker.nextNode() as Text | null)) {
      const text = node.textContent || '';
      const index = text.indexOf(searchText);
      if (index !== -1) {
        const range = document.createRange();
        range.setStart(node, index);
        range.setEnd(node, index + searchText.length);
        return range;
      }
    }

    // Try across multiple text nodes for multi-line content
    const fullText = containerRef.current.textContent || '';
    const searchIndex = fullText.indexOf(searchText);
    if (searchIndex === -1) return null;

    // Use Selection API to find and select the text
    const selection = window.getSelection();
    if (!selection) return null;

    // Reset walker
    const walker2 = document.createTreeWalker(
      containerRef.current,
      NodeFilter.SHOW_TEXT,
      null
    );

    let charCount = 0;
    let startNode: Text | null = null;
    let startOffset = 0;
    let endNode: Text | null = null;
    let endOffset = 0;

    while ((node = walker2.nextNode() as Text | null)) {
      const nodeLength = node.textContent?.length || 0;

      if (!startNode && charCount + nodeLength > searchIndex) {
        startNode = node;
        startOffset = searchIndex - charCount;
      }

      if (startNode && charCount + nodeLength >= searchIndex + searchText.length) {
        endNode = node;
        endOffset = searchIndex + searchText.length - charCount;
        break;
      }

      charCount += nodeLength;
    }

    if (startNode && endNode) {
      const range = document.createRange();
      range.setStart(startNode, startOffset);
      range.setEnd(endNode, endOffset);
      return range;
    }

    return null;
  }, []);

  useImperativeHandle(ref, () => ({
    removeHighlight: (id: string) => {
      // Try highlighter first (for regular text selections)
      highlighterRef.current?.remove(id);

      // Handle manually created highlights (may be multiple marks with same ID)
      const manualHighlights = containerRef.current?.querySelectorAll(`[data-bind-id="${id}"]`);
      manualHighlights?.forEach(el => {
        const parent = el.parentNode;
        while (el.firstChild) {
          parent?.insertBefore(el.firstChild, el);
        }
        el.remove();
      });
    },

    clearAllHighlights: () => {
      // Clear all manual highlights (shared annotations and code blocks)
      const manualHighlights = containerRef.current?.querySelectorAll('[data-bind-id]');
      manualHighlights?.forEach(el => {
        const parent = el.parentNode;
        while (el.firstChild) {
          parent?.insertBefore(el.firstChild, el);
        }
        el.remove();
      });

      // Clear web-highlighter highlights
      const webHighlights = containerRef.current?.querySelectorAll('.annotation-highlight');
      webHighlights?.forEach(el => {
        const parent = el.parentNode;
        while (el.firstChild) {
          parent?.insertBefore(el.firstChild, el);
        }
        el.remove();
      });
    },

    applySharedAnnotations: (sharedAnnotations: Annotation[]) => {
      const highlighter = highlighterRef.current;
      if (!highlighter || !containerRef.current) return;

      sharedAnnotations.forEach(ann => {
        // Skip if already highlighted
        const existingDoms = highlighter.getDoms(ann.id);
        if (existingDoms && existingDoms.length > 0) return;

        // Also skip if manually highlighted
        const existingManual = containerRef.current?.querySelector(`[data-bind-id="${ann.id}"]`);
        if (existingManual) return;

        // Find the text in the DOM
        const range = findTextInDOM(ann.originalText);
        if (!range) {
          console.warn(`Could not find text for annotation ${ann.id}: "${ann.originalText.slice(0, 50)}..."`);
          return;
        }

        try {
          // Multi-mark approach: wrap each text node portion separately
          // This avoids destructive extractContents() that breaks DOM structure
          const textNodes: { node: Text; start: number; end: number }[] = [];

          // Collect all text nodes within the range
          const walker = document.createTreeWalker(
            range.commonAncestorContainer.nodeType === Node.TEXT_NODE
              ? range.commonAncestorContainer.parentNode!
              : range.commonAncestorContainer,
            NodeFilter.SHOW_TEXT,
            null
          );

          let node: Text | null;
          let inRange = false;

          while ((node = walker.nextNode() as Text | null)) {
            // Check if this node is the start container
            if (node === range.startContainer) {
              inRange = true;
              const start = range.startOffset;
              const end = node === range.endContainer ? range.endOffset : node.length;
              if (end > start) {
                textNodes.push({ node, start, end });
              }
              if (node === range.endContainer) break;
              continue;
            }

            // Check if this node is the end container
            if (node === range.endContainer) {
              if (inRange) {
                const end = range.endOffset;
                if (end > 0) {
                  textNodes.push({ node, start: 0, end });
                }
              }
              break;
            }

            // Node is fully within range
            if (inRange && node.length > 0) {
              textNodes.push({ node, start: 0, end: node.length });
            }
          }

          // If we only have one text node and it's fully contained, use simple approach
          if (textNodes.length === 0) {
            console.warn(`No text nodes found for annotation ${ann.id}`);
            return;
          }

          // Wrap each text node portion with its own mark (process in reverse to avoid offset issues)
          textNodes.reverse().forEach(({ node, start, end }) => {
            try {
              const nodeRange = document.createRange();
              nodeRange.setStart(node, start);
              nodeRange.setEnd(node, end);

              const mark = document.createElement('mark');
              mark.className = 'annotation-highlight';
              mark.dataset.bindId = ann.id;

              if (ann.type === AnnotationType.DELETION) {
                mark.classList.add('deletion');
              } else if (ann.type === AnnotationType.COMMENT) {
                mark.classList.add('comment');
              }

              // surroundContents works reliably for single text node ranges
              nodeRange.surroundContents(mark);

              // Make it clickable
              mark.addEventListener('click', () => {
                onSelectAnnotation(ann.id);
              });
            } catch (e) {
              console.warn(`Failed to wrap text node for annotation ${ann.id}:`, e);
            }
          });
        } catch (e) {
          console.warn(`Failed to apply highlight for annotation ${ann.id}:`, e);
        }
      });
    }
  }), [findTextInDOM, onSelectAnnotation]);

  useEffect(() => {
    if (!containerRef.current) return;

    const highlighter = new Highlighter({
      $root: containerRef.current,
      exceptSelectors: ['.annotation-toolbar', 'button'],
      wrapTag: 'mark',
      style: { className: 'annotation-highlight' }
    });

    highlighterRef.current = highlighter;

    highlighter.on(Highlighter.event.CREATE, ({ sources }: { sources: any[] }) => {
      if (sources.length > 0) {
        const source = sources[0];
        const doms = highlighter.getDoms(source.id);
        if (doms?.length > 0) {
          // Clean up previous pending highlight if exists
          if (pendingSourceRef.current) {
            highlighter.remove(pendingSourceRef.current.id);
            pendingSourceRef.current = null;
          }

          if (modeRef.current === 'redline') {
            // Auto-delete in redline mode
            createAnnotationFromSource(highlighter, source, AnnotationType.DELETION);
            window.getSelection()?.removeAllRanges();
          } else {
            // Show toolbar in selection mode
            pendingSourceRef.current = source;
            setToolbarState({ element: doms[0] as HTMLElement, source });
          }
        }
      }
    });

    highlighter.on(Highlighter.event.CLICK, ({ id }: { id: string }) => {
      onSelectAnnotation(id);
    });

    highlighter.run();

    return () => highlighter.dispose();
  }, [onSelectAnnotation]);


  useEffect(() => {
    const highlighter = highlighterRef.current;
    if (!highlighter) return;

    annotations.forEach(ann => {
      try {
        const doms = highlighter.getDoms(ann.id);
        if (doms?.length > 0) {
          if (ann.type === AnnotationType.DELETION) {
            highlighter.addClass('deletion', ann.id);
          } else if (ann.type === AnnotationType.COMMENT) {
            highlighter.addClass('comment', ann.id);
          }
        }
      } catch (e) {}
    });
  }, [annotations]);

  const handleAnnotate = (type: AnnotationType, text?: string) => {
    const highlighter = highlighterRef.current;
    if (!toolbarState || !highlighter) return;

    createAnnotationFromSource(highlighter, toolbarState.source, type, text);
    pendingSourceRef.current = null;
    setToolbarState(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleToolbarClose = () => {
    if (toolbarState && highlighterRef.current) {
      highlighterRef.current.remove(toolbarState.source.id);
    }
    pendingSourceRef.current = null;
    setToolbarState(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleCodeBlockAnnotate = (type: AnnotationType, text?: string) => {
    const highlighter = highlighterRef.current;
    if (!hoveredCodeBlock || !highlighter) return;

    // Find the code element inside the pre
    const codeEl = hoveredCodeBlock.element.querySelector('code');
    if (!codeEl) return;

    // Create a range that selects all content in the code block
    const range = document.createRange();
    range.selectNodeContents(codeEl);

    // Set the browser selection to this range
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    // Use highlighter.fromRange which triggers CREATE event internally
    // We need to handle this synchronously, so we'll create the annotation directly
    const id = `codeblock-${Date.now()}`;
    const codeText = codeEl.textContent || '';

    // Wrap the content manually
    const wrapper = document.createElement('mark');
    wrapper.className = 'annotation-highlight';
    wrapper.dataset.bindId = id;

    // Extract and wrap content
    range.surroundContents(wrapper);

    // Add the appropriate class
    if (type === AnnotationType.DELETION) {
      wrapper.classList.add('deletion');
    } else if (type === AnnotationType.COMMENT) {
      wrapper.classList.add('comment');
    }

    // Create the annotation
    const newAnnotation: Annotation = {
      id,
      blockId: hoveredCodeBlock.block.id,
      startOffset: 0,
      endOffset: codeText.length,
      type,
      text,
      originalText: codeText,
      createdA: Date.now(),
      author: getIdentity(),
    };

    onAddAnnotationRef.current(newAnnotation);

    // Clear selection
    selection?.removeAllRanges();
    setHoveredCodeBlock(null);
  };

  const handleCodeBlockToolbarClose = () => {
    setHoveredCodeBlock(null);
  };

  return (
    <div className="relative z-50 w-full max-w-3xl">
      
      <article
        ref={containerRef}
        className="w-full max-w-3xl bg-card border border-border/50 rounded-xl shadow-xl p-5 md:p-10 lg:p-14 relative"
      >
        {/* Copy plan button */}
        <button
          onClick={() => handleCopyNote(markdown)}
          className={`absolute top-3 right-3 md:top-5 md:right-5 flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-md transition-colors ${noteAnimationClass} ${noteButtonClass}`}
          title={noteCopied ? 'Copiado!' : 'Copiar nota'}
        >
          {noteCopied ? (
            <>
              <svg className={`w-3.5 h-3.5 text-green-500 ${noteIconClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Copiado!
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copiar nota
            </>
          )}
        </button>
        {blocks.map((block, index) => (
          <div
            key={block.id}
            className={`rounded-lg transition-all ${focusedBlockIndex === index ? 'block-focused ring-2 ring-primary ring-offset-2' : ''}`}
          >
            {block.type === 'code' ? (
              <CodeBlock
                block={block}
                onHover={(element) => {
                  // Clear any pending leave timeout
                  if (hoverTimeoutRef.current) {
                    clearTimeout(hoverTimeoutRef.current);
                    hoverTimeoutRef.current = null;
                  }
                  // Cancel exit animation if re-entering
                  setIsCodeBlockToolbarExiting(false);
                  // Only show hover toolbar if no selection toolbar is active
                  if (!toolbarState) {
                    setHoveredCodeBlock({ block, element });
                  }
                }}
                onLeave={() => {
                  // Delay then start exit animation
                  hoverTimeoutRef.current = setTimeout(() => {
                    setIsCodeBlockToolbarExiting(true);
                    // After exit animation, unmount
                    setTimeout(() => {
                      setHoveredCodeBlock(null);
                      setIsCodeBlockToolbarExiting(false);
                    }, 150);
                  }, 100);
                }}
                isHovered={hoveredCodeBlock?.block.id === block.id}
              />
            ) : (
              <BlockRenderer
                block={block}
                blocks={blocks}
                onBlockChange={onBlockChange}
                isEditMode={mode === 'edit'}
              />
            )}
          </div>
        ))}

        <Toolbar
          highlightElement={toolbarState?.element ?? null}
          onAnnotate={handleAnnotate}
          onClose={handleToolbarClose}
        />

        {/* Code block hover toolbar */}
        {hoveredCodeBlock && !toolbarState && (
          <CodeBlockToolbar
            element={hoveredCodeBlock.element}
            onAnnotate={handleCodeBlockAnnotate}
            onClose={handleCodeBlockToolbarClose}
            isExiting={isCodeBlockToolbarExiting}
            onMouseEnter={() => {
              if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
                hoverTimeoutRef.current = null;
              }
              setIsCodeBlockToolbarExiting(false);
            }}
            onMouseLeave={() => {
              hoverTimeoutRef.current = setTimeout(() => {
                setIsCodeBlockToolbarExiting(true);
                setTimeout(() => {
                  setHoveredCodeBlock(null);
                  setIsCodeBlockToolbarExiting(false);
                }, 150);
              }, 100);
            }}
          />
        )}
      </article>
    </div>
  );
});

/**
 * Renders inline markdown: **bold**, *italic*, `code`, [links](url), ![images](url)
 * Images are wrapped with ImageAnnotator for drawing tools
 */
const InlineMarkdown: React.FC<{ text: string }> = ({ text }) => {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Images: ![alt](url) - must check before links
    let match = remaining.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (match) {
      const alt = match[1];
      const src = match[2];
      const imageId = `img-${key}-${src.slice(-20)}`; // ID único para a imagem

      parts.push(
        <AnnotatedImage key={key++} src={src} alt={alt} imageId={imageId} />
      );
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Bold: **text**
    match = remaining.match(/^\*\*(.+?)\*\*/);
    if (match) {
      parts.push(<strong key={key++} className="font-semibold">{match[1]}</strong>);
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Italic: *text*
    match = remaining.match(/^\*(.+?)\*/);
    if (match) {
      parts.push(<em key={key++}>{match[1]}</em>);
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Inline code: `code`
    match = remaining.match(/^`([^`]+)`/);
    if (match) {
      parts.push(
        <code key={key++} className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">
          {match[1]}
        </code>
      );
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Links: [text](url)
    match = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (match) {
      parts.push(
        <a
          key={key++}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2 hover:text-primary/80"
        >
          {match[1]}
        </a>
      );
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Find next special character or consume one regular character
    const nextSpecial = remaining.slice(1).search(/[\*`\[!]/);
    if (nextSpecial === -1) {
      parts.push(remaining);
      break;
    } else {
      parts.push(remaining.slice(0, nextSpecial + 1));
      remaining = remaining.slice(nextSpecial + 1);
    }
  }

  return <>{parts}</>;
};

/**
 * Componente wrapper para imagens com anotação
 * Gerencia o estado de anotações por imagem
 */
const AnnotatedImage: React.FC<{
  src: string;
  alt: string;
  imageId: string;
}> = ({ src, alt, imageId }) => {
  // Estado local para as anotações desta imagem específica
  const [strokes, setStrokes] = useState<Stroke[]>([]);

  return (
    <span className="inline-block my-2">
      <ImageAnnotator
        src={src}
        alt={alt}
        onAnnotationsChange={setStrokes}
        initialStrokes={strokes}
      />
    </span>
  );
};

const parseTableContent = (content: string): { headers: string[]; rows: string[][] } => {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseRow = (line: string): string[] => {
    // Remove leading/trailing pipes and split by |
    return line
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map(cell => cell.trim());
  };

  const headers = parseRow(lines[0]);
  const rows: string[][] = [];

  // Skip the separator line (contains dashes) and parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    // Skip separator lines (contain only dashes, pipes, colons, spaces)
    if (/^[\|\-:\s]+$/.test(line)) continue;
    rows.push(parseRow(line));
  }

  return { headers, rows };
};

/**
 * Helper to map Lucide icon names to components
 */
function getLucideIcon(iconName: string): React.ComponentType<{ size?: number; className?: string }> {
  // Converter 'alert-triangle' → 'AlertTriangle'
  const componentName = iconName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  const Icon = (LucideIcons as any)[componentName];
  return Icon || LucideIcons.Pencil; // fallback
}

/**
 * Security: Sanitize Mermaid SVG output to prevent XSS attacks
 * Removes dangerous tags and attributes while preserving SVG functionality
 */
function sanitizeMermaidSVG(svg: string): string {
  return DOMPurify.sanitize(svg, {
    USE_PROFILES: { svg: true },
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
    ALLOWED_TAGS: ['svg', 'g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'text', 'tspan', 'defs', 'marker', 'use', 'foreignObject', 'style'],
    KEEP_CONTENT: false
  });
}

/**
 * Custom code renderer for Mermaid diagrams
 */
const MermaidRenderer: React.FC<any> = (props) => {
  const { children, className, node, inline, ...rest } = props;
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Extract language from className
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';

  // Get text content
  const code = String(children).replace(/\n$/, '');

  useEffect(() => {
    if (!inline && language === 'mermaid' && code) {
      const renderDiagram = async () => {
        try {
          // Initialize mermaid with safe config
          mermaid.initialize({
            startOnLoad: false,
            theme: 'base',
            themeVariables: {
              primaryColor: '#8b5cf6',
              primaryTextColor: '#fff',
              primaryBorderColor: '#7c3aed',
              lineColor: '#a78bfa',
              secondaryColor: '#06b6d4',
              tertiaryColor: '#f59e0b',
              background: '#1f2937',
              mainBkg: '#374151',
              secondBkg: '#4b5563',
              textColor: '#e5e7eb',
              border1: '#6b7280',
              border2: '#9ca3af',
            },
            securityLevel: 'loose',
            flowchart: {
              useMaxWidth: true,
              htmlLabels: true,
              curve: 'basis',
            },
          });

          const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const result = await mermaid.render(id, code);

          // Security: Sanitize SVG before rendering to prevent XSS
          const cleanSvg = sanitizeMermaidSVG(result.svg);
          setSvg(cleanSvg);
          setError(null);
        } catch (err) {
          console.error('Mermaid rendering error:', err);
          setError(err instanceof Error ? err.message : 'Failed to render diagram');
        }
      };

      renderDiagram();
    }
  }, [code, language, inline]);

  // Handle Mermaid diagrams
  if (!inline && language === 'mermaid') {
    if (error) {
      return (
        <div className="p-4 my-4 bg-destructive/10 border border-destructive rounded text-destructive text-sm">
          <strong>Mermaid Error:</strong> {error}
          <pre className="mt-2 text-xs opacity-75 overflow-auto">{code}</pre>
        </div>
      );
    }
    if (svg) {
      return <div className="mermaid-diagram my-4" dangerouslySetInnerHTML={{ __html: svg }} />;
    }
    return <div className="my-4 text-muted-foreground">Rendering diagram...</div>;
  }

  // Regular code blocks and inline code
  return <code className={className} {...rest}>{children}</code>;
};

/**
 * Renders a callout block with icon, title, and collapsible functionality
 */
const CalloutBlock: React.FC<{ block: Block }> = ({ block }) => {
  const [isCollapsed, setIsCollapsed] = useState(
    block.defaultCollapsed ?? false
  );

  const config = getCalloutConfig(block.calloutType || 'note');
  const Icon = getLucideIcon(config.icon);
  const ChevronDown = LucideIcons.ChevronDown;

  const handleToggle = () => {
    if (block.isCollapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div
      className={`callout callout-${block.calloutType} ${block.isCollapsible ? 'is-collapsible' : ''} ${isCollapsed ? 'is-collapsed' : ''}`}
      style={{
        '--callout-color': config.color,
        borderLeftColor: config.color,
      } as React.CSSProperties}
      data-block-id={block.id}
    >
      <div
        className="callout-title"
        onClick={handleToggle}
        style={{ cursor: block.isCollapsible ? 'pointer' : 'default' }}
      >
        <div className="callout-icon" style={{ color: config.color }}>
          <Icon size={16} />
        </div>

        <div className="callout-title-inner">
          {block.calloutTitle || block.calloutType}
        </div>

        {block.isCollapsible && (
          <div className={`callout-fold ${isCollapsed ? 'is-collapsed' : ''}`}>
            <ChevronDown size={16} />
          </div>
        )}
      </div>

      {!isCollapsed && (
        <div className="callout-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code: MermaidRenderer,
              ul: ({ node, ...props }) => (
                <ul style={{ listStyleType: 'disc', paddingLeft: '2rem', marginLeft: 0 }} {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol style={{ listStyleType: 'decimal', paddingLeft: '2rem', marginLeft: 0 }} {...props} />
              ),
              li: ({ node, ordered, ...props }) => (
                <li style={{ display: 'list-item', listStylePosition: 'outside' }} {...props} />
              ),
            }}
          >
            {block.content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};

const BlockRenderer: React.FC<{
  block: Block;
  blocks?: Block[];
  onBlockChange?: (blocks: Block[]) => void;
  isEditMode?: boolean;
}> = ({ block, blocks, onBlockChange, isEditMode = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(block.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(block.content);
  }, [block.content]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [isEditing]);

  const handleSave = () => {
    if (blocks && onBlockChange && editValue !== block.content) {
      const updatedBlocks = blocks.map(b =>
        b.id === block.id ? { ...b, content: editValue } : b
      );
      onBlockChange(updatedBlocks);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(block.content);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };
  switch (block.type) {    case 'frontmatter':
      return (
        <div
          className="mb-6 p-4 bg-muted/30 border border-border/30 rounded-lg"
          data-block-id={block.id}
        >
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-semibold">
            Frontmatter YAML
          </div>
          <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap">
            {block.content}
          </pre>
        </div>
      );

    case 'heading':
      const Tag = `h${block.level || 1}` as keyof JSX.IntrinsicElements;
      const styles = {
        1: 'text-2xl font-bold mb-4 mt-6 first:mt-0 tracking-tight',
        2: 'text-xl font-semibold mb-3 mt-8 text-foreground/90',
        3: 'text-base font-semibold mb-2 mt-6 text-foreground/80',
      }[block.level || 1] || 'text-base font-semibold mb-2 mt-4';

      if (isEditing) {
        return (
          <div className="mb-4 relative group" data-block-id={block.id}>
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSave();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  handleCancel();
                }
              }}
              className={`w-full p-2 bg-muted/30 border-2 border-primary/50 rounded-lg ${styles} focus:outline-none focus:border-primary`}
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSave}
                className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
              >
                Salvar (Enter)
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 text-xs font-medium bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors"
              >
                Cancelar (Esc)
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="relative group" data-block-id={block.id}>
          <Tag className={styles}>
            <InlineMarkdown text={block.content} />
          </Tag>
          {isEditMode && (
            <button
              onClick={() => setIsEditing(true)}
              className="absolute -right-8 top-0 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
              title="Editar este título"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
        </div>
      );

    case 'callout':
      return <CalloutBlock block={block} />;

    case 'blockquote':
      return (
        <blockquote
          className="border-l-2 border-primary/50 pl-4 my-4 text-muted-foreground italic"
          data-block-id={block.id}
        >
          <InlineMarkdown text={block.content} />
        </blockquote>
      );

    case 'list-item':
      return (
        <div className="flex gap-3 my-1.5" data-block-id={block.id}>
          <span className="text-primary/60 select-none">â€¢</span>
          <span className="text-foreground/90 text-sm leading-relaxed"><InlineMarkdown text={block.content} /></span>
        </div>
      );

    case 'code':
      return <CodeBlock block={block} />;

    case 'table': {
      const { headers, rows } = parseTableContent(block.content);
      return (
        <div className="my-4 overflow-x-auto" data-block-id={block.id}>
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border">
                {headers.map((header, i) => (
                  <th
                    key={i}
                    className="px-3 py-2 text-left font-semibold text-foreground/90 bg-muted/30"
                  >
                    <InlineMarkdown text={header} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => (
                <tr key={rowIdx} className="border-b border-border/50 hover:bg-muted/20">
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="px-3 py-2 text-foreground/80">
                      <InlineMarkdown text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case 'hr':
      return <hr className="border-border/30 my-8" data-block-id={block.id} />;

    default:
      if (isEditing) {
        return (
          <div className="mb-4 relative group" data-block-id={block.id}>
            <textarea
              ref={textareaRef}
              value={editValue}
              onChange={(e) => {
                setEditValue(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              onKeyDown={handleKeyDown}
              className="w-full p-3 bg-muted/30 border-2 border-primary/50 rounded-lg text-foreground/90 text-[15px] leading-relaxed resize-none focus:outline-none focus:border-primary"
              rows={1}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSave}
                className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
              >
                Salvar (Ctrl+Enter)
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 text-xs font-medium bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors"
              >
                Cancelar (Esc)
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="relative group mb-4" data-block-id={block.id}>
          <p className="leading-relaxed text-foreground/90 text-[15px]">
            <InlineMarkdown text={block.content} />
          </p>
          {isEditMode && (
            <button
              onClick={() => setIsEditing(true)}
              className="absolute -right-8 top-0 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
              title="Editar este parágrafo"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
        </div>
      );
  }
};

interface CodeBlockProps {
  block: Block;
  onHover: (element: HTMLElement) => void;
  onLeave: () => void;
  isHovered: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ block, onHover, onLeave, isHovered }) => {
  // Use copy feedback hook for animations
  const {
    copied,
    handleCopy,
    animationClass,
    buttonClass,
    iconClass,
  } = useCopyFeedback();

  const containerRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLElement>(null);

  // Highlight code block on mount and when content/language changes
  useEffect(() => {
    if (codeRef.current) {
      // Reset any previous highlighting
      codeRef.current.removeAttribute('data-highlighted');
      codeRef.current.className = `hljs font-mono${block.language ? ` language-${block.language}` : ''}`;
      hljs.highlightElement(codeRef.current);
    }
  }, [block.content, block.language]);

  const handleMouseEnter = () => {
    if (containerRef.current) {
      onHover(containerRef.current);
    }
  };

  // Build className for code element
  const codeClassName = `hljs font-mono${block.language ? ` language-${block.language}` : ''}`;

  return (
    <div
      ref={containerRef}
      className="relative group my-5"
      data-block-id={block.id}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onLeave}
    >
      <button
        onClick={() => handleCopy(block.content)}
        className={`absolute top-2 right-2 p-1.5 rounded-md bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity z-10 ${animationClass} ${buttonClass}`}
        title={copied ? 'Copiado!' : 'Copiar código'}
      >
        {copied ? (
          <svg className={`w-4 h-4 copy-check-animated ${iconClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>
      <pre className="rounded-lg text-[13px] overflow-x-auto bg-muted/50 border border-border/30">
        <code ref={codeRef} className={codeClassName}>{block.content}</code>
      </pre>
    </div>
  );
};

const CodeBlockToolbar: React.FC<{
  element: HTMLElement;
  onAnnotate: (type: AnnotationType, text?: string) => void;
  onClose: () => void;
  isExiting: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}> = ({ element, onAnnotate, onClose, isExiting, onMouseEnter, onMouseLeave }) => {
  const [step, setStep] = useState<'menu' | 'input'>('menu');
  const [inputValue, setInputValue] = useState('');
  const [position, setPosition] = useState<{ top: number; right: number }>({ top: 0, right: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 'input') inputRef.current?.focus();
  }, [step]);

  // Update position on scroll/resize
  useEffect(() => {
    const updatePosition = () => {
      const rect = element.getBoundingClientRect();
      setPosition({
        top: rect.top - 40,
        right: window.innerWidth - rect.right,
      });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [element]);

  const { top, right } = position;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAnnotate(AnnotationType.COMMENT, inputValue);
    }
  };

  return createPortal(
    <div
      className="annotation-toolbar fixed z-[100] bg-popover border border-border rounded-lg shadow-2xl"
      style={{
        top,
        right,
        animation: isExiting ? 'code-toolbar-out 0.15s ease-in forwards' : 'code-toolbar-in 0.2s ease-out',
      }}
      onMouseDown={e => e.stopPropagation()}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <style>{`
        @keyframes code-toolbar-in {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes code-toolbar-out {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(8px);
          }
        }
      `}</style>
      {step === 'menu' ? (
        <div className="flex items-center p-1 gap-0.5">
          <button
            onClick={() => onAnnotate(AnnotationType.DELETION)}
            title="Delete"
            className="p-1.5 rounded-md transition-colors text-destructive hover:bg-destructive/10"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button
            onClick={() => setStep('input')}
            title="Comment"
            className="p-1.5 rounded-md transition-colors text-accent hover:bg-accent/10"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </button>
          <div className="w-px h-5 bg-border mx-0.5" />
          <button
            onClick={onClose}
            title="Cancel"
            className="p-1.5 rounded-md transition-colors text-muted-foreground hover:bg-muted"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex items-start gap-1.5 p-1.5 pl-3">
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            className="bg-transparent border-none outline-none text-sm w-52 placeholder:text-muted-foreground resize-none"
            placeholder="Adicione um comentário..."
            rows={2}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Escape') setStep('menu');
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                if (inputValue.trim()) handleSubmit(e as unknown as React.FormEvent);
              }
            }}
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="px-2 py-1 text-xs font-medium rounded bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            Salvar
          </button>
          <button
            type="button"
            onClick={() => setStep('menu')}
            className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/15 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </form>
      )}
    </div>,
    document.body
  );
};
