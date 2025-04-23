"use client"

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSubscription } from '../hooks/useSubscription';
import { Crown } from 'lucide-react';

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
        <div 
          onClick={() => router.push('/pricing')} 
          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 cursor-pointer"
        >
          <Crown className="w-4 h-4" />
          <span>Upgrade</span>
        </div>
      </div>
    )
  }
  if (loading) return <p>loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className='md:flex md:mr-3 items-center text-right'>
      <p className='md:mr-7'>Plan: <span className='text-green-500'>{plan}</span></p>
      <div 
        onClick={() => router.push('/pricing')} 
        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 cursor-pointer"
      >
        <Crown className="w-4 h-4" />
        <span>Upgrade</span>
      </div>
    </div>
  );
}
