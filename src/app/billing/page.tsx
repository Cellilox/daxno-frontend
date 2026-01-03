import { getUserPlan, getUserSubscription, getPaymentHistory } from "@/actions/payment-actions";
import { getTransactions } from "@/actions/transaction-actions";
import Billing from "@/components/Billing";
import BillingConfig from "@/components/BillingConfig";
import { getBillingConfig, getTrustedModels, getAllModels } from "@/actions/settings-actions";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Cellilox | Billing',
  description: 'Manage your billing information, view invoices, and update your payment methods securely with Daxno.'
};

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

  return (
    <>
      <BillingConfig initialConfig={billingConfig} trustedModels={trustedModels} allModels={allModels} />

      {firstTx && subscriptionProps ? (
        <Billing {...subscriptionProps} />
      ) : (
        <div className="max-w-2xl mx-auto py-12 px-4 flex flex-col justify-center items-center">
          <h1 className="text-2xl font-bold mb-6">Subscription History</h1>
          <p className="text-gray-500 mb-4">You don't have any ongoing subscription.</p>
          <a href="/pricing" className="text-indigo-600 hover:text-indigo-800 font-medium">
            View Pricing Plans &rarr;
          </a>
        </div>
      )}
    </>
  );
}
