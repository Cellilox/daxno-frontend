import { getUserPlan, getUserSubscription, getPaymentHistory } from "@/actions/payment-actions";
import { getTransactions } from "@/actions/transaction-actions";
import Billing from "@/components/Billing";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Cellilox | Billing',
  description: 'Manage your billing information, view invoices, and update your payment methods securely with Daxno.'
};

export default async function BillingPage() {
  const activeTransactions = await getTransactions();
  const paymentHistory = await getPaymentHistory(1, 10);

  if (!activeTransactions?.length && !paymentHistory?.transactions?.length) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 bg-red-300 flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold mb-6">Billing & Subscription</h1>
        <p>You don't have any ongoing subscription.</p>
      </div>
    );
  }

  const firstTx = activeTransactions?.[0] || paymentHistory?.transactions?.[0];

  if (!firstTx) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold mb-6">Billing & Subscription</h1>
        <p>No billing history found.</p>
      </div>
    );
  }

  const [subscription, userPlan] = await Promise.all([
    firstTx.t_id ? getUserSubscription(firstTx.t_id) : Promise.resolve(null),
    firstTx.plan_id ? getUserPlan(firstTx.plan_id) : Promise.resolve(null)
  ]);

  return (
    <Billing
      sub_id={subscription?.data[0]?.id}
      t_id={firstTx.t_id}
      subPlan={userPlan?.data?.name}
      subAmount={subscription?.data[0]?.amount}
      subInterval={userPlan?.data?.interval}
      isActive={subscription?.data[0]?.status === 'active'}
      subCurrency={userPlan?.data?.currency}
      nextBillingDate={firstTx.end_date}
      history={paymentHistory}
    />
  );
}
