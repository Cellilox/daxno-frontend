'use client'

import { useState, useEffect } from "react"
import Image from "next/image"
import { Crown } from 'lucide-react'
import { BillingToggle } from "./BillingToggle"
import { PricingContent } from "./PricingContent"
import { getAvailablePlans, requestPayment } from "@/actions/payment-actions"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import { Transaction, Plan } from "./types"

type Transactions = {
  transactions: Transaction[]
}

export default function PricingModal({ transactions }: Transactions) {
  const [isOuterExpanded, setIsOuterExpanded] = useState(false)
  const [isInnerVisible, setIsInnerVisible] = useState(false)
  const [areCardsVisible, setAreCardsVisible] = useState(false)
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('annual')
  const [timeoutIds, setTimeoutIds] = useState<number[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [clickedPlanName, setClickedPlanName] = useState<string>('')
  const [clickedPlanAmount, setClickedPlanAmount] = useState<number>()
  const pathname = usePathname().slice(1)
  const router = useRouter()
  const toggleExpand = () => {
    if (isOuterExpanded) {
      setAreCardsVisible(false)
      createTrackedTimeout(() => setIsInnerVisible(false), 300)
      createTrackedTimeout(() => setIsOuterExpanded(false), 500)
    } else {
      setIsOuterExpanded(true)
      createTrackedTimeout(() => setIsInnerVisible(true), 300)
      createTrackedTimeout(() => setAreCardsVisible(true), 800)
    }
  }

  const createTrackedTimeout = (callback: () => void, delay: number) => {
    const id = window.setTimeout(callback, delay)
    setTimeoutIds(prev => [...prev, id])
    return id
  }

  useEffect(() => {
    return () => timeoutIds.forEach(id => clearTimeout(id))
  }, [timeoutIds])


  const [plansList, setPlansList] = useState<any>()

  const setAvailablePlans = async () => {
    const plans = await getAvailablePlans();
    setPlansList(plans?.data)
  }

  useEffect(() => {
    setAvailablePlans()
  }, [])

  useEffect(() => {
    if (plansList && transactions && transactions.length > 0) {
      const activePlanId = transactions[0].plan_id;
      // In case plan_id from transaction is string, cast to number for comparison or vice versa
      const activePlan = plansList.find((p: Plan) => String(p.id) === String(activePlanId));

      if (activePlan) {
        if (activePlan.interval === 'yearly') {
          setBillingInterval('annual');
        } else if (activePlan.interval === 'monthly') {
          setBillingInterval('monthly');
        }
      }
    }
  }, [plansList, transactions]);

  const monthlyPlans = plansList?.filter((x: Plan) => x.interval === "monthly").sort((a: Plan, b: Plan) => a.amount - b.amount);
  const yearlyPlans = plansList?.filter((x: Plan) => x.interval === "yearly").sort((a: Plan, b: Plan) => a.amount - b.amount);
  const hourlyPlans = plansList?.filter((x: Plan) => x.interval === "hourly").sort((a: Plan, b: Plan) => a.amount - b.amount);


  const makePayment = async (planId: number | undefined, proratedAmount: number | undefined) => {
    if (!planId) {
      console.error("No planId provided to makePayment");
      return;
    }

    try {
      setLoading(true)
      let amount;
      // Ensure type compatibility when finding plan
      const pickedPlan = plansList.filter((x: Plan) => Number(x.id) === Number(planId))

      if (!pickedPlan || pickedPlan.length === 0) {
        console.error("Plan not found in plansList for ID:", planId);
        setLoading(false);
        return;
      }

      const paymentPlan = pickedPlan[0].id
      if (proratedAmount !== undefined && proratedAmount !== null) {
        amount = proratedAmount
      } else {
        amount = pickedPlan[0].amount
      }

      setClickedPlanName(pickedPlan[0].name)
      if (paymentPlan && amount !== undefined) {
        const result = await requestPayment(pathname, amount, paymentPlan)
        if (result?.data) {
          setClickedPlanName('')
          setLoading(false)
          router.push(result?.data?.link)
        }
      }
    } catch (error) {
      setClickedPlanName('')
      setLoading(false)
      console.log('Error', error)
      alert('Error requesting to pay')
    }
  }

  return (
    <div>
      <div
        onClick={toggleExpand}
        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 cursor-pointer"
      >
        <Crown className="w-4 h-4" />
        <span>Upgrade</span>
      </div>

      <div
        className={`fixed inset-0 bg-white z-50 transition-opacity duration-500 ${isOuterExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
      >
        <div className="relative w-full h-full flex flex-col items-center justify-start pt-16">
          <button
            onClick={toggleExpand}
            className="absolute top-4 right-4 p-2"
          >
            <Image src="/close.svg" alt="Close" width={30} height={30} />
          </button>

          <div className="text-center px-4 mb-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              No hidden fees, cancel anytime.
            </p>

            <BillingToggle
              billingInterval={billingInterval}
              setBillingInterval={setBillingInterval}
            />
          </div>

          <div
            className={`mt-3 bg-white w-11/12 flex justify-center transform origin-top transition-transform duration-500 overflow-y-auto ${isInnerVisible ? 'scale-y-100 max-h-[80vh]' : 'scale-y-0 max-h-0'
              }`}
          >
            <div className="py-8 bg-gray-100 w-11/12">
              <div className="mx-auto px-4">
                <div className={`transition-opacity duration-300 ${areCardsVisible ? 'opacity-100' : 'opacity-0'
                  }`}>
                  <PricingContent
                    billingInterval={billingInterval}
                    makePayment={makePayment}
                    loading={loading} clickedPlanName={clickedPlanName}
                    current_plan={transactions[0]?.plan_name}
                    current_txn_amount={transactions[0]?.amount}
                    current_txn_end_date={transactions[0]?.end_date}
                    current_plan_id={transactions[0]?.plan_id}
                    monthlyPlans={monthlyPlans}
                    yearlyPlans={yearlyPlans}
                    hourlyPlans={hourlyPlans}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}