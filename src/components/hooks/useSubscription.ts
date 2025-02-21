
import { getSubscriptions, getUserPlan } from '@/actions/payment-actions';
import { useState, useEffect } from 'react';

interface Transaction {
  payment_type: 'mobilemoneyrw' | 'card';
  end_date?: string;
  amount?: number;
  t_id?: number;
}

interface SubscriptionData {
  status: string;
  plan: string;
  paymentType: string;
  loading: boolean;
  error: string | null;
}

export function useSubscription(currentTransaction: Transaction): SubscriptionData {
  const [data, setData] = useState<SubscriptionData>({
    status: '',
    plan: '',
    paymentType: '',
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchSubscription() {
      try {
        let status = '';
        let plan = '';
        let paymentType = '';

        if (currentTransaction.payment_type === 'mobilemoneyrw') {
          paymentType = 'MoMo Rwanda';
          const now = Date.now();
          const endDate = new Date(currentTransaction.end_date || '').getTime();
          status = endDate > now ? 'Active' : 'Expired';
          plan = currentTransaction.amount && currentTransaction.amount <= 29000 ? 'Starter'
                : currentTransaction.amount && currentTransaction.amount >= 49000 ? 'Professional'
                : 'Standard';
        } else if (currentTransaction.payment_type === 'card') {
          paymentType = 'Card';
          // Fetch all subscription
          const subsRes = await getSubscriptions(currentTransaction.t_id)
          const subscription = subsRes?.data?.[0];
          status = subscription?.status;

          // Fetch plan details
          const planRes = await getUserPlan(subscription?.plan)
          plan = planRes?.data?.name;
        }

        setData({ status, plan, paymentType, loading: false, error: null });
      } catch (error: any) {
        setData({ status: '', plan: '', paymentType: '', loading: false, error: error.message });
      }
    }

    fetchSubscription();
  }, [currentTransaction]);

  return data;
}

