'use client'

import { useEffect, useRef, useState } from 'react';
import DownLoadCSV from './DownlaodCSV';
import GoogleDriveExport from './google-drive/GoogleDriveExport';
import { Plug2 } from 'lucide-react';
import HubSpotExport from './hubspot/HubSpotExport';
import { Field, Record } from '../spreadsheet/types';

type OptionsProps = {
    projectId: string;
    fields: Field[]
    records: Record[]
}

export default function Integrations({ projectId, fields, records }: OptionsProps) {
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
                className="text-base inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition-colors"
                onClick={() => setIsOptionVisible(true)}
            >
                <Plug2 className="w-5 h-5 mr-3 flex-shrink-0" />
                Integrations
            </button>
            {isOptionVisible &&
                <div className="z-[100] fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end p-4">
                    <div ref={modalRef} className="bg-white w-full lg:w-2/5 h-full rounded-lg shadow-lg flex flex-col">
                        {/* Fixed Header */}
                        <div className='flex justify-between items-center p-6 border-b border-gray-200'>
                            <h2 className="text-xl font-semibold">Integrations</h2>
                            <button
                                onClick={() => setIsOptionVisible(false)}
                                className="text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto">
                            <div className='p-6 space-y-6'>
                                {/* Download Section */}
                                <div className="space-y-3">
                                    <h3 className="text-base font-medium text-gray-900">Download your data</h3>
                                    <DownLoadCSV projectId={projectId} />
                                </div>

                                {/* Google Drive Section */}
                                <div className="space-y-3">
                                    <GoogleDriveExport projectId={projectId} />
                                </div>

                                {/* HubSpot Section */}
                                <div className="space-y-3">
                                    <HubSpotExport
                                        projectId={projectId}
                                        fields={fields}
                                        records={records}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
} 