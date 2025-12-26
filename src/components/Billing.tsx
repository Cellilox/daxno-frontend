'use client';

import { activateSubscription, cancelSubscription, downloadInvoice, getPaymentHistory } from "@/actions/payment-actions";
import { deleteTransaction } from "@/actions/transaction-actions";
import { useState } from "react";
import LoadingSpinner from "./ui/LoadingSpinner";
import { useRouter } from "next/navigation";
import { create_sub_feedback } from "@/actions/cancel-feedback-actions";
import { usePathname } from "next/navigation";

type BillingProps = {
  sub_id: number;
  t_id: number;
  subPlan: string;
  subAmount: number;
  subInterval: string;
  isActive: boolean;
  subCurrency: string;
  nextBillingDate: string;
  history: {
    transactions: any[];
    total: number;
    page: number;
    per_page: number;
    pages: number;
  } | null;
}

export default function Billing({ sub_id, t_id, subPlan, subAmount, subInterval, isActive, subCurrency, nextBillingDate, history }: BillingProps) {
  const [historyData, setHistoryData] = useState(history);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const router = useRouter()
  const pathname = usePathname()

  const isoString = nextBillingDate;
  const date = new Date(isoString);
  const readableDate = date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

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
      if (res.data.status === 'cancelled') {
        router.push(pathname)
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    } finally {
      setSubmitting(false);
    }
  }

  const handleActivateSubscription = async (sub_id: number) => {
    setIsActivating(true);
    try {
      const res = await activateSubscription(sub_id)
      if (res.data.status === 'active') {
        router.push(pathname)
      }
    } catch (error) {
      console.error('Error activating subscription:', error);
    } finally {
      setIsActivating(true);

    }
  };


  const handleDownloadInvoice = async (t_id: number) => {
    setDownloadingId(t_id);
    try {
      const blob = await downloadInvoice(t_id);
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice_${t_id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Download failed', error);
    } finally {
      setDownloadingId(null);
    }
  };

  const loadPage = async (page: number) => {
    const newData = await getPaymentHistory(page);
    if (newData) setHistoryData(newData);
  };


  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Billing & Subscription</h1>
        {isActive ?
          (
            <div className="border border-green-600 px-4 py-2 rounded-lg">
              <h1 className="text-green-600 bold">Active</h1>
            </div>
          ) : (
            <button
              onClick={() => handleActivateSubscription(sub_id)}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2">
              {isActivating ? 'Reactivating...' : 'Reactivate'}
            </button>
          )}
      </div>
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
        <div className="flex justify-between">
          <span className="font-medium">Next Billing Date:</span>
          <span className="capitalize">{readableDate}</span>
        </div>
        {isActive ? (
          <button
            onClick={openModal}
            className="w-full flex justify-center items-center mt-4 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg"
          >
            {submitting && <LoadingSpinner className="mr3" />}
            {submitting ? 'Cancelling...' : 'Cancel Subscription'}
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

      {/* Payment History Section */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4">Payment History</h2>
        <div className="bg-white shadow-md rounded-lg overflow-hidden overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {historyData?.transactions?.map((tx) => {
                const isExpired = new Date(tx.end_date) < new Date();
                let status = tx.status || (isExpired ? 'completed' : 'active');
                if (status === 'active' && isExpired) status = 'completed';

                return (
                  <tr key={tx.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => handleDownloadInvoice(tx.t_id)}
                        disabled={downloadingId === tx.t_id}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1 disabled:opacity-50"
                      >
                        {downloadingId === tx.t_id ? 'Loading...' : `INV-${tx.t_id}`}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.plan_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tx.currency} {parseFloat(tx.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(tx.start_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(tx.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                     ${status === 'active' ? 'bg-green-100 text-green-800' :
                          status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {!historyData?.transactions?.length && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No transactions found</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {historyData && historyData.pages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:justify-end gap-2">
                <button
                  onClick={() => loadPage(historyData.page - 1)}
                  disabled={historyData.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="self-center text-sm text-gray-700">
                  Page {historyData.page} of {historyData.pages}
                </span>
                <button
                  onClick={() => loadPage(historyData.page + 1)}
                  disabled={historyData.page === historyData.pages}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div >
  );
}
