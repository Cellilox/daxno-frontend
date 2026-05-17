/**
 * Next.js browser-side instrumentation hook. Runs in every client bundle.
 * Initializes Sentry so browser exceptions, unhandled rejections, and
 * React render errors ship to GlitchTip.
 *
 * Uses NEXT_PUBLIC_SENTRY_DSN because this file ships to the browser.
 * That DSN is intentionally semi-public (Sentry/GlitchTip DSNs are not
 * secrets — they're event ingestion endpoints with rate limits applied).
 */
import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'development',
    tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || '0'),
    // Don't send IP / cookies by default; PII flag for compliance.
    sendDefaultPii: false,
    // Replay is paid on Sentry SaaS and not implemented on GlitchTip; omit.
    integrations: [],
  });
}

// Required by @sentry/nextjs for navigation tracing instrumentation.
// Always exported even when Sentry is disabled (no-op).
export const onRouterTransitionStart = dsn
  ? Sentry.captureRouterTransitionStart
  : () => {};
