
export default function Loading() {
    return (
        <div className="mx-auto p-6 md:p-12 h-screen bg-gray-50 animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-lg h-32">
                    <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-10 bg-gray-200 rounded w-16 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg h-32">
                    <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-10 bg-gray-200 rounded w-16 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-40"></div>
                </div>
            </div>
        </div>
    );
}
