import React from 'react';
import PricingModal from '../pricing/PricingModal';
import { Transaction } from '../pricing/types';

interface Transactions {
  transactions: Transaction[];
}

export default function CurrentPlan({ transactions }: Transactions) {
  return (
    <div className='md:flex md:mr-3 items-center text-right'>
      <p className='md:mr-7'>
        Plan: <span className='text-green-500'>{transactions[0]?.plan_name || 'Free'}</span>
      </p>
      <div>
        <PricingModal transactions = {transactions}/>
      </div>
    </div>
  );
}