
import { getUserPlan } from '@/actions/payment-actions';
import { useState, useEffect } from 'react';

interface Transaction {
  end_date?: string;
  amount?: number;
  t_id?: number;
  payment_plan: number
}

interface SubscriptionData {
  plan: string;
  loading: boolean;
  error: string | null;
}

export function useSubscription(currentTransaction: Transaction): SubscriptionData {
  const [data, setData] = useState<SubscriptionData>({
    plan: '',
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchSubscription() {
      try {
        let plan = ''

        // Fetch plan details
        const planRes = await getUserPlan(currentTransaction?.payment_plan)
        plan = planRes?.data?.name;

        setData({ 
          plan, 
          loading: false, 
          error: null 
        });
      } catch (error: any) {
        setData({ plan: '', loading: false, error: error.message });
      }
    }

    fetchSubscription();
  }, [currentTransaction]);

  return data;
}

