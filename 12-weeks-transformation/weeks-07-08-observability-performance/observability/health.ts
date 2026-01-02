import { log } from '../logger';
import { cache } from '../cache';
import { supabase } from '../supabase';
import { realtime } from '../realtime';

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface HealthCheck {
  name: string;
  status: HealthStatus;
  message?: string;
  timestamp: number;
  duration: number;
  metadata?: Record<string, any>;
}

export interface HealthReport {
  status: HealthStatus;
  checks: HealthCheck[];
  timestamp: number;
  uptime: number;
}

// Health checker
export class HealthChecker {
  private checks: Map<string, () => Promise<HealthCheck>> = new Map();
  private startTime = Date.now();
  private lastReport: HealthReport | null = null;

  constructor() {
    this.registerDefaultChecks();
  }

  // Register a health check
  register(name: string, check: () => Promise<HealthCheck>): void {
    this.checks.set(name, check);
  }

  // Run all health checks
  async check(): Promise<HealthReport> {
    const results: HealthCheck[] = [];

    for (const [name, check] of this.checks) {
      try {
        const result = await check();
        results.push(result);
      } catch (error) {
        results.push({
          name,
          status: 'unhealthy',
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now(),
          duration: 0,
        });
      }
    }

    // Determine overall status
    const status = this.determineOverallStatus(results);

    const report: HealthReport = {
      status,
      checks: results,
      timestamp: Date.now(),
      uptime: Date.now() - this.startTime,
    };

    this.lastReport = report;

    // Log unhealthy checks
    results.forEach(check => {
      if (check.status === 'unhealthy') {
        log.error('Health check failed', { check });
      } else if (check.status === 'degraded') {
        log.warn('Health check degraded', { check });
      }
    });

    return report;
  }

  // Get last report
  getLastReport(): HealthReport | null {
    return this.lastReport;
  }

  // Determine overall health status
  private determineOverallStatus(checks: HealthCheck[]): HealthStatus {
    if (checks.some(c => c.status === 'unhealthy')) {
      return 'unhealthy';
    }
    if (checks.some(c => c.status === 'degraded')) {
      return 'degraded';
    }
    return 'healthy';
  }

  // Register default health checks
  private registerDefaultChecks(): void {
    // Database health
    this.register('database', async () => {
      const start = Date.now();

      try {
        const { error } = await supabase.from('organizations').select('count').limit(1);

        if (error) throw error;

        return {
          name: 'database',
          status: 'healthy',
          message: 'Database connection is healthy',
          timestamp: Date.now(),
          duration: Date.now() - start,
        };
      } catch (error) {
        return {
          name: 'database',
          status: 'unhealthy',
          message: error instanceof Error ? error.message : 'Database check failed',
          timestamp: Date.now(),
          duration: Date.now() - start,
        };
      }
    });

    // Cache health
    this.register('cache', async () => {
      const start = Date.now();

      try {
        const isHealthy = await cache.healthCheck();

        return {
          name: 'cache',
          status: isHealthy ? 'healthy' : 'degraded',
          message: isHealthy ? 'Cache is healthy' : 'Cache unavailable',
          timestamp: Date.now(),
          duration: Date.now() - start,
        };
      } catch (error) {
        return {
          name: 'cache',
          status: 'degraded', // Cache failure is not critical
          message: 'Cache check failed',
          timestamp: Date.now(),
          duration: Date.now() - start,
        };
      }
    });

    // Real-time connection health
    this.register('realtime', async () => {
      const start = Date.now();

      try {
        const status = realtime.getConnectionStatus();

        return {
          name: 'realtime',
          status: status === 'connected' ? 'healthy' : status === 'connecting' ? 'degraded' : 'unhealthy',
          message: `Real-time connection is ${status}`,
          timestamp: Date.now(),
          duration: Date.now() - start,
          metadata: {
            activeChannels: realtime.getActiveChannels().length,
          },
        };
      } catch (error) {
        return {
          name: 'realtime',
          status: 'unhealthy',
          message: 'Real-time check failed',
          timestamp: Date.now(),
          duration: Date.now() - start,
        };
      }
    });

    // Memory health
    this.register('memory', async () => {
      const start = Date.now();

      if (!('memory' in performance)) {
        return {
          name: 'memory',
          status: 'healthy',
          message: 'Memory API not available',
          timestamp: Date.now(),
          duration: Date.now() - start,
        };
      }

      const memory = (performance as any).memory;
      const usedPercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;

      let status: HealthStatus = 'healthy';
      if (usedPercent > 90) {
        status = 'unhealthy';
      } else if (usedPercent > 75) {
        status = 'degraded';
      }

      return {
        name: 'memory',
        status,
        message: `Memory usage: ${usedPercent.toFixed(2)}%`,
        timestamp: Date.now(),
        duration: Date.now() - start,
        metadata: {
          usedMB: (memory.usedJSHeapSize / 1024 / 1024).toFixed(2),
          limitMB: (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2),
          usedPercent: usedPercent.toFixed(2),
        },
      };
    });

    // Network health
    this.register('network', async () => {
      const start = Date.now();

      const isOnline = navigator.onLine;

      if ('connection' in navigator) {
        const conn = (navigator as any).connection;

        return {
          name: 'network',
          status: isOnline ? 'healthy' : 'unhealthy',
          message: isOnline ? 'Network is available' : 'Network is offline',
          timestamp: Date.now(),
          duration: Date.now() - start,
          metadata: {
            type: conn.effectiveType,
            downlink: conn.downlink,
            rtt: conn.rtt,
          },
        };
      }

      return {
        name: 'network',
        status: isOnline ? 'healthy' : 'unhealthy',
        message: isOnline ? 'Network is available' : 'Network is offline',
        timestamp: Date.now(),
        duration: Date.now() - start,
      };
    });
  }
}

