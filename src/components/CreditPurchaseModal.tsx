'use client'

import { useState, useEffect } from "react"
import { calculateServiceFee, FeeResult } from "@/lib/fee-calculator"

import LoadingSpinner from "./ui/LoadingSpinner"
import { ShieldCheck, CreditCard, AlertCircle } from 'lucide-react'

// Mock action for now, replaced by actual prop later
import { getAvailablePlans, requestPayment } from "@/actions/payment-actions"
import { usePathname, useRouter } from "next/navigation"

const mockPurchaseAction = async (_amount: number) => {
    return new Promise((resolve) => setTimeout(resolve, 2000));
}

interface CreditPurchaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPurchaseSuccess: (amount: number) => void;
}

export default function CreditPurchaseModal({ isOpen, onClose, onPurchaseSuccess }: CreditPurchaseModalProps) {
    const [amount, setAmount] = useState<number>(30); // Default to sweet spot
    const [feeDetails, setFeeDetails] = useState<FeeResult>(calculateServiceFee(30));
    const [loading, setLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    const pathname = usePathname().slice(1);
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [isOpen]);

    useEffect(() => {
        setFeeDetails(calculateServiceFee(amount || 0));
    }, [amount]);

    const handlePurchase = async () => {
        if (amount < 5) return;
        setLoading(true);
        try {
            // 1. Fetch Plans
            const plansResponse = await getAvailablePlans();
            const plans = plansResponse?.data || [];

            // 2. Find 'gyok' plan
            const gyokPlan = plans.find((p: any) => p.name.toLowerCase() === 'gyok'); // eslint-disable-line @typescript-eslint/no-explicit-any

            if (!gyokPlan) {
                throw new Error("GYOK Plan not found in system.");
            }

            // 3. Initiate Payment with Custom Amount
            // requestPayment(pathname, amount, plan_id)
            const result = await requestPayment('billing?tab=configuration&tier=managed', amount, gyokPlan.id);

            if (result?.data?.link) {
                onPurchaseSuccess(amount);
                // Redirect
                router.push(result.data.link);
                onClose();
            } else {
                throw new Error("Failed to get payment link.");
            }
        } catch (error) {
            console.error("Purchase failed", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all duration-300 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>
                {/* Header with Pattern */}
                <div className="bg-customBlue p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl" />

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>

                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <CreditCard className="w-6 h-6" />
                        Top Up Credits
                    </h2>
                    <p className="text-blue-100 text-sm mt-1">
                        Securely purchase credits for your managed key.
                    </p>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                    {/* Amount Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Amount to Pay (USD)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                                className="w-full pl-8 pr-4 py-3 text-xl font-bold text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-customBlue focus:border-customBlue transition-all"
                                min="5"
                            />
                        </div>
                        {amount < 5 && (
                            <p className="text-xs text-red-500 flex items-center mt-1">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Minimum purchase amount is $5.00
                            </p>
                        )}
                    </div>

                    {/* Calculation Breakdown */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Purchase Amount</span>
                            <span className="font-semibold text-gray-900">${feeDetails.inputAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-1.5">
                                <span className="text-gray-600">Service Fee ({feeDetails.serviceFeePercentage}%)</span>
                                <div className="group relative">
                                    <AlertCircle className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                        Fees decrease as you buy more:
                                        <br />$5-20: 35%
                                        <br />$21-50: 30%
                                        <br />$51-100: 25%
                                        <br />$100+: 20%
                                    </div>
                                </div>
                            </div>
                            <span className="font-semibold text-red-500">-${feeDetails.serviceFeeAmount.toFixed(2)}</span>
                        </div>
                        <div className="h-px bg-gray-200" />
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-900">Total Credits Received</span>
                            <span className="font-bold text-xl text-green-600">${feeDetails.credits.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Info Alert */}
                    <div className="flex items-start p-3 bg-blue-50 border border-blue-100 rounded-lg">
                        <ShieldCheck className="w-5 h-5 text-customBlue shrink-0 mr-2 mt-0.5" />
                        <p className="text-xs text-blue-800">
                            Credits are non-expiring and can be used with any supported model.
                            Your managed key will be funded immediately after payment.
                        </p>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handlePurchase}
                        disabled={amount < 5 || loading}
                        className="w-full py-3.5 px-4 bg-customBlue hover:bg-blue-800 text-white text-base font-semibold rounded-xl shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:shadow-none transition-all transform active:scale-[0.98] flex justify-center items-center"
                    >
                        {loading ? (
                            <LoadingSpinner className="w-5 h-5 mr-2" />
                        ) : (
                            <CreditCard className="w-5 h-5 mr-2" />
                        )}
                        {loading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
                    </button>

                    <p className="text-center text-xs text-gray-400">
                        Secured by Stripe/Flutterwave
                    </p>
                </div>
            </div>
        </div>
    )
}
