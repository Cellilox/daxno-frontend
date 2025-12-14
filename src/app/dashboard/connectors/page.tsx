"use client";

import React, { useEffect, useState } from "react";
import { Link, RefreshCw, ExternalLink } from "lucide-react";

interface ConnectorSnapshot {
    id: number;
    name: string;
    source: string;
    input_type: string;
    connector_specific_config: any;
    refresh_freq: number | null;
}

export default function ConnectorsPage() {
    const [connectors, setConnectors] = useState<ConnectorSnapshot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchConnectors = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/onyx/connectors");
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            setConnectors(data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConnectors();
    }, []);

    const [loginLoading, setLoginLoading] = useState(false);

    const handleManageOnyx = async () => {
        setLoginLoading(true);
        try {
            const res = await fetch("/api/onyx/login-url", { method: "POST" });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Failed to get login URL");
            }
            const data = await res.json();
            window.open(data.url, "_blank");
        } catch (e: any) {
            const errorText = e.message;
            console.error(e);
            alert(`Could not log you into Onyx automatically. Error: ${errorText}`);
        } finally {
            setLoginLoading(false);
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Link className="text-blue-600" /> Connected Data Sources
                    </h1>
                    <p className="text-gray-500 mt-1">Manage external data sources synced via Onyx AI.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchConnectors}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        title="Refresh List"
                    >
                        <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                    </button>
                    <button
                        onClick={handleManageOnyx}
                        disabled={loginLoading}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {loginLoading ? <RefreshCw size={16} className="animate-spin" /> : <ExternalLink size={16} />}
                        Manage in Onyx (Auto Login)
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
                    Error loading connectors: {error}
                </div>
            )}

            {loading && !connectors.length ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {connectors.length === 0 && !error && (
                        <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500">No connectors found. Add one in Onyx to get started.</p>
                        </div>
                    )}

                    {connectors.map((connector) => (
                        <div key={connector.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-blue-50 text-blue-700 font-semibold px-3 py-1 rounded-full text-xs uppercase tracking-wide">
                                    {connector.source}
                                </div>
                                {connector.refresh_freq && (
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <RefreshCw size={12} /> every {connector.refresh_freq}s
                                    </span>
                                )}
                            </div>
                            <h3 className="font-semibold text-lg text-gray-900 mb-2 truncate" title={connector.name}>
                                {connector.name}
                            </h3>

                            <div className="text-sm text-gray-500 mb-4">
                                {/* Display some config if available */}
                                Config: {Object.keys(connector.connector_specific_config || {}).join(", ") || "Standard"}
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex justify-end">
                                <span className="text-xs text-green-600 font-medium px-2 py-1 bg-green-50 rounded">
                                    Active
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
