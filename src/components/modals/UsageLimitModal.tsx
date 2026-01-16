'use client'

import React from 'react'
import { X, Lock, Key, CreditCard, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface UsageLimitModalProps {
    isOpen: boolean
    onClose: () => void
    message: string
    type: 'AI_EXHAUSTED' | 'DAILY_LIMIT'
}

export default function UsageLimitModal({ isOpen, onClose, message, type }: UsageLimitModalProps) {
    const router = useRouter()

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header/Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white text-center">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-4">
                        {type === 'AI_EXHAUSTED' ? <Sparkles size={24} /> : <Lock size={24} />}
                    </div>
                    <h2 className="text-xl font-bold">Limit Reached</h2>
                    <p className="text-blue-100 text-sm mt-1">Upgrade or connect your own provider to continue</p>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6">
                        <p className="text-gray-700 text-sm leading-relaxed text-center italic">
                            "{message}"
                        </p>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => {
                                onClose()
                                router.push('/billing?tab=configuration&option=byok')
                            }}
                            className="w-full flex items-center justify-between p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <Key size={18} />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-gray-900">Bring Your Own Key</p>
                                    <p className="text-xs text-gray-500">Use your own OpenAI or OpenRouter key</p>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={() => {
                                onClose()
                                router.push('/billing?tab=configuration&option=managed')
                            }}
                            className="w-full flex items-center justify-between p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <CreditCard size={18} />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-gray-900">Managed Credits</p>
                                    <p className="text-xs text-gray-500">Recharge and process at low platform rates</p>
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
                </div>
            </div>
        </div>
    )
}
