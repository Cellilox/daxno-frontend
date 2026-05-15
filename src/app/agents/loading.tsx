
export default function Loading() {
    return (
        <div className="min-h-screen p-6 bg-gray-50 animate-pulse">
            <div className="flex items-center justify-between mb-8">
                <div className="h-9 bg-gray-200 rounded w-32"></div>
                <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
            </div>

            <div className="mt-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm h-48">
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                                <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
                            </div>
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>

                            <div className="mt-6 flex items-center justify-between">
                                <div className="h-4 bg-gray-200 rounded w-16"></div>
                                <div className="h-6 w-16 bg-gray-100 rounded-full"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}