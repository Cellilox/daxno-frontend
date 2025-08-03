'use client'

import { useState, FormEvent } from 'react'

interface BuyCreditsFormProps {
  makePayment: (amount: number) => void
}

export function BuyCreditsForm({ makePayment }: BuyCreditsFormProps) {
  const [amount, setAmount] = useState<number>(5)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    makePayment(amount)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white rounded-lg shadow">
      <div className="mb-6">
        <div className="flex items-center border border-gray-300 rounded overflow-hidden focus-within:ring">
          <span className="px-3 bg-gray-100 text-gray-500">Amount</span>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className="flex-1 px-3 py-2 focus:outline-none text-black"
          />
        </div>
      </div>
      <p className='text-black'>Service Fee: $0.00</p>
      <p className='text-black'>Total Due: ${amount}</p>

      <button
        type="submit"
        className="mt-3 w-full py-3 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition"
      >
        Purchase
      </button>
    </form>
  )
}
