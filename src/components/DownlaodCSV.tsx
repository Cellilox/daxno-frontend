'use client'

import { useState } from "react";
import LoadingSpinner from "./ui/LoadingSpinner";
type ExportCSVProps = {
    headers: any,
    projectId: string
}


export default function DownLoadCSV({headers, projectId}: ExportCSVProps) {
     const [isLoading, setIsLoading] = useState(false)
     async function downloadCSV () {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/download-csv/${projectId}`;

        // Fetch the CSV file from the backend as a blob
        setIsLoading(true)
        const getCSV = await fetch(url, {
            method: 'GET',
            headers: headers
        });

        // Check if the response is successful
        if (!getCSV.ok) {
            setIsLoading(false)
            console.error('Failed to fetch CSV');
            return;
        }

        // Convert the response to a blob (binary data)
        const blob = await getCSV.blob();

        // Create a temporary download link
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'data.csv';  // The name of the file to download
        setIsLoading(false)
        link.click();  // Trigger the download
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

