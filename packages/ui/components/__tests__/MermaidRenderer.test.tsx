import { describe, test, expect, mock, beforeEach, afterEach } from 'bun:test';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import React, { useEffect, useState, useRef } from 'react';
import mermaid from 'mermaid';
import { sanitizeSvg } from '../../utils/sanitize';

/**
 * MermaidRenderer component extracted for testing purposes.
 * This mirrors the implementation in Viewer.tsx to test the mermaid rendering
 * and XSS protection in isolation.
 */
const MermaidRenderer: React.FC<{
  code: string;
  inline?: boolean;
  className?: string;
}> = ({ code, inline = false, className = 'language-mermaid' }) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';

  useEffect(() => {
    if (!inline && language === 'mermaid' && code) {
      const renderDiagram = async () => {
        try {
          mermaid.initialize({
            startOnLoad: false,
            theme: 'base',
            securityLevel: 'strict',
            flowchart: {
              useMaxWidth: true,
              htmlLabels: true,
              curve: 'basis',
            },
          });

          const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const result = await mermaid.render(id, code);

          setSvg(sanitizeSvg(result.svg));
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to render diagram');
        }
      };

      renderDiagram();
    }
  }, [code, language, inline]);

  if (!inline && language === 'mermaid') {
    if (error) {
      return (
        <div className="mermaid-error" data-testid="mermaid-error">
          <strong>Mermaid Error:</strong> {error}
          <pre data-testid="mermaid-error-code">{code}</pre>
        </div>
      );
    }
    if (svg) {
      return (
        <div
          className="mermaid-diagram"
          data-testid="mermaid-diagram"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      );
    }
    return <div data-testid="mermaid-loading">Rendering diagram...</div>;
  }

  return <code className={className}>{code}</code>;
};