// Heartbeat service
export class HeartbeatService {
  private interval: ReturnType<typeof setInterval> | null = null;
  private endpoint: string;
  private intervalMs: number;

  constructor(endpoint: string, intervalMs: number = 60000) {
    this.endpoint = endpoint;
    this.intervalMs = intervalMs;
  }

  start(): void {
    if (this.interval) return;

    this.send(); // Send immediately

    this.interval = setInterval(() => {
      this.send();
    }, this.intervalMs);

    log.info('Heartbeat service started', { intervalMs: this.intervalMs });
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      log.info('Heartbeat service stopped');
    }
  }

  private async send(): Promise<void> {
    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: Date.now(),
          status: 'alive',
          version: import.meta.env.VITE_APP_VERSION || '1.0.0',
        }),
      });

      log.debug('Heartbeat sent');
    } catch (error) {
      log.error('Failed to send heartbeat', error);
    }
  }
}

// Alert manager
export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: number;
  source: string;
  metadata?: Record<string, any>;
}

export class AlertManager {
  private alerts: Alert[] = [];
  private handlers: Array<(alert: Alert) => void> = [];
  private webhookUrl?: string;

  constructor(webhookUrl?: string) {
    this.webhookUrl = webhookUrl || import.meta.env.VITE_ALERT_WEBHOOK_URL;
  }

  // Trigger an alert
  async trigger(
    severity: AlertSeverity,
    title: string,
    message: string,
    source: string = 'app',
    metadata?: Record<string, any>
  ): Promise<void> {
    const alert: Alert = {
      id: crypto.randomUUID(),
      severity,
      title,
      message,
      timestamp: Date.now(),
      source,
      metadata,
    };

    this.alerts.push(alert);

    // Log alert
    const logFn = severity === 'critical' || severity === 'error' ? log.error :
                   severity === 'warning' ? log.warn : log.info;

    logFn(`Alert: ${title}`, { alert });

    // Notify handlers
    this.handlers.forEach(handler => handler(alert));

    // Send to webhook
    if (this.webhookUrl && (severity === 'error' || severity === 'critical')) {
      await this.sendToWebhook(alert);
    }
  }

  // Register alert handler
  onAlert(handler: (alert: Alert) => void): () => void {
    this.handlers.push(handler);

    return () => {
      const index = this.handlers.indexOf(handler);
      if (index > -1) {
        this.handlers.splice(index, 1);
      }
    };
  }

  // Get recent alerts
  getRecent(limit: number = 50): Alert[] {
    return this.alerts.slice(-limit);
  }

  // Clear alerts
  clear(): void {
    this.alerts = [];
  }

  // Send alert to webhook
  private async sendToWebhook(alert: Alert): Promise<void> {
    if (!this.webhookUrl) return;

    try {
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 ${alert.severity.toUpperCase()}: ${alert.title}`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*${alert.title}*\n${alert.message}`,
              },
            },
            {
              type: 'context',
              elements: [
                {
                  type: 'mrkdwn',
                  text: `Source: ${alert.source} | Time: ${new Date(alert.timestamp).toISOString()}`,
                },
              ],
            },
          ],
        }),
      });

      log.info('Alert sent to webhook', { alertId: alert.id });
    } catch (error) {
      log.error('Failed to send alert to webhook', error);
    }
  }
}

// Export singletons
export const health = new HealthChecker();
export const alerts = new AlertManager();

// Start periodic health checks
if (typeof window !== 'undefined') {
  setInterval(() => {
    health.check().then(report => {
      if (report.status === 'unhealthy') {
        alerts.trigger('error', 'System Unhealthy', `Health check failed: ${report.checks.filter(c => c.status === 'unhealthy').map(c => c.name).join(', ')}`);
      }
    });
  }, 60000); // Every minute
}
