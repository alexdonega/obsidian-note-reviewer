import { useEffect } from 'react';

interface ResourceHintsProps {
  preconnect?: string[];
  dnsPrefetch?: string[];
  preload?: Array<{
    href: string;
    as: 'script' | 'style' | 'font' | 'image' | 'fetch';
    type?: string;
    crossorigin?: 'anonymous' | 'use-credentials';
  }>;
  prefetch?: string[];
  modulePreload?: string[];
}

export function ResourceHints({
  preconnect = [],
  dnsPrefetch = [],
  preload = [],
  prefetch = [],
  modulePreload = [],
}: ResourceHintsProps) {
  useEffect(() => {
    const head = document.head;
    const addedLinks: HTMLLinkElement[] = [];

    // Preconnect - establish early connection to important third-party origins
    preconnect.forEach((href) => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = href;
      link.crossOrigin = 'anonymous';
      head.appendChild(link);
      addedLinks.push(link);
    });

    // DNS Prefetch - resolve DNS for domains we'll use later
    dnsPrefetch.forEach((href) => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = href;
      head.appendChild(link);
      addedLinks.push(link);
    });

    // Preload - high-priority resources needed for current page
    preload.forEach(({ href, as, type, crossorigin }) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = as;
      if (type) link.type = type;
      if (crossorigin) link.crossOrigin = crossorigin;
      head.appendChild(link);
      addedLinks.push(link);
    });

    // Prefetch - low-priority resources for next navigation
    prefetch.forEach((href) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      head.appendChild(link);
      addedLinks.push(link);
    });

    // Module Preload - preload ES modules
    modulePreload.forEach((href) => {
      const link = document.createElement('link');
      link.rel = 'modulepreload';
      link.href = href;
      head.appendChild(link);
      addedLinks.push(link);
    });

    // Cleanup
    return () => {
      addedLinks.forEach((link) => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
    };
  }, [preconnect, dnsPrefetch, preload, prefetch, modulePreload]);

  return null;
}

// Pre-configured hints for common use cases
export function DefaultResourceHints() {
  return (
    <ResourceHints
      // Establish early connections to critical origins
      preconnect={[
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
      ]}

      // DNS lookup for domains we'll use
      dnsPrefetch={[
        'https://www.google-analytics.com',
        'https://cdn.jsdelivr.net',
      ]}

      // Preload critical fonts
      preload={[
        {
          href: '/fonts/inter-var.woff2',
          as: 'font',
          type: 'font/woff2',
          crossorigin: 'anonymous',
        },
      ]}
    />
  );
}

// Supabase-specific resource hints
export function SupabaseResourceHints({ supabaseUrl }: { supabaseUrl: string }) {
  return (
    <ResourceHints
      preconnect={[supabaseUrl]}
      dnsPrefetch={[supabaseUrl]}
    />
  );
}

// CDN resource hints
export function CDNResourceHints({ cdnUrls }: { cdnUrls: string[] }) {
  return (
    <ResourceHints
      dnsPrefetch={cdnUrls}
    />
  );
}

// Utility: Preload critical images
export function usePreloadImages(imageUrls: string[]) {
  useEffect(() => {
    const images = imageUrls.map((url) => {
      const img = new Image();
      img.src = url;
      return img;
    });

    return () => {
      images.forEach((img) => {
        img.src = '';
      });
    };
  }, [imageUrls]);
}

// Utility: Prefetch route data
export function usePrefetchRoute(routePath: string, condition: boolean = true) {
  useEffect(() => {
    if (!condition) return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = routePath;
    document.head.appendChild(link);

    return () => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    };
  }, [routePath, condition]);
}

// Utility: Priority hints for images and iframes
export function usePriorityHint(
  ref: React.RefObject<HTMLImageElement | HTMLIFrameElement>,
  priority: 'high' | 'low' | 'auto' = 'auto'
) {
  useEffect(() => {
    if (!ref.current) return;

    (ref.current as any).fetchPriority = priority;
  }, [ref, priority]);
}
