'use client';

import { useState } from 'react';
import { backfillColumn } from '@/actions/backfill-actions';
import { Sparkles, X, CheckCircle, AlertCircle } from 'lucide-react';

type BackfillModalProps = {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    field: { hidden_id: string; name: string } | null;
    recordCount: number;
};

export default function BackfillModal({ isOpen, onClose, projectId, field, recordCount }: BackfillModalProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<{
        success: boolean;
        records_updated: number;
        records_failed?: number;
        message?: string;
    } | null>(null);

    if (!isOpen || !field) return null;

    const handleBackfill = async () => {
        setIsProcessing(true);
        try {
            const response = await backfillColumn(projectId, field.hidden_id, field.name);
            setResult(response);
        } catch (error) {
            console.error('Backfill failed:', error);
            setResult({ success: false, records_updated: 0, records_failed: recordCount });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClose = () => {
        setResult(null);
        setIsProcessing(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                    disabled={isProcessing}
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Smart Backfill</h2>
                        <p className="text-sm text-gray-500">AI Re-analysis</p>
                    </div>
                </div>

                {!result ? (
                    <>
                        <p className="text-gray-700 mb-6">
                            Re-analyze <span className="font-bold text-blue-600">{recordCount} documents</span> for the column{' '}
                            <span className="font-bold">"{field.name}"</span> using cached data?
                        </p>
                        <p className="text-xs text-gray-500 mb-6 bg-blue-50 p-3 rounded-lg border border-blue-100">
                            ✨ <span className="font-semibold">No re-upload or OCR needed!</span> We'll use cached text blocks to extract values instantly.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={handleBackfill}
                                disabled={isProcessing}
                                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        Start Backfill
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleClose}
                                disabled={isProcessing}
                                className="px-4 py-3 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center">
                        {result.success ? (
                            <>
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-10 h-10 text-green-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Backfill Complete! 🎉</h3>
                                <p className="text-gray-600 mb-6">
                                    Successfully updated <span className="font-bold text-green-600">{result.records_updated}</span> records
                                    {result.records_failed && result.records_failed > 0 && (
                                        <span className="text-gray-500"> ({result.records_failed} failed)</span>
                                    )}
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="w-10 h-10 text-amber-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3">Backfill Not Available</h3>
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                                    <p className="text-sm text-amber-900 mb-3">
                                        {result.message || "No documents eligible for backfill"}
                                    </p>
                                    <div className="text-xs text-amber-800 space-y-1">
                                        <p className="font-semibold">💡 Why this happens:</p>
                                        <p>Documents uploaded before this feature was enabled don't have cached OCR data.</p>
                                        <p className="font-semibold mt-2">✅ Solution:</p>
                                        <p>Upload new documents to use Smart Backfill on them.</p>
                                    </div>
                                </div>
                            </>
                        )}
                        <button
                            onClick={handleClose}
                            className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
