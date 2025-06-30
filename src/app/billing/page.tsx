import { getUserPlan, getUserSubscription } from "@/actions/payment-actions";
import { getTransactions } from "@/actions/transaction-actions";
import Billing from "@/components/Billing";



export default async function BillingPage() {
  const transactions = await getTransactions();

  if (!transactions?.length) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 bg-red-300 flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold mb-6">Billing & Subscription</h1>
        <p>You don't have any ongoing subscription.</p>
      </div>
    );
  }

  const firstTx = transactions[0];
  const subscription = await getUserSubscription(firstTx.t_id);
  const userPlan    = await getUserPlan(firstTx.plan_id);

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
    />
  );
}
