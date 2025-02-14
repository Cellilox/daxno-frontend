'use client'
import React, { useState } from 'react'
import ChargeCard from '@/components/ChargeCard'
import ChargeMoMo from '@/components/ChargeMoMo'
import { FaCreditCard, FaMobileAlt } from 'react-icons/fa'

type formType = 'card' | 'momo'

export default function Payments() {
  const [form, setForm] = useState<formType>('card')

  return (
    <div className="space-y-6">
      <div className="max-w-lg mx-auto p-6">
        <div className="flex border rounded-md overflow-hidden shadow">
          <button
            onClick={() => setForm('card')}
            className={`flex-1 py-3 transition-colors duration-300 ${
              form === 'card'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-blue-600 hover:bg-blue-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <FaCreditCard size={20} />
              <span className="font-medium">Card</span>
            </div>
          </button>

          <button
            onClick={() => setForm('momo')}
            className={`flex-1 py-3 transition-colors duration-300 ${
              form === 'momo'
                ? 'bg-yellow-500 text-black'
                : 'bg-white text-yellow-500 hover:bg-yellow-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <FaMobileAlt size={20} />
              <span className="font-medium">MTN Mobile Money</span>
            </div>
          </button>
        </div>
      </div>


      {form === 'card' && <ChargeCard />}
      {form === 'momo' && <ChargeMoMo />}
    </div>
  )
}
