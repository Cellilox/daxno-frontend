'use client';

import { useState, useMemo, useEffect } from 'react';
import { updateBillingConfig, provisionManagedByok, rotateManagedByok, getByokUsage, getManagedByokActivity } from '@/actions/settings-actions';
import LoadingSpinner from './ui/LoadingSpinner';
import CreditPurchaseModal from './CreditPurchaseModal';
import { RefreshCcw, ShieldCheck, CreditCard, Activity, BarChart3, ChevronDown, ChevronUp, Lock, CheckCircle2 } from 'lucide-react';

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

export interface BillingConfigProps {
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
    currentPlan?: string;
}

export default function BillingConfig({ initialConfig, trustedModels, allModels, currentPlan }: BillingConfigProps) {
    // 3 Modes: 'standard', 'byok' (Own Key), 'managed' (GYOMK)
    // Map initialConfig.subscription_type (standard/byok) to one of these.
    // Ideally backend should support 'managed', but for now we might infer or keep 'byok' for both backend-side but separating UI.
    // Assumption: If subscription_type is 'byok' and user has a managed key (starts with 'sk-or-managed-' or similar? 
    // OR we track it via a flag? 
    // For now, let's treat the UI selection as the source of truth for the *intent*, and backend might just see 'byok' for both.

    // However, if we want to distinguish cleanly on load:
    // If byok_api_key is present and we know it's managed (maybe we don't know easily without a flag), default to 'managed'.
    // Let's default to standard or what's in config.

    const [billingType, setBillingType] = useState<'standard' | 'byok' | 'managed'>(
        initialConfig?.subscription_type === 'byok' ? (initialConfig?.byok_api_key?.startsWith('sk-or-daxno') ? 'managed' : 'byok') : 'standard'
    );

    const [apiKey, setApiKey] = useState(initialConfig?.byok_api_key || '');

    // BYOK Subscription State
    // Check if the actual current plan is 'byok' (case-insensitive)
    const [isByokSubscribed, setIsByokSubscribed] = useState(
        currentPlan?.toLowerCase() === 'byok' || initialConfig?.subscription_type === 'byok'
    );

    // Credit Modal State
    const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);

    // Effect to detect managed key pattern if we want to auto-switch UI on first load (already handled in useState init above somewhat)

    // ... existing logic ...

    // Parse initial preferred models (handle legacy list or new dict)
    const initialVisible = useMemo(() => {
        const pm = initialConfig?.preferred_models;
        if (!pm) return [];
        if (Array.isArray(pm)) return pm;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (pm as any).visible || [];
    }, [initialConfig]);

    const initialDefault = useMemo(() => {
        const pm = initialConfig?.preferred_models;
        if (!pm) return '';
        if (Array.isArray(pm)) return ''; // No default in legacy format
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (pm as any).default || '';
    }, [initialConfig]);

    const [preferredModels, setPreferredModels] = useState<string[]>(initialVisible);
    const [defaultModel, setDefaultModel] = useState<string>(initialDefault);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isProvisioning, setIsProvisioning] = useState(false);
    const [usage, setUsage] = useState<{ usage: number; limit: number; status: string; tokens?: number; requests?: number } | null>(null);
    const [activity, setActivity] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
    const [isModelsOpen, setIsModelsOpen] = useState(false);
    const [isActivityOpen, setIsActivityOpen] = useState(false); // Default closed for cleaner UI
    const [isLoadingActivity, setIsLoadingActivity] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const ACTIVITY_LIMIT = 10;


    // Fetch usage and activity on mount if BYOK/Managed
    useEffect(() => {
        if ((billingType === 'byok' || billingType === 'managed') && apiKey) {
            getByokUsage().then(u => setUsage(u));

            setIsLoadingActivity(true);
            // Fetch first page
            getManagedByokActivity(ACTIVITY_LIMIT, 0).then(a => {
                setActivity(a);
                setHasMore(a.length === ACTIVITY_LIMIT);
                setIsLoadingActivity(false);
            }).catch(() => setIsLoadingActivity(false));
        }
    }, [billingType, apiKey]);

    const handleLoadMore = async () => {
        setIsLoadingMore(true);
        const currentOffset = activity.length;
        try {
            const more = await getManagedByokActivity(ACTIVITY_LIMIT, currentOffset);
            setActivity(prev => [...prev, ...more]);
            setHasMore(more.length === ACTIVITY_LIMIT);
        } catch (e) {
            console.error("Failed to load more activity", e);
        } finally {
            setIsLoadingMore(false);
        }
    };

    const handleProvision = async () => {
        setIsProvisioning(true);
        setMessage(null);
        try {
            const result = await provisionManagedByok(0.10); // Initial $0.10 test limit
            setApiKey(result.api_key);
            setMessage({ type: 'success', text: 'Managed key generated successfully!' });
        } catch {
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
        } catch {
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

            // Map UI billingType to backend subscription_type
            // 'managed' is just 'byok' with a managed key effectively
            const backendSubType = billingType === 'standard' ? 'standard' : 'byok';

            await updateBillingConfig(backendSubType, apiKey, payload);
            setMessage({ type: 'success', text: 'Configuration updated successfully.' });
        } catch {
            setMessage({ type: 'error', text: 'Failed to update configuration.' });
        } finally {
            setIsSaving(false);
        }
    };

    const onPurchaseSuccess = (amount: number) => {
        // Mock: In real flow, webhook updates DB, we just refetch usage or simulate it
        setMessage({ type: 'success', text: `Purchase of $${amount} successful! Key generating...` });

        // If no key, generate one
        if (!apiKey) {
            handleProvision();
        } else {
            // Just refresh usage
            getByokUsage().then(u => setUsage(u));
        }
    };

    const handleByokSubscribe = async () => {
        // Mock BYOK Subscription
        setIsSaving(true);
        setTimeout(() => {
            setIsByokSubscribed(true);
            setIsSaving(false);
            setMessage({ type: 'success', text: 'BYOK Subscription Active!' });
        }, 1500);
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
                    <div
                        onClick={() => setBillingType('standard')}
                        className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all duration-200 ${billingType === 'standard' ? 'border-customBlue bg-blue-50 ring-1 ring-customBlue' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                    >
                        <input
                            type="radio"
                            name="billing_type"
                            value="standard"
                            checked={billingType === 'standard'}
                            onChange={() => setBillingType('standard')}
                            className="mt-1 h-4 w-4 text-customBlue border-gray-300 focus:ring-customBlue"
                        />
                        <div className="ml-3">
                            <span className={`block text-sm font-bold ${billingType === 'standard' ? 'text-customBlue' : 'text-gray-900'}`}>Standard Subscription</span>
                            <span className="block text-sm text-gray-500 mt-1">Simple monthly subscription with managed limits. Best for most users.</span>
                        </div>
                    </div>

                    {/* Option 2: GYOMK (Generate Your Own Managed Key) */}
                    <div
                        onClick={() => setBillingType('managed')}
                        className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all duration-200 ${billingType === 'managed' ? 'border-customBlue bg-blue-50 ring-1 ring-customBlue' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                    >
                        <input
                            type="radio"
                            name="billing_type"
                            value="managed"
                            checked={billingType === 'managed'}
                            onChange={() => setBillingType('managed')}
                            className="mt-1 h-4 w-4 text-customBlue border-gray-300 focus:ring-customBlue"
                        />
                        <div className="ml-3">
                            <span className={`block text-sm font-bold ${billingType === 'managed' ? 'text-customBlue' : 'text-gray-900'}`}>Generate Managed Key (GYOMK)</span>
                            <span className="block text-sm text-gray-500 mt-1">Pre-pay for credits. We manage the key and rotation. Ideal for high volume or fluctuating usage.</span>
                            <div className="flex gap-2 mt-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                    No Monthly Fee
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    Pay as you go
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Option 3: BYOK */}
                    <div
                        onClick={() => setBillingType('byok')}
                        className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all duration-200 ${billingType === 'byok' ? 'border-customBlue bg-blue-50 ring-1 ring-customBlue' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                    >
                        <input
                            type="radio"
                            name="billing_type"
                            value="byok"
                            checked={billingType === 'byok'}
                            onChange={() => setBillingType('byok')}
                            className="mt-1 h-4 w-4 text-customBlue border-gray-300 focus:ring-customBlue"
                        />
                        <div className="ml-3">
                            <span className={`block text-sm font-bold ${billingType === 'byok' ? 'text-customBlue' : 'text-gray-900'}`}>Bring Your Own Key (BYOK)</span>
                            <span className="block text-sm text-gray-500 mt-1">Use your own OpenRouter API key. Direct billing with OpenRouter + small service fee.</span>
                            <div className="flex gap-2 mt-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                    $10/mo Service Fee
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {billingType === 'standard' && (
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

                {billingType === 'managed' && (
                    <div className="space-y-6 mt-4 pt-4 border-t border-gray-100">
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4 sm:gap-0">
                                <label className="block text-sm font-medium text-gray-700 flex items-center">
                                    <ShieldCheck className="w-4 h-4 mr-2 text-green-600" />
                                    Managed Key
                                </label>
                                <button
                                    onClick={() => setIsCreditModalOpen(true)}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center shadow-sm"
                                >
                                    <CreditCard className="mr-2 h-3.5 w-3.5" />
                                    Buy Credits
                                </button>
                            </div>

                            {apiKey ? (
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="text"
                                            value={apiKey}
                                            readOnly
                                            className="flex-1 border border-gray-300 bg-gray-100 text-gray-500 rounded-lg p-2 text-sm font-mono"
                                        />
                                        <button
                                            onClick={handleRotate}
                                            disabled={isProvisioning}
                                            className="p-2 text-gray-500 hover:text-customBlue transition-colors"
                                            title="Rotate Key"
                                        >
                                            <RefreshCcw className={`h-4 w-4 ${isProvisioning ? 'animate-spin' : ''}`} />
                                        </button>
                                    </div>

                                    {usage ? (
                                        <div className="space-y-4 pt-2">
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-medium text-gray-600">
                                                    <span>Available Balance</span>
                                                    <span>${usage.usage.toFixed(4)} / ${usage.limit.toFixed(2)}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="bg-green-500 h-full transition-all duration-500"
                                                        style={{ width: `${Math.min(100, (usage.usage / usage.limit) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Minimal Stats */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-3 bg-white rounded border border-gray-100">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Total Requests</p>
                                                    <p className="text-lg font-bold text-gray-900">{usage.requests?.toLocaleString() || 0}</p>
                                                </div>
                                                <div className="p-3 bg-white rounded border border-gray-100">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Total Tokens</p>
                                                    <p className="text-lg font-bold text-gray-900">{usage.tokens?.toLocaleString() || 0}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <LoadingSpinner className="mx-auto h-5 w-5 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg bg-white">
                                    <p className="text-sm text-gray-500 mb-3">No active managed key found.</p>
                                    <button
                                        onClick={() => setIsCreditModalOpen(true)}
                                        className="text-customBlue hover:underline font-medium text-sm"
                                    >
                                        Purchase credits to generate your key
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {billingType === 'byok' && (
                    <div className="space-y-6 mt-4 pt-4 border-t border-gray-100">
                        {/* Unlock Feature Overlay if not subscribed */}
                        {!isByokSubscribed && (
                            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-6 text-center space-y-4">
                                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                                    <Lock className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-yellow-900">Unlock BYOK Access</h3>
                                    <p className="text-sm text-yellow-700 max-w-sm mx-auto mt-2">
                                        To use your own API Key, a small platform service fee is required.
                                    </p>
                                </div>
                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={handleByokSubscribe}
                                        disabled={isSaving}
                                        className="px-6 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg shadow-sm w-full max-w-xs transition-transform active:scale-95"
                                    >
                                        {isSaving ? 'Processing...' : 'Subscribe ($10/mo)'}
                                    </button>
                                </div>
                                <p className="text-xs text-yellow-600">
                                    Or save 17% with <a href="#" className="underline">Annual billing ($100/yr)</a>
                                </p>
                            </div>
                        )}

                        {/* Actual Input - Disabled or Hidden if not subscribed */}
                        {isByokSubscribed && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-gray-700">OpenRouter API Key</label>
                                        <span className="flex items-center text-xs text-green-600 font-medium">
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            Subscription Active
                                        </span>
                                    </div>
                                    <input
                                        type="password"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        placeholder="sk-or-..."
                                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-customBlue focus:border-customBlue"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">
                                        Enter your OpenRouter key. We will validate it on save.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}


                {/* Model Selection - Available for Managed (if key exists) AND BYOK (if key exists) */}
                {(apiKey && (billingType === 'byok' || billingType === 'managed') && allModels) && (
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
                                        {sortedAndFilteredModels.slice(0, 50).map((model: ModelInfo) => (
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
                                                No models found matching &quot;{searchTerm}&quot;
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>
                        )}
                    </div>
                )}

                {/* Activity Log Table - Only for Managed or when usage exists */}
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
                            {isLoadingActivity && activity.length === 0 ? (
                                <div className="flex justify-center items-center py-8">
                                    <LoadingSpinner className="h-6 w-6 text-customBlue" />
                                    <span className="ml-2 text-sm text-gray-500">Loading activity...</span>
                                </div>
                            ) : activity.length > 0 ? (
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
                                                {activity.map((row, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50">
                                                        <td className="px-3 py-2 text-gray-900 font-medium truncate max-w-[120px]" title={row.model}>{row.model.split('/').pop()}</td>
                                                        <td className="px-3 py-2 text-right text-gray-600">
                                                            {((row.prompt_tokens || 0) + (row.completion_tokens || 0)).toLocaleString()}
                                                        </td>
                                                        <td className="px-3 py-2 text-right text-customBlue font-bold">
                                                            ${(row.usage || 0).toFixed(6)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {hasMore && (
                                        <div className="mt-3 text-center">
                                            <button
                                                onClick={handleLoadMore}
                                                disabled={isLoadingMore}
                                                className="text-xs text-customBlue hover:text-blue-700 font-medium flex items-center justify-center mx-auto disabled:opacity-50"
                                            >
                                                {isLoadingMore ? <LoadingSpinner className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                                                Load More Activity
                                            </button>
                                        </div>
                                    )}
                                    <p className="text-[10px] text-gray-400 mt-2 text-center italic">
                                        Showing {activity.length} requests. Data refreshes on interaction.
                                    </p>
                                </>
                            ) : (
                                !isLoadingActivity && (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                        <BarChart3 className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">No recent activity found.</p>
                                        <p className="text-[10px] text-gray-400 mt-1">Activity logs appear here after your first few requests.</p>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>


                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    {message && (
                        <span className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                            {message.text}
                        </span>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={isSaving || (billingType !== 'standard' && !apiKey)}
                        className="ml-auto bg-customBlue hover:bg-[#1e3470] text-white font-medium py-2 px-4 rounded-lg flex items-center disabled:opacity-50 transition-colors"
                    >
                        {isSaving && <LoadingSpinner className="mr-2 h-4 w-4 text-white" />}
                        Save Changes
                    </button>
                </div>
            </div>

            <CreditPurchaseModal
                isOpen={isCreditModalOpen}
                onClose={() => setIsCreditModalOpen(false)}
                onPurchaseSuccess={onPurchaseSuccess}
            />
        </div >
    );
}
