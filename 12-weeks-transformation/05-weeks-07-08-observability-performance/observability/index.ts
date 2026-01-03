// Unified Observability SDK
// Single entry point for all observability features

import { initTracing, Tracing, getTracer } from './tracing';
import { metrics, AppMetrics } from './metrics';
import { health, alerts, HeartbeatService, type HealthReport, type Alert } from './health';
import { log } from '../logger';

export interface ObservabilityConfig {
  enableTracing?: boolean;
  enableMetrics?: boolean;
  enableHealthChecks?: boolean;
  enableHeartbeat?: boolean;
  heartbeatEndpoint?: string;
  heartbeatInterval?: number;
  metricsEndpoint?: string;
  alertWebhook?: string;
}

// Observability SDK
export class ObservabilitySDK {
  private static instance: ObservabilitySDK;
  private heartbeat: HeartbeatService | null = null;
  private config: ObservabilityConfig;

  private constructor(config: ObservabilityConfig = {}) {
    this.config = {
      enableTracing: true,
      enableMetrics: true,
      enableHealthChecks: true,
      enableHeartbeat: false,
      ...config,
    };
  }

  static getInstance(config?: ObservabilityConfig): ObservabilitySDK {
    if (!ObservabilitySDK.instance) {
      ObservabilitySDK.instance = new ObservabilitySDK(config);
    }
    return ObservabilitySDK.instance;
  }

  // Initialize observability
  async initialize(): Promise<void> {
    log.info('Initializing observability SDK', { config: this.config });

    try {
      // Initialize tracing
      if (this.config.enableTracing) {
        initTracing();
        log.info('Tracing initialized');
      }

      // Register system metrics
      if (this.config.enableMetrics) {
        metrics.registerSystemMetrics();
        log.info('Metrics initialized');
      }

      // Run initial health check
      if (this.config.enableHealthChecks) {
        const report = await health.check();
        log.info('Health check completed', { status: report.status });
      }

      // Start heartbeat
      if (this.config.enableHeartbeat && this.config.heartbeatEndpoint) {
        this.heartbeat = new HeartbeatService(
          this.config.heartbeatEndpoint,
          this.config.heartbeatInterval
        );
        this.heartbeat.start();
        log.info('Heartbeat started');
      }

      log.info('Observability SDK initialized successfully');
    } catch (error) {
      log.error('Failed to initialize observability SDK', error);
      throw error;
    }
  }

  // Shutdown observability
  shutdown(): void {
    if (this.heartbeat) {
      this.heartbeat.stop();
    }

    log.info('Observability SDK shutdown');
  }

  // Tracing API
  get trace() {
    return {
      startSpan: Tracing.startSpan.bind(Tracing),
      withSpan: Tracing.withSpan.bind(Tracing),
      traceRequest: Tracing.traceRequest.bind(Tracing),
      traceQuery: Tracing.traceQuery.bind(Tracing),
      traceUserAction: Tracing.traceUserAction.bind(Tracing),
      addEvent: Tracing.addEvent.bind(Tracing),
      setAttribute: Tracing.setAttribute.bind(Tracing),
      recordError: Tracing.recordError.bind(Tracing),
      getTracer,
    };
  }

  // Metrics API
  get metrics() {
    return metrics;
  }

  // Health API
  get health() {
    return {
      check: health.check.bind(health),
      getLastReport: health.getLastReport.bind(health),
      register: health.register.bind(health),
    };
  }

  // Alerts API
  get alerts() {
    return {
      trigger: alerts.trigger.bind(alerts),
      onAlert: alerts.onAlert.bind(alerts),
      getRecent: alerts.getRecent.bind(alerts),
      clear: alerts.clear.bind(alerts),
    };
  }

  // Get full observability status
  async getStatus(): Promise<{
    health: HealthReport;
    metrics: Record<string, any>;
    alerts: Alert[];
  }> {
    const healthReport = await health.check();

    return {
      health: healthReport,
      metrics: metrics.exportJSON(),
      alerts: alerts.getRecent(10),
    };
  }
}

// Export singleton instance
export const observability = ObservabilitySDK.getInstance({
  enableTracing: import.meta.env.VITE_ENABLE_TRACING !== 'false',
  enableMetrics: import.meta.env.VITE_ENABLE_METRICS !== 'false',
  enableHealthChecks: import.meta.env.VITE_ENABLE_HEALTH_CHECKS !== 'false',
  enableHeartbeat: import.meta.env.VITE_ENABLE_HEARTBEAT === 'true',
  heartbeatEndpoint: import.meta.env.VITE_HEARTBEAT_ENDPOINT,
  metricsEndpoint: import.meta.env.VITE_METRICS_ENDPOINT,
  alertWebhook: import.meta.env.VITE_ALERT_WEBHOOK_URL,
});

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
  observability.initialize().catch(error => {
    console.error('Failed to initialize observability:', error);
  });

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    observability.shutdown();
  });
}

// Re-export for convenience
export { Tracing, metrics, health, alerts };
export type { HealthReport, Alert };
export * from './metrics';
export * from './health';
