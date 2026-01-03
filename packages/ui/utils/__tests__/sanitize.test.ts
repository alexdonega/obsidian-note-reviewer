import { describe, test, expect, mock, beforeAll } from 'bun:test';

// Mock DOMPurify for consistent behavior in test environment
// The actual implementation uses isomorphic-dompurify which may behave differently
// with happy-dom vs jsdom vs real browser DOM
const mockSanitize = (input: string, config?: any): string => {
  if (!input || typeof input !== 'string') return '';
  if (input.trim() === '') return '';

  let result = input;

  // Remove dangerous tags
  const dangerousTags = ['script', 'foreignObject', 'iframe', 'object', 'embed', 'applet', 'base', 'meta', 'link'];
  for (const tag of dangerousTags) {
    // Remove opening and closing tags and their content for script
    if (tag === 'script') {
      result = result.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
    } else if (tag === 'foreignObject') {
      result = result.replace(/<foreignObject\b[^>]*>[\s\S]*?<\/foreignObject>/gi, '');
    } else {
      // Remove self-closing and opening tags
      result = result.replace(new RegExp(`<${tag}\\b[^>]*\\/?>`, 'gi'), '');
      result = result.replace(new RegExp(`</${tag}>`, 'gi'), '');
    }
  }

  // Remove event handlers (on* attributes)
  result = result.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
  result = result.replace(/\s+on\w+\s*=\s*[^\s>]+/gi, '');

  // Remove javascript: URLs
  result = result.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '');
  result = result.replace(/xlink:href\s*=\s*["']javascript:[^"']*["']/gi, '');

  return result;
};

mock.module('isomorphic-dompurify', () => ({
  default: {
    sanitize: mockSanitize,
  },
}));

// Re-import after mocking
import { sanitizeSvg, hasDangerousSvgContent } from '../sanitize';

describe('sanitizeSvg', () => {
  describe('removes dangerous elements', () => {
    test('removes script tags', () => {
      const maliciousSvg = `<svg>
        <script>alert('XSS')</script>
        <rect width="100" height="100"/>
      </svg>`;

      const sanitized = sanitizeSvg(maliciousSvg);

      expect(sanitized).not.toContain('<script');
      expect(sanitized).not.toContain('</script>');
      expect(sanitized).not.toContain("alert('XSS')");
      expect(sanitized).toContain('<rect');
    });

    test('removes foreignObject elements', () => {
      const maliciousSvg = `<svg>
        <foreignObject>
          <div xmlns="http://www.w3.org/1999/xhtml">
            <script>alert('XSS')</script>
          </div>
        </foreignObject>
        <circle cx="50" cy="50" r="25"/>
      </svg>`;

      const sanitized = sanitizeSvg(maliciousSvg);

      expect(sanitized).not.toContain('<foreignObject');
      expect(sanitized).not.toContain('</foreignObject>');
      expect(sanitized).toContain('<circle');
    });

    test('removes iframe elements', () => {
      const maliciousSvg = `<svg>
        <iframe src="javascript:alert('XSS')"></iframe>
        <text x="10" y="20">Hello</text>
      </svg>`;

      const sanitized = sanitizeSvg(maliciousSvg);

      expect(sanitized).not.toContain('<iframe');
      expect(sanitized).toContain('<text');
    });

    test('removes object and embed elements', () => {
      const maliciousSvg = `<svg>
        <object data="malicious.swf"></object>
        <embed src="malicious.swf"/>
        <path d="M10 10"/>
      </svg>`;

      const sanitized = sanitizeSvg(maliciousSvg);

      expect(sanitized).not.toContain('<object');
      expect(sanitized).not.toContain('<embed');
      expect(sanitized).toContain('<path');
    });
  });

  describe('removes event handlers', () => {
    test('removes onclick attribute', () => {
      const maliciousSvg = `<svg>
        <rect onclick="alert('XSS')" width="100" height="100"/>
      </svg>`;

      const sanitized = sanitizeSvg(maliciousSvg);

      expect(sanitized).not.toContain('onclick');
      expect(sanitized).toContain('<rect');
      expect(sanitized).toContain('width="100"');
    });

    test('removes onerror attribute', () => {
      const maliciousSvg = `<svg>
        <image href="x" onerror="alert('XSS')"/>
      </svg>`;

      const sanitized = sanitizeSvg(maliciousSvg);

      expect(sanitized).not.toContain('onerror');
    });

    test('removes onload attribute', () => {
      const maliciousSvg = `<svg onload="alert('XSS')">
        <rect width="100" height="100"/>
      </svg>`;

      const sanitized = sanitizeSvg(maliciousSvg);

      expect(sanitized).not.toContain('onload');
      expect(sanitized).toContain('<rect');
    });

    test('removes multiple event handlers', () => {
      const maliciousSvg = `<svg>
        <rect
          onmouseover="alert('hover')"
          onmouseout="alert('out')"
          onfocus="alert('focus')"
          onblur="alert('blur')"
          width="100"
          height="100"
        />
      </svg>`;

      const sanitized = sanitizeSvg(maliciousSvg);

      expect(sanitized).not.toContain('onmouseover');
      expect(sanitized).not.toContain('onmouseout');
      expect(sanitized).not.toContain('onfocus');
      expect(sanitized).not.toContain('onblur');
      expect(sanitized).toContain('width="100"');
      expect(sanitized).toContain('height="100"');
    });

    test('removes touch event handlers', () => {
      const maliciousSvg = `<svg>
        <rect
          ontouchstart="alert('touch')"
          ontouchmove="alert('move')"
          ontouchend="alert('end')"
          width="100"
          height="100"
        />
      </svg>`;

      const sanitized = sanitizeSvg(maliciousSvg);

      expect(sanitized).not.toContain('ontouchstart');
      expect(sanitized).not.toContain('ontouchmove');
      expect(sanitized).not.toContain('ontouchend');
    });
  });

  describe('preserves valid SVG elements', () => {
    test('preserves path elements', () => {
      const validSvg = `<svg>
        <path d="M10 10 L90 90" fill="none" stroke="black"/>
      </svg>`;

      const sanitized = sanitizeSvg(validSvg);

      expect(sanitized).toContain('<path');
      expect(sanitized).toContain('d="M10 10 L90 90"');
      expect(sanitized).toContain('fill="none"');
      expect(sanitized).toContain('stroke="black"');
    });

    test('preserves rect elements', () => {
      const validSvg = `<svg>
        <rect x="10" y="10" width="80" height="80" rx="5" fill="blue"/>
      </svg>`;

      const sanitized = sanitizeSvg(validSvg);

      expect(sanitized).toContain('<rect');
      expect(sanitized).toContain('width="80"');
      expect(sanitized).toContain('height="80"');
      expect(sanitized).toContain('fill="blue"');
    });

    test('preserves circle elements', () => {
      const validSvg = `<svg>
        <circle cx="50" cy="50" r="40" stroke="green" fill="yellow"/>
      </svg>`;

      const sanitized = sanitizeSvg(validSvg);

      expect(sanitized).toContain('<circle');
      expect(sanitized).toContain('cx="50"');
      expect(sanitized).toContain('cy="50"');
      expect(sanitized).toContain('r="40"');
    });

    test('preserves text elements', () => {
      const validSvg = `<svg>
        <text x="20" y="35" font-family="Arial">Hello, SVG!</text>
      </svg>`;

      const sanitized = sanitizeSvg(validSvg);

      expect(sanitized).toContain('<text');
      expect(sanitized).toContain('Hello, SVG!');
      expect(sanitized).toContain('font-family="Arial"');
    });

    test('preserves g (group) elements', () => {
      const validSvg = `<svg>
        <g id="group1" transform="translate(10, 10)">
          <rect width="50" height="50"/>
          <circle cx="25" cy="25" r="20"/>
        </g>
      </svg>`;

      const sanitized = sanitizeSvg(validSvg);

      expect(sanitized).toContain('<g');
      expect(sanitized).toContain('id="group1"');
      expect(sanitized).toContain('transform="translate(10, 10)"');
      expect(sanitized).toContain('<rect');
      expect(sanitized).toContain('<circle');
    });

    test('preserves defs and gradient elements', () => {
      const validSvg = `<svg>
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:rgb(255,255,0)"/>
            <stop offset="100%" style="stop-color:rgb(255,0,0)"/>
          </linearGradient>
        </defs>
        <rect fill="url(#grad1)" width="100" height="100"/>
      </svg>`;

      const sanitized = sanitizeSvg(validSvg);

      expect(sanitized).toContain('<defs');
      expect(sanitized).toContain('<linearGradient');
      expect(sanitized).toContain('<stop');
    });

    test('preserves marker elements', () => {
      const validSvg = `<svg>
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="black"/>
          </marker>
        </defs>
        <line x1="0" y1="0" x2="90" y2="90" marker-end="url(#arrow)"/>
      </svg>`;

      const sanitized = sanitizeSvg(validSvg);

      expect(sanitized).toContain('<marker');
      expect(sanitized).toContain('marker-end');
    });

    test('preserves clipPath elements', () => {
      const validSvg = `<svg>
        <defs>
          <clipPath id="clip">
            <rect width="50" height="50"/>
          </clipPath>
        </defs>
        <circle cx="50" cy="50" r="40" clip-path="url(#clip)"/>
      </svg>`;

      const sanitized = sanitizeSvg(validSvg);

      expect(sanitized).toContain('<clipPath');
      expect(sanitized).toContain('clip-path');
    });
  });

  describe('handles edge cases gracefully', () => {
    test('returns empty string for empty input', () => {
      expect(sanitizeSvg('')).toBe('');
    });

    test('returns empty string for null input', () => {
      expect(sanitizeSvg(null as unknown as string)).toBe('');
    });

    test('returns empty string for undefined input', () => {
      expect(sanitizeSvg(undefined as unknown as string)).toBe('');
    });

    test('returns empty string for non-string input', () => {
      expect(sanitizeSvg(123 as unknown as string)).toBe('');
      expect(sanitizeSvg({} as unknown as string)).toBe('');
      expect(sanitizeSvg([] as unknown as string)).toBe('');
    });

    test('handles malformed SVG without throwing', () => {
      const malformedSvg = '<svg><rect width="100" height="100">';

      expect(() => sanitizeSvg(malformedSvg)).not.toThrow();
    });

    test('handles SVG with only dangerous content', () => {
      const onlyDangerousSvg = '<script>alert("XSS")</script>';

      const sanitized = sanitizeSvg(onlyDangerousSvg);

      expect(sanitized).not.toContain('script');
      expect(sanitized).not.toContain('alert');
    });

    test('handles deeply nested dangerous elements', () => {
      const nestedMaliciousSvg = `<svg>
        <g>
          <g>
            <g>
              <script>alert('nested XSS')</script>
              <rect width="50" height="50"/>
            </g>
          </g>
        </g>
      </svg>`;

      const sanitized = sanitizeSvg(nestedMaliciousSvg);

      expect(sanitized).not.toContain('<script');
      expect(sanitized).toContain('<rect');
    });

    test('handles whitespace-only input', () => {
      expect(sanitizeSvg('   ')).toBe('');
    });
  });

  describe('mermaid-specific elements', () => {
    test('preserves common mermaid SVG structure', () => {
      const mermaidSvg = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <g class="output">
          <g class="clusters">
            <rect class="cluster" fill="#ECECFF" rx="5" ry="5"/>
          </g>
          <g class="edgePaths">
            <path class="edge" d="M0,0 L100,100" marker-end="url(#arrow)"/>
          </g>
          <g class="edgeLabels">
            <text class="edgeLabel" x="50" y="50">Label</text>
          </g>
          <g class="nodes">
            <rect class="node" fill="#ECECFF" stroke="#9370DB"/>
            <text class="nodeLabel">Node</text>
          </g>
        </g>
      </svg>`;

      const sanitized = sanitizeSvg(mermaidSvg);

      expect(sanitized).toContain('viewBox');
      expect(sanitized).toContain('class="output"');
      expect(sanitized).toContain('marker-end');
      // Check for stroke attribute (either stroke-width or stroke color)
      expect(sanitized.includes('stroke-width') || sanitized.includes('stroke="#9370DB"')).toBe(true);
    });
  });
});

describe('hasDangerousSvgContent', () => {
  describe('detects dangerous content', () => {
    test('detects script tags', () => {
      const malicious = '<svg><script>alert("XSS")</script></svg>';
      expect(hasDangerousSvgContent(malicious)).toBe(true);
    });

    test('detects script tags case-insensitively', () => {
      const malicious = '<svg><SCRIPT>alert("XSS")</SCRIPT></svg>';
      expect(hasDangerousSvgContent(malicious)).toBe(true);
    });

    test('detects foreignObject elements', () => {
      const malicious = '<svg><foreignObject><div>Evil</div></foreignObject></svg>';
      expect(hasDangerousSvgContent(malicious)).toBe(true);
    });

    test('detects onclick event handler', () => {
      const malicious = '<svg><rect onclick="alert(1)"/></svg>';
      expect(hasDangerousSvgContent(malicious)).toBe(true);
    });

    test('detects onerror event handler', () => {
      const malicious = '<svg><image onerror="alert(1)"/></svg>';
      expect(hasDangerousSvgContent(malicious)).toBe(true);
    });

    test('detects onload event handler', () => {
      const malicious = '<svg onload="alert(1)"></svg>';
      expect(hasDangerousSvgContent(malicious)).toBe(true);
    });

    test('detects javascript: URLs', () => {
      const malicious = '<svg><a href="javascript:alert(1)">Click</a></svg>';
      expect(hasDangerousSvgContent(malicious)).toBe(true);
    });

    test('detects data: URLs with HTML content', () => {
      const malicious = '<svg><image href="data:text/html,<script>alert(1)</script>"/></svg>';
      expect(hasDangerousSvgContent(malicious)).toBe(true);
    });
  });

  describe('returns false for safe content', () => {
    test('returns false for valid SVG', () => {
      const safe = '<svg><rect width="100" height="100"/></svg>';
      expect(hasDangerousSvgContent(safe)).toBe(false);
    });

    test('returns false for empty string', () => {
      expect(hasDangerousSvgContent('')).toBe(false);
    });

    test('returns false for null input', () => {
      expect(hasDangerousSvgContent(null as unknown as string)).toBe(false);
    });

    test('returns false for undefined input', () => {
      expect(hasDangerousSvgContent(undefined as unknown as string)).toBe(false);
    });

    test('returns false for complex but safe mermaid SVG', () => {
      const safeMermaid = `<svg viewBox="0 0 200 200">
        <defs>
          <marker id="arrow">
            <path d="M0,0 L10,5 L0,10"/>
          </marker>
        </defs>
        <g class="flowchart">
          <rect class="node"/>
          <text>Node Label</text>
          <path marker-end="url(#arrow)"/>
        </g>
      </svg>`;
      expect(hasDangerousSvgContent(safeMermaid)).toBe(false);
    });
  });
});
