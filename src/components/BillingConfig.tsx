'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { updateBillingConfig, provisionManagedByok, rotateManagedByok, getByokUsage, getManagedByokActivity } from '@/actions/settings-actions';
import { getAvailablePlans, requestPayment } from '@/actions/payment-actions';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import LoadingSpinner from './ui/LoadingSpinner';
import CreditPurchaseModal from './CreditPurchaseModal';
import { RefreshCcw, ShieldCheck, CreditCard, Activity, BarChart3, ChevronDown, ChevronUp, Lock, CheckCircle2 } from 'lucide-react';
import BYOKConfig from './billing/BYOKConfig';
import { ModelInfo } from './Models';

export interface BillingConfigProps {
    initialConfig: {
        subscription_type: string;
        byok_api_key?: string;
        preferred_models?: { default?: string; visible: string[] } | string[];
        byok_provider?: string;
    } | null;
    trustedModels: {
        professional: string[];
        starter: string[];
        free: string[];
    } | null;
    allModels: ModelInfo[] | null;
    currentPlan?: string;
    currentInterval?: string;
    currentAmount?: number;
    currentEndDate?: string | Date;
}

export default function BillingConfig({ initialConfig, trustedModels, allModels, currentPlan, currentInterval, currentAmount, currentEndDate }: BillingConfigProps) {
    // 3 Modes: 'standard', 'byok' (Own Key), 'managed' (GYOMK)
    // Map initialConfig.subscription_type (standard/byok) to one of these.
    // Ideally backend should support 'managed', but for now we might infer or keep 'byok' for both backend-side but separating UI.
    // Assumption: If subscription_type is 'byok' and user has a managed key (starts with 'sk-or-managed-' or similar? 
    // OR we track it via a flag? 
    // For now, let's treat the UI selection as the source of truth for the *intent*, and backend might just see 'byok' for both.

    // However, if we want to distinguish cleanly on load:
    // If byok_api_key is present and we know it's managed (maybe we don't know easily without a flag), default to 'managed'.
    // Let's default to standard or what's in config.

    const pathname = usePathname().slice(1);
    const router = useRouter();
    const searchParams = useSearchParams();

    // Determine initial billing type based on URL param 'option' (new) or 'tier' (legacy) or config
    // Priority: URL Param > Config > Default
    const initialBillingType = useMemo(() => {
        // Check both 'option' (new) and 'tier' (legacy) params
        const option = searchParams.get('option');
        const tier = searchParams.get('tier');

        const param = option || tier;

        if (param === 'managed') return 'managed';
        if (param === 'byok') return 'byok';
        if (param === 'standard') return 'standard';

        // Fallback to config logic
        if (initialConfig?.subscription_type === 'managed') return 'managed';
        if (initialConfig?.subscription_type === 'standard') return 'standard';
        if (initialConfig?.subscription_type === 'byok') {
            return initialConfig?.byok_api_key?.startsWith('sk-or-daxno') ? 'managed' : 'byok';
        }
        return 'standard';
    }, [searchParams, initialConfig]);

    const [billingType, setBillingType] = useState<'standard' | 'byok' | 'managed'>(initialBillingType);
    const [apiKey, setApiKey] = useState(initialConfig?.byok_api_key || '');
    const [provider, setProvider] = useState(initialConfig?.byok_provider || 'openrouter');

    // BYOK Subscription State
    // Check if the actual current plan is 'byok' (case-insensitive)
    const [isByokSubscribed, setIsByokSubscribed] = useState(
        currentPlan?.toLowerCase() === 'byok' || initialConfig?.subscription_type === 'byok'
    );
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');


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
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [isProvisioning, setIsProvisioning] = useState(false);
    const [usage, setUsage] = useState<{ usage: number; limit: number; status: string; tokens?: number; requests?: number } | null>(null);
    const [activity, setActivity] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
    const [isModelsOpen, setIsModelsOpen] = useState(false);
    const [isActivityOpen, setIsActivityOpen] = useState(false); // Default closed for cleaner UI
    const [isLoadingActivity, setIsLoadingActivity] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Provider-specific model fetching states
    const [isLoadingModels, setIsLoadingModels] = useState(false);
    const [providerModels, setProviderModels] = useState<ModelInfo[]>([]);
    const [modelsFetchError, setModelsFetchError] = useState<string | null>(null);
    const [isConnectingKey, setIsConnectingKey] = useState(false);
    // Unified verification logic: Verified if standard OR matches existing configuration
    const [isKeyVerified, setIsKeyVerified] = useState(() => {
        const initialSub = initialConfig?.subscription_type;
        const hasSavedKey = !!initialConfig?.byok_api_key;
        return initialSub === 'standard' || hasSavedKey;
    });

    // Track the last verified key to know when user is typing a NEW one
    const lastVerifiedKeyRef = useRef(initialConfig?.byok_api_key || '');

    // Auto-verify if user switches back to their currently saved provider
    useEffect(() => {
        if (billingType === 'byok' && provider === initialConfig?.byok_provider && initialConfig?.byok_api_key) {
            setIsKeyVerified(true);
            setApiKey(initialConfig.byok_api_key);
            lastVerifiedKeyRef.current = initialConfig.byok_api_key;
        }
    }, [provider, billingType, initialConfig]);

    // Handle state restoration when user reverts to saved configuration
    useEffect(() => {
        if (billingType === 'byok' && provider === initialConfig?.byok_provider && initialConfig?.byok_api_key) {
            // Restore the saved api key (usually the mask '••••••••')
            setApiKey(initialConfig.byok_api_key);
            // No need to set isKeyVerified here because isEffectivelyVerified handles the matching logic
        }
    }, [provider, billingType, initialConfig]);

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

    // Track if we should highlight the CTA button
    const [highlightCTA, setHighlightCTA] = useState(false);

    // Simple scroll to top when coming from modal
    useEffect(() => {
        const option = searchParams.get('option');
        if (!option) return;

        // Longer delay to ensure page fully loads
        const timer = setTimeout(() => {
            // Find the selected radio button
            const radioElement = document.querySelector(`input[value="${option}"]`);

            if (radioElement) {
                // Get the parent container
                const container = radioElement.closest('div.flex.items-start');

                if (container) {
                    // Calculate position to bring element to top of viewport
                    const elementPosition = container.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = elementPosition - 10; // 10px from top

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }

            // Add highlight for managed option's Buy Credits button
            if (option === 'managed') {
                setHighlightCTA(true);
                setTimeout(() => setHighlightCTA(false), 3000);
            }
        }, 800); // Longer delay for full page load

        return () => clearTimeout(timer);
    }, [searchParams]);

    // Auto-fetch provider-specific models when provider and API key are configured (for BYOK)
    useEffect(() => {
        const fetchProviderModels = async () => {
            // Only fetch for BYOK with valid provider and non-masked API key
            if (billingType !== 'byok' || !provider || !apiKey || apiKey === '••••••••') {
                // Reset provider models if not applicable
                if (providerModels.length > 0) {
                    setProviderModels([]);
                }
                return;
            }

            // Skip OpenRouter - use existing allModels
            if (provider === 'openrouter') {
                setProviderModels([]);
                return;
            }

            // Only fetch for direct providers
            const directProviders = ['openai', 'anthropic', 'deepseek', 'google_vertex'];
            if (!directProviders.includes(provider)) {
                return;
            }

            setIsLoadingModels(true);
            setModelsFetchError(null);

            try {
                const { getProviderModels } = await import('@/actions/settings-actions');
                const models = await getProviderModels(provider);

                if (models && models.length > 0) {
                    setProviderModels(models);
                    console.log(`[BillingConfig] Fetched ${models.length} models for provider: ${provider}`);
                } else {
                    throw new Error('No models returned from provider');
                }
            } catch (error) {
                console.error(`[ERROR] Failed to fetch models for ${provider}:`, error);
                setModelsFetchError(`Unable to fetch models from ${provider}. Please check your API key and try again.`);
                setProviderModels([]);
            } finally {
                setIsLoadingModels(false);
            }
        };

        fetchProviderModels();
    }, []); // DISABLED: was [billingType, provider, apiKey] - now fetch happens in handleSave after key is saved

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

    const handleBillingTypeChange = (type: 'standard' | 'byok' | 'managed') => {
        setBillingType(type);
        // Clear previous model selections when switching types
        setPreferredModels([]);
        setDefaultModel('');
        setProviderModels([]);
        setModelsFetchError(null);
        // Reset search term for fresh start
        setSearchTerm('');
        setIsKeyVerified(
            type === 'standard' ||
            (type === 'managed' && initialConfig?.subscription_type === 'managed' && !!initialConfig?.byok_api_key) ||
            (type === 'byok' && initialConfig?.subscription_type === 'byok' && !!initialConfig?.byok_api_key)
        );
        // Sync to URL for deep linking and auto-scroll behavior
        const params = new URLSearchParams(searchParams.toString());
        params.set('option', type);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
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
            // 'managed' is strictly separated now
            const backendSubType = billingType;

            await updateBillingConfig(backendSubType, apiKey, payload, provider);
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

    const handleByokSubscribe = async (cycleOverride?: 'monthly' | 'yearly') => {
        setIsSubscribing(true);
        setMessage(null);

        const targetCycle = cycleOverride || billingCycle;

        try {
            // 1. Fetch Plans
            const plansResponse = await getAvailablePlans();
            const plans = plansResponse?.data || [];

            // 2. Find 'byok' plan matching the cycle
            const byokPlan = plans.find((p: any) =>
                p.name.toLowerCase() === 'byok' &&
                p.interval === targetCycle
            );

            let targetPlan;

            if (!byokPlan) {
                // Fallback: If yearly requested but not found, maybe allow forcing standard plan? 
                // For now, assume plan exists or warn
                const anyByok = plans.find((p: any) => p.name.toLowerCase() === 'byok');
                if (!anyByok) throw new Error("BYOK Plan not found.");

                // If we found a monthly plan but want yearly, we can't just switch interval client-side easily 
                // without backend support or existing plan. 
                // However, we can TRY to send the ID and override amount if safe.
                // Backend now supports amount override.
                // BUT interval remains monthly on FW side.
                // So we warn if exact match not found.
                if (targetCycle === 'yearly' && anyByok.interval !== 'yearly') {
                    throw new Error("Yearly BYOK plan not configured in payment provider.");
                }
                // Use the found one
                targetPlan = anyByok;
            } else {
                targetPlan = byokPlan;
            }

            // 3. Initiate Payment
            // Pass redirect path explicitly
            const result = await requestPayment('billing?tab=configuration&tier=byok', targetCycle === 'yearly' ? 100 : 10, targetPlan.id);

            if (result?.data?.link) {
                // Redirect
                router.push(result.data.link);
            } else {
                throw new Error("Failed to get payment link.");
            }

        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error(error);
            setMessage({ type: 'error', text: error.message || 'Failed to initiate BYOK subscription.' });
            setIsSubscribing(false);
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
        // Determine source list: dynamcially fetched provider models take priority
        let sourceList = providerModels.length > 0 ? providerModels : (allModels || []);

        // Specialized gating for BYOK to prevent mixing in OpenRouter models before fetch
        if (billingType === 'byok' && provider && provider !== 'openrouter' && providerModels.length === 0) {
            sourceList = [];
        }

        // While loading, show empty to avoid flicker or stale data
        if (isLoadingModels) {
            sourceList = [];
        }

        let filtered = sourceList;

        if (searchTerm) {
            filtered = sourceList.filter(m =>
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
    }, [allModels, searchTerm, preferredModels, billingType, provider, providerModels, isLoadingModels]);

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
                        onClick={() => handleBillingTypeChange('standard')}
                        className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all duration-200 ${billingType === 'standard' ? 'border-customBlue bg-blue-50 ring-1 ring-customBlue' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                    >
                        <input
                            type="radio"
                            name="billing_type"
                            value="standard"
                            checked={billingType === 'standard'}
                            onChange={() => handleBillingTypeChange('standard')}
                            className="mt-1 h-4 w-4 text-customBlue border-gray-300 focus:ring-customBlue"
                        />
                        <div className="ml-3">
                            <span className={`block text-sm font-bold ${billingType === 'standard' ? 'text-customBlue' : 'text-gray-900'}`}>Standard Subscription</span>
                            <span className="block text-sm text-gray-500 mt-1">Simple monthly subscription with managed limits. Best for most users.</span>
                        </div>
                    </div>

                    {/* Option 2: GYOMK (Generate Your Own Managed Key) */}
                    <div
                        onClick={() => handleBillingTypeChange('managed')}
                        className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all duration-200 ${billingType === 'managed' ? 'border-customBlue bg-blue-50 ring-1 ring-customBlue' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                    >
                        <input
                            type="radio"
                            name="billing_type"
                            value="managed"
                            checked={billingType === 'managed'}
                            onChange={() => handleBillingTypeChange('managed')}
                            className="mt-1 h-4 w-4 text-customBlue border-gray-300 focus:ring-customBlue"
                        />
                        <div className="ml-3">
                            <span className={`block text-sm font-bold ${billingType === 'managed' ? 'text-customBlue' : 'text-gray-900'}`}>Get Your Own Key (GYOK)</span>
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
                        onClick={() => handleBillingTypeChange('byok')}
                        className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all duration-200 ${billingType === 'byok' ? 'border-customBlue bg-blue-50 ring-1 ring-customBlue' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                    >
                        <input
                            type="radio"
                            name="billing_type"
                            value="byok"
                            checked={billingType === 'byok'}
                            onChange={() => handleBillingTypeChange('byok')}
                            className="mt-1 h-4 w-4 text-customBlue border-gray-300 focus:ring-customBlue"
                        />
                        <div className="ml-3">
                            <span className={`block text-sm font-bold ${billingType === 'byok' ? 'text-customBlue' : 'text-gray-900'}`}>Bring Your Own Key (BYOK)</span>
                            <span className="block text-sm text-gray-500 mt-1">Use your own API key from supported providers (OpenAI, Anthropic, OpenRouter, etc.). Direct billing with the provider + small service fee.</span>
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
                                    className={`px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center shadow-sm ${highlightCTA ? 'animate-pulse ring-4 ring-blue-300' : ''
                                        }`}
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
                            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 sm:p-6 text-center space-y-4">
                                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                                    <Lock className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-yellow-900">Unlock BYOK Access</h3>
                                    <p className="text-sm text-yellow-700 max-w-sm mx-auto mt-2">
                                        To use your own API Key, a small platform service fee is required.
                                    </p>

                                    {/* Billing Cycle Toggle */}
                                    <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 mt-4 mb-2">
                                        <button
                                            onClick={() => setBillingCycle('monthly')}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${billingCycle === 'monthly' ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                                        >
                                            Monthly ($10)
                                        </button>
                                        <button
                                            onClick={() => setBillingCycle('yearly')}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${billingCycle === 'yearly' ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                                        >
                                            Yearly ($100)
                                            <span className="ml-1 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Save $20</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-center">
                                    <button
                                        onClick={() => handleByokSubscribe()}
                                        disabled={isSubscribing}
                                        className="px-6 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg shadow-sm w-full sm:max-w-xs transition-transform active:scale-95 disabled:opacity-75 disabled:scale-100"
                                    >
                                        {isSubscribing ? 'Processing...' : `Subscribe (${billingCycle === 'yearly' ? '$100/yr' : '$10/mo'})`}
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
                                        <div className="flex flex-col">
                                            <label className="block text-sm font-medium text-gray-700">Provider API Key</label>
                                            {currentInterval !== 'yearly' && (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 uppercase">
                                                        Active: {currentInterval || 'Monthly'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <span className="flex items-center text-xs text-green-600 font-medium">
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            Subscription Active
                                        </span>
                                    </div>

                                    {/* Upgrade UI for Non-Yearly Users */}
                                    {currentInterval !== 'yearly' && (
                                        <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between animate-in fade-in zoom-in-95 duration-300">
                                            <div>
                                                <p className="text-xs font-bold text-blue-800">Switch to Yearly & Save $20</p>
                                                {(() => {
                                                    // Simple Frontend Proration Check
                                                    const upgradeBasePrice = 100;
                                                    let displayPrice = 100;
                                                    let isProrated = false;

                                                    if (currentEndDate && currentAmount) {
                                                        const now = new Date();
                                                        const end = new Date(currentEndDate);
                                                        if (end > now) {
                                                            const diffTime = Math.abs(end.getTime() - now.getTime());
                                                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                                                            // Assume monthly/hourly basis (30 days) to match backend heuristic
                                                            const intervalDays = 30;
                                                            const dailyRate = currentAmount / intervalDays;
                                                            const credit = dailyRate * diffDays;

                                                            // Cap credit at currentAmount (optional, backend logic handles it too)
                                                            // and ensure price doesn't go below 0
                                                            displayPrice = Math.max(0, upgradeBasePrice - credit);
                                                            isProrated = true;
                                                        }
                                                    }

                                                    return (
                                                        <p className="text-[10px] text-blue-600">
                                                            {isProrated ? (
                                                                <>Pay <span className="font-bold">${displayPrice.toFixed(2)}</span> (Prorated) instead of $100</>
                                                            ) : (
                                                                <>Pay $100/year instead of $120</>
                                                            )}
                                                        </p>
                                                    );
                                                })()}
                                            </div>
                                            <button
                                                onClick={() => handleByokSubscribe('yearly')}
                                                disabled={isSubscribing}
                                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded shadow-sm transition-colors disabled:opacity-50"
                                            >
                                                {isSubscribing ? 'Processing...' : 'Upgrade'}
                                            </button>
                                        </div>
                                    )}
                                    <div className="mb-4">
                                        <BYOKConfig
                                            apiKey={apiKey}
                                            setApiKey={setApiKey}
                                            provider={provider || 'openai'}
                                            setProvider={setProvider}
                                            providerModels={providerModels}
                                            setProviderModels={setProviderModels}
                                            setPreferredModels={setPreferredModels}
                                            setDefaultModel={setDefaultModel}
                                            isVerified={isKeyVerified}
                                            setIsVerified={setIsKeyVerified}
                                        />
                                    </div>

                                </div>
                            </div>
                        )}
                    </div>
                )}


                {/* Model Selection - Available for ALL types now (Standard, Managed, BYOK) */}
                {((billingType === 'standard' || (apiKey && (billingType === 'byok' || billingType === 'managed'))) && allModels) && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                        {/* Loading State - when fetching provider models */}


                        {/* Error State - when fetching fails */}
                        {billingType === 'byok' && modelsFetchError && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <svg className="h-5 w-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-red-900">Failed to fetch models</p>
                                        <p className="text-xs text-red-700 mt-1">{modelsFetchError}</p>
                                        <button
                                            onClick={() => {
                                                setModelsFetchError(null);
                                                setIsLoadingModels(true);
                                                // Trigger refetch by updating a dependency
                                                setApiKey(apiKey);
                                            }}
                                            className="mt-2 text-xs text-red-800 font-medium hover:text-red-900 underline"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Model selection disabled notice for BYOK without verified key */}
                        {billingType === 'byok' && !isKeyVerified && (
                            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-blue-900">Verify your API key first</p>
                                        <p className="text-xs text-blue-700 mt-1">Connect your provider API key above to access model selection.</p>
                                    </div>
                                </div>
                            </div>
                        )}


                        {/* Warning when no models selected */}
                        {(billingType === 'byok' || billingType === 'managed') && isKeyVerified && preferredModels.length === 0 && (
                            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg animate-pulse">
                                <div className="flex items-start gap-3">
                                    <svg className="h-5 w-5 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-amber-900">Select a default model to complete setup</p>
                                        <p className="text-xs text-amber-700 mt-1">Choose at least one model from the list below and set it as your default.</p>
                                    </div>
                                </div>
                            </div>
                        )}


                        {/* Only show Preferred Models section when not loading and no error */}
                        {(!isLoadingModels || billingType !== 'byok') && !modelsFetchError && (billingType === 'standard' || isKeyVerified) && (
                            <button
                                onClick={async () => {
                                    const isOpening = !isModelsOpen;
                                    setIsModelsOpen(isOpening);

                                    // Fetch models if we're opening the section and don't have them yet
                                    if (isOpening && providerModels.length === 0) {
                                        let fetchProvider = null;

                                        if (billingType === 'standard') {
                                            fetchProvider = 'openrouter';
                                        } else if (billingType === 'managed' && apiKey) {
                                            fetchProvider = 'openrouter';
                                        } else if (billingType === 'byok' && apiKey && provider) {
                                            fetchProvider = provider;
                                        }

                                        if (fetchProvider) {
                                            setIsLoadingModels(true);
                                            setModelsFetchError(null);
                                            try {
                                                const { getProviderModels } = await import('@/actions/settings-actions');
                                                const models = await getProviderModels(fetchProvider);
                                                if (models && models.length > 0) {
                                                    setProviderModels(models);
                                                } else {
                                                    setModelsFetchError(`No models found for ${fetchProvider}.`);
                                                }
                                            } catch (error) {
                                                console.error("Failed to fetch models on open:", error);
                                                setModelsFetchError("Failed to load models. Please check your connection.");
                                            } finally {
                                                setIsLoadingModels(false);
                                            }
                                        }
                                    }
                                }}
                                disabled={!isKeyVerified}
                                className={`w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 transition-colors mb-4 ${!isKeyVerified
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:bg-gray-100 cursor-pointer'
                                    }`}
                            >
                                <div className="flex items-center">
                                    <h3 className="text-sm font-semibold text-gray-900">Preferred Models</h3>
                                    <span className="ml-2 px-2 py-0.5 bg-customBlue text-white text-[10px] font-bold rounded-full">{preferredModels.length}</span>
                                    {preferredModels.length === 0 && (billingType === 'byok' || billingType === 'managed') && isKeyVerified && (
                                        <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full">Required</span>
                                    )}
                                </div>
                                {isModelsOpen ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                            </button>
                        )}


                        {isModelsOpen && !modelsFetchError && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <p className="text-xs text-gray-500 mb-4">
                                    {billingType === 'standard'
                                        ? "Select the models you want to use. Upgrade your plan to access PRO models."
                                        : "Search and select any OpenRouter models you want to use. You must select a Default Model to save changes."}
                                </p>

                                {isLoadingModels && (
                                    <div className="flex justify-center py-4">
                                        <LoadingSpinner className="h-6 w-6 text-customBlue" />
                                        <span className="ml-2 text-sm text-gray-500">Fetching models...</span>
                                    </div>
                                )}

                                {!isLoadingModels && (
                                    <>
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
                                                {sortedAndFilteredModels.map((model: ModelInfo) => {
                                                    // Determine Tier for Standard Plan
                                                    let tierTag = null;
                                                    let isDisabled = false;

                                                    if (billingType === 'standard') {
                                                        const isPro = trustedModels?.professional?.includes(model.id);
                                                        const isStarter = trustedModels?.starter?.includes(model.id);

                                                        // Normalize plan name handling (assuming currentPlan comes as 'Professional', 'Starter', 'Free')
                                                        const userPlan = currentPlan || 'Free';

                                                        if (isPro) {
                                                            if (userPlan !== 'Professional') isDisabled = true;
                                                            tierTag = <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded font-bold border flex-shrink-0 bg-yellow-100 text-yellow-800 border-yellow-200">PRO</span>;
                                                        } else if (isStarter) {
                                                            if (!['Starter', 'Professional'].includes(userPlan)) isDisabled = true;
                                                            tierTag = <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded font-bold border flex-shrink-0 bg-blue-100 text-blue-800 border-blue-200">STARTER</span>;
                                                        }
                                                    }

                                                    return (
                                                        <div key={model.id} className={`flex items-start p-2 rounded-md border transition-colors ${preferredModels.includes(model.id) ? 'border-customBlue bg-blue-50' : 'border-gray-200'} ${isDisabled ? 'bg-gray-50 cursor-not-allowed opacity-80' : ''}`}>
                                                            <div className="flex items-center h-5">
                                                                <input
                                                                    type="checkbox"
                                                                    className="h-4 w-4 text-customBlue focus:ring-customBlue border-gray-300 rounded"
                                                                    checked={preferredModels.includes(model.id)}
                                                                    onChange={() => !isDisabled && toggleModel(model.id)}
                                                                    disabled={isDisabled}
                                                                />
                                                            </div>
                                                            <div className="ml-3 flex-1 min-w-0">
                                                                <div className={`flex items-center justify-between ${!isDisabled && 'cursor-pointer'}`} onClick={() => !isDisabled && toggleModel(model.id)}>
                                                                    <div className="flex items-center min-w-0 flex-1 mr-2">
                                                                        <span className="text-sm font-medium text-gray-900 truncate" title={model.name}>
                                                                            {model.name}
                                                                        </span>
                                                                        {tierTag}
                                                                    </div>
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
                                                    )
                                                })}
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
                                    </>
                                )}

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
