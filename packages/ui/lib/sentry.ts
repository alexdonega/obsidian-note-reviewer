import * as Sentry from '@sentry/react';

export function initSentry() {
  if (import.meta.env.MODE !== 'production') return;

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration()
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.MODE,
    beforeSend(event, hint) {
      // Filter out known/expected errors
      if (event.exception?.values?.[0]?.value?.includes('ResizeObserver loop')) {
        return null;
      }
      return event;
    }
  });
}
