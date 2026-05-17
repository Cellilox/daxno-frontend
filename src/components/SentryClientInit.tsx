'use client';

import { useEffect } from 'react';

/**
 * Manually initializes the Sentry browser SDK on first mount.
 *
 * Why this exists: Next.js 15.3+ supports `instrumentation-client.ts` for
 * auto-init, but that auto-discovery is Turbopack-only. Our scripts run
 * `next dev --webpack` (and `next build --webpack`), where the file is
 * not picked up. Mounting this component in the root layout is the
 * bundler-agnostic equivalent.
 *
 * Idempotent: subsequent mounts no-op via `getCurrentHub().getClient()`.
 */
export default function SentryClientInit() {
    useEffect(() => {
        const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
        if (!dsn) return;
        import('@sentry/nextjs').then(Sentry => {
            // Bundler-agnostic init. instrumentation-client.ts may also init
            // depending on bundler (Turbopack auto-discovers, webpack does
            // not in older configs) — this is the belt-and-suspenders path.
            if (Sentry.getClient?.()) return;
            Sentry.init({
                dsn,
                environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'development',
                tracesSampleRate: Number(
                    process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || '0',
                ),
                sendDefaultPii: false,
                integrations: [],
            });
        }).catch(() => {
            // SDK failed to load; don't break the app.
        });
    }, []);

    return null;
}
