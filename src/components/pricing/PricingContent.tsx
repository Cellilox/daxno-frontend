'use client'

import { PricingCard } from "./PricingCard"
import { Plan } from "./types";


interface PricingContentProps {
  billingInterval: 'monthly' | 'annual'
  makePayment: (planId: number | undefined, proratedAmount: number | undefined) => void
  loading: boolean;
  clickedPlanName: string;
  current_plan: string;
  current_txn_amount: number;
  current_txn_end_date: string;
  current_plan_id?: string;
  monthlyPlans: Plan[];
  yearlyPlans: Plan[];
  hourlyPlans: Plan[];
}

export function PricingContent({ billingInterval, makePayment, loading, clickedPlanName, current_plan, current_txn_amount, current_txn_end_date, current_plan_id, monthlyPlans, yearlyPlans, hourlyPlans }: PricingContentProps) {
  const features = {
    starter: [
      <>500 documents/month</>,
      <>Basic Templates</>,
      <>Email Support</>
    ],
    professional: [
      <>2,000 documents/month</>,
      <>Advanced Templates</>,
      <>Priority Support</>
    ],
    enterprise: [
      <>Unlimited Documents</>,
      <>Custom Workflows</>,
      <>Dedicated Support</>
    ]
  }
  return (
    <>
      {billingInterval === "annual" ?
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {yearlyPlans?.map((plan: Plan) => {
            const key = plan.name.toLowerCase() as keyof typeof features;
            return (
              <PricingCard
                key={plan.plan_token}
                planId={plan.id}
                title={plan.name}
                planAmount={plan.amount}
                features={features[key] || []}
                ctaText="Upgrade"
                billingInterval={billingInterval}
                makePayment={makePayment}
                loading={loading}
                clickedPlanName={clickedPlanName}
                current_plan={current_plan}
                current_txn_amount={current_txn_amount}
                current_txn_end_date={current_txn_end_date}
                current_plan_id={current_plan_id}
                isPopular={plan.name === 'Professional'}
              />
            )
          })}
          <PricingCard
            title="Enterprise"
            planAmount={0}
            features={features.enterprise}
            ctaText="Contact Sales"
            ctaLink="/contact"
            billingInterval={billingInterval}
            isEnterprise
            makePayment={makePayment}
            loading={loading}
            clickedPlanName={clickedPlanName}
            current_plan={current_plan}
            current_txn_amount={current_txn_amount}
            current_txn_end_date={current_txn_end_date}
          />
        </div> :

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {monthlyPlans?.map((plan: Plan) => {
            const key = plan.name.toLowerCase() as keyof typeof features;
            return (
              <PricingCard
                key={plan.plan_token}
                planId={plan.id}
                title={plan.name}
                planAmount={plan.amount}
                features={features[key] || []}
                ctaText="Upgrade"
                billingInterval={billingInterval}
                makePayment={makePayment}
                loading={loading}
                clickedPlanName={clickedPlanName}
                current_plan={current_plan}
                current_txn_amount={current_txn_amount}
                current_txn_end_date={current_txn_end_date}
                current_plan_id={current_plan_id}
                isPopular={plan.name === 'Professional'}
              />
            )
          })}
          <PricingCard
            title="Enterprise"
            planAmount={0}
            features={features.enterprise}
            ctaText="Contact Sales"
            ctaLink="/contact"
            billingInterval={billingInterval}
            isEnterprise
            makePayment={makePayment}
            loading={loading}
            clickedPlanName={clickedPlanName}
            current_plan={current_plan}
            current_txn_amount={current_txn_amount}
            current_txn_end_date={current_txn_end_date}
          />
        </div>
      }
    </>
  )
}