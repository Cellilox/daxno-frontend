'use client'

import { useState } from "react";
import LoadingSpinner from "../ui/LoadingSpinner";
import { download } from "@/actions/download-actions";
import { FileSpreadsheet } from 'lucide-react';

type ExportCSVProps = {
    projectId: string
}

export default function DownLoadCSV({projectId}: ExportCSVProps) {
     const [isLoading, setIsLoading] = useState(false)
     async function downloadCSV () {
        setIsLoading(true)
        try {
            const blob = await download(projectId)
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'data.csv';
            link.click();
        } catch (error) {
            console.error('Error downloading CSV:', error);
        } finally {
            setIsLoading(false)
        }
    }
    return (
        <div className="w-full">
            <div className="flex flex-col items-center gap-3">
                <div className="w-full">
                    {isLoading ? (
                        <div className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
                            <LoadingSpinner />
                            <span className="text-sm">Preparing CSV...</span>
                        </div>
                    ) : (
                        <button
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                            onClick={downloadCSV}
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            <span className="text-sm">Export as CSV</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

