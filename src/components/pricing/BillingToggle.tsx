'use client'

interface BillingToggleProps {
  billingInterval: 'monthly' | 'annual'
  setBillingInterval: (interval: 'monthly' | 'annual') => void
}

export function BillingToggle({ billingInterval, setBillingInterval }: BillingToggleProps) {
  return (
    <div className="mt-6 bg-gray-100 p-1 rounded-lg inline-flex">
      <button
        onClick={() => setBillingInterval('monthly')}
        className={`px-6 py-2 rounded-md transition-colors ${
          billingInterval === 'monthly' 
            ? 'bg-white text-blue-600 shadow-sm' 
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        Monthly
      </button>
      <button
        onClick={() => setBillingInterval('annual')}
        className={`px-6 py-2 rounded-md transition-colors ${
          billingInterval === 'annual' 
            ? 'bg-white text-blue-600 shadow-sm' 
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        Annual (20% off)
      </button>
    </div>
  )
}