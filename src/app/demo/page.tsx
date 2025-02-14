"use client"

import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [billingCycle, setBillingCycle] = useState("monthly");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ... Previous Sections (Navigation, Hero, Features) ... */}

      {/* Interactive Demo Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              See It in Action
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Watch how TheWings AI transforms document processing in 90 seconds
            </p>
          </div>

          {/* Video Container */}
          <div className="relative aspect-video bg-gray-200 rounded-2xl shadow-xl overflow-hidden">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/6XwSZ9x6ZRQ?si=Ly71GTA0yQhHnA2u"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>

          {/* Demo Features List */}
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center p-6">
              <div className="text-blue-600 text-2xl mb-2">1.</div>
              <h3 className="font-semibold mb-2">Define Your Template</h3>
              <p className="text-gray-600">Set up custom fields in minutes</p>
            </div>
            <div className="text-center p-6">
              <div className="text-blue-600 text-2xl mb-2">2.</div>
              <h3 className="font-semibold mb-2">Capture Documents</h3>
              <p className="text-gray-600">Scan or upload any file type</p>
            </div>
            <div className="text-center p-6">
              <div className="text-blue-600 text-2xl mb-2">3.</div>
              <h3 className="font-semibold mb-2">Watch Magic Happen</h3>
              <p className="text-gray-600">Real-time data extraction & sync</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Start free then upgrade as you grow. No hidden fees, cancel anytime.
            </p>
          </div>

          {/* Billing Cycle Switcher */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-md shadow-sm">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-2 border border-blue-600 text-sm font-medium ${
                  billingCycle === "monthly"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-blue-600"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("annually")}
                className={`px-4 py-2 border border-blue-600 text-sm font-medium ${
                  billingCycle === "annually"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-blue-600"
                }`}
              >
                Annually (Save 20%)
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {/* Free Plan */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="mb-4">
                <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                  Current Plan
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Free</h3>
              <div className="text-4xl font-bold mb-6">$0</div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  100 documents/month
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Basic Templates
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Community Support
                </li>
              </ul>
              <div className="block w-full text-center border-2 border-green-600 text-green-600 py-3 px-6 rounded-lg transition-colors cursor-default">
                Current Plan
              </div>
            </div>

            {/* Starter Plan */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Starter</h3>
              <div className="text-4xl font-bold mb-6">
                {billingCycle === "monthly" ? (
                  <>
                    $25<span className="text-lg text-gray-500">/mo</span>
                  </>
                ) : (
                  <>
                    $240<span className="text-lg text-gray-500">/yr</span>
                  </>
                )}
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-blue-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  500 documents/month
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-blue-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Basic Templates
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-blue-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Email Support
                </li>
              </ul>
              <Link
                href="/payments"
                className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Professional Plan (Featured) */}
            <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-blue-600 transform scale-105">
              <div className="mb-4">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                  Most Popular
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Professional
              </h3>
              <div className="text-4xl font-bold mb-6">
                {billingCycle === "monthly" ? (
                  <>
                    $49<span className="text-lg text-gray-500">/mo</span>
                  </>
                ) : (
                  <>
                    $470<span className="text-lg text-gray-500">/yr</span>
                  </>
                )}
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-blue-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  2,000 documents/month
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-blue-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Advanced Templates
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-blue-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Priority Support
                </li>
              </ul>
              <Link
                href="/payments"
                className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Enterprise</h3>
              <div className="text-4xl font-bold mb-6">Custom</div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Unlimited Documents
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Custom Workflows
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Dedicated Support
                </li>
              </ul>
              <Link
                href="/contact"
                className="block w-full text-center border-2 border-blue-600 text-blue-600 py-3 px-6 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </div>

          <p className="text-center text-gray-600 mt-8 text-sm">
            All plans include 14-day free trial. Need more?{" "}
            <Link href="/contact" className="text-blue-600 hover:underline">
              Contact us
            </Link>
          </p>
        </div>
      </div>

      {/* ... Footer Section ... */}
    </div>
  );
}
