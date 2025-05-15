import Link from "next/link";
import Testimonial from "@/components/Testimonial";
import Demo from "@/components/Demo";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Blue Color Scheme */}
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6">
          Your AI-Powered Document
          <span className="text-blue-600 block mt-2 md:mt-3">Query Agent</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8 max-w-3xl mx-auto px-2 md:px-0">
          Meet Cellilox AI - your intelligent document query agent that{" "}
          <span className="font-semibold text-blue-600">understands natural language requests</span>,
          extracts precise data points, and delivers answers in structured formats.
          Powered by NLP and machine learning, your AI agent becomes smarter at
          interpreting document queries with every interaction.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-2">
          <Link
            href="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 md:py-3 px-6 md:px-8 rounded-lg shadow-lg transition-all hover:scale-105 text-sm md:text-base"
          >
            Get Started
          </Link>
          <Demo/>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-16 grid md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-blue-600">
          <div className="w-12 h-12 bg-blue-100 rounded-lg mb-4 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-3">Cognitive Document Analysis</h3>
          <p className="text-gray-600">
            Our AI agent understands document layouts and context like humans do,
            adapting to new formats through continuous learning.
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-blue-600">
          <div className="w-12 h-12 bg-blue-100 rounded-lg mb-4 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-3">Intelligent Data Structuring</h3>
          <p className="text-gray-600">
            The AI agent doesn't just extract - it organizes information logically,
            detects relationships, and validates data integrity automatically.
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-blue-600">
          <div className="w-12 h-12 bg-blue-100 rounded-lg mb-4 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-3">Self-Improving AI</h3>
          <p className="text-gray-600">
            The more you use Cellilox AI, the smarter it becomes. Our agent learns
            from your feedback and document patterns unique to your workflow.
          </p>
        </div>
      </div>


      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">
              AI Agent Processing Pipeline
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold">Project Setup & Template Design</h4>
                  <p className="text-gray-600">
                    Create projects and define key data points like setting spreadsheets. The Agent will take all columns text as a batch of queries during query processing</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold">Create Collection Link</h4>
                  <p className="text-gray-600">Generate a secure URL to share with document senders</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold">Automatic Processing</h4>
                  <p className="text-gray-600">AI agent receives documents via upload or secure collection links and prefill data in your prepared spreadsheet</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">4</span>
                </div>
                <div>
                  <h4 className="font-semibold">Review & Export</h4>
                  <p className="text-gray-600">Push clean data to HubSpot CRM or Google Sheets</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Testimonial />
    </div>
  );
}