
export default function Loading() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-100">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded w-40"></div>
                    </div>
                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
            </div>
        </div>
    );
}
