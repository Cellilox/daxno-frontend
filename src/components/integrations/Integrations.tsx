'use client'

import { useEffect, useRef, useState } from 'react';
import DownLoadCSV from './DownlaodCSV';
import GoogleDriveExport from './google-drive/GoogleDriveExport';

type OptionsProps = {
    projectId: string
}

export default function Integrations({projectId}: OptionsProps) {
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
        <div className="z-10">
            <button
                className="text-xs sm:text-sm inline-flex items-center px-2 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition-colors"
                onClick={() => setIsOptionVisible(true)}
            >
                Integrations
            </button>
            {isOptionVisible &&
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end p-4">
                    <div ref={modalRef} className="bg-white w-full lg:w-2/5 h-full p-6 rounded-lg shadow-lg">
                        <div className='flex justify-between items-center'>
                            <h2 className="text-lg font-semibold">Integrations</h2>
                            <button onClick={() => setIsOptionVisible(false)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 hover:text-gray-800">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <div className='mt-5 flex flex-col justify-end items-end'>
                        <p className="mb-3">Download your data</p>
                        <DownLoadCSV projectId={projectId} />
                        <p className="mt-3 mb-3">Export to drive</p>
                        <GoogleDriveExport projectId={projectId} /> 
                        <p className="mt-3 mb-3">Export to SpotHub</p>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
} 