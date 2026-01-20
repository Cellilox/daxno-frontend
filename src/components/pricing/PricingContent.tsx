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
      <><strong>500</strong>&nbsp;Documents/month</>,
      <>AI Analysis & Project Agents</>,
      <>Advanced OCR & Layout Geometry</>,
      <>Cloud Connectors (Google Drive, etc.)</>,
      <>Automated Workflows & Attachments</>,
      <>Team Collaboration & Shared Links</>
    ],
    professional: [
      <><strong>2,000</strong>&nbsp;Documents/month</>,
      <>Priority AI Processing</>,
      <>Advanced Collaboration Tools</>,
      <>Smart Notifications (SES/SNS)</>,
      <>Priority Email & Chat Support</>,
      <><strong>Everything in Starter</strong></>
    ],
    byok: [
      <><strong>1,000</strong>&nbsp;Documents/month</>,
      <><strong>Bring Your Own Key (BYOK)</strong></>,
      <><strong>Generate Managed Keys (GYOMK)</strong></>,
      <>Full AI Agent Suite Access</>,
      <>Enterprise-Grade Connectors</>,
      <><strong>Dedicated 24/7 Support</strong></>
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

        </div>
      }
    </>
  )
}