describe('MermaidRenderer', () => {
  beforeEach(() => {
    // Reset mermaid mock state
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  describe('basic rendering', () => {
    test('renders loading state initially', () => {
      // Mock mermaid.render to never resolve (simulating loading)
      const originalRender = mermaid.render;
      mermaid.render = mock(() => new Promise(() => {})) as any;

      render(<MermaidRenderer code="graph TD\n  A-->B" />);

      expect(screen.getByTestId('mermaid-loading')).toBeDefined();
      expect(screen.getByText('Rendering diagram...')).toBeDefined();

      mermaid.render = originalRender;
    });

    test('renders SVG when mermaid succeeds', async () => {
      const safeSvg = '<svg viewBox="0 0 100 100"><rect width="50" height="50" fill="blue"/></svg>';

      const originalRender = mermaid.render;
      mermaid.render = mock(async () => ({ svg: safeSvg })) as any;

      render(<MermaidRenderer code="graph TD\n  A-->B" />);

      await waitFor(() => {
        expect(screen.getByTestId('mermaid-diagram')).toBeDefined();
      });

      const diagram = screen.getByTestId('mermaid-diagram');
      expect(diagram.innerHTML).toContain('<svg');
      expect(diagram.innerHTML).toContain('<rect');

      mermaid.render = originalRender;
    });

    test('renders regular code block when not mermaid language', () => {
      render(
        <MermaidRenderer
          code="const x = 1;"
          className="language-javascript"
        />
      );

      // Should render as regular code, not mermaid
      const codeEl = screen.getByText('const x = 1;');
      expect(codeEl.tagName.toLowerCase()).toBe('code');
    });

    test('renders regular code when inline is true', () => {
      render(
        <MermaidRenderer
          code="graph TD"
          inline={true}
          className="language-mermaid"
        />
      );

      const codeEl = screen.getByText('graph TD');
      expect(codeEl.tagName.toLowerCase()).toBe('code');
    });
  });

  describe('XSS protection', () => {
    test('strips script tags from mermaid output', async () => {
      const maliciousSvg = `<svg viewBox="0 0 100 100">
        <script>alert('XSS')</script>
        <rect width="50" height="50"/>
      </svg>`;

      const originalRender = mermaid.render;
      mermaid.render = mock(async () => ({ svg: maliciousSvg })) as any;

      render(<MermaidRenderer code="graph TD\n  A-->B" />);

      await waitFor(() => {
        expect(screen.getByTestId('mermaid-diagram')).toBeDefined();
      });

      const diagram = screen.getByTestId('mermaid-diagram');
      expect(diagram.innerHTML).not.toContain('<script');
      expect(diagram.innerHTML).not.toContain('alert');
      expect(diagram.innerHTML).toContain('<rect');

      mermaid.render = originalRender;
    });

    test('strips onclick event handlers from mermaid output', async () => {
      const maliciousSvg = `<svg viewBox="0 0 100 100">
        <rect onclick="alert('XSS')" width="50" height="50"/>
      </svg>`;

      const originalRender = mermaid.render;
      mermaid.render = mock(async () => ({ svg: maliciousSvg })) as any;

      render(<MermaidRenderer code="graph TD\n  A-->B" />);

      await waitFor(() => {
        expect(screen.getByTestId('mermaid-diagram')).toBeDefined();
      });

      const diagram = screen.getByTestId('mermaid-diagram');
      expect(diagram.innerHTML).not.toContain('onclick');
      expect(diagram.innerHTML).toContain('<rect');

      mermaid.render = originalRender;
    });

    test('strips onerror event handlers from mermaid output', async () => {
      const maliciousSvg = `<svg viewBox="0 0 100 100">
        <image href="x" onerror="alert('XSS')"/>
      </svg>`;

      const originalRender = mermaid.render;
      mermaid.render = mock(async () => ({ svg: maliciousSvg })) as any;

      render(<MermaidRenderer code="graph TD\n  A-->B" />);

      await waitFor(() => {
        expect(screen.getByTestId('mermaid-diagram')).toBeDefined();
      });

      const diagram = screen.getByTestId('mermaid-diagram');
      expect(diagram.innerHTML).not.toContain('onerror');

      mermaid.render = originalRender;
    });

    test('strips onload event handlers from mermaid output', async () => {
      const maliciousSvg = `<svg onload="alert('XSS')" viewBox="0 0 100 100">
        <rect width="50" height="50"/>
      </svg>`;

      const originalRender = mermaid.render;
      mermaid.render = mock(async () => ({ svg: maliciousSvg })) as any;

      render(<MermaidRenderer code="graph TD\n  A-->B" />);

      await waitFor(() => {
        expect(screen.getByTestId('mermaid-diagram')).toBeDefined();
      });

      const diagram = screen.getByTestId('mermaid-diagram');
      expect(diagram.innerHTML).not.toContain('onload');
      expect(diagram.innerHTML).toContain('<rect');

      mermaid.render = originalRender;
    });

    test('strips foreignObject elements from mermaid output', async () => {
      const maliciousSvg = `<svg viewBox="0 0 100 100">
        <foreignObject width="100" height="100">
          <div xmlns="http://www.w3.org/1999/xhtml">
            <script>alert('XSS')</script>
          </div>
        </foreignObject>
        <rect width="50" height="50"/>
      </svg>`;

      const originalRender = mermaid.render;
      mermaid.render = mock(async () => ({ svg: maliciousSvg })) as any;

      render(<MermaidRenderer code="graph TD\n  A-->B" />);

      await waitFor(() => {
        expect(screen.getByTestId('mermaid-diagram')).toBeDefined();
      });

      const diagram = screen.getByTestId('mermaid-diagram');
      expect(diagram.innerHTML).not.toContain('<foreignObject');
      expect(diagram.innerHTML).not.toContain('script');
      expect(diagram.innerHTML).toContain('<rect');

      mermaid.render = originalRender;
    });

    test('strips javascript: URLs from mermaid output', async () => {
      const maliciousSvg = `<svg viewBox="0 0 100 100">
        <a href="javascript:alert('XSS')">
          <rect width="50" height="50"/>
        </a>
      </svg>`;

      const originalRender = mermaid.render;
      mermaid.render = mock(async () => ({ svg: maliciousSvg })) as any;

      render(<MermaidRenderer code="graph TD\n  A-->B" />);

      await waitFor(() => {
        expect(screen.getByTestId('mermaid-diagram')).toBeDefined();
      });

      const diagram = screen.getByTestId('mermaid-diagram');
      expect(diagram.innerHTML).not.toContain('javascript:');

      mermaid.render = originalRender;
    });

    test('preserves valid mermaid SVG structure', async () => {
      const validMermaidSvg = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10">
            <path d="M0,0 L10,5 L0,10"/>
          </marker>
        </defs>
        <g class="output">
          <g class="clusters">
            <rect class="cluster" fill="#ECECFF" rx="5" ry="5"/>
          </g>
          <g class="edgePaths">
            <path class="edge" d="M0,0 L100,100" marker-end="url(#arrow)"/>
          </g>
          <g class="nodes">
            <rect class="node" fill="#ECECFF" stroke="#9370DB"/>
            <text class="nodeLabel">Node A</text>
          </g>
        </g>
      </svg>`;

      const originalRender = mermaid.render;
      mermaid.render = mock(async () => ({ svg: validMermaidSvg })) as any;

      render(<MermaidRenderer code="graph TD\n  A-->B" />);

      await waitFor(() => {
        expect(screen.getByTestId('mermaid-diagram')).toBeDefined();
      });

      const diagram = screen.getByTestId('mermaid-diagram');
      expect(diagram.innerHTML).toContain('<svg');
      expect(diagram.innerHTML).toContain('<defs');
      expect(diagram.innerHTML).toContain('<marker');
      expect(diagram.innerHTML).toContain('<path');
      expect(diagram.innerHTML).toContain('<rect');
      expect(diagram.innerHTML).toContain('<text');
      expect(diagram.innerHTML).toContain('Node A');

      mermaid.render = originalRender;
    });
  });

  describe('error handling', () => {
    test('displays error state for invalid mermaid syntax', async () => {
      const originalRender = mermaid.render;
      mermaid.render = mock(async () => {
        throw new Error('Parse error on line 1');
      }) as any;

      render(<MermaidRenderer code="invalid mermaid syntax ~~~" />);

      await waitFor(() => {
        expect(screen.getByTestId('mermaid-error')).toBeDefined();
      });

      expect(screen.getByText('Mermaid Error:')).toBeDefined();
      expect(screen.getByText(/Parse error on line 1/)).toBeDefined();
      expect(screen.getByTestId('mermaid-error-code').textContent).toContain('invalid mermaid syntax');

      mermaid.render = originalRender;
    });

    test('displays error state when mermaid throws non-Error object', async () => {
      const originalRender = mermaid.render;
      mermaid.render = mock(async () => {
        throw 'String error';
      }) as any;

      render(<MermaidRenderer code="invalid syntax" />);

      await waitFor(() => {
        expect(screen.getByTestId('mermaid-error')).toBeDefined();
      });

      expect(screen.getByText(/Failed to render diagram/)).toBeDefined();

      mermaid.render = originalRender;
    });

    test('shows original code in error state for debugging', async () => {
      const originalRender = mermaid.render;
      mermaid.render = mock(async () => {
        throw new Error('Syntax error');
      }) as any;

      const invalidCode = 'graph TD\n  A-->B-->';

      render(<MermaidRenderer code={invalidCode} />);

      await waitFor(() => {
        expect(screen.getByTestId('mermaid-error')).toBeDefined();
      });

      const errorCode = screen.getByTestId('mermaid-error-code');
      expect(errorCode.textContent).toBe(invalidCode);

      mermaid.render = originalRender;
    });
  });

  describe('security configuration', () => {
    test('mermaid is initialized with strict security level', async () => {
      const initializeSpy = mock(() => {});
      const originalInitialize = mermaid.initialize;
      const originalRender = mermaid.render;

      mermaid.initialize = initializeSpy;
      mermaid.render = mock(async () => ({ svg: '<svg></svg>' })) as any;

      render(<MermaidRenderer code="graph TD\n  A-->B" />);

      await waitFor(() => {
        expect(initializeSpy).toHaveBeenCalled();
      });

      const initConfig = initializeSpy.mock.calls[0][0] as any;
      expect(initConfig.securityLevel).toBe('strict');

      mermaid.initialize = originalInitialize;
      mermaid.render = originalRender;
    });
  });
});
