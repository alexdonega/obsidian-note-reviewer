import { trace, context, SpanStatusCode, type Span } from '@opentelemetry/api';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { log } from '../logger';

// Tracer configuration
const TRACER_NAME = 'obsidian-note-reviewer';
const TRACE_ENDPOINT = import.meta.env.VITE_OTEL_ENDPOINT || 'http://localhost:4318/v1/traces';

// Initialize OpenTelemetry
export function initTracing() {
  try {
    // Create resource with service information
    const resource = new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'note-reviewer-ui',
      [SemanticResourceAttributes.SERVICE_VERSION]: import.meta.env.VITE_APP_VERSION || '1.0.0',
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: import.meta.env.MODE || 'development',
    });

    // Create tracer provider
    const provider = new WebTracerProvider({
      resource,
    });

    // Configure OTLP exporter (sends to OpenTelemetry Collector)
    const exporter = new OTLPTraceExporter({
      url: TRACE_ENDPOINT,
      headers: {
        'x-api-key': import.meta.env.VITE_OTEL_API_KEY || '',
      },
    });

    // Add batch span processor
    provider.addSpanProcessor(
      new BatchSpanProcessor(exporter, {
        maxQueueSize: 100,
        maxExportBatchSize: 10,
        scheduledDelayMillis: 5000,
      })
    );

    // Register the provider
    provider.register({
      contextManager: new ZoneContextManager(),
    });

    // Auto-instrument browser APIs
    registerInstrumentations({
      instrumentations: [
        getWebAutoInstrumentations({
          '@opentelemetry/instrumentation-fetch': {
            propagateTraceHeaderCorsUrls: [
              /https:\/\/.*\.supabase\.co/,
              /http:\/\/localhost:.*/,
            ],
            clearTimingResources: true,
          },
          '@opentelemetry/instrumentation-xml-http-request': {
            propagateTraceHeaderCorsUrls: [
              /https:\/\/.*\.supabase\.co/,
              /http:\/\/localhost:.*/,
            ],
          },
        }),
      ],
    });

    log.info('OpenTelemetry tracing initialized');
  } catch (error) {
    log.error('Failed to initialize OpenTelemetry', error);
  }
}

// Get tracer instance
export function getTracer() {
  return trace.getTracer(TRACER_NAME);
}

// Trace decorator for functions
export function traced(operation: string, attributes?: Record<string, any>) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const tracer = getTracer();
      const span = tracer.startSpan(operation, {
        attributes: {
          ...attributes,
          'code.function': propertyKey,
          'code.namespace': target.constructor.name,
        },
      });

      try {
        const result = await originalMethod.apply(this, args);
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
        span.recordException(error as Error);
        throw error;
      } finally {
        span.end();
      }
    };

    return descriptor;
  };
}

// Manual span creation helpers
export class Tracing {
  private static tracer = getTracer();

  // Start a new span
  static startSpan(name: string, attributes?: Record<string, any>): Span {
    return this.tracer.startSpan(name, { attributes });
  }

  // Execute function within a span
  static async withSpan<T>(
    name: string,
    fn: (span: Span) => Promise<T>,
    attributes?: Record<string, any>
  ): Promise<T> {
    const span = this.tracer.startSpan(name, { attributes });

    try {
      const result = await context.with(trace.setSpan(context.active(), span), () => fn(span));
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  }

  // Trace HTTP request
  static async traceRequest<T>(
    method: string,
    url: string,
    fn: () => Promise<T>
  ): Promise<T> {
    return this.withSpan(
      `HTTP ${method}`,
      async (span) => {
        span.setAttributes({
          'http.method': method,
          'http.url': url,
          'http.scheme': new URL(url).protocol.replace(':', ''),
          'http.host': new URL(url).host,
        });

        const result = await fn();

        span.setAttributes({
          'http.status_code': 200, // Set actual status code
        });

        return result;
      }
    );
  }

  // Trace database query
  static async traceQuery<T>(
    table: string,
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    return this.withSpan(
      `db.${operation}`,
      async (span) => {
        span.setAttributes({
          'db.system': 'postgresql',
          'db.name': 'supabase',
          'db.operation': operation,
          'db.table': table,
        });

        return await fn();
      }
    );
  }

  // Trace user action
  static async traceUserAction<T>(
    action: string,
    userId: string,
    fn: () => Promise<T>
  ): Promise<T> {
    return this.withSpan(
      `user.${action}`,
      async (span) => {
        span.setAttributes({
          'user.id': userId,
          'user.action': action,
        });

        return await fn();
      }
    );
  }

  // Add event to current span
  static addEvent(name: string, attributes?: Record<string, any>): void {
    const currentSpan = trace.getActiveSpan();
    if (currentSpan) {
      currentSpan.addEvent(name, attributes);
    }
  }

  // Set attribute on current span
  static setAttribute(key: string, value: any): void {
    const currentSpan = trace.getActiveSpan();
    if (currentSpan) {
      currentSpan.setAttribute(key, value);
    }
  }

  // Record error on current span
  static recordError(error: Error): void {
    const currentSpan = trace.getActiveSpan();
    if (currentSpan) {
      currentSpan.recordException(error);
      currentSpan.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
    }
  }
}

// Span timing helpers
export class SpanTimer {
  private startTime: number;
  private span: Span;

  constructor(span: Span) {
    this.span = span;
    this.startTime = Date.now();
  }

  checkpoint(name: string): void {
    const elapsed = Date.now() - this.startTime;
    this.span.addEvent(name, {
      'elapsed.ms': elapsed,
    });
  }

  end(): void {
    const duration = Date.now() - this.startTime;
    this.span.setAttribute('duration.ms', duration);
    this.span.end();
  }
}

// Baggage (context propagation) helpers
export class TracingContext {
  static set(key: string, value: string): void {
    // Set baggage for cross-service context propagation
    const currentContext = context.active();
    context.with(currentContext, () => {
      // Would use baggage API here
    });
  }

  static get(key: string): string | undefined {
    // Get baggage from context
    return undefined; // Placeholder
  }
}
