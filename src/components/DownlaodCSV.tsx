'use client'

import { useState } from "react";
import LoadingSpinner from "./ui/LoadingSpinner";
import { download } from "@/actions/download-actions";
import { Download } from 'lucide-react';

type ExportCSVProps = {
    projectId: string
}

export default function DownLoadCSV({projectId}: ExportCSVProps) {
     const [isLoading, setIsLoading] = useState(false)
     async function downloadCSV () {
        setIsLoading(true)
        const blob = await download(projectId)
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'data.csv';
        setIsLoading(false)
        link.click();
    }
    return (
        <div className="w-full">
            <div className="flex flex-col items-center gap-3">
                <p className="text-sm font-medium text-gray-700">Download your data</p>
                <div className="w-full">
                    {isLoading ? (
                        <div className="flex justify-center items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors">
                            <LoadingSpinner />
                            <span className="text-sm">Downloading...</span>
                        </div>
                    ) : (
                        <button
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
                            onClick={downloadCSV}
                        >
                            <Download className="w-4 h-4" />
                            <span className="text-sm">Download CSV</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

