"use client";

import SmartAuthGuard from "@/components/auth/SmartAuthGuard";
import { useSyncStatus } from "@/hooks/useSyncStatus";
import { WifiOff } from "lucide-react";

export default function BillingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isOnline } = useSyncStatus();

    if (!isOnline) {
        return (
            <SmartAuthGuard>
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center p-8 max-w-md">
                        <WifiOff className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-700 mb-2">
                            Billing Requires Internet Connection
                        </h2>
                        <p className="text-gray-500 mb-4">
                            Payment information and transaction history must be fetched
                            in real-time for security reasons.
                        </p>
                        <p className="text-sm text-gray-400">
                            Please reconnect to manage your subscription.
                        </p>
                    </div>
                </div>
            </SmartAuthGuard>
        );
    }

    return <SmartAuthGuard>{children}</SmartAuthGuard>;
}
