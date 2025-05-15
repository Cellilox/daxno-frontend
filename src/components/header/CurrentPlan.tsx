"use client"

import React, { useEffect, useState } from 'react';
import PricingModal from '../pricing/PricingModal';
import { checkPlan } from '../pricing/utils';
import { Transaction } from '../pricing/types';

interface Transactions {
  transactions: Transaction[];
}

export default function CurrentPlan({ transactions }: Transactions) {
  const [plan, setPlan] = useState<string>('');
  const [currentTransaction, setCurrentTransaction] = useState<Transaction>();

  useEffect(() => {
    if (transactions?.length) {
      setCurrentTransaction(transactions[0]);
    }
  }, [transactions]); 

  useEffect(() => {
    if (!currentTransaction) return;
    
    const fetchPlan = async () => {
      try {
        const planName = await checkPlan(currentTransaction);
        setPlan(planName);
      } catch (e) {
        console.error('Failed to load plan:', e);
      }
    };

    fetchPlan();
  }, [currentTransaction]);

  if (!currentTransaction) {
    return (
      <div>
        <PricingModal />
      </div>
    );
  }

  return (
    <div className='md:flex md:mr-3 items-center text-right'>
      <p className='md:mr-7'>
        Plan: <span className='text-green-500'>{plan || 'loading...'}</span>
      </p>
      <div>
        <PricingModal />
      </div>
    </div>
  );
}