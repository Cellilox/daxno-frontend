import React, { useState, useEffect } from 'react';
import { ModelInfo } from '../Models';
import { verifyProviderKey } from '@/actions/settings-actions';
import { CheckCircleIcon, XCircleIcon, KeyIcon } from 'lucide-react';

interface BYOKConfigProps {
    apiKey: string;
    setApiKey: (key: string) => void;
    provider: string;
    setProvider: (provider: string) => void;
    providerModels: ModelInfo[];
    setProviderModels: (models: ModelInfo[]) => void;
    setPreferredModels: (models: string[]) => void;
    setDefaultModel: (model: string) => void;
    isVerified: boolean;
    setIsVerified: (verified: boolean) => void;
}

export default function BYOKConfig({
    apiKey,
    setApiKey,
    provider,
    setProvider,
    providerModels,
    setProviderModels,
    setPreferredModels,
    setDefaultModel,
    isVerified,
    setIsVerified
}: BYOKConfigProps) {
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const isMasked = apiKey === '••••••••' || apiKey === '********';
        if (isMasked) {
            setIsVerified(true);
        } else if (!apiKey) {
            setIsVerified(false);
            setSuccessMessage(null);
            setError(null);
        } else if (!isVerified) {
            // Reset messages only when starting to type a new, unverified key
            setSuccessMessage(null);
            setError(null);
        }
    }, [apiKey, isVerified, setIsVerified]);



    const handleVerify = async () => {
        if (!apiKey || !provider) return;

        setIsVerifying(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const { verifyProviderKey } = await import('@/actions/settings-actions');
            const result = await verifyProviderKey(provider, apiKey);

            if (result.success && result.models) {
                setProviderModels(result.models);
                // Clear existing preferences on new verification
                setPreferredModels([]);
                setDefaultModel('');
                setIsVerified(true);
                setSuccessMessage(`Connected! Found ${result.models.length} models.`);
            } else {
                throw new Error("Verification failed: No models returned");
            }
        } catch (err: any) {
            console.error("Verification failed:", err);
            setError(err.message || "Failed to verify API key");
            setIsVerified(false);
            setProviderModels([]);
        } finally {
            setIsVerifying(false);
        }
    };


    const getProviderLabel = (p: string) => {
        switch (p) {
            case 'openai': return 'OpenAI';
            case 'anthropic': return 'Anthropic';
            case 'deepseek': return 'DeepSeek';
            case 'google_vertex': return 'Google Gemini';
            case 'openrouter': return 'OpenRouter';
            default: return p;
        }
    };

    return (
        <div className="space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50/50">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <KeyIcon className="w-4 h-4 text-gray-500" />
                Provider Configuration
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        AI Provider
                    </label>
                    <select
                        value={provider}
                        onChange={(e) => {
                            setProvider(e.target.value);
                            setApiKey('');
                            setProviderModels([]);
                            setIsVerified(false);
                            setPreferredModels([]);
                            setDefaultModel('');
                        }}
                        className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-customBlue focus:border-customBlue bg-white"
                    >
                        <option value="openrouter">OpenRouter (Recommended)</option>
                        <option value="openai">OpenAI</option>
                        <option value="anthropic">Anthropic (Claude)</option>
                        <option value="google_vertex">Google Gemini</option>
                        <option value="deepseek">DeepSeek</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        API Key for {getProviderLabel(provider)}
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder={apiKey === '••••••••' ? '••••••••' : `sk-...`}
                            className="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:ring-customBlue focus:border-customBlue"
                        />
                        <button
                            onClick={handleVerify}
                            disabled={!apiKey || apiKey === '••••••••' || isVerifying || (isVerified && apiKey === '••••••••')}
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2
                                ${isVerified
                                    ? 'bg-green-100 text-green-700 border border-green-200 cursor-default'
                                    : 'bg-customBlue hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                                }`}
                        >
                            {isVerifying ? (
                                'Checking...'
                            ) : isVerified ? (
                                <>
                                    <CheckCircleIcon className="w-4 h-4" />
                                    Verified
                                </>
                            ) : (
                                'Verify'
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded flex items-center gap-2">
                    <XCircleIcon className="w-4 h-4" />
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="text-xs text-green-600 bg-green-50 p-2 rounded flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4" />
                    {successMessage}
                </div>
            )}

            <p className="text-xs text-gray-500">
                Verify your API key to unlock model selection. We'll verify it by fetching the latest model list from {getProviderLabel(provider)}.
            </p>
        </div>
    );
}
