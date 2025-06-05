// File: /app/refund-policy/page.tsx
import React from 'react';

export default function RefundPolicyPage() {
  return (
    <article className="prose lg:prose-lg max-w-3xl mx-auto px-6 py-12">
      <h1>Refund Policy</h1>
      <p>
        <strong>Effective Date:</strong> Jun 05, 2025
      </p>

      <hr />

      <h2>1. Introduction</h2>
      <p>
        This Refund Policy applies to all purchases of subscription plans, licenses, or other services (collectively, “Services”)
        offered by Cellilox Limited (“Company,” “we,” “us,” or “our”). By subscribing to or purchasing our Services,
        you agree to be bound by the terms of this Refund Policy in addition to our Terms of Service and Privacy Policy.
      </p>

      <h2>2. Definitions</h2>
      <ul>
        <li><strong>Customer/User:</strong> Any individual or entity that purchases or subscribes to the Services.</li>
        <li><strong>Subscription:</strong> Recurring access to Services (e.g., monthly or annual billing).</li>
        <li><strong>Billing Cycle:</strong> The predefined interval (month, quarter, or year) for which the Customer pays to use the Services.</li>
        <li><strong>Prorated Refund:</strong> A partial refund reflecting unused days of a subscription period.</li>
        <li><strong>Trial Period:</strong> A limited-time, complimentary access period to the Services (if applicable).</li>
      </ul>

      <h2>3. Scope of Refunds</h2>
      <h3>3.1 Initial 14-Day Money-Back Guarantee</h3>
      <ul>
        <li>
          We offer a full refund if a refund request is made within fourteen (14) days of the initial subscription purchase or renewal.
        </li>
        <li>
          To be eligible, Customers must:
          <ul>
            <li>Be subscribing for the first time to the selected plan.</li>
            <li>Have not exceeded [e.g., 100] API calls (or other usage metric, if applicable) during the billing period.</li>
          </ul>
        </li>
        <li>After 14 days from the date of purchase or renewal, all sales are final and non-refundable, except as expressly provided herein.</li>
      </ul>

      <h3>3.2 Trial Period (If Applicable)</h3>
      <ul>
        <li>
          If we offer a free trial, no payment is processed until the trial expires. Customers who manually cancel before the trial end date will not be billed.
        </li>
        <li>No refunds are given for unused portions of a trial period, as no charge has yet occurred.</li>
      </ul>

      <h2>4. Subscription Cancellation and Prorated Refunds</h2>
      <h3>4.1 Cancellation by Customer</h3>
      <p>
        Customers may cancel their subscription at any time through their account dashboard or by contacting{' '}
        <a href="mailto:support@cellilox.com" className="text-blue-600 hover:underline">
          support@cellilox.com
        </a>.
        Cancellation takes effect at the end of the current billing cycle. After cancellation, access to Services continues until the end of the paid period, but no further charges will be incurred for subsequent billing cycles.
      </p>

      <h3>4.2 Prorated Refunds</h3>
      <ul>
        <li>We do not typically offer prorated refunds for mid-period cancellations, except under exceptional circumstances (e.g., extended service outages attributable to us).</li>
        <li>
          In the event a prorated refund is approved, the calculation will be based on the number of full unused days in the then-current billing cycle, divided by the total number of days in that cycle.
        </li>
        <li>
          To request a prorated refund, Customers must contact{' '}
          <a href="mailto:support@cellilox.com" className="text-blue-600 hover:underline">
            support@cellilox.com
          </a>{' '}
          and provide:
          <ul>
            <li>Customer name and account email.</li>
            <li>Subscription plan details.</li>
            <li>Reason for requesting a prorated refund.</li>
          </ul>
        </li>
        <li>We reserve the right to accept or deny prorated refund requests at our sole discretion.</li>
      </ul>

      <h2>5. Non-Refundable Situations</h2>
      <p>Refunds will <strong>not</strong> be provided for:</p>
      <ul>
        <li>Any subscription period that has already passed beyond the initial 14-day window.</li>
        <li>Downgrading from a higher-priced plan to a lower-priced plan (unused credits or overages remain non-refundable).</li>
        <li>Failure to use the Service or changing one’s mind after the 14-day period.</li>
        <li>Temporary service interruptions, errors, or minor performance issues, so long as we are making commercially reasonable efforts to resolve them.</li>
        <li>Add-ons, usage-based overages, or one-time fees (unless otherwise stated).</li>
      </ul>

      <h2>6. How to Request a Refund</h2>
      <h3>6.1 Submit a Request</h3>
      <p>
        Email us at{' '}
        <a href="mailto:support@cellilox.com" className="text-blue-600 hover:underline">
          support@cellilox.com
        </a>{' '}
        with the subject line “Refund Request.” Include the following information:
      </p>
      <ul>
        <li>Full name of the Customer.</li>
        <li>Registered email address or username.</li>
        <li>Invoice number or date of purchase/renewal.</li>
        <li>Reason for the refund request.</li>
      </ul>

      <h3>6.2 Processing Time</h3>
      <p>
        We will review all refund requests within seven (7) business days of receipt. If approved, refunds will be issued to the original payment method within ten (10) business days.
      </p>

      <h3>6.3 Communication</h3>
      <p>
        We will notify you at the email address on file regarding the approval or denial of your refund request. If more information is required, we may contact you for clarification.
      </p>

      <h2>7. Refund Exceptions and Special Circumstances</h2>
      <p>
        <strong>Service-Outage Credit:</strong> If our Services are unavailable for more than 72 consecutive hours due to causes within our control (excluding scheduled maintenance or force majeure events), you may be eligible for a service credit (not a cash refund) equal to one full day’s subscription fee for each 24-hour period of continuous downtime.
      </p>
      <p>
        <strong>Chargeback Policy:</strong> If you initiate a chargeback with your bank or credit card company without first seeking a refund per this policy, your account may be suspended or terminated, and you may be responsible for all fees, collection costs, and late charges.
      </p>

      <h2>8. Modification of This Policy</h2>
      <p>
        We reserve the right to change or update this Refund Policy at any time. Any updates will become effective immediately upon posting the revised policy on our website. Your continued use of our Services after such changes constitutes your acceptance of the updated policy.
      </p>
      <ul>
        <li>
          <strong>Notification of Changes:</strong> If material changes are made, we will notify you via email at least thirty (30) days prior to the changes taking effect or by posting a notice on our website.
        </li>
      </ul>

      <h2>9. Contact Information</h2>
      <p>If you have any questions, concerns, or requests regarding this Refund Policy, please contact us:</p>
      <pre className="bg-gray-100 p-4 rounded text-black text-sm overflow-x-auto">
Support
Email: support@cellilox.com
      </pre>

      <h2>Acknowledgment</h2>
      <p>
        By subscribing to or purchasing our Services, you acknowledge that you have read, understood, and agree to be bound by this Refund Policy.
      </p>
    </article>
  );
}
