/**
 * Next.js server-side instrumentation hook. Runs once per Node process at
 * startup (and per edge-runtime instance). We use it to initialize the
 * Sentry SDK so server actions / route handlers ship errors to GlitchTip.
 *
 * No-op when SENTRY_DSN is unset.
 *
 * GlitchTip implements the Sentry protocol so @sentry/nextjs works as-is.
 */
import type { Instrumentation } from 'next';

export async function register(): Promise<void> {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    return;
  }

  if (process.env.NEXT_RUNTIME === 'nodejs' || process.env.NEXT_RUNTIME === 'edge') {
    const Sentry = await import('@sentry/nextjs');
    Sentry.init({
      dsn,
      environment: process.env.SENTRY_ENVIRONMENT || 'development',
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || '0'),
      sendDefaultPii: false,
    });
  }
}

// Forward Next's onRequestError signal into Sentry so unhandled errors in
// route handlers and server actions become real events.
export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  if (!process.env.SENTRY_DSN) return;
  const Sentry = await import('@sentry/nextjs');
  Sentry.captureRequestError(error, request, context);
};
