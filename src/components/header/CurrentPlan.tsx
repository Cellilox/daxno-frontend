import React from 'react';
import PricingModal from '../pricing/PricingModal';
import { Transaction } from '../pricing/types';
import Link from 'next/link';

interface Transactions {
  transactions: Transaction[];
}

export default function CurrentPlan({ transactions }: Transactions) {
  return (
    <div className='md:flex md:mr-3 items-center text-right'>
      {transactions[0]?.plan_name === 'Professional' || transactions[0]?.plan_name === 'Starter' && <Link href='/billing' className='hidden md:block underline md:mr-7 hover: text-blue-500'>Billing</Link>}
      <p className='md:mr-7'>
        Plan: <span className='text-green-500'>{transactions[0]?.plan_name || 'Free'}</span>
      </p>
      <div className="flex-col justify-end">
      {transactions[0]?.plan_name === 'Professional' || transactions[0]?.plan_name === 'Starter' && <Link href='/billing' className='block md:hidden underline hover:text-blue-500'>Billing</Link>}
      <div className="flex justify-end">
        <PricingModal transactions = {transactions}/>
      </div>
      </div>
    </div>
  );
}