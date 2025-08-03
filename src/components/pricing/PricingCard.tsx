'use client'

import Link from "next/link"
import LoadingSpinner from "../ui/LoadingSpinner"
import { useMemo, useState } from "react"
import { set } from "react-hook-form"

interface PricingCardProps {
  title: string
  planId?: number
  planAmount: number
  isPopular?: boolean
  features: JSX.Element[]
  ctaText: string
  ctaLink?: string
  billingInterval: 'monthly' | 'annual'
  isEnterprise?: boolean
  makePayment: (planId: number | undefined, proratedAmount: number | undefined) => void
  loading: boolean
  clickedPlanName: string
  current_plan: string
  current_txn_amount: number
  current_txn_end_date: string
}

export function PricingCard({
  title,
  planId,
  planAmount,
  isPopular,
  features,
  ctaText,
  ctaLink,
  billingInterval,
  isEnterprise,
  makePayment,
  loading,
  clickedPlanName,
  current_plan,
  current_txn_amount,
  current_txn_end_date
}: PricingCardProps) {
  const [proratedAmount, setProratedAmount] = useState<number | undefined>()

  // Proration calculations
  const { proRatedCharge, fullCharge, creditAmount, remainingDays } = useMemo(() => {
    const now = new Date()
    const endDate = new Date(current_txn_end_date)

    // Number of milliseconds in one day (24h)
    const msInDay = 1000 * 60 * 60 * 24
    // Compute the raw difference in days between end date and now
    const diffDays = (endDate.getTime() - now.getTime()) / msInDay
    // Round up to the next whole day, and ensure we don't get negative days
    const remDays = Math.max(Math.ceil(diffDays), 0)

    // Determine the billing interval in days based on billingInterval prop
    let intervalDays: number
    if (billingInterval === 'annual') {
      intervalDays = 365
    } else {
      intervalDays = 30
    }

    // Monthly equivalent charge is always the monthlyPrice
    const monthlyEquivalentRaw: number = planAmount

    // Credit for unused time on current plan
    const creditRaw = current_txn_amount * (remDays / intervalDays)
    const credit = parseFloat(creditRaw.toFixed(2))

    // Net due for next month
    const netRaw = planAmount - credit
    const netDue = parseFloat(Math.max(netRaw, 0).toFixed(2))
    setProratedAmount(netDue)

    return {
      proRatedCharge: netDue,
      fullCharge: parseFloat(monthlyEquivalentRaw.toFixed(2)),
      creditAmount: credit,
      remainingDays: remDays
    }
  }, [current_txn_amount, current_txn_end_date, planAmount, billingInterval])

  return (
    <div className={`bg-white p-6 rounded-xl shadow-lg flex flex-col ${isPopular ? 'border-2 border-blue-600 transform scale-105' : ''}`}>
      <div className='flex items-center justify-between mb-4 w-full'>
        <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
        {isPopular && (
          <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm">
            Popular
          </span>
        )}
      </div>
      <div className="text-4xl font-bold mb-4">
        {isEnterprise ? (
          'Custom'
        ) : (
          <>
          {billingInterval === 'annual' && (
            <div>
            <p>{planAmount / 12}<span className="text-lg text-gray-500">/mo</span></p>
            <p className="text-xs text-gray-400">Billed annually</p>
            </div>
          )}
          {billingInterval === 'monthly' && (
            <div>
            <p>{planAmount}<span className="text-lg text-gray-500">/mo</span></p>
            <p className="text-xs text-gray-400">Billed monthly</p>
            </div>
          )}
          </>
        )}
      </div>

      {current_plan === title ? null : title === 'Enterprise'? null: (current_plan != 'title' && current_plan === 'Professional')? null: !current_plan? null: (
      <div className="relative inline-block text-left mb-6 group">
        <div className="bg-blue-50 p-3 rounded-lg flex items-center space-x-1 cursor-pointer">
          {billingInterval === 'annual' && (
          <p className="text-xs text-gray-700">
            Upgrade today and pay <strong>$ {(proRatedCharge / 12).toFixed(2)}</strong> now (pro-rated) /mo (billed anually), then <strong>$ {(fullCharge / 12).toFixed(2)}</strong>/mo thereafter.
          </p>
          )}

         {billingInterval === 'monthly' && (
          <p className="text-xs text-gray-700">
            Upgrade today and pay <strong>$ {proRatedCharge.toFixed(2)}</strong> now (pro-rated) /mo (billed anually), then <strong>$ {fullCharge.toFixed(2)}</strong>/mo thereafter.
          </p>
          )}
          <span className="text-gray-500">ⓘ</span>
        </div>
        {/* Tooltip panel positioned below */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs text-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 ease-in-out z-20">
          <div className="relative">
            {/* Arrow pointing up */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 h-3 w-3 bg-white border-b border-r border-gray-200 rotate-45"></div>
            <div>
            <p className="mb-1">Unused fees from current plan ({remainingDays} days): <strong>$ {creditAmount.toFixed(2)}</strong></p>
            <p className="mb-1">Plan Fee: <strong>$ {fullCharge.toFixed(2)}</strong></p>
            <hr className="my-2" />
            <p><strong>Net today: $ {proRatedCharge.toFixed(2)}</strong></p>
            </div>
          </div>
        </div>
      </div>
      )}

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
          onClick={() => makePayment(planId, proratedAmount)}
          disabled={current_plan === title || loading || current_plan === 'Professional'}
          className={`mt-auto bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex justify-around items-center ${(current_plan === title) ? 'disabled bg-green-400 hover:bg-green-500 cursor-not-allowed': ''} ${loading && clickedPlanName === title ? 'disabled bg-gray-400 hover:bg-gray-500 cursor-not-allowed': ''} ${(current_plan === title) ? 'disabled bg-green-400 hover:bg-green-500 cursor-not-allowed': ''} ${current_plan === 'Professional' ? 'disabled bg-gray-400 hover:bg-gray-500 cursor-not-allowed': ''}`}
        >
          {loading && clickedPlanName === title ? <LoadingSpinner /> : null}
          {`${current_plan === title ? "Current Plan" : current_plan === "Professional" ? "Downgrade" : ctaText}`}
        </button>
      )}
    </div>
  )
}
