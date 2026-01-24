import { getUserPlan, getUserSubscription, getPaymentHistory } from "@/actions/payment-actions";
import { getTransactions } from "@/actions/transaction-actions";
import BillingTabs from "@/components/BillingTabs";
import { getBillingConfig, getTrustedModels, getAllModels } from "@/actions/settings-actions";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Cellilox | Billing',
  description: 'Manage your billing information, view invoices, and update your payment methods securely with Daxno.'
};

export const dynamic = 'force-dynamic';

export default async function BillingPage() {
  const activeTransactions = await getTransactions();
  const paymentHistory = await getPaymentHistory(1, 10);

  /* Fetch Billing Configuration, Trusted Models (Standard), & All Models (BYOK) */
  const [billingConfig, trustedModels, allModels] = await Promise.all([
    getBillingConfig(),
    getTrustedModels(),
    getAllModels()
  ]);

  const firstTx = activeTransactions?.[0] || paymentHistory?.transactions?.[0];

  let subscriptionProps = null;

  if (firstTx) {
    const [subscription, userPlan] = await Promise.all([
      firstTx.t_id ? getUserSubscription(firstTx.t_id) : Promise.resolve(null),
      firstTx.plan_id ? getUserPlan(firstTx.plan_id) : Promise.resolve(null)
    ]);

    subscriptionProps = {
      sub_id: subscription?.data[0]?.id,
      t_id: firstTx.t_id,
      subPlan: userPlan?.data?.name,
      subAmount: subscription?.data[0]?.amount,
      subInterval: userPlan?.data?.interval,
      isActive: subscription?.data[0]?.status === 'active',
      subCurrency: userPlan?.data?.currency,
      nextBillingDate: firstTx.end_date,
      history: paymentHistory
    };
  }

  const billingConfigProps = {
    initialConfig: billingConfig,
    trustedModels: trustedModels,
    allModels: allModels,
    currentPlan: subscriptionProps?.subPlan || (firstTx?.plan_name as string), // Fallback to transaction plan name if available
    currentInterval: subscriptionProps?.subInterval,
    currentAmount: subscriptionProps?.subAmount ? Number(subscriptionProps.subAmount) : (firstTx?.amount ? Number(firstTx.amount) : 0),
    currentEndDate: subscriptionProps?.nextBillingDate || firstTx?.end_date,
  };

  return (
    <BillingTabs
      billingConfigProps={billingConfigProps}
      billingProps={subscriptionProps}
    />
  );
}

