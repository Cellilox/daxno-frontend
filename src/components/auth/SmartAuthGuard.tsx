"use client";

import { RedirectToSignIn, useUser } from "@clerk/nextjs";
import { useSyncStatus } from "@/hooks/useSyncStatus";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function SmartAuthGuard({ children }: { children: React.ReactNode }) {
    const { isLoaded, isSignedIn } = useUser();
    const { isOnline } = useSyncStatus();
    const pathname = usePathname();
    const [showRetry, setShowRetry] = useState(false);
    const [allowBypass, setAllowBypass] = useState(false);
    const wasOffline = useRef<boolean>(!isOnline);

    useEffect(() => {
        let retryTimer: NodeJS.Timeout;
        let bypassTimer: NodeJS.Timeout;

        if (isOnline && !isLoaded) {
            // Show retry button after 8 seconds
            retryTimer = setTimeout(() => {
                setShowRetry(true);
            }, 8000);

            // Allow bypass after 15 seconds if Clerk never loads
            bypassTimer = setTimeout(() => {
                console.warn('[SmartAuthGuard] Clerk initialization timeout - allowing bypass');
                setAllowBypass(true);
            }, 15000);

            return () => {
                clearTimeout(retryTimer);
                clearTimeout(bypassTimer);
            };
        } else {
            setShowRetry(false);
            setAllowBypass(false);
        }
    }, [isOnline, isLoaded]);

    const handleRetry = () => {
        window.location.reload();
    };

    const LoadingShell = ({ message, testId }: { message: string, testId?: string }) => (
        <div data-testid={testId || "auth-guard-loading"} className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700">{message}</h2>
            <p className="text-gray-500 mt-2">Daxno is securing your workspace</p>
        </div>
    );

    if (!isOnline) {
        return <>{children}</>;
    }

    // If Clerk hasn't loaded and we haven't allowed bypass yet, show loading
    if (!isLoaded && !allowBypass) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh]">
                <LoadingShell message="Checking authorization..." />
                {showRetry && (
                    <div className="absolute mt-48 animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col items-center">
                        <p className="text-sm text-gray-500 mb-4 text-center px-6 max-w-sm">
                            This is taking longer than expected. The connection might be unstable.
                        </p>
                        <button
                            onClick={handleRetry}
                            className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95"
                        >
                            Retry Now
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // If we bypassed (timeout) or Clerk loaded, check sign-in status
    if (isLoaded && !isSignedIn) {
        return (
            <>
                <LoadingShell message="Redirecting to login..." testId="auth-guard-redirecting" />
                <RedirectToSignIn signInFallbackRedirectUrl={pathname} />
            </>
        );
    }

    return <>{children}</>;
}
