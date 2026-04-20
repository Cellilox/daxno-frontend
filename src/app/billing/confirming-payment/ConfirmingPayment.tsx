'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getBillingConfig } from '@/actions/settings-actions';

const DESTINATION = '/billing?tab=configuration&option=managed';

// Polling cadence. The background task typically finishes within ~5-15s,
// but OpenRouter can occasionally take longer under load.
const FAST_POLL_MS = 2000;       // first phase
const FAST_POLL_UNTIL_MS = 30_000; // 30s at 2s = 15 fast polls
const SLOW_POLL_MS = 10_000;     // second phase
const OVERALL_TIMEOUT_MS = 180_000; // 3 minutes total

type ViewState =
    | { kind: 'provisioning'; slow: boolean }
    | { kind: 'timeout' }
    | { kind: 'cancelled' }
    | { kind: 'failed' }
    | { kind: 'success' };

function isManagedKeyReady(config: Awaited<ReturnType<typeof getBillingConfig>>): boolean {
    if (!config) return false;
    if (config.subscription_type !== 'managed') return false;
    const key = config.byok_api_key;
    if (!key || key === '••••••••') return false;
    return key.startsWith('sk-or-');
}

export default function ConfirmingPayment() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const status = searchParams.get('status');
    const txRef = searchParams.get('tx_ref');

    const [view, setView] = useState<ViewState>(() => {
        if (status === 'cancelled') return { kind: 'cancelled' };
        if (status === 'failed') return { kind: 'failed' };
        return { kind: 'provisioning', slow: false };
    });

    const startedAtRef = useRef<number>(Date.now());
    const stoppedRef = useRef(false);

    useEffect(() => {
        // If the URL tells us the payment didn't succeed, don't poll at all.
        if (view.kind === 'cancelled' || view.kind === 'failed') return;

        let timer: ReturnType<typeof setTimeout> | null = null;
        stoppedRef.current = false;

        const tick = async () => {
            if (stoppedRef.current) return;

            const elapsed = Date.now() - startedAtRef.current;

            try {
                const config = await getBillingConfig();
                if (stoppedRef.current) return;

                if (isManagedKeyReady(config)) {
                    setView({ kind: 'success' });
                    // Small delay so the user sees the success flash, then redirect.
                    setTimeout(() => router.replace(DESTINATION), 600);
                    return;
                }
            } catch {
                // Ignore transient fetch errors; we'll try again next tick.
            }

            if (elapsed >= OVERALL_TIMEOUT_MS) {
                setView({ kind: 'timeout' });
                return;
            }

            const nextDelay = elapsed < FAST_POLL_UNTIL_MS ? FAST_POLL_MS : SLOW_POLL_MS;
            if (elapsed >= FAST_POLL_UNTIL_MS) {
                setView(prev => (prev.kind === 'provisioning' && !prev.slow ? { kind: 'provisioning', slow: true } : prev));
            }
            timer = setTimeout(tick, nextDelay);
        };

        // Kick off immediately — the key may already be ready on first load.
        tick();

        return () => {
            stoppedRef.current = true;
            if (timer) clearTimeout(timer);
        };
    }, [router, view.kind]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center space-y-6">
                    {view.kind === 'provisioning' && (
                        <>
                            <div className="flex justify-center">
                                <div className="relative">
                                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                                        <ShieldCheck className="w-8 h-8 text-green-600" />
                                    </div>
                                    <LoadingSpinner className="absolute -bottom-1 -right-1 h-6 w-6 text-green-600 bg-white rounded-full p-0.5" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-xl font-bold text-gray-900">
                                    {view.slow ? 'Almost there…' : 'Finalizing your payment'}
                                </h1>
                                <p className="text-sm text-gray-600">
                                    {view.slow
                                        ? "Your payment is confirmed. We're still setting up your managed key — this occasionally takes a minute."
                                        : "We're confirming your payment and generating your managed key. This usually takes just a few seconds."}
                                </p>
                            </div>
                            <div className="pt-2 flex items-center justify-center gap-2 text-xs text-gray-400">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span>Do not close this window</span>
                            </div>
                        </>
                    )}

                    {view.kind === 'success' && (
                        <>
                            <div className="flex justify-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="w-9 h-9 text-green-600" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-xl font-bold text-gray-900">You&apos;re all set</h1>
                                <p className="text-sm text-gray-600">
                                    Your managed key is ready. Redirecting you now…
                                </p>
                            </div>
                        </>
                    )}

                    {view.kind === 'timeout' && (
                        <>
                            <div className="flex justify-center">
                                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="w-9 h-9 text-amber-600" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-xl font-bold text-gray-900">Taking longer than usual</h1>
                                <p className="text-sm text-gray-600">
                                    Your payment is confirmed{txRef ? ` (ref ${txRef})` : ''} and your balance is safe.
                                    Your managed key is still being set up — we&apos;ll keep working on it in the background.
                                </p>
                                <p className="text-xs text-gray-500">
                                    You can head to billing now — the key will appear automatically when it&apos;s ready.
                                    If it still isn&apos;t visible in a few minutes, please contact support.
                                </p>
                            </div>
                            <button
                                onClick={() => router.replace(DESTINATION)}
                                className="w-full py-2.5 px-4 bg-customBlue hover:bg-blue-800 text-white font-medium rounded-lg transition-colors"
                            >
                                Go to billing
                            </button>
                        </>
                    )}

                    {view.kind === 'cancelled' && (
                        <>
                            <div className="flex justify-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                    <XCircle className="w-9 h-9 text-gray-500" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-xl font-bold text-gray-900">Payment cancelled</h1>
                                <p className="text-sm text-gray-600">
                                    You cancelled the payment before it completed. No charges were made.
                                </p>
                            </div>
                            <button
                                onClick={() => router.replace(DESTINATION)}
                                className="w-full py-2.5 px-4 bg-customBlue hover:bg-blue-800 text-white font-medium rounded-lg transition-colors"
                            >
                                Back to billing
                            </button>
                        </>
                    )}

                    {view.kind === 'failed' && (
                        <>
                            <div className="flex justify-center">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                    <XCircle className="w-9 h-9 text-red-600" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-xl font-bold text-gray-900">Payment didn&apos;t complete</h1>
                                <p className="text-sm text-gray-600">
                                    The payment did not go through. If you were charged, the amount will be refunded
                                    automatically. You can try again from the billing page.
                                </p>
                            </div>
                            <button
                                onClick={() => router.replace(DESTINATION)}
                                className="w-full py-2.5 px-4 bg-customBlue hover:bg-blue-800 text-white font-medium rounded-lg transition-colors"
                            >
                                Back to billing
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
