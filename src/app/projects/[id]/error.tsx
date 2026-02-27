'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('[ProjectView] Error Boundary caught:', error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 bg-gray-50/50 rounded-xl border border-gray-100 mt-8 mx-auto max-w-2xl">
            <div className="bg-white p-4 rounded-full shadow-sm mb-6 border border-gray-100">
                <AlertCircle className="w-10 h-10 text-red-500" />
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-500 text-center mb-8 max-w-md">
                We encountered an issue loading the project data. This might be due to a temporary connection issue.
            </p>

            <div className="flex gap-4">
                <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="px-6 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Go to Dashboard
                </button>
                <button
                    onClick={
                        // Attempt to recover by trying to re-render the segment
                        () => reset()
                    }
                    className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-shadow shadow-sm hover:shadow"
                >
                    <RefreshCw className="w-4 h-4" />
                    Try again
                </button>
            </div>

            {process.env.NODE_ENV !== 'production' && (
                <div className="mt-12 p-4 bg-red-50 border border-red-100 rounded-lg text-left w-full overflow-auto max-h-60 text-xs font-mono">
                    <p className="text-red-700 font-bold mb-2">Error Details (Dev Only):</p>
                    <p className="text-red-600 whitespace-pre-wrap">{error.message}</p>
                    {error.stack && <p className="text-gray-500 mt-2">{error.stack}</p>}
                </div>
            )}
        </div>
    )
}
