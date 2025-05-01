interface AnswerItem {
    text: string;
    geometry: {
      left: number;
      top: number;
      width: number;
      height: number;
    };
  }
  
  interface DocumentReviewProps {
    selectedRecordForReview?: {
      orginal_file_name: string;
      created_at: string;
      answers: Record<string, AnswerItem>;
      filename: string;
    };
  }
  
  export default function DocumentReview({ selectedRecordForReview }: DocumentReviewProps) {
    if (!selectedRecordForReview) return null;
  
    const { orginal_file_name, created_at, answers, filename } = selectedRecordForReview;
  
    return (
      <div className="flex flex-col md:flex-row gap-8 p-8 max-w-6xl mx-auto">
        {/* Scrollable Data Section */}
        <div className="w-full md:w-1/2 overflow-y-auto md:max-h-[calc(100vh-4rem)]">
          {/* Answers List */}
          <div className="bg-white p-8 rounded-lg shadow-md space-y-4">
            {Object.entries(answers).map(([key, value]) => (
              <div 
                key={key}
                className="p-4 bg-gray-50 rounded-md transition-colors hover:bg-gray-100"
              >
                <dt className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  {key}
                </dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">
                  {value.text}
                </dd>
              </div>
            ))}
          </div>
        </div>
         {/* Fixed Image Preview */}
        <div className="w-full md:w-1/2 md:sticky md:top-8 md:self-start">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="bg-gray-100 rounded-md p-5 text-center text-gray-600 aspect-[16/9] flex items-center justify-center">
              Document Preview
              {/* Replace with actual image/PDF preview */}
            </div>
          </div>
        </div>
      </div>
    );
  }