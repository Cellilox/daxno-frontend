'use client'

import React from 'react'
import { Lock, Key, CreditCard, Sparkles } from 'lucide-react'
import StandardPopup from '../ui/StandardPopup'
import { useRouter } from 'next/navigation'

interface UsageLimitModalProps {
    isOpen: boolean
    onClose: () => void
    message: string
    type: 'AI_EXHAUSTED' | 'DAILY_LIMIT'
    currentTier?: 'standard' | 'byok' | 'managed'
}

export default function UsageLimitModal({ isOpen, onClose, message, type, currentTier = 'standard' }: UsageLimitModalProps) {
    const router = useRouter()
    const icon = type === 'AI_EXHAUSTED' ? <Sparkles size={24} /> : <Lock size={24} />
    const title = "Limit Reached"
    const subtitle = currentTier === 'managed'
        ? "Recharge your credits to continue processing"
        : "Upgrade or connect your own provider to continue"

    return (
        <StandardPopup
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            subtitle={subtitle}
            icon={icon}
        >
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6">
                <p className="text-gray-700 text-sm leading-relaxed text-center italic">
                    "{message}"
                </p>
            </div>

            <div className="space-y-3">
                {/* Managed Credit Option */}
                <button
                    onClick={() => {
                        onClose()
                        router.push('/billing?tab=configuration&option=managed')
                    }}
                    className={`w-full flex items-center justify-between p-4 bg-white border-2 rounded-xl transition-all group ${currentTier === 'managed' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100 hover:border-indigo-500 hover:bg-indigo-50'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg transition-colors ${currentTier === 'managed' ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'
                            }`}>
                            <CreditCard size={18} />
                        </div>
                        <div className="text-left">
                            <p className="font-semibold text-gray-900">{currentTier === 'managed' ? 'Recharge Managed Credits' : 'Managed Credits'}</p>
                            <p className="text-xs text-gray-500">{currentTier === 'managed' ? 'Add more usage to your platform balance' : 'Recharge and process at platform rates'}</p>
                        </div>
                    </div>
                </button>

                {/* BYOK Option */}
                <button
                    onClick={() => {
                        onClose()
                        router.push('/billing?tab=configuration&option=byok')
                    }}
                    className={`w-full flex items-center justify-between p-4 bg-white border-2 rounded-xl transition-all group ${currentTier === 'byok' ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-blue-500 hover:bg-blue-50'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg transition-colors ${currentTier === 'byok' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
                            }`}>
                            <Key size={18} />
                        </div>
                        <div className="text-left">
                            <p className="font-semibold text-gray-900">{currentTier === 'byok' ? 'Update BYOK Config' : 'Bring Your Own Key'}</p>
                            <p className="text-xs text-gray-500">{currentTier === 'byok' ? 'Change or check your provider settings' : 'Connect your OpenAI or OpenRouter key'}</p>
                        </div>
                    </div>
                </button>
            </div>

            <div className="mt-6 flex flex-col gap-3">
                <button
                    onClick={() => {
                        onClose()
                        router.push('/billing')
                    }}
                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all"
                >
                    View Higher Plans
                </button>
                <button
                    onClick={onClose}
                    className="w-full py-2 text-gray-400 text-sm hover:text-gray-600 transition-colors"
                >
                    Maybe later
                </button>
            </div>
        </StandardPopup>
    )
}
