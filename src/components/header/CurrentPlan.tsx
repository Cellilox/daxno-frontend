"use client"

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSubscription } from '../hooks/useSubscription';
import { Crown } from 'lucide-react';
import PricingModal from '../pricing/PricingModal';

interface Transaction {
  payment_type: 'mobilemoneyrw' | 'card';
  end_date?: string;
  amount?: number;
  t_id?: number;
  // ...other properties
}

interface Transactions {
  transactions: Transaction[];
}


export default function CurrentPlan({ transactions }: Transactions) {
  const router = useRouter();
  const currentTransaction = transactions[0]
  const {  plan, loading, error } = useSubscription(currentTransaction);
  console.log('CCCurent_Transaction', currentTransaction)
  if (currentTransaction == undefined) {
    return (
      <div>
        <PricingModal redirect_url='/'/>
      </div>
    )
  }
  
  if (loading) return <p>loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className='md:flex md:mr-3 items-center text-right'>
      <p className='md:mr-7'>Plan: <span className='text-green-500'>{plan}</span></p>
      <div>
        <PricingModal redirect_url='/'/>
      </div>
    </div>
  );
}
