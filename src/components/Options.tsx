'use client'

import { useEffect, useRef, useState } from 'react';
import ShareToDrive from './ShareToDrive';
import DownLoadCSV from './DownlaodCSV';

type OptionsProps = {
    headers: any
    projectId: string
}

export default function Options({headers, projectId}: OptionsProps) {
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
            <div className="flex flex-col items-center">
                <div>
                    <p className="text-lg md:text-xl lg:text-sm">Sharing</p>
                </div>
                <div className="mt-3">
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
                        onClick={() => setIsOptionVisible(true)}
                    >
                        Options
                    </button>
                </div>
            </div>
            {isOptionVisible &&
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end p-4">
                    <div ref={modalRef} className="bg-white w-full lg:w-2/5 h-full p-6 rounded-lg shadow-lg">
                        <div className='flex justify-between'>
                        <h2 className="text-lg font-semibold mb-4">Options</h2>
                        <button onClick={() => setIsOptionVisible(false)}>Close</button>
                        </div>
                        <div className='flex flex-col justify-end items-end'>
                        <DownLoadCSV headers={headers} projectId={projectId} />
                        <ShareToDrive headers={headers} projectId={projectId} />
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}
