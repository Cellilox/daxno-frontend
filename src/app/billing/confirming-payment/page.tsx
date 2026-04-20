import { Metadata } from "next";
import ConfirmingPayment from "./ConfirmingPayment";

export const metadata: Metadata = {
  title: 'Cellilox | Finalizing Payment',
  description: 'Confirming your payment and preparing your account.'
};

export const dynamic = 'force-dynamic';

export default function ConfirmingPaymentPage() {
  return <ConfirmingPayment />;
}
