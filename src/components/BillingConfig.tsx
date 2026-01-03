'use client';

import { useState, useMemo } from 'react';
import { updateBillingConfig } from '@/actions/settings-actions';
import LoadingSpinner from './ui/LoadingSpinner';

interface ModelInfo {
    id: string;
    name: string;
    description?: string;
    pricing?: {
        prompt: string;
        completion: string;
    };
    context_length?: number;
}

interface BillingConfigProps {
    initialConfig: {
        subscription_type: string;
        byok_api_key?: string;
        preferred_models?: { default?: string; visible: string[] } | string[];
    } | null;
    trustedModels: {
        professional: string[];
        starter: string[];
        free: string[];
    } | null;
    allModels: ModelInfo[] | null;
}

export default function BillingConfig({ initialConfig, trustedModels, allModels }: BillingConfigProps) {
    const [subscriptionType, setSubscriptionType] = useState(initialConfig?.subscription_type || 'standard');
    const [apiKey, setApiKey] = useState(initialConfig?.byok_api_key || '');

    // Parse initial preferred models (handle legacy list or new dict)
    const initialVisible = useMemo(() => {
        const pm = initialConfig?.preferred_models;
        if (!pm) return [];
        if (Array.isArray(pm)) return pm;
        return (pm as any).visible || [];
    }, [initialConfig]);

    const initialDefault = useMemo(() => {
        const pm = initialConfig?.preferred_models;
        if (!pm) return '';
        if (Array.isArray(pm)) return ''; // No default in legacy format
        return (pm as any).default || '';
    }, [initialConfig]);

    const [preferredModels, setPreferredModels] = useState<string[]>(initialVisible);
    const [defaultModel, setDefaultModel] = useState<string>(initialDefault);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSave = async () => {
        setIsSaving(true);
        setMessage(null);
        try {
            // Construct payload
            const payload = {
                visible: preferredModels,
                default: defaultModel || (preferredModels.length > 0 ? preferredModels[0] : '')
            };

            await updateBillingConfig(subscriptionType, apiKey, payload);
            setMessage({ type: 'success', text: 'Configuration updated successfully.' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update configuration.' });
        } finally {
            setIsSaving(false);
        }
    };

    const toggleModel = (modelId: string) => {
        if (preferredModels.includes(modelId)) {
            const newModels = preferredModels.filter(m => m !== modelId);
            setPreferredModels(newModels);
            // If we removed the default model, reset default
            if (defaultModel === modelId) {
                setDefaultModel(newModels.length > 0 ? newModels[0] : '');
            }
        } else {
            const newModels = [...preferredModels, modelId];
            setPreferredModels(newModels);
            // If it's the first model, make it default automatically
            if (newModels.length === 1) {
                setDefaultModel(modelId);
            }
        }
    };

    const filteredModels = useMemo(() => {
        if (!allModels) return [];
        if (!searchTerm) return allModels;
        return allModels.filter(m =>
            m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (m.description && m.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            m.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allModels, searchTerm]);

    return (
        <div className="max-w-2xl mx-auto mb-8 px-4">
            <div className="bg-white shadow-md rounded-lg p-6 space-y-6">
                <div>
                    <h2 className="text-xl font-bold mb-2">LLM Configuration</h2>
                    <p className="text-gray-600 text-sm">Choose how you want to pay for AI usage.</p>
                </div>

                <div className="flex flex-col space-y-4">
                    {/* Option 1: Standard */}
                    <label className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${subscriptionType === 'standard' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input
                            type="radio"
                            name="billing_type"
                            value="standard"
                            checked={subscriptionType === 'standard'}
                            onChange={() => setSubscriptionType('standard')}
                            className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        />
                        <div className="ml-3">
                            <span className="block text-sm font-medium text-gray-900">Standard Subscription</span>
                            <span className="block text-sm text-gray-500">Your monthly subscription includes AI usage limits. Simple and managed.</span>
                        </div>
                    </label>

                    {/* Option 2: BYOK */}
                    <label className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${subscriptionType === 'byok' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input
                            type="radio"
                            name="billing_type"
                            value="byok"
                            checked={subscriptionType === 'byok'}
                            onChange={() => setSubscriptionType('byok')}
                            className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        />
                        <div className="ml-3">
                            <span className="block text-sm font-medium text-gray-900">Bring Your Own Key (BYOK)</span>
                            <span className="block text-sm text-gray-500">Use your own OpenRouter API Key. You pay only a small service fee to us, and pay AI usage directly to OpenRouter.</span>
                        </div>
                    </label>
                </div>

                {subscriptionType === 'standard' && (
                    <div className="space-y-4 mt-4 pt-4 border-t border-gray-100">
                        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-indigo-900">Managed AI Models</h3>
                                    <div className="mt-1 text-sm text-indigo-700">
                                        <p>
                                            Your subscription includes access to our curated list of trusted models.
                                            We automatically assign and rotate default models to ensure optimal performance and availability.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Available in your tier</h4>
                            <div className="flex flex-wrap gap-2">
                                {Array.from(new Set([
                                    ...(trustedModels?.free || []),
                                    ...(trustedModels?.starter || []),
                                    ...(trustedModels?.professional || [])
                                ])).map(m => (
                                    <span key={m} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white text-gray-700 border border-gray-200 shadow-sm">
                                        {m.split('/').pop()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {subscriptionType === 'byok' && (
                    <div className="space-y-6 mt-4 pt-4 border-t border-gray-100">
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-2">OpenRouter API Key</label>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="sk-or-..."
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {initialConfig?.byok_api_key && apiKey === initialConfig.byok_api_key ? "Key is set (masked)." : "Enter your OpenRouter API Key."}
                            </p>
                        </div>

                        {/* Model Selection (Searchable) */}
                        {allModels && (
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium text-gray-900">Preferred Models</h3>
                                    <span className="text-xs text-gray-500">{preferredModels.length} selected</span>
                                </div>
                                <p className="text-xs text-gray-500 mb-4">Search and select any OpenRouter models you want to use. Please select a Default Model.</p>

                                {/* Search Bar */}
                                <input
                                    type="text"
                                    placeholder="Search models (e.g. gpt-4, claude, deepseek)..."
                                    className="w-full border border-gray-300 rounded-lg p-2 mb-4 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />

                                <div className="max-h-96 overflow-y-auto pr-2 border border-gray-100 rounded-lg p-2">
                                    <div className="grid grid-cols-1 gap-2">
                                        {filteredModels.slice(0, 50).map(model => (
                                            <div key={model.id} className={`flex items-start p-2 rounded-md border transition-colors ${preferredModels.includes(model.id) ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}`}>
                                                <div className="flex items-center h-5">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                        checked={preferredModels.includes(model.id)}
                                                        onChange={() => toggleModel(model.id)}
                                                    />
                                                </div>
                                                <div className="ml-3 flex-1">
                                                    <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleModel(model.id)}>
                                                        <span className="text-sm font-medium text-gray-900 truncate mr-2" title={model.name}>{model.name}</span>
                                                        <span className="text-xs text-gray-400 font-mono hidden sm:inline-block shrink-0">{model.id}</span>
                                                    </div>
                                                    {model.description && <p className="text-xs text-gray-500 truncate" title={model.description}>{model.description}</p>}

                                                    {/* Default Model Selector - Only show if selected */}
                                                    {preferredModels.includes(model.id) && (
                                                        <div className="mt-2 flex items-center">
                                                            <input
                                                                type="radio"
                                                                name="default_model"
                                                                checked={defaultModel === model.id}
                                                                onChange={() => setDefaultModel(model.id)}
                                                                className="h-3 w-3 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                                            />
                                                            <span className="ml-2 text-xs text-gray-600 cursor-pointer" onClick={() => setDefaultModel(model.id)}>Set as Default</span>
                                                            {defaultModel === model.id && <span className="ml-2 text-xs font-semibold text-indigo-600 bg-indigo-100 px-1.5 rounded">Default</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {filteredModels.length > 50 && (
                                            <div className="text-center text-xs text-gray-500 py-2">
                                                Showing top 50 matches. Refine search to see more.
                                            </div>
                                        )}
                                        {filteredModels.length === 0 && (
                                            <div className="text-center text-sm text-gray-500 py-4">
                                                No models found matching "{searchTerm}"
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    {message && (
                        <span className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                            {message.text}
                        </span>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="ml-auto bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg flex items-center disabled:opacity-50"
                    >
                        {isSaving && <LoadingSpinner className="mr-2 h-4 w-4 text-white" />}
                        Save Changes
                    </button>
                </div>

            </div>
        </div>
    );
}
