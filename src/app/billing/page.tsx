import { getUserPlan, getUserSubscription } from "@/actions/payment-actions";
import { getTransactions } from "@/actions/transaction-actions";
import Billing from "@/components/Billing";



export default async function BillingPage() {

  const transactions = await getTransactions()
  console.log('TXX', transactions[0])
  const subscription = await getUserSubscription(transactions[0]?.t_id)
  console.log('SUB', subscription)
  const userPlan = await getUserPlan(transactions[0]?.plan_id)
  console.log('PLAN', userPlan)

  return (
    <Billing 
    sub_id = {subscription?.data[0]?.id}
    t_id = {transactions[0]?.t_id}
    subPlan= {userPlan?.data?.name}
    subAmount={subscription?.data[0]?.amount}
    subInterval={userPlan?.data?.interval}
    isActive={subscription?.data[0]?.status == 'active'}
    subCurrency={userPlan?.data?.currency}
    />
  )
}
