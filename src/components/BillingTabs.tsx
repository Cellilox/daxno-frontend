"use client";

import { useState } from "react";
import Billing, { BillingProps } from "./Billing";
import BillingConfig, { BillingConfigProps } from "./BillingConfig";

interface BillingTabsProps {
    billingConfigProps: BillingConfigProps;
    billingProps: BillingProps | null;
}

export default function BillingTabs({ billingConfigProps, billingProps }: BillingTabsProps) {
    const [activeTab, setActiveTab] = useState<'config' | 'billing'>('config');

    return (
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Tabs Header */}
            <div className="border-b border-gray-200 mb-8 overflow-x-auto scrollbar-hide">
                <nav className="-mb-px flex space-x-8 min-w-max px-2" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('config')}
                        className={`
               whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base transition-colors duration-200
               ${activeTab === 'config'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
             `}
                    >
                        Configuration
                    </button>
                    <button
                        onClick={() => setActiveTab('billing')}
                        className={`
               whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base transition-colors duration-200
               ${activeTab === 'billing'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
             `}
                    >
                        Subscription & History
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === 'config' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <BillingConfig {...billingConfigProps} />
                    </div>
                )}

                {activeTab === 'billing' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {billingProps ? (
                            <div className="-mx-4 sm:mx-0"> {/* Negative margin to offset inner padding on mobile if needed, though Billing has its own padding */}
                                <Billing {...billingProps} />
                            </div>
                        ) : (
                            <div className="max-w-2xl mx-auto py-12 px-4 flex flex-col justify-center items-center text-center bg-white rounded-lg shadow-sm border border-gray-100">
                                <div className="p-3 bg-indigo-50 rounded-full mb-4">
                                    <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                                <h1 className="text-2xl font-bold mb-2 text-gray-900">No Active Subscription</h1>
                                <p className="text-gray-500 mb-6 max-w-md">It looks like you don&apos;t have an active subscription yet. Check out our pricing plans to get started.</p>
                                <a href="/pricing" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                                    View Pricing Plans
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
