import { log } from './logger';

// Web Vitals metrics
export interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

// Performance thresholds (as per Google's Core Web Vitals)
const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },        // Cumulative Layout Shift
  FID: { good: 100, poor: 300 },         // First Input Delay (ms)
  FCP: { good: 1800, poor: 3000 },       // First Contentful Paint (ms)
  LCP: { good: 2500, poor: 4000 },       // Largest Contentful Paint (ms)
  TTFB: { good: 800, poor: 1800 },       // Time to First Byte (ms)
  INP: { good: 200, poor: 500 },         // Interaction to Next Paint (ms)
};

// Rate metric based on thresholds
function rateMetric(name: WebVitalsMetric['name'], value: number): WebVitalsMetric['rating'] {
  const threshold = THRESHOLDS[name];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

// Send metrics to analytics
function sendToAnalytics(metric: WebVitalsMetric) {
  log.info('Web Vitals metric', {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    navigationType: metric.navigationType,
  });

  // Send to your analytics service (Sentry, Google Analytics, etc.)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      value: Math.round(metric.value),
      metric_id: metric.id,
      metric_value: metric.value,
      metric_delta: metric.delta,
      metric_rating: metric.rating,
    });
  }

  // Send to Sentry if available
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.setMeasurement(metric.name, metric.value, 'millisecond');
  }
}

// Initialize Web Vitals monitoring
export async function initWebVitals() {
  if (typeof window === 'undefined') return;

  try {
    const { onCLS, onFID, onFCP, onLCP, onTTFB, onINP } = await import('web-vitals');

    onCLS((metric) => {
      const webVitalsMetric: WebVitalsMetric = {
        ...metric,
        rating: rateMetric('CLS', metric.value),
      };
      sendToAnalytics(webVitalsMetric);
    });

    onFID((metric) => {
      const webVitalsMetric: WebVitalsMetric = {
        ...metric,
        rating: rateMetric('FID', metric.value),
      };
      sendToAnalytics(webVitalsMetric);
    });

    onFCP((metric) => {
      const webVitalsMetric: WebVitalsMetric = {
        ...metric,
        rating: rateMetric('FCP', metric.value),
      };
      sendToAnalytics(webVitalsMetric);
    });

    onLCP((metric) => {
      const webVitalsMetric: WebVitalsMetric = {
        ...metric,
        rating: rateMetric('LCP', metric.value),
      };
      sendToAnalytics(webVitalsMetric);
    });

    onTTFB((metric) => {
      const webVitalsMetric: WebVitalsMetric = {
        ...metric,
        rating: rateMetric('TTFB', metric.value),
      };
      sendToAnalytics(webVitalsMetric);
    });

    onINP((metric) => {
      const webVitalsMetric: WebVitalsMetric = {
        ...metric,
        rating: rateMetric('INP', metric.value),
      };
      sendToAnalytics(webVitalsMetric);
    });

    log.info('Web Vitals monitoring initialized');
  } catch (error) {
    log.error('Failed to initialize Web Vitals', error);
  }
}

// Performance Observer for custom metrics
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private observers: PerformanceObserver[] = [];

  private constructor() {
    this.initObservers();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initObservers() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    // Long Tasks (> 50ms)
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          log.warn('Long task detected', {
            duration: entry.duration,
            startTime: entry.startTime,
            name: entry.name,
          });

          // Alert if task blocks main thread for > 100ms
          if (entry.duration > 100) {
            log.error('Critical long task', {
              duration: entry.duration,
              startTime: entry.startTime,
            });
          }
        }
      });

      longTaskObserver.observe({ entryTypes: ['longtask'] });
      this.observers.push(longTaskObserver);
    } catch (e) {
      // longtask not supported
    }

    // Layout Shifts
    try {
      const layoutShiftObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if ((entry as any).hadRecentInput) continue; // Ignore user-initiated shifts

          const shift = entry as any;
          if (shift.value > 0.1) {
            log.warn('Significant layout shift', {
              value: shift.value,
              sources: shift.sources,
            });
          }
        }
      });

      layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(layoutShiftObserver);
    } catch (e) {
      // layout-shift not supported
    }

    // Resource loading performance
    try {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resource = entry as PerformanceResourceTiming;

          // Warn about slow resources (> 1s)
          if (resource.duration > 1000) {
            log.warn('Slow resource load', {
              name: resource.name,
              duration: resource.duration,
              size: resource.transferSize,
              type: resource.initiatorType,
            });
          }

          // Track cache hits
          if (resource.transferSize === 0 && resource.decodedBodySize > 0) {
            log.debug('Resource served from cache', {
              name: resource.name,
              size: resource.decodedBodySize,
            });
          }
        }
      });

      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);
    } catch (e) {
      // resource not supported
    }
  }

  // Mark custom performance milestones
  mark(name: string) {
    if (typeof window === 'undefined' || !performance.mark) return;

    performance.mark(name);
    log.debug('Performance mark', { name });
  }

  // Measure time between two marks
  measure(name: string, startMark: string, endMark: string) {
    if (typeof window === 'undefined' || !performance.measure) return;

    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name, 'measure')[0];

      log.info('Performance measure', {
        name,
        duration: measure.duration,
        startTime: measure.startTime,
      });

      return measure.duration;
    } catch (error) {
      log.error('Performance measure failed', error);
    }
  }

  // Get navigation timing
  getNavigationTiming() {
    if (typeof window === 'undefined' || !performance.getEntriesByType) {
      return null;
    }

    const [navigation] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (!navigation) return null;

    return {
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      ttfb: navigation.responseStart - navigation.requestStart,
      download: navigation.responseEnd - navigation.responseStart,
      domInteractive: navigation.domInteractive - navigation.fetchStart,
      domComplete: navigation.domComplete - navigation.fetchStart,
      loadComplete: navigation.loadEventEnd - navigation.fetchStart,
    };
  }

  // Get resource timing stats
  getResourceStats() {
    if (typeof window === 'undefined' || !performance.getEntriesByType) {
      return null;
    }

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

    const stats = {
      total: resources.length,
      byType: {} as Record<string, number>,
      totalSize: 0,
      totalDuration: 0,
      slowResources: [] as Array<{ name: string; duration: number }>,
    };

    resources.forEach((resource) => {
      // Count by type
      stats.byType[resource.initiatorType] = (stats.byType[resource.initiatorType] || 0) + 1;

      // Sum sizes and durations
      stats.totalSize += resource.transferSize || 0;
      stats.totalDuration += resource.duration;

      // Track slow resources
      if (resource.duration > 1000) {
        stats.slowResources.push({
          name: resource.name,
          duration: resource.duration,
        });
      }
    });

    return stats;
  }

  // Disconnect all observers
  disconnect() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Utility: Report performance summary
export function reportPerformanceSummary() {
  const navigation = performanceMonitor.getNavigationTiming();
  const resources = performanceMonitor.getResourceStats();

  log.info('Performance Summary', {
    navigation,
    resources,
  });

  return { navigation, resources };
}
