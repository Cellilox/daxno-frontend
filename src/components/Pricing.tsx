"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { usePaymentContext } from "./context/payment/Payment"
import { useRouter } from "next/navigation"

type PricingTypes = {
    headers: any,
    userId: string | undefined
}

type planTypes = 'Starter' | 'Professional'

export default function Pricing({headers, userId}: PricingTypes) {
  const router = useRouter()
  const {amount, paymentPlan, transactionReference, setAmount, setTransactionReference, setPaymentPlan} = usePaymentContext()
  console.log(amount, paymentPlan, transactionReference)
  const [plansList, setPlansList] = useState<any>()
  console.log('PPPPPP', plansList)

  const getAvailablePlans = async () => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/payments/payment-plans?status=active`
    const response = await fetch(url, {
        method: 'GET',
        headers: headers
    })
    const result = await response.json()
    setPlansList(result.data)
  }

  useEffect(() => {
    getAvailablePlans()
  }, [])

  const pickPlan = (plan: planTypes) => {
    const pickedPlan = plansList.filter((x: any) => x.name === plan)
    console.log('PICKED', pickedPlan)
    setPaymentPlan(pickedPlan[0].id)
    setAmount(pickedPlan[0].amount)
    setTransactionReference(userId)
    router.push('/payments')
  }


  return (
    <div>
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

          <div className="grid md:grid-cols-3 gap-8">

            {/* Starter Plan */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Starter</h3>
              <div className="text-4xl font-bold mb-6">
                    $29<span className="text-lg text-gray-500">/mo</span>
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
              <div
                // href="/payments"
                onClick={() => pickPlan('Starter')}
                className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors hover:cursor-pointer"
              >
                Start Free Trial
              </div>
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
                    $49<span className="text-lg text-gray-500">/mo</span>
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
              <div
              onClick={() => pickPlan('Professional')}
                // href="/payments"
                className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors hover:cursor-pointer"
              >
                Get Started
              </div>
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
    </div>
  )
}
