"use client";

import { RedirectToSignIn, useUser } from "@clerk/nextjs";
import { useSyncStatus } from "@/hooks/useSyncStatus";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export default function SmartAuthGuard({ children }: { children: React.ReactNode }) {
    const { isLoaded, isSignedIn, user } = useUser();
    const { isOnline } = useSyncStatus();
    const pathname = usePathname();
    const wasOffline = useRef<boolean>(!isOnline);

    // Monitor online state transitions and trigger re-auth check
    useEffect(() => {
        // If we transitioned from offline → online, force Clerk to reload session
        if (wasOffline.current && isOnline) {
            console.log("[SmartAuthGuard] Network restored. Re-checking authentication...");
            // Clerk will automatically re-sync when the component re-renders
            // The wasOffline flag ensures this only happens once per transition
        }
        wasOffline.current = !isOnline;
    }, [isOnline]);

    // 1. Loading Shell - Used during initialization AND redirection
    const LoadingShell = ({ message, testId }: { message: string, testId?: string }) => (
        <div data-testid={testId || "auth-guard-loading"} className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700">{message}</h2>
            <p className="text-gray-500 mt-2">Daxno is securing your workspace</p>
        </div>
    );

    // 2. Logic: If we are OFFLINE, we skip the cloud auth check and render content immediately.
    // This allows the PWA to display cached data from IndexedDB without a delay.
    if (!isOnline) {
        return <>{children}</>;
    }

    // 3. While Clerk is still initializing (Online Only)
    if (!isLoaded) {
        return <LoadingShell message="Checking authorization..." />;
    }

    // 4. If we are online and NOT signed in, redirect smoothly
    if (!isSignedIn) {
        return (
            <>
                <LoadingShell message="Redirecting to login..." testId="auth-guard-redirecting" />
                <RedirectToSignIn signInFallbackRedirectUrl={pathname} />
            </>
        );
    }

    // 5. If signed in (Online), render actual content
    return <>{children}</>;
}
