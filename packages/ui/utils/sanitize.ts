/**
 * SVG Sanitization Utility
 *
 * Provides XSS protection for SVG content rendered with dangerouslySetInnerHTML.
 * Uses DOMPurify with SVG-specific configuration to allow safe SVG elements
 * while removing dangerous elements and event handlers.
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * DOMPurify configuration for SVG sanitization
 *
 * - USE_PROFILES.svg: Enables SVG-specific element allowlist
 * - FORBID_TAGS: Blocks dangerous elements that could execute code
 * - FORBID_ATTR: Blocks event handler attributes and other dangerous attributes
 * - ADD_TAGS: Allows additional SVG elements commonly used by mermaid
 */
const SVG_SANITIZE_CONFIG: DOMPurify.Config = {
  USE_PROFILES: { svg: true, svgFilters: true },
  FORBID_TAGS: [
    'script',
    'foreignObject',
    'iframe',
    'object',
    'embed',
    'applet',
    'base',
    'meta',
    'link',
    'form',
    'input',
    'button',
    'textarea',
    'select',
  ],
  FORBID_ATTR: [
    // Event handlers
    'onclick',
    'ondblclick',
    'onmousedown',
    'onmouseup',
    'onmouseover',
    'onmousemove',
    'onmouseout',
    'onmouseenter',
    'onmouseleave',
    'onkeydown',
    'onkeypress',
    'onkeyup',
    'onfocus',
    'onblur',
    'onload',
    'onunload',
    'onerror',
    'onabort',
    'onchange',
    'onsubmit',
    'onreset',
    'onscroll',
    'onresize',
    'ondrag',
    'ondrop',
    'oncopy',
    'oncut',
    'onpaste',
    'oncontextmenu',
    'onwheel',
    'ontouchstart',
    'ontouchmove',
    'ontouchend',
    'ontouchcancel',
    'onpointerdown',
    'onpointermove',
    'onpointerup',
    'onpointercancel',
    'onanimationstart',
    'onanimationend',
    'onanimationiteration',
    'ontransitionend',
    // Other potentially dangerous attributes
    'xlink:href',  // Can be used for XSS in older browsers
    'formaction',
    'srcdoc',
  ],
  // Allow additional SVG elements commonly used by mermaid
  ADD_TAGS: [
    'marker',
    'pattern',
    'mask',
    'clipPath',
    'symbol',
    'use',
    'linearGradient',
    'radialGradient',
    'stop',
    'animate',
    'animateTransform',
    'animateMotion',
    'set',
  ],
  // Allow common SVG attributes used by mermaid
  ADD_ATTR: [
    'marker-end',
    'marker-start',
    'marker-mid',
    'viewBox',
    'preserveAspectRatio',
    'xmlns',
    'xmlns:xlink',
    'fill-opacity',
    'stroke-opacity',
    'stroke-width',
    'stroke-dasharray',
    'stroke-linecap',
    'stroke-linejoin',
    'font-family',
    'font-size',
    'font-weight',
    'text-anchor',
    'dominant-baseline',
    'alignment-baseline',
    'clip-path',
  ],
  // Return the full document including the svg root
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
};

/**
 * Sanitize SVG content to prevent XSS attacks
 *
 * This function removes potentially dangerous elements and attributes from SVG
 * content while preserving the valid SVG structure needed for rendering.
 *
 * @param svg - The raw SVG string to sanitize
 * @returns The sanitized SVG string safe for use with dangerouslySetInnerHTML
 *
 * @example
 * ```typescript
 * const safeSvg = sanitizeSvg(mermaidOutput);
 * return <div dangerouslySetInnerHTML={{ __html: safeSvg }} />;
 * ```
 */
export function sanitizeSvg(svg: string): string {
  // Handle empty or non-string input gracefully
  if (!svg || typeof svg !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(svg, SVG_SANITIZE_CONFIG);
}

/**
 * Check if a string contains potentially dangerous SVG content
 *
 * Useful for logging or alerting when suspicious content is detected,
 * before sanitization removes it.
 *
 * @param svg - The SVG string to check
 * @returns true if the SVG contains potentially dangerous content
 */
export function hasDangerousSvgContent(svg: string): boolean {
  if (!svg || typeof svg !== 'string') {
    return false;
  }

  // Check for script tags
  if (/<script\b/i.test(svg)) {
    return true;
  }

  // Check for foreignObject
  if (/<foreignObject\b/i.test(svg)) {
    return true;
  }

  // Check for event handlers (on* attributes)
  if (/\bon\w+\s*=/i.test(svg)) {
    return true;
  }

  // Check for javascript: URLs
  if (/javascript:/i.test(svg)) {
    return true;
  }

  // Check for data: URLs with script content
  if (/data:[^,]*text\/html/i.test(svg)) {
    return true;
  }

  return false;
}
