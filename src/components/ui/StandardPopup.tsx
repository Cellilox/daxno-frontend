import React from 'react';
import { X } from 'lucide-react';

interface StandardPopupProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    widthClassName?: string;
    closeOnOutsideClick?: boolean;
}

export default function StandardPopup({
    isOpen,
    onClose,
    title,
    subtitle,
    icon,
    children,
    widthClassName = 'max-w-md',
    closeOnOutsideClick = true
}: StandardPopupProps) {

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Click outside to close */}
            <div className="absolute inset-0" onClick={() => closeOnOutsideClick && onClose()} />

            <div className={`relative w-full ${widthClassName} bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200`}>
                {/* Header/Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white text-center select-none relative z-10">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                    {icon && (
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-4">
                            {icon}
                        </div>
                    )}
                    <h2 className="text-xl font-bold">{title}</h2>
                    {subtitle && <p className="text-blue-100 text-sm mt-1">{subtitle}</p>}
                </div>

                {/* Content */}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
