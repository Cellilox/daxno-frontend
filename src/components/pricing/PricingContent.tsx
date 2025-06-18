'use client'

import { PricingCard } from "./PricingCard"


interface PricingContentProps {
  billingInterval: 'monthly' | 'annual'
  makePayment:(plan: string) => void
  loading: boolean;
  planName: string;
  current_plan: string;
}

export function PricingContent({ billingInterval, makePayment, loading, planName, current_plan}: PricingContentProps) {
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
    team: [
      <>500 documents/month</>,
      <>Basic Templates</>,
      <>Email Support</>
    ],
    enterprise: [
      <>Unlimited Documents</>,
      <>Custom Workflows</>,
      <>Dedicated Support</>
    ]
  }

  return (
    <div className="grid gap-8 md:grid-cols-4">
      <PricingCard
        title="Starter"
        monthlyPrice={19}
        features={features.starter}
        ctaText="Upgrade"
        billingInterval={billingInterval}
        makePayment={makePayment}
        loading={loading}
        planName={planName}
        current_plan={current_plan}
      />

      <PricingCard
        title="Professional"
        monthlyPrice={49}
        features={features.professional}
        ctaText="Upgrade"
        billingInterval={billingInterval}
        isPopular
        makePayment={makePayment}
        loading={loading}
        planName={planName}
        current_plan={current_plan}
      />

      <PricingCard
        title="Team"
        monthlyPrice={70}
        features={features.team}
        ctaText="Upgrade"
        billingInterval={billingInterval}
        makePayment={makePayment}
        loading={loading}
        planName={planName}
        current_plan={current_plan}
      />

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
        planName={planName}
        current_plan={current_plan}
      />
    </div>
  )
}