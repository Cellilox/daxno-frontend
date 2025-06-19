export default async function BillingPage() {
  const planName = "Professional" 
  const interval = "Annual"
  const isActive  = true

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">Billing & Subscription</h1>
      <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
        <div className="flex justify-between">
          <span className="font-medium">Current Plan:</span>
          <span className="font-semibold">{planName}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Billing Interval:</span>
          <span className="capitalize">{interval}</span>
        </div>
        {isActive ? (
          <form action="/api/subscription/cancel" method="POST">
            <button
              type="submit"
              className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg"
            >
              Cancel Subscription
            </button>
          </form>
        ) : (
          <button
            disabled
            className="w-full mt-4 bg-gray-400 text-white font-medium py-2 rounded-lg cursor-not-allowed"
          >
            Subscription Cancelled
          </button>
        )}
      </div>
    </div>
  );
}
