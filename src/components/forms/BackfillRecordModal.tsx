'use client';

import { useState } from 'react';
import { backfillRecord } from '@/actions/backfill-actions';
import { Sparkles, X, CheckCircle, AlertCircle } from 'lucide-react';

type BackfillRecordModalProps = {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    recordId: string | null;
    filename: string | null;
};

export default function BackfillRecordModal({ isOpen, onClose, projectId, recordId, filename }: BackfillRecordModalProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen || !recordId) return null;

    const handleBackfill = async () => {
        setIsProcessing(true);
        try {
            onClose(); // Close immediately for maximum responsiveness
            await backfillRecord(projectId, recordId);
        } catch (error) {
            console.error('Record re-analysis failed:', error);
            alert('Failed to start re-analysis process');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClose = () => {
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
                        <h2 className="text-xl font-bold text-gray-900">Document Re-analysis</h2>
                        <p className="text-sm text-gray-500">Smart Backfill</p>
                    </div>
                </div>

                <div className="mb-6">
                    <p className="text-gray-700 leading-relaxed">
                        Re-analyze <span className="font-bold text-purple-600 break-all">"{filename}"</span> for all project fields using cached OCR data?
                    </p>
                    <p className="mt-4 text-xs text-gray-500 bg-purple-50 p-3 rounded-lg border border-purple-100">
                        ✨ <span className="font-semibold text-purple-700">Non-destructive:</span> This will refresh the data in this row using current project field extraction rules.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleBackfill}
                        disabled={isProcessing}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isProcessing ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                Re-analyze Document
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
            </div>
        </div>
    );
}
