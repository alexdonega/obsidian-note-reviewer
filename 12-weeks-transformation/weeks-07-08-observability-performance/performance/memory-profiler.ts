// Memory Profiler & Leak Detector
// Monitors memory usage and detects potential memory leaks

import { log } from '../logger';

export interface MemorySnapshot {
  timestamp: number;
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usedPercent: number;
}

export interface MemoryLeak {
  component: string;
  detectedAt: number;
  growthRate: number; // MB per second
  snapshots: MemorySnapshot[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Memory profiler class
export class MemoryProfiler {
  private static instance: MemoryProfiler;
  private snapshots: MemorySnapshot[] = [];
  private leaks: MemoryLeak[] = [];
  private monitors = new Map<string, WeakMap<object, any>>();
  private isMonitoring = false;
  private monitorInterval: ReturnType<typeof setInterval> | null = null;

  private readonly SNAPSHOT_INTERVAL = 5000; // 5 seconds
  private readonly MAX_SNAPSHOTS = 100;
  private readonly LEAK_THRESHOLD_MB = 10; // 10MB growth
  private readonly LEAK_THRESHOLD_PERCENT = 5; // 5% growth

  private constructor() {}

  static getInstance(): MemoryProfiler {
    if (!MemoryProfiler.instance) {
      MemoryProfiler.instance = new MemoryProfiler();
    }
    return MemoryProfiler.instance;
  }

  // Start memory monitoring
  start(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.takeSnapshot();

    this.monitorInterval = setInterval(() => {
      this.takeSnapshot();
      this.detectLeaks();
    }, this.SNAPSHOT_INTERVAL);

    log.info('Memory profiler started');
  }

  // Stop monitoring
  stop(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }

    this.isMonitoring = false;
    log.info('Memory profiler stopped');
  }

  // Take memory snapshot
  takeSnapshot(): MemorySnapshot | null {
    if (!('memory' in performance)) {
      return null;
    }

    const memory = (performance as any).memory;
    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usedPercent: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
    };

    this.snapshots.push(snapshot);

    // Keep only recent snapshots
    if (this.snapshots.length > this.MAX_SNAPSHOTS) {
      this.snapshots.shift();
    }

    return snapshot;
  }

  // Detect memory leaks
  detectLeaks(): void {
    if (this.snapshots.length < 10) return; // Need at least 10 snapshots

    const recent = this.snapshots.slice(-10);
    const first = recent[0];
    const last = recent[recent.length - 1];

    const growthMB = (last.usedJSHeapSize - first.usedJSHeapSize) / 1024 / 1024;
    const growthPercent =
      ((last.usedJSHeapSize - first.usedJSHeapSize) / first.usedJSHeapSize) * 100;
    const durationSeconds = (last.timestamp - first.timestamp) / 1000;
    const growthRate = growthMB / durationSeconds;

    // Check if memory is growing consistently
    const isGrowing = this.isConsistentGrowth(recent);

    if (isGrowing && (growthMB > this.LEAK_THRESHOLD_MB || growthPercent > this.LEAK_THRESHOLD_PERCENT)) {
      const severity = this.calculateSeverity(growthRate, last.usedPercent);

      const leak: MemoryLeak = {
        component: 'unknown',
        detectedAt: Date.now(),
        growthRate,
        snapshots: [...recent],
        severity,
      };

      this.leaks.push(leak);

      log.warn('Potential memory leak detected', {
        growthMB: growthMB.toFixed(2),
        growthPercent: growthPercent.toFixed(2),
        growthRate: growthRate.toFixed(2),
        severity,
      });

      // Trigger GC if available
      this.forceGC();
    }
  }

  // Check if memory is growing consistently
  private isConsistentGrowth(snapshots: MemorySnapshot[]): boolean {
    let increases = 0;

    for (let i = 1; i < snapshots.length; i++) {
      if (snapshots[i].usedJSHeapSize > snapshots[i - 1].usedJSHeapSize) {
        increases++;
      }
    }

    // At least 70% of measurements show growth
    return increases / (snapshots.length - 1) >= 0.7;
  }

  // Calculate leak severity
  private calculateSeverity(
    growthRate: number,
    usedPercent: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (usedPercent > 90 || growthRate > 5) return 'critical';
    if (usedPercent > 75 || growthRate > 2) return 'high';
    if (usedPercent > 60 || growthRate > 1) return 'medium';
    return 'low';
  }

  // Force garbage collection (if available)
  forceGC(): void {
    if ('gc' in global && typeof (global as any).gc === 'function') {
      (global as any).gc();
      log.info('Forced garbage collection');
    } else if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
      log.info('Forced garbage collection');
    }
  }

  // Get current memory status
  getStatus(): {
    current: MemorySnapshot | null;
    leaks: MemoryLeak[];
    trend: 'increasing' | 'stable' | 'decreasing';
  } {
    const current = this.snapshots[this.snapshots.length - 1] || null;
    const trend = this.calculateTrend();

    return {
      current,
      leaks: this.leaks,
      trend,
    };
  }

  // Calculate memory trend
  private calculateTrend(): 'increasing' | 'stable' | 'decreasing' {
    if (this.snapshots.length < 5) return 'stable';

    const recent = this.snapshots.slice(-5);
    const first = recent[0].usedJSHeapSize;
    const last = recent[recent.length - 1].usedJSHeapSize;
    const change = ((last - first) / first) * 100;

    if (change > 5) return 'increasing';
    if (change < -5) return 'decreasing';
    return 'stable';
  }

  // Monitor component lifecycle
  monitorComponent(componentName: string, instance: object): () => void {
    if (!this.monitors.has(componentName)) {
      this.monitors.set(componentName, new WeakMap());
    }

    const monitor = this.monitors.get(componentName)!;
    const startMemory = this.getCurrentMemory();

    monitor.set(instance, {
      mountTime: Date.now(),
      startMemory,
    });

    // Return cleanup function
    return () => {
      const data = monitor.get(instance);
      if (data) {
        const endMemory = this.getCurrentMemory();
        const duration = Date.now() - data.mountTime;
        const memoryDelta = endMemory - data.startMemory;

        if (memoryDelta > 1024 * 1024) {
          // > 1MB
          log.warn(`Component ${componentName} leaked ${(memoryDelta / 1024 / 1024).toFixed(2)}MB`, {
            duration,
            startMemory: data.startMemory,
            endMemory,
          });
        }
      }
    };
  }

  // Get current memory usage
  private getCurrentMemory(): number {
    if (!('memory' in performance)) return 0;
    return (performance as any).memory.usedJSHeapSize;
  }

  // Export report
  exportReport(): {
    summary: {
      totalSnapshots: number;
      totalLeaks: number;
      currentMemoryMB: number;
      trend: string;
    };
    snapshots: MemorySnapshot[];
    leaks: MemoryLeak[];
  } {
    const current = this.snapshots[this.snapshots.length - 1];

    return {
      summary: {
        totalSnapshots: this.snapshots.length,
        totalLeaks: this.leaks.length,
        currentMemoryMB: current ? current.usedJSHeapSize / 1024 / 1024 : 0,
        trend: this.calculateTrend(),
      },
      snapshots: this.snapshots,
      leaks: this.leaks,
    };
  }

  // Clear leaks
  clearLeaks(): void {
    this.leaks = [];
  }
}

// React hook for memory monitoring
export function useMemoryMonitor(componentName: string) {
  if (typeof window === 'undefined') return;

  const profiler = MemoryProfiler.getInstance();

  // Monitor on mount/unmount
  const cleanup = profiler.monitorComponent(componentName, {});

  // Cleanup on unmount
  return cleanup;
}

// WeakRef-based cache to prevent memory leaks
export class WeakCache<K extends object, V> {
  private cache = new WeakMap<K, WeakRef<V>>();
  private registry = new FinalizationRegistry<K>((key) => {
    this.cache.delete(key);
  });

  set(key: K, value: V): void {
    const ref = new WeakRef(value);
    this.cache.set(key, ref);
    this.registry.register(value as any, key);
  }

  get(key: K): V | undefined {
    const ref = this.cache.get(key);
    return ref?.deref();
  }

  has(key: K): boolean {
    const ref = this.cache.get(key);
    return ref?.deref() !== undefined;
  }

  delete(key: K): void {
    this.cache.delete(key);
  }
}

// Event listener leak detector
export class EventListenerMonitor {
  private listeners = new Map<string, number>();

  track(eventName: string): void {
    const count = this.listeners.get(eventName) || 0;
    this.listeners.set(eventName, count + 1);

    if (count > 100) {
      log.warn(`Potential event listener leak: ${eventName} has ${count} listeners`);
    }
  }

  untrack(eventName: string): void {
    const count = this.listeners.get(eventName) || 0;
    if (count > 0) {
      this.listeners.set(eventName, count - 1);
    }
  }

  getReport(): Map<string, number> {
    return new Map(this.listeners);
  }
}

// Singleton instances
export const memoryProfiler = MemoryProfiler.getInstance();
export const eventMonitor = new EventListenerMonitor();

// Auto-start in development
if (import.meta.env.DEV) {
  memoryProfiler.start();

  // Log memory status every 30 seconds
  setInterval(() => {
    const status = memoryProfiler.getStatus();
    if (status.current) {
      log.info('Memory status', {
        usedMB: (status.current.usedJSHeapSize / 1024 / 1024).toFixed(2),
        usedPercent: status.current.usedPercent.toFixed(2),
        trend: status.trend,
        leaks: status.leaks.length,
      });
    }
  }, 30000);
}
