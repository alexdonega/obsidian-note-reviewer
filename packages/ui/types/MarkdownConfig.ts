/**
 * MarkdownConfig Type Definitions
 *
 * Configuration types and default settings for markdown rendering.
 */

import { ReactNode } from 'react';

/**
 * Security sanitization levels
 */
export type SanitizationLevel = 'strict' | 'permissive' | 'none';

/**
 * Security configuration for markdown rendering
 */
export interface SecurityConfig {
  /**
   * Level of HTML sanitization to apply
   * - strict: Default, safe HTML only
   * - permissive: Allow more HTML tags
   * - none: No sanitization (use with caution)
   */
  sanitizationLevel: SanitizationLevel;

  /**
   * Enable content validation before rendering
   */
  enableValidation: boolean;

  /**
   * Throw error on validation failure (vs just warning)
   */
  throwOnError: boolean;
}

/**
 * Syntax highlighting configuration
 */
export interface SyntaxHighlightingConfig {
  /**
   * Enable syntax highlighting for code blocks
   */
  enabled: boolean;

  /**
   * Default theme name (from react-syntax-highlighter)
   */
  theme: string;

  /**
   * Show line numbers by default
   */
  showLineNumbers: boolean;

  /**
   * Highlight lines format (e.g., {1,3-5})
   */
  highlightLines?: string;
}

/**
 * Image rendering configuration
 */
export interface ImageConfig {
  /**
   * Enable image optimization
   */
  enabled: boolean;

  /**
   * Default image loading strategy
   */
  loadingStrategy: 'lazy' | 'eager';

  /**
   * Maximum image width (in pixels)
   */
  maxWidth?: number;

  /**
   * Allow images from external domains
   */
  allowExternal: boolean;

  /**
   * Allowed image domains (empty = all)
   */
  allowedDomains?: string[];
}

/**
 * Link rendering configuration
 */
export interface LinkConfig {
  /**
   * Open links in new tab
   */
  openInNewTab: boolean;

  /**
   * Add rel="noopener noreferrer" to links
   */
  addNoReferrer: boolean;

  /**
   * Allow links to external domains
   */
  allowExternal: boolean;

  /**
   * Allowed link domains (empty = all)
   */
  allowedDomains?: string[];
}

/**
 * Custom renderer components
 */
export interface CustomRenderers {
  a?: ReactNode;
  img?: ReactNode;
  code?: ReactNode;
  pre?: ReactNode;
  blockquote?: ReactNode;
  table?: ReactNode;
  thead?: ReactNode;
  tbody?: ReactNode;
  tr?: ReactNode;
  th?: ReactNode;
  td?: ReactNode;
  [key: string]: ReactNode | undefined;
}

/**
 * Main markdown configuration interface
 */
export interface MarkdownConfig {
  /**
   * Syntax highlighting configuration
   */
  syntaxHighlighting: SyntaxHighlightingConfig;

  /**
   * Image rendering configuration
   */
  images: ImageConfig;

  /**
   * Link rendering configuration
   */
  links: LinkConfig;

  /**
   * Security configuration
   */
  security: SecurityConfig;

  /**
   * Custom renderers for specific markdown elements
   */
  customRenderers?: CustomRenderers;

  /**
   * Enable GitHub Flavored Markdown (GFM)
   */
  enableGFM: boolean;

  /**
   * Custom CSS class name for the wrapper
   */
  className?: string;

  /**
   * Maximum content length (for DoS prevention)
   */
  maxContentLength?: number;
}

/**
 * Default security configuration
 */
export const defaultSecurityConfig: SecurityConfig = {
  sanitizationLevel: 'strict',
  enableValidation: true,
  throwOnError: false,
};

/**
 * Default syntax highlighting configuration
 */
export const defaultSyntaxHighlightingConfig: SyntaxHighlightingConfig = {
  enabled: true,
  theme: 'vscDarkPlus',
  showLineNumbers: false,
};

/**
 * Default image configuration
 */
export const defaultImageConfig: ImageConfig = {
  enabled: true,
  loadingStrategy: 'lazy',
  allowExternal: true,
};

/**
 * Default link configuration
 */
export const defaultLinkConfig: LinkConfig = {
  openInNewTab: true,
  addNoReferrer: true,
  allowExternal: true,
};

/**
 * Default markdown configuration with recommended settings
 */
export const defaultMarkdownConfig: MarkdownConfig = {
  syntaxHighlighting: defaultSyntaxHighlightingConfig,
  images: defaultImageConfig,
  links: defaultLinkConfig,
  security: defaultSecurityConfig,
  enableGFM: true,
  maxContentLength: 1000000, // 1MB
};

/**
 * Strict configuration for untrusted content
 */
export const strictMarkdownConfig: MarkdownConfig = {
  ...defaultMarkdownConfig,
  images: {
    ...defaultImageConfig,
    allowExternal: false,
    allowedDomains: [],
  },
  links: {
    ...defaultLinkConfig,
    allowExternal: false,
    allowedDomains: [],
  },
  security: {
    ...defaultSecurityConfig,
    throwOnError: true,
  },
};

/**
 * Permissive configuration for trusted content
 */
export const permissiveMarkdownConfig: MarkdownConfig = {
  ...defaultMarkdownConfig,
  security: {
    ...defaultSecurityConfig,
    sanitizationLevel: 'permissive',
    enableValidation: false,
  },
};

/**
 * Validate markdown configuration
 *
 * @param config - Configuration to validate
 * @returns Validation result with any errors
 */
export function validateConfig(config: Partial<MarkdownConfig>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate syntax highlighting
  if (config.syntaxHighlighting) {
    if (typeof config.syntaxHighlighting.enabled !== 'boolean') {
      errors.push('syntaxHighlighting.enabled must be a boolean');
    }
    if (config.syntaxHighlighting.theme && typeof config.syntaxHighlighting.theme !== 'string') {
      errors.push('syntaxHighlighting.theme must be a string');
    }
  }

  // Validate security
  if (config.security) {
    const validLevels: SanitizationLevel[] = ['strict', 'permissive', 'none'];
    if (
      config.security.sanitizationLevel &&
      !validLevels.includes(config.security.sanitizationLevel)
    ) {
      errors.push(
        `security.sanitizationLevel must be one of: ${validLevels.join(', ')}`
      );
    }
  }

  // Validate max content length
  if (config.maxContentLength !== undefined) {
    if (typeof config.maxContentLength !== 'number' || config.maxContentLength <= 0) {
      errors.push('maxContentLength must be a positive number');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * TypeScript types for plugin components
 */

/**
 * Props for custom renderer components
 */
export interface RendererProps {
  children?: ReactNode;
  className?: string;
  [key: string]: any;
}

/**
 * Props for link renderer
 */
export interface LinkRendererProps extends RendererProps {
  href?: string;
  target?: string;
  rel?: string;
}

/**
 * Props for image renderer
 */
export interface ImageRendererProps extends RendererProps {
  src?: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
}

/**
 * Props for code block renderer
 */
export interface CodeBlockRendererProps extends RendererProps {
  className?: string;
  language?: string;
}

export default MarkdownConfig;
