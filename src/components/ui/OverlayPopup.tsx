import { useEffect, useRef, useState, ReactNode } from 'react';
import { Bot, Plug2 } from 'lucide-react';
import { UsageData } from '../chat';
import CreditsToolTip from './CreditToolTip';

export type IntegrationsModalProps = {
    widthClassName?: string;
    children?: ReactNode;
    buttonLabel?: string;
    creditUsage?: UsageData | undefined
};

export default function OverlayPopup({ widthClassName = 'lg:w-2/5', children, buttonLabel = 'Integrations', creditUsage }: IntegrationsModalProps) {
    const [isOptionVisible, setIsOptionVisible] = useState<boolean>(false)
    const modalRef = useRef<HTMLDivElement>(null);

    const onCancel = () => {
        setIsOptionVisible(false) 
    }

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onCancel();
            }
        }
        if (isOptionVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        } 
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOptionVisible, onCancel]);

    return (
        <div className="">
            <button
                className="text-xs sm:text-sm inline-flex items-center px-2 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition-colors"
                onClick={() => setIsOptionVisible(true)}
            >
               {buttonLabel === "Integrations" && <Plug2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />}
               {buttonLabel !== "Integrations" && <Bot className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />}
                {buttonLabel}
            </button>
            {isOptionVisible &&
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end p-4 z-[49]">
                    <div ref={modalRef} className={`bg-white w-full ${widthClassName} h-full rounded-lg shadow-lg flex flex-col`}>
                        {/* Fixed Header */}
                        <div className='flex justify-between p-6 border-b border-gray-200'>
                            <div>
                            <h2 className="text-lg font-semibold">{buttonLabel}</h2>
                            </div>
                            <div className='flex flex-col items-end'>
                             <button 
                                onClick={() => setIsOptionVisible(false)}
                                className="text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                            {buttonLabel == "Insights & Chat" && 
                            <div className='mt-3'>
                            <CreditsToolTip 
                            used={creditUsage?.used_credits} 
                            remaining={creditUsage?.remaining_credits} 
                            limit={creditUsage?.credit_limit}/>
                            </div>
                            }
                            </div>
                        </div>


                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto">
                            <div className='p-6 space-y-6'>
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
} 