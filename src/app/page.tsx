import Link from "next/link";
import Testimonial from "@/components/Testimonial";
import Demo from "@/components/Demo";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
          <span className="text-blue-600 block mb-3">Meet Cellilox</span>
          Your AI Doc Assistant
        </h1>

        <div className="prose prose-blue prose-xl mx-auto mb-8">
          <p>
            Speed up data entry with AI. Create projects,
            define key insights, and let Cellilox handle the rest.
          </p>
          <p>
            Powered by NLP and machine learning, Cellilox extracts data from incoming files, 
            manages your findings in spreadsheets, and seamlessly integrates with your favorite cloud and CRM tools (Google, HubSpot, etc.).
          </p>
          <p>
            From scanned forms to email attachments—Cellilox works 24/7 to
            streamline your workflows even when you're off.
          </p>
        </div>

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

      <div className="max-w-7xl mx-auto px-4 py-16 grid md:grid-cols-3 gap-12">
        <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-blue-600">
          <div className="w-12 h-12 bg-blue-100 rounded-lg mb-4 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-3">Smart Document Processing</h3>
          <p className="text-gray-600">
            Extract precise data from any format - images, PDFs, scans. Our OCR + NLP engine learns your requirements and auto-fills spreadsheets in real-time.
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-blue-600">
          <div className="w-12 h-12 bg-blue-100 rounded-lg mb-4 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-3">Live Mobile Integration</h3>
          <p className="text-gray-600">
            Scan documents with your phone and watch data appear instantly on your desktop. Project-specific QR codes ensure seamless team collaboration.
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-blue-600">
          <div className="w-12 h-12 bg-blue-100 rounded-lg mb-4 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-3">Email Automation</h3>
          <p className="text-gray-600">
            Auto-process email attachments 24/7. Connect your Gmail, Outlook, etc__ and let Cellilox parse incoming documents while you focus on what matters.
          </p>
        </div>
      </div>


      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">
              Processing Pipeline
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
                  <h4 className="font-semibold">Secure Links and Project Address Domain Generation</h4>
                  <p className="text-gray-600">Cellilox generates automatically secure links and project address domain to share to your documents senders</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold">Automatic Processing</h4>
                  <p className="text-gray-600">Whenever documents are sent, cellilox process Optical Character Recognition, pass the result to An AI model for data analaysis and extraction even when you are away</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">4</span>
                </div>
                <div>
                  <h4 className="font-semibold">Review, Share & Export</h4>
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