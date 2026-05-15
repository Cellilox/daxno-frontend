
export default function Loading() {
    return (
        <div className="px-4 sm:px-6 lg:px-8 animate-pulse">
            {/* Top Section - Project Details & Header */}
            <div className="bg-white p-4 sm:p-6 lg:p-8 shadow-lg rounded-lg mb-6">
                <div className="flex flex-col space-y-4 sm:space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start w-full">
                        <div className="flex flex-col gap-2 w-full sm:w-2/3">
                            {/* Title */}
                            <div className="h-8 bg-gray-200 rounded w-1/2 sm:w-1/3"></div>
                            {/* Description */}
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                        {/* Action Button Placeholder */}
                        <div className="w-full sm:w-auto">
                            <div className="h-10 bg-gray-200 rounded w-full sm:w-40"></div>
                        </div>
                    </div>

                    {/* Collapsible Actions Placeholder */}
                    <div className="flex gap-2 mt-4">
                        <div className="h-8 bg-gray-200 rounded w-24"></div>
                        <div className="h-8 bg-gray-200 rounded w-24"></div>
                        <div className="h-8 bg-gray-200 rounded w-24"></div>
                    </div>
                </div>
            </div>

            {/* Bottom Section - Spreadsheet Styles */}
            <div className="bg-white border border-gray-200 rounded-lg shadow overflow-hidden">
                {/* Spreadsheet Header / Toolbar */}
                <div className="h-12 border-b border-gray-200 bg-gray-50 flex items-center px-4 gap-2">
                    <div className="h-6 w-20 bg-gray-200 rounded"></div>
                    <div className="h-6 w-20 bg-gray-200 rounded"></div>
                    <div className="flex-1"></div>
                    <div className="h-6 w-6 bg-gray-200 rounded"></div>
                </div>

                {/* Spreadsheet Grid */}
                <div className="overflow-x-auto">
                    <div className="min-w-full inline-block align-middle">
                        <div className="border rounded-lg">
                            <div className="grid grid-cols-12 gap-0">
                                {/* Header Row */}
                                <div className="col-span-12 flex border-b border-gray-200">
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <div key={`head-${i}`} className="flex-1 h-10 bg-gray-100 border-r border-gray-200"></div>
                                    ))}
                                </div>

                                {/* Data Rows */}
                                {[...Array(10)].map((_, idx) => (
                                    <div key={idx} className="col-span-12 flex border-b border-gray-100">
                                        {[1, 2, 3, 4, 5, 6].map((i) => (
                                            <div key={`cell-${idx}-${i}`} className="flex-1 h-12 border-r border-gray-100 p-2">
                                                <div className="h-5 bg-gray-100 rounded w-3/4 mt-1"></div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
