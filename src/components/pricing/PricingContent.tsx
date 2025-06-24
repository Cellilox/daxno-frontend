'use client'

import { PricingCard } from "./PricingCard"
import { Plan } from "./types";


interface PricingContentProps {
  billingInterval: 'monthly' | 'annual'
  makePayment:(planId: number | undefined) => void
  loading: boolean;
  clickedPlanName: string;
  current_plan: string;
  monthlyPlans: Plan[];
  yearlyPlans: Plan[];
}

export function PricingContent({ billingInterval, makePayment, loading, clickedPlanName, current_plan, monthlyPlans, yearlyPlans}: PricingContentProps) {
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
    {billingInterval === "annual"? 
        <div className="grid gap-8 md:grid-cols-3">
          {yearlyPlans?.map((plan: Plan) => {
            const key = plan.name.toLowerCase() as keyof typeof features;
          return (
            <PricingCard
            key={plan.plan_token}
            planId={plan.id}
            title={plan.name}
            monthlyPrice={plan.amount / 12}
            features={features[key] || []}
            ctaText="Upgrade"
            billingInterval={billingInterval}
            makePayment={makePayment}
            loading={loading}
            clickedPlanName={clickedPlanName}
            current_plan={current_plan}
            isPopular={plan.name === 'Professional'}
            />
       )})}
          <PricingCard
          title="Enterprise"
          monthlyPrice="Custom"
          features={features.enterprise}
          ctaText="Contact Sales"
          ctaLink="/contact"
          billingInterval={billingInterval}
          isEnterprise
          makePayment={makePayment}
          loading={loading}
          clickedPlanName={clickedPlanName}
          current_plan={current_plan}
        />
    </div>:

       <div className="grid gap-8 md:grid-cols-3">
        {monthlyPlans?.map((plan: Plan) => {
          const key = plan.name.toLowerCase() as keyof typeof features;
          return (
          <PricingCard
            key={plan.plan_token}
            planId={plan.id}
            title={plan.name}
            monthlyPrice={plan.amount}
            features={features[key] || []}
            ctaText="Upgrade"
            billingInterval={billingInterval}
            makePayment={makePayment}
            loading={loading}
            clickedPlanName={clickedPlanName}
            current_plan={current_plan}
            isPopular={plan.name === 'Professional'}
          />
         )})}  
          <PricingCard
          title="Enterprise"
          monthlyPrice="Custom"
          features={features.enterprise}
          ctaText="Contact Sales"
          ctaLink="/contact"
          billingInterval={billingInterval}
          isEnterprise
          makePayment={makePayment}
          loading={loading}
          clickedPlanName={clickedPlanName}
          current_plan={current_plan}
        />
    </div>
  }
    </>
  )
}