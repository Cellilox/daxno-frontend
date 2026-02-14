"use client";

import { useEffect, useState } from "react";
import { useSyncStatus } from "@/hooks/useSyncStatus";
import { getCachedProjects } from "@/lib/db/indexedDB";
import { useUser } from "@clerk/nextjs";
import { WifiOff } from "lucide-react";
import Link from "next/link";
import { getDashboardStats } from "@/actions/dashboard-actions";

type DashboardStats = {
    projects: number;
    pages: number;
    docs: number;
};

export default function DashboardClient() {
    const { isOnline } = useSyncStatus();
    const { user } = useUser();
    const [stats, setStats] = useState<DashboardStats>({ projects: 0, pages: 0, docs: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            try {
                if (isOnline) {
                    // Fetch from server using Server Action
                    const data = await getDashboardStats(user?.id);
                    setStats(data);
                } else {
                    // Offline: show cached project count only
                    const cached = await getCachedProjects(user?.id || '');
                    setStats({ projects: cached.length, pages: 0, docs: 0 });
                }
            } catch (error) {
                console.error("[DashboardClient] Failed to load stats:", error);
                // Try to show cached data as fallback
                try {
                    const cached = await getCachedProjects(user?.id || '');
                    setStats({ projects: cached.length, pages: 0, docs: 0 });
                } catch {
                    // Silent fail
                }
            } finally {
                setLoading(false);
            }
        }
        if (user) loadStats();
    }, [isOnline, user]);

    if (!isOnline) {
        return (
            <div className="mx-auto p-6 md:p-12 min-h-screen bg-gray-50">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                    <div className="flex items-center">
                        <WifiOff className="w-5 h-5 text-yellow-600 mr-2" />
                        <p className="text-yellow-700 font-medium">Limited Offline Mode</p>
                    </div>
                    <p className="text-yellow-600 text-sm mt-1">
                        Some statistics require an internet connection
                    </p>
                </div>

                <h1 className="text-3xl font-bold text-gray-800 mb-8">Overview</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link href="/projects" className="bg-yellow-50 p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Projects</h2>
                        <p className="text-4xl font-bold text-blue-600">{stats.projects}</p>
                        <p className="text-gray-500">Cached Locally</p>
                    </Link>

                    <div className="bg-gray-100 p-6 rounded-lg shadow-lg opacity-60">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Pages</h2>
                        <p className="text-4xl font-bold text-gray-400">—</p>
                        <p className="text-gray-400 text-sm">Requires internet</p>
                    </div>
                </div>
            </div>
        );
    }

    // Online version
    return (
        <div className="mx-auto p-6 md:p-12 min-h-screen bg-gray-50">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Overview</h1>
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-200 animate-pulse p-6 rounded-lg h-32"></div>
                    <div className="bg-gray-200 animate-pulse p-6 rounded-lg h-32"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link href="/projects" className="bg-yellow-50 p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Projects</h2>
                        <p className="text-4xl font-bold text-blue-600">{stats.projects}</p>
                        <p className="text-gray-500">Total Projects</p>
                    </Link>

                    <div className="bg-blue-50 p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Pages</h2>
                        <p className="text-4xl font-bold text-blue-600">{stats.pages}</p>
                        <p className="text-gray-500">{stats.docs} Documents</p>
                        <p className="text-xs text-gray-400">Including what you deleted if there is any</p>
                    </div>
                </div>
            )}
        </div>
    );
}
