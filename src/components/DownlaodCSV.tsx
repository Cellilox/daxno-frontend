'use client'

import { useState } from "react";
import LoadingSpinner from "./ui/LoadingSpinner";
import { download } from "@/actions/download-actions";
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
        <>
            <div className="flex flex-col items-center">
                    <p>Download</p>
                    <div className="mt-3">
                    {isLoading ?
                        <div
                            className="flex justify-between px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
                        >
                            <LoadingSpinner />
                            <p className="ml-3">Downloading...</p>
                        </div> :
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
                            onClick={downloadCSV}
                        >
                            Download your file
                        </button>
                    }
                    </div>
            </div>
        </>
    );
}

