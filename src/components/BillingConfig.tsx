'use client';

import { useState, useMemo, useEffect } from 'react';
import { updateBillingConfig, provisionManagedByok, rotateManagedByok, getByokUsage, getManagedByokActivity } from '@/actions/settings-actions';
import LoadingSpinner from './ui/LoadingSpinner';
import { RefreshCcw, ShieldCheck, CreditCard, Activity, BarChart3, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

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
    const [isProvisioning, setIsProvisioning] = useState(false);
    const [usage, setUsage] = useState<{ usage: number; limit: number; status: string; tokens?: number; requests?: number } | null>(null);
    const [activity, setActivity] = useState<any[]>([]);
    const [isModelsOpen, setIsModelsOpen] = useState(false);
    const [isActivityOpen, setIsActivityOpen] = useState(true);
    const [isLoadingActivity, setIsLoadingActivity] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Fetch usage and activity on mount if BYOK
    useEffect(() => {
        if (subscriptionType === 'byok' && apiKey) {
            getByokUsage().then(u => setUsage(u));

            setIsLoadingActivity(true);
            getManagedByokActivity().then(a => {
                setActivity(a);
                setIsLoadingActivity(false);
            }).catch(() => setIsLoadingActivity(false));
        }
    }, [subscriptionType, apiKey]);

    const handleProvision = async () => {
        setIsProvisioning(true);
        setMessage(null);
        try {
            const result = await provisionManagedByok(0.10); // Initial $0.10 test limit
            setApiKey(result.api_key);
            setMessage({ type: 'success', text: 'Managed key generated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to generate managed key.' });
        } finally {
            setIsProvisioning(false);
        }
    };

    const handleRotate = async () => {
        setIsProvisioning(true);
        setMessage(null);
        try {
            const result = await rotateManagedByok();
            setApiKey(result.api_key);
            setMessage({ type: 'success', text: 'Key regenerated. Remaining balance preserved.' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to regenerate key.' });
        } finally {
            setIsProvisioning(false);
        }
    };

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

    const sortedAndFilteredModels = useMemo(() => {
        if (!allModels) return [];

        let filtered = allModels;
        if (searchTerm) {
            filtered = allModels.filter(m =>
                m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (m.description && m.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                m.id.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Sort: Selected first, then Alpha
        return [...filtered].sort((a, b) => {
            const aSelected = preferredModels.includes(a.id);
            const bSelected = preferredModels.includes(b.id);
            if (aSelected && !bSelected) return -1;
            if (!aSelected && bSelected) return 1;
            return a.name.localeCompare(b.name);
        });
    }, [allModels, searchTerm, preferredModels]);

    return (
        <div className="max-w-2xl mx-auto mb-8 px-4">
            <div className="bg-white shadow-md rounded-lg p-6 space-y-6">
                <div>
                    <h2 className="text-xl font-bold mb-2">LLM Configuration</h2>
                    <p className="text-gray-600 text-sm">Choose how you want to pay for AI usage.</p>
                </div>

                <div className="flex flex-col space-y-4">
                    {/* Option 1: Standard */}
                    <label className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${subscriptionType === 'standard' ? 'border-customBlue bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input
                            type="radio"
                            name="billing_type"
                            value="standard"
                            checked={subscriptionType === 'standard'}
                            onChange={() => setSubscriptionType('standard')}
                            className="mt-1 h-4 w-4 text-customBlue border-gray-300 focus:ring-customBlue"
                        />
                        <div className="ml-3">
                            <span className={`block text-sm font-medium ${subscriptionType === 'standard' ? 'text-customBlue' : 'text-gray-900'}`}>Standard Subscription</span>
                            <span className="block text-sm text-gray-500">Your monthly subscription includes AI usage limits. Simple and managed.</span>
                        </div>
                    </label>

                    {/* Option 2: BYOK */}
                    <label className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${subscriptionType === 'byok' ? 'border-customBlue bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input
                            type="radio"
                            name="billing_type"
                            value="byok"
                            checked={subscriptionType === 'byok'}
                            onChange={() => setSubscriptionType('byok')}
                            className="mt-1 h-4 w-4 text-customBlue border-gray-300 focus:ring-customBlue"
                        />
                        <div className="ml-3">
                            <span className={`block text-sm font-medium ${subscriptionType === 'byok' ? 'text-customBlue' : 'text-gray-900'}`}>Bring Your Own Key (BYOK)</span>
                            <span className="block text-sm text-gray-500">Use your own OpenRouter API Key. You pay only a small service fee to us, and pay AI usage directly to OpenRouter.</span>
                        </div>
                    </label>
                </div>

                {subscriptionType === 'standard' && (
                    <div className="space-y-4 mt-4 pt-4 border-t border-gray-100">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <ShieldCheck className="h-5 w-5 text-customBlue" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-blue-900">Managed AI Models</h3>
                                    <div className="mt-1 text-sm text-blue-700">
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
                            <div className="flex items-center justify-between mb-4">
                                <label className="block text-sm font-medium text-gray-700">OpenRouter API Key</label>
                                <button
                                    onClick={apiKey ? handleRotate : handleProvision}
                                    disabled={isProvisioning}
                                    className="flex items-center text-xs font-semibold text-customBlue hover:underline disabled:opacity-50"
                                >
                                    {isProvisioning ? (
                                        <LoadingSpinner className="mr-1 h-3 w-3 text-customBlue" />
                                    ) : (
                                        apiKey ? <RefreshCcw className="mr-1 h-3 w-3" /> : <ShieldCheck className="mr-1 h-3 w-3" />
                                    )}
                                    {apiKey ? 'Regenerate Managed Key' : 'Generate Secure Managed Key'}
                                </button>
                            </div>

                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="sk-or-..."
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-customBlue focus:border-customBlue"
                            />

                            {usage && (
                                <div className="mt-4 space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-medium text-gray-600">
                                            <div className="flex items-center">
                                                <CreditCard className="mr-1.5 h-3 w-3" />
                                                <span>Usage Credits</span>
                                            </div>
                                            <span>${usage.usage.toFixed(4)} / ${usage.limit.toFixed(2)}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="bg-customBlue h-full transition-all duration-500"
                                                style={{ width: `${Math.min(100, (usage.usage / usage.limit) * 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Detailed Stats */}
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="p-2 bg-white rounded border border-gray-100 flex items-center justify-between group">
                                            <div className="flex items-center">
                                                <Activity className="h-4 w-4 text-gray-400 mr-2" />
                                                <div>
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Total Requests</p>
                                                    <p className="text-sm font-semibold text-gray-900">{usage.requests?.toLocaleString() || 0}</p>
                                                </div>
                                            </div>
                                            <div className="flex space-x-1">
                                                <button
                                                    onClick={() => {
                                                        setIsActivityOpen(true);
                                                        const el = document.getElementById('recent-activity');
                                                        el?.scrollIntoView({ behavior: 'smooth' });
                                                    }}
                                                    className="p-1 hover:bg-blue-50 rounded text-customBlue transition-colors flex items-center text-[10px] font-bold"
                                                    title="Scroll to detailed activity logs"
                                                >
                                                    DETAILS
                                                    <ChevronDown className="ml-1 h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-2 bg-white rounded border border-gray-100 flex items-center">
                                            <BarChart3 className="h-4 w-4 text-gray-400 mr-2" />
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold">Total Tokens</p>
                                                <p className="text-sm font-semibold text-gray-900">{usage.tokens?.toLocaleString() || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <p className="text-xs text-gray-500 mt-2 italic">
                                {apiKey ? "Key is set. You can regenerate it while preserving your remaining balance." : "Generate a secure managed key or enter your own OpenRouter key."}
                            </p>
                        </div>

                        {/* Model Selection - Hidden until API key is present */}
                        {apiKey && allModels && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                                <button
                                    onClick={() => setIsModelsOpen(!isModelsOpen)}
                                    className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors mb-4"
                                >
                                    <div className="flex items-center">
                                        <h3 className="text-sm font-semibold text-gray-900">Preferred Models</h3>
                                        <span className="ml-2 px-2 py-0.5 bg-customBlue text-white text-[10px] font-bold rounded-full">{preferredModels.length}</span>
                                    </div>
                                    {isModelsOpen ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                                </button>

                                {isModelsOpen && (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                        <p className="text-xs text-gray-500 mb-4">Search and select any OpenRouter models you want to use. You must select a Default Model to save changes.</p>

                                        {/* Search Bar */}
                                        <input
                                            type="text"
                                            placeholder="Search models (e.g. gpt-4, claude, deepseek)..."
                                            className="w-full border border-gray-300 rounded-lg p-2 mb-4 text-sm focus:ring-customBlue focus:border-customBlue text-black"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />

                                        <div className="max-h-80 overflow-y-auto pr-2 border border-blue-50 rounded-lg p-2 bg-white">
                                            <div className="grid grid-cols-1 gap-2">
                                                {sortedAndFilteredModels.slice(0, 50).map((model: any) => (
                                                    <div key={model.id} className={`flex items-start p-2 rounded-md border transition-colors ${preferredModels.includes(model.id) ? 'border-customBlue bg-blue-50' : 'border-gray-200'}`}>
                                                        <div className="flex items-center h-5">
                                                            <input
                                                                type="checkbox"
                                                                className="h-4 w-4 text-customBlue focus:ring-customBlue border-gray-300 rounded"
                                                                checked={preferredModels.includes(model.id)}
                                                                onChange={() => toggleModel(model.id)}
                                                            />
                                                        </div>
                                                        <div className="ml-3 flex-1">
                                                            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleModel(model.id)}>
                                                                <span className="text-sm font-medium text-gray-900 truncate max-w-[180px]" title={model.name}>{model.name}</span>
                                                                <span className="text-xs text-gray-400 font-mono hidden sm:inline-block shrink-0">{model.id}</span>
                                                            </div>
                                                            {model.description && <p className="text-xs text-gray-500 truncate max-w-[300px]" title={model.description}>{model.description}</p>}

                                                            {/* Default Model Selector - Only show if selected */}
                                                            {preferredModels.includes(model.id) && (
                                                                <div className="mt-2 flex items-center">
                                                                    <input
                                                                        type="radio"
                                                                        name="default_model"
                                                                        checked={defaultModel === model.id}
                                                                        onChange={() => setDefaultModel(model.id)}
                                                                        className="h-3 w-3 text-customBlue border-gray-300 focus:ring-customBlue"
                                                                    />
                                                                    <span className="ml-2 text-xs text-gray-600 cursor-pointer" onClick={() => setDefaultModel(model.id)}>Set as Default</span>
                                                                    {defaultModel === model.id && <span className="ml-2 text-xs font-semibold text-customBlue bg-blue-100 px-1.5 rounded">Default</span>}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                                {sortedAndFilteredModels.length > 50 && (
                                                    <div className="text-center text-xs text-gray-500 py-2">
                                                        Showing top 50 matches. Refine search to see more.
                                                    </div>
                                                )}
                                                {sortedAndFilteredModels.length === 0 && (
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

                        {/* Activity Log Table - Now always rendered when BYOK is active */}
                        <div className="mt-8 border-t border-gray-100 pt-6" id="recent-activity">
                            <button
                                onClick={() => setIsActivityOpen(!isActivityOpen)}
                                className="w-full flex items-center justify-between mb-4 hover:bg-gray-50 p-2 rounded transition-colors"
                            >
                                <h3 className="text-sm font-medium text-gray-900 flex items-center">
                                    <Activity className={`mr-2 h-4 w-4 text-customBlue ${isLoadingActivity ? 'animate-pulse' : ''}`} />
                                    Recent Activity
                                    {isLoadingActivity && <LoadingSpinner className="ml-2 h-3 w-3 text-customBlue" />}
                                </h3>
                                {isActivityOpen ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                            </button>

                            {isActivityOpen && (
                                <div className="animate-in fade-in duration-500">
                                    {activity.length > 0 ? (
                                        <>
                                            <div className="overflow-x-auto border border-gray-100 rounded-lg shadow-sm">
                                                <table className="min-w-full divide-y divide-gray-200 text-xs text-black">
                                                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase">
                                                        <tr>
                                                            <th className="px-3 py-2 text-left">Model</th>
                                                            <th className="px-3 py-2 text-right">Tokens</th>
                                                            <th className="px-3 py-2 text-right">Cost</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-100">
                                                        {activity.slice(0, 15).map((row, idx) => (
                                                            <tr key={idx} className="hover:bg-gray-50">
                                                                <td className="px-3 py-2 text-gray-900 font-medium truncate max-w-[120px]" title={row.model}>{row.model.split('/').pop()}</td>
                                                                <td className="px-3 py-2 text-right text-gray-600">
                                                                    {((row.prompt_tokens || 0) + (row.completion_tokens || 0)).toLocaleString()}
                                                                </td>
                                                                <td className="px-3 py-2 text-right text-customBlue font-bold">
                                                                    ${(row.usage || 0).toFixed(4)}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-2 text-center italic">Showing last 15 requests. Data refreshes on page reload.</p>
                                        </>
                                    ) : (
                                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                            <BarChart3 className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">No recent activity found.</p>
                                            <p className="text-[10px] text-gray-400 mt-1">Activity logs appear here after your first few requests.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
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
                        disabled={isSaving || (subscriptionType === 'byok' && !!apiKey && !defaultModel)}
                        className="ml-auto bg-customBlue hover:bg-[#1e3470] text-white font-medium py-2 px-4 rounded-lg flex items-center disabled:opacity-50 transition-colors"
                    >
                        {isSaving && <LoadingSpinner className="mr-2 h-4 w-4 text-white" />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
