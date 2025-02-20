
"use client"

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSubscription } from './hooks/useSubscription';

interface Transaction {
  payment_type: 'mobilemoneyrw' | 'card';
  end_date?: string;
  amount?: number;
  t_id?: number;
  // ...other properties
}

interface CurrentPlanProps {
  currentTransaction: Transaction;
  headers: Headers;
}

export default function CurrentPlan({ currentTransaction, headers }: CurrentPlanProps) {
  const router = useRouter();
  const { status, plan, paymentType, loading, error } = useSubscription(currentTransaction, headers);

  if (loading) return <p>Loading subscription data...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <p>Payment type: {paymentType}</p>
      <p>Status: {status}</p>
      <p>Current Plan: {plan}</p>
      <p onClick={() => router.push('/pricing')} className="underline hover:cursor-pointer">Upgrade</p>
      <button onClick={() => router.push('/pricing')} className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors">
        Upgrade
      </button>
    </div>
  );
}

