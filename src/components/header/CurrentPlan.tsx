"use client"

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSubscription } from '../hooks/useSubscription';

interface Transaction {
  payment_type: 'mobilemoneyrw' | 'card';
  end_date?: string;
  amount?: number;
  t_id?: number;
  // ...other properties
}

interface CurrentPlanProps {
  currentTransaction: Transaction;
}


export default function CurrentPlan({ currentTransaction }: CurrentPlanProps) {
  const router = useRouter();

  const { status, plan, paymentType, loading, error } = useSubscription(currentTransaction);
  console.log('CCCurent_Transaction', currentTransaction)
  if (currentTransaction == undefined) {
    return (
      <div>
        <button onClick={() => router.push('/pricing')} className="px-3 py-1 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors">
        Upgrade
      </button>
      </div>
    )
  }
  if (loading) return <p>loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className='md:flex md:mr-3 items-center text-right'>
      <p className='md:mr-7'>Plan: <span className='text-green-500'>{plan}</span></p>
      <p onClick={() => router.push('/pricing')} className="underline hover:cursor-pointer text-sm">Upgrade</p>
    </div>
  );
}

