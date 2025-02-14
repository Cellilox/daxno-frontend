"use client"

import Link from "next/link";
import Testimonial from "@/components/Testimonial";
import Attachment from "@/components/Attachment";

// import GmailStatus from "@/components/GmailStatus";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      {/* <Attachment/> */}
      {/* <GmailStatus/> */}
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Hey, I am DaxNo, Your
          <span className="text-blue-600 block mt-3">AI Agent</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Simplify your data entry with AI-powered automation. Create projects, define key insights, and let our AI handle the rest. 
          Extract data from images and PDFs, manage your findings in spreadsheets, and seamlessly integrate with your favorite Google tools.
          From scanned forms to email attachments - 
          our AI agents work 24/7 to streamline your workflows.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/projects"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg shadow-lg transition-all transform hover:scale-105"
          >
            Start Free Trial
          </Link>
          <Link
            href="/demo"
            className="border-2 border-blue-600 text-blue-600 font-medium py-3 px-8 rounded-lg transition-all hover:bg-blue-50"
          >
            Watch Demo
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16 grid md:grid-cols-3 gap-12">
        <div className="bg-white p-8 rounded-xl shadow-lg">
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

        <div className="bg-white p-8 rounded-xl shadow-lg">
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

        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="w-12 h-12 bg-blue-100 rounded-lg mb-4 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-3">Email Automation</h3>
          <p className="text-gray-600">
            Auto-process email attachments 24/7. Connect your Gmail and let our AI parse incoming documents while you focus on what matters.
          </p>
        </div>
      </div>

      {/* Real-time Demo Preview */}
      <div className="bg-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Live Data Synchronization</h2>
            <p className="text-lg text-gray-600 mb-6">
              Watch extracted data populate your spreadsheets in real-time across all devices. Our WebSocket technology ensures you never work with outdated information.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Instant mobile-to-desktop updates
              </li>
              {/* Add more list items */}
            </ul>
          </div>
          <div className="flex-1 bg-white p-8 rounded-xl shadow-lg">
            {/* Add your screenshot or mockup here */}
          </div>
        </div>
      </div>

      <Testimonial/>
    </div>
  );
}