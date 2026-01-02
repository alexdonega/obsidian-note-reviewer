import { log } from '../logger';

// Metric types
export type MetricType = 'counter' | 'gauge' | 'histogram' | 'summary';

export interface Metric {
  name: string;
  type: MetricType;
  help: string;
  labels?: Record<string, string>;
  value: number;
  timestamp: number;
}

export interface HistogramBucket {
  le: number; // Less than or equal
  count: number;
}

// Metrics registry
class MetricsRegistry {
  private metrics = new Map<string, Metric>();
  private histograms = new Map<string, { buckets: HistogramBucket[]; sum: number; count: number }>();
  private collectors: Array<() => void> = [];

  // Register a counter
  counter(name: string, help: string, labels?: Record<string, string>): Counter {
    return new Counter(name, help, labels, this);
  }

  // Register a gauge
  gauge(name: string, help: string, labels?: Record<string, string>): Gauge {
    return new Gauge(name, help, labels, this);
  }

  // Register a histogram
  histogram(
    name: string,
    help: string,
    buckets?: number[],
    labels?: Record<string, string>
  ): Histogram {
    return new Histogram(name, help, buckets, labels, this);
  }

  // Set metric value
  set(metric: Metric): void {
    const key = this.getMetricKey(metric.name, metric.labels);
    this.metrics.set(key, metric);
  }

  // Get metric value
  get(name: string, labels?: Record<string, string>): Metric | undefined {
    const key = this.getMetricKey(name, labels);
    return this.metrics.get(key);
  }

  // Record histogram value
  recordHistogram(
    name: string,
    value: number,
    buckets: number[],
    labels?: Record<string, string>
  ): void {
    const key = this.getMetricKey(name, labels);
    let hist = this.histograms.get(key);

    if (!hist) {
      hist = {
        buckets: buckets.map(le => ({ le, count: 0 })),
        sum: 0,
        count: 0,
      };
      this.histograms.set(key, hist);
    }

    // Update buckets
    hist.buckets.forEach(bucket => {
      if (value <= bucket.le) {
        bucket.count++;
      }
    });

    hist.sum += value;
    hist.count++;
  }

  // Get histogram data
  getHistogram(name: string, labels?: Record<string, string>) {
    const key = this.getMetricKey(name, labels);
    return this.histograms.get(key);
  }

  // Register a collector function
  registerCollector(collector: () => void): void {
    this.collectors.push(collector);
  }

  // Collect all metrics
  collect(): void {
    this.collectors.forEach(collector => collector());
  }

  // Export metrics in Prometheus format
  export(): string {
    this.collect();

    const lines: string[] = [];

    // Export regular metrics
    const metricsByName = new Map<string, Metric[]>();

    this.metrics.forEach(metric => {
      if (!metricsByName.has(metric.name)) {
        metricsByName.set(metric.name, []);
      }
      metricsByName.get(metric.name)!.push(metric);
    });

    metricsByName.forEach((metrics, name) => {
      const firstMetric = metrics[0];

      // HELP line
      lines.push(`# HELP ${name} ${firstMetric.help}`);

      // TYPE line
      lines.push(`# TYPE ${name} ${firstMetric.type}`);

      // Metric lines
      metrics.forEach(metric => {
        const labels = this.formatLabels(metric.labels);
        lines.push(`${name}${labels} ${metric.value} ${metric.timestamp}`);
      });

      lines.push('');
    });

    // Export histograms
    this.histograms.forEach((hist, key) => {
      const [name, labelsStr] = key.split('{');
      const labels = labelsStr ? `{${labelsStr}` : '';

      lines.push(`# HELP ${name} Histogram`);
      lines.push(`# TYPE ${name} histogram`);

      // Bucket lines
      hist.buckets.forEach(bucket => {
        const bucketLabels = labels
          ? `${labels.slice(0, -1)},le="${bucket.le}"}`
          : `{le="${bucket.le}"}`;
        lines.push(`${name}_bucket${bucketLabels} ${bucket.count}`);
      });

      // +Inf bucket
      const infLabels = labels
        ? `${labels.slice(0, -1)},le="+Inf"}`
        : `{le="+Inf"}`;
      lines.push(`${name}_bucket${infLabels} ${hist.count}`);

      // Sum and count
      lines.push(`${name}_sum${labels} ${hist.sum}`);
      lines.push(`${name}_count${labels} ${hist.count}`);
      lines.push('');
    });

    return lines.join('\n');
  }

  // Get metrics as JSON
  exportJSON(): Record<string, any> {
    this.collect();

    return {
      metrics: Array.from(this.metrics.values()),
      histograms: Array.from(this.histograms.entries()).map(([key, hist]) => ({
        key,
        ...hist,
      })),
      timestamp: Date.now(),
    };
  }

  // Clear all metrics
  clear(): void {
    this.metrics.clear();
    this.histograms.clear();
  }

  private getMetricKey(name: string, labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return name;
    }

    const labelStr = this.formatLabels(labels);
    return `${name}${labelStr}`;
  }

  private formatLabels(labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return '';
    }

    const pairs = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}="${value}"`)
      .join(',');

    return `{${pairs}}`;
  }
}

// Counter metric
export class Counter {
  private value = 0;

  constructor(
    private name: string,
    private help: string,
    private labels: Record<string, string> | undefined,
    private registry: MetricsRegistry
  ) {}

  inc(amount: number = 1): void {
    this.value += amount;
    this.update();
  }

  get(): number {
    return this.value;
  }

  private update(): void {
    this.registry.set({
      name: this.name,
      type: 'counter',
      help: this.help,
      labels: this.labels,
      value: this.value,
      timestamp: Date.now(),
    });
  }
}

// Gauge metric
export class Gauge {
  private value = 0;

  constructor(
    private name: string,
    private help: string,
    private labels: Record<string, string> | undefined,
    private registry: MetricsRegistry
  ) {}

  set(value: number): void {
    this.value = value;
    this.update();
  }

  inc(amount: number = 1): void {
    this.value += amount;
    this.update();
  }

  dec(amount: number = 1): void {
    this.value -= amount;
    this.update();
  }

  get(): number {
    return this.value;
  }

  private update(): void {
    this.registry.set({
      name: this.name,
      type: 'gauge',
      help: this.help,
      labels: this.labels,
      value: this.value,
      timestamp: Date.now(),
    });
  }
}

// Histogram metric
export class Histogram {
  private static readonly DEFAULT_BUCKETS = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];

  constructor(
    private name: string,
    private help: string,
    private buckets: number[] = Histogram.DEFAULT_BUCKETS,
    private labels: Record<string, string> | undefined,
    private registry: MetricsRegistry
  ) {}

  observe(value: number): void {
    this.registry.recordHistogram(this.name, value, this.buckets, this.labels);
  }

  // Measure execution time
  async measure<T>(fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      return await fn();
    } finally {
      const duration = (performance.now() - start) / 1000; // Convert to seconds
      this.observe(duration);
    }
  }

  // Start a timer
  startTimer(): () => void {
    const start = performance.now();
    return () => {
      const duration = (performance.now() - start) / 1000;
      this.observe(duration);
    };
  }
}

// Application metrics
export class AppMetrics {
  private registry = new MetricsRegistry();

  // HTTP metrics
  httpRequestsTotal = this.registry.counter(
    'http_requests_total',
    'Total number of HTTP requests',
    { method: '', path: '', status: '' }
  );

  httpRequestDuration = this.registry.histogram(
    'http_request_duration_seconds',
    'HTTP request duration in seconds',
    [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
    { method: '', path: '' }
  );

  // Database metrics
  dbQueriesTotal = this.registry.counter(
    'db_queries_total',
    'Total number of database queries',
    { table: '', operation: '' }
  );

  dbQueryDuration = this.registry.histogram(
    'db_query_duration_seconds',
    'Database query duration in seconds',
    [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
    { table: '', operation: '' }
  );

  // Cache metrics
  cacheHitsTotal = this.registry.counter(
    'cache_hits_total',
    'Total number of cache hits',
    { cache: '' }
  );

  cacheMissesTotal = this.registry.counter(
    'cache_misses_total',
    'Total number of cache misses',
    { cache: '' }
  );

  // User metrics
  activeUsers = this.registry.gauge(
    'active_users',
    'Number of currently active users'
  );

  userActions = this.registry.counter(
    'user_actions_total',
    'Total number of user actions',
    { action: '', user_id: '' }
  );

  // Performance metrics
  pageLoadTime = this.registry.histogram(
    'page_load_time_seconds',
    'Page load time in seconds',
    [0.1, 0.5, 1, 2, 5, 10]
  );

  renderTime = this.registry.histogram(
    'component_render_time_seconds',
    'Component render time in seconds',
    [0.001, 0.005, 0.01, 0.05, 0.1],
    { component: '' }
  );

  // Error metrics
  errorsTotal = this.registry.counter(
    'errors_total',
    'Total number of errors',
    { type: '', severity: '' }
  );

  // Export metrics
  export(): string {
    return this.registry.export();
  }

  exportJSON(): Record<string, any> {
    return this.registry.exportJSON();
  }

  // Send metrics to endpoint
  async push(endpoint?: string): Promise<void> {
    const url = endpoint || import.meta.env.VITE_METRICS_ENDPOINT;
    if (!url) {
      log.warn('Metrics endpoint not configured');
      return;
    }

    try {
      const metrics = this.exportJSON();

      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics),
      });

      log.debug('Metrics pushed successfully');
    } catch (error) {
      log.error('Failed to push metrics', error);
    }
  }

  // Register system metrics collector
  registerSystemMetrics(): void {
    this.registry.registerCollector(() => {
      // Memory usage
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        this.registry.gauge('process_memory_bytes', 'Memory usage in bytes').set(memory.usedJSHeapSize);
      }

      // Active connections
      if ('connection' in navigator) {
        const conn = (navigator as any).connection;
        this.registry.gauge('network_downlink_mbps', 'Network downlink in Mbps').set(conn.downlink || 0);
      }
    });
  }
}

// Export singleton
export const metrics = new AppMetrics();

// Auto-register system metrics
if (typeof window !== 'undefined') {
  metrics.registerSystemMetrics();

  // Push metrics every 60 seconds
  setInterval(() => {
    metrics.push();
  }, 60000);
}
