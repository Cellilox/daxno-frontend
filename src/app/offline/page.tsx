"use client";

import Link from "next/link";
import { WifiOff, RefreshCcw } from "lucide-react";

export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 max-w-md w-full animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <WifiOff size={40} />
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">You're Offline</h1>

                <p className="text-gray-600 mb-8 leading-relaxed">
                    It looks like your internet connection is taking a break. Don't worry, your local data is safe!
                </p>

                <div className="space-y-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 active:scale-95"
                    >
                        <RefreshCcw size={18} />
                        Try Reconnecting
                    </button>

                    <Link
                        href="/projects"
                        className="block w-full text-blue-600 hover:text-blue-700 font-semibold py-2"
                    >
                        Go to Dashboard
                    </Link>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100">
                    <p className="text-sm text-gray-400">
                        Daxno will auto-sync your files once you're back online.
                    </p>
                </div>
            </div>
        </div>
    );
}
