import React from 'react';
import { Transaction } from '../pricing/types';
import Link from 'next/link';
import { Crown } from 'lucide-react';

interface CurrentPlanProps {
  transactions: Transaction[];
  billingConfig: any;
}

export default function CurrentPlan({ transactions, billingConfig }: CurrentPlanProps) {
  const planName = transactions[0]?.plan_name || 'Free';
  const subType = billingConfig?.subscription_type;

  const displayPlan = subType === 'byok'
    ? 'BYOK'
    : subType === 'managed'
      ? 'GYOK'
      : planName;

  return (
    <div className='md:flex md:mr-3 items-center text-right'>
      {(planName === 'Professional' || planName === 'Starter') && <Link href='/billing' className='hidden md:block underline md:mr-7 hover: text-blue-500'>Billing</Link>}
      <p className='md:mr-7'>
        Plan: <span className='text-green-500'>{displayPlan}</span>
      </p>
      <div className="flex-col justify-end">
        {(transactions[0]?.plan_name === 'Professional' || transactions[0]?.plan_name === 'Starter') && <Link href='/billing' className='block md:hidden underline hover:text-blue-500'>Billing</Link>}
        <div className="flex justify-end">
          <Link
            href="/billing?tab=configuration&option=byok"
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            <Crown className="w-4 h-4" />
            <span>Upgrade</span>
          </Link>
        </div>
      </div>
    </div>
  );
}