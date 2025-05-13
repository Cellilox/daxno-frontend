'use client'

import Link from "next/link"
import LoadingSpinner from "../ui/LoadingSpinner"


interface PricingCardProps {
  title: string
  monthlyPrice: number | string
  isPopular?: boolean
  isCurrentPlan?: boolean
  features: JSX.Element[]
  ctaText: string
  ctaLink?: string
  billingInterval: 'monthly' | 'annual'
  isEnterprise?: boolean
  makePayment: (plan: string) => void
  loading: boolean;
  planName: string;
}

export function PricingCard({
  title,
  monthlyPrice,
  isPopular,
  isCurrentPlan,
  features,
  ctaText,
  ctaLink,
  billingInterval,
  isEnterprise,
  makePayment,
  loading,
  planName
}: PricingCardProps) {
  const calculateAnnualPrice = (price: number) => (price * 12 * 0.8).toFixed(2)

  return (
    <div className={`bg-white p-6 rounded-xl shadow-lg flex flex-col ${isPopular ? 'border-2 border-blue-600 transform scale-105' : ''}`}>
      <div className='flex items-center justify-between mb-4 w-ful'>
      {isCurrentPlan && (
          <span className="bg-green-600 text-white px-2 py-1 rounded-full text-sm">
            Current Plan
          </span>
        )}
        {isPopular && (
          <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-sm">
            Most Popular
          </span>
        )}
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
      
      <div className="text-4xl font-bold mb-4">
        {isEnterprise ? (
          'Custom'
        ) : billingInterval === 'monthly' ? (
          typeof monthlyPrice === 'number' ? (
            <>
              ${monthlyPrice}<span className="text-lg text-gray-500">/mo</span>
            </>
          ) : (
            monthlyPrice
          )
        ) : (
          <>
            ${calculateAnnualPrice(monthlyPrice as number)}
            <span className="text-lg text-gray-500">/year</span>
            <div className="text-sm text-gray-500 mt-1">
              (${(Number(monthlyPrice) * 0.8).toFixed(2)}/mo equivalent)
            </div>
          </>
        )}
      </div>

      <ul className="space-y-2 mb-6 flex-1">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      {ctaLink ? (
        <Link
          href="/contact"
          className={`mt-auto ${
            isEnterprise 
              ? 'text-blue-600 border border-blue-600 hover:bg-blue-50' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } py-2 rounded-lg text-center transition-colors`}
        >
          {ctaText}
        </Link>
      ) : (
        <button 
        onClick={() => makePayment(title)}
        disabled={loading}
        className={`mt-auto bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex justify-around items-center ${loading && planName === title ? 'disabled bg-gray-400 hover:bg-gray-500 cursor-not-allowed': ''}`}>
          {loading && planName === title? <LoadingSpinner/>: null}
          {ctaText}
        </button>
      )}
    </div>
  )
}