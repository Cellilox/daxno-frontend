'use client';

import { cancelSubscription } from "@/actions/payment-actions";
import { deleteTransaction } from "@/actions/transaction-actions";
import { useState } from "react";
import LoadingSpinner from "./ui/LoadingSpinner";
import { useRouter } from "next/navigation";
import { create_sub_feedback } from "@/actions/cancel-feedback-actions";

type BillingProps = {
    sub_id: number;
    t_id: number;
    subPlan: string;
    subAmount: number;
    subInterval: string;
    isActive: boolean;
    subCurrency: string;
    
}

export default function Billing({ sub_id, t_id, subPlan, subAmount, subInterval, isActive, subCurrency }: BillingProps) {
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter()

  const options = [
    'Found a better alternative',
    'Plan is too expensive',
    'Not using the service enough',
    'Prefer not to say',
    'Other',
  ];

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    if (!submitting) {
      setShowModal(false);
      setReason('');
      setCustomReason('');
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      reason: reason === 'Other' ? customReason : reason,
    };
    const result = await create_sub_feedback(payload)
    console.log('RESXL', result)
    setShowModal(false)
    await handleCancelSubscription(sub_id, t_id);
  };

  const handleCancelSubscription = async (sub_id: number, t_id: number) => {
    setSubmitting(true)
    try {
      const res = await cancelSubscription(sub_id)
      if(res.data.status === 'cancelled') {
        await deleteTransaction(t_id)
        router.push('/')
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">Billing & Subscription</h1>
      <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
        <div className="flex justify-between">
          <span className="font-medium">Current Plan:</span>
          <span className="font-semibold">{subPlan}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Amount:</span>
          <span className="font-semibold">{subCurrency}{subAmount}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Billing Interval:</span>
          <span className="capitalize">{subInterval}</span>
        </div>
        {isActive ? (
          <button
            onClick={openModal}
            className="w-full flex justify-center items-center mt-4 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg"
          >
            {submitting && <LoadingSpinner className="mr3"/>}
            {submitting ? 'Cancelling...': 'Cancel Subscription'}
          </button>
        ) : (
          <button
            disabled
            className="w-full mt-4 bg-gray-400 text-white font-medium py-2 rounded-lg cursor-not-allowed"
          >
            Subscription Cancelled
          </button>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-lg w-11/12 max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Why are you cancelling?</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {options.map((opt) => (
                <label key={opt} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="reason"
                    value={opt}
                    disabled={submitting}
                    checked={reason === opt}
                    onChange={() => setReason(opt)}
                    className="form-radio text-red-600"
                  />
                  <span>{opt}</span>
                </label>
              ))}

              {reason === 'Other' && (
                <textarea
                  placeholder="Please specify"
                  disabled={submitting}
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              )}

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!reason || (reason === 'Other' && !customReason) || submitting}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
