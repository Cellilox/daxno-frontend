// File: /app/refund-policy/page.tsx
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Cellilox | Refund Policy',
  description: 'Review refund policy to understand your options and rights regarding payments and refunds.'
};

export const dynamic = "force-dynamic";

export default function RefundPolicyPage() {
  return (
    <article className="prose lg:prose-lg max-w-3xl mx-auto px-6 py-12">
      <h1>Refund Policy</h1>
      <p>
        <strong>Effective Date:</strong> April 24, 2026
      </p>

      <hr />

      <h2>1. Introduction</h2>
      <p>
        This Refund Policy governs all payments made to Cellilox Limited (&quot;Cellilox,&quot;
        &quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) for access to the Cellilox platform and
        related services (collectively, the &quot;Services&quot;). By making a payment, you agree
        to this Policy, our Terms of Service, and our Privacy Policy. The rules below
        differ based on the type of purchase you make — please read the section that
        applies to you.
      </p>
      <p>
        Our Services are currently offered in three plan types: a free tier (&quot;Standard&quot;),
        a monthly or yearly subscription (&quot;BYOK&quot;), and a pay-as-you-go credit top-up
        (&quot;Managed&quot;). Each is treated differently for refund purposes because the
        underlying economics are different.
      </p>

      <h2>2. Definitions</h2>
      <ul>
        <li><strong>Customer / User:</strong> Any individual or entity holding a Cellilox account.</li>
        <li><strong>Standard Plan:</strong> The free tier. No payment is taken and therefore no refund is applicable.</li>
        <li><strong>BYOK Plan:</strong> A recurring (monthly or yearly) subscription that unlocks the ability to use your own third-party AI provider API key (e.g. OpenRouter, OpenAI, Anthropic, DeepSeek, Google) inside Cellilox. Cellilox does not bill you for individual AI requests on BYOK — your AI provider does.</li>
        <li><strong>Managed Plan (Credit Top-Up):</strong> A one-time purchase of AI credits that are credited to your Cellilox balance and consumed on a pay-as-you-go basis.</li>
        <li><strong>Gross Amount:</strong> The total amount you paid for a Managed top-up, before the service fee is applied.</li>
        <li><strong>Service Fee:</strong> The portion of a Managed top-up that is retained by Cellilox at purchase to cover payment processing, key provisioning, and operational overhead. It is disclosed to you before checkout and ranges from 20% to 35% depending on the amount, as shown in the purchase modal.</li>
        <li><strong>Net Credits:</strong> The Gross Amount minus the Service Fee. This is the amount added to your spendable balance.</li>
        <li><strong>Consumed Credits:</strong> Net Credits that have already been deducted from your balance through AI requests, OCR processing, or chat activity on the platform.</li>
        <li><strong>Remaining Balance:</strong> Net Credits that have not yet been consumed. Remaining Balance never expires.</li>
        <li><strong>Processing Buffer:</strong> A small percentage (currently 10%) added to the real OpenRouter per-token price of each Managed AI request, disclosed in the in-app Recent Activity panel. It covers price drift, provider surcharges not visible in public pricing feeds, and token-count rounding. It is a cost-recovery buffer and is not a service fee.</li>
        <li><strong>Billing Cycle:</strong> For BYOK subscribers only — the month or year for which access is prepaid.</li>
        <li><strong>Payment Processor:</strong> Flutterwave and/or other processors we may use from time to time.</li>
      </ul>

      <h2>3. Refunds by Plan Type</h2>

      <h3>3.1 Standard (Free) Plan</h3>
      <p>
        The Standard plan is free of charge. No payment is collected and therefore no refund
        can be requested under this Policy.
      </p>

      <h3>3.2 BYOK Subscription</h3>
      <p>
        A 14-day money-back guarantee is available on BYOK subscriptions, subject to the
        following conditions (all must be met):
      </p>
      <ul>
        <li>The refund request is submitted within fourteen (14) calendar days of the initial subscription purchase.</li>
        <li>This is your first BYOK subscription on the account (renewals and re-subscriptions are excluded).</li>
        <li>You have not processed more than 50 document pages on the Service during the current billing cycle.</li>
      </ul>
      <p>
        If approved, we will refund the BYOK subscription fee paid to Cellilox. We cannot
        refund charges billed to you directly by your third-party AI provider (OpenRouter,
        OpenAI, Anthropic, DeepSeek, Google, etc.) — those are governed by the respective
        provider&#39;s own policy and we have no ability to reverse them.
      </p>
      <p>
        Renewals (monthly or yearly) are <strong>not</strong> covered by the 14-day guarantee. To avoid
        charges for a new cycle, cancel your subscription in Settings &rarr; Billing before the
        renewal date; access continues through the end of the paid period.
      </p>

      <h3>3.3 Managed Plan (Credit Top-Ups)</h3>
      <p>
        Managed credits are a digital consumable. As soon as a top-up is processed, Cellilox
        incurs real and largely non-recoverable costs — payment-processor fees, provisioning
        of a dedicated AI provider subkey on your behalf, and per-request infrastructure cost.
        For this reason, top-ups are treated differently from subscriptions.
      </p>
      <p>
        A refund of the <strong>Remaining Balance</strong> of a Managed top-up may be granted, at
        Cellilox&#39;s sole discretion, if <em>all</em> of the following are true:
      </p>
      <ul>
        <li>The refund is requested within fourteen (14) calendar days of the top-up payment;</li>
        <li>At least ninety percent (90%) of the Net Credits from that top-up remain unconsumed;</li>
        <li>You have not previously received a discretionary refund on this account within the past six (6) months.</li>
      </ul>
      <p>If approved, the refund amount will be calculated as follows:</p>
      <ul>
        <li><strong>Refundable:</strong> the Remaining Balance from the top-up in question.</li>
        <li><strong>Not refundable:</strong> Consumed Credits, any Processing Buffer already charged, the Service Fee charged at purchase, and payment-processor fees that are not returned to us by the processor.</li>
      </ul>
      <p>
        After fourteen (14) days, or after more than ten percent (10%) of the Net Credits
        from a given top-up have been consumed, that top-up is final and non-refundable.
        Because Remaining Balance does not expire, unused credits remain available for you
        to spend on the platform indefinitely — we strongly recommend using them rather
        than requesting a refund.
      </p>
      <p>
        The Service Fee disclosed at the moment of top-up is <strong>non-refundable in all
        circumstances</strong>, including where a Remaining Balance refund is granted. This is
        because the Service Fee is consumed at the instant of purchase to pay the processor
        and provision your AI key.
      </p>

      <h2>4. Cancellation</h2>
      <p>
        <strong>Standard:</strong> no action required — simply stop using the Service.
      </p>
      <p>
        <strong>BYOK:</strong> you may cancel at any time from Settings &rarr; Billing, or by
        contacting{' '}
        <a href="mailto:hello@support.cellilox.com" className="text-blue-600 hover:underline">
          hello@support.cellilox.com
        </a>. Cancellation stops the next renewal; access continues through the end of the
        already-paid billing cycle. Cellilox does not issue prorated refunds for mid-cycle
        BYOK cancellations outside the 14-day window described in §3.2.
      </p>
      <p>
        <strong>Managed:</strong> there is nothing to cancel. You may stop using your credits at any time;
        your Remaining Balance persists on the account and does not expire.
      </p>

      <h2>5. Non-Refundable Situations</h2>
      <p>Refunds will <strong>not</strong> be provided for:</p>
      <ul>
        <li>Consumed Credits on a Managed plan, regardless of which activity consumed them (file analysis, backfill, chat, or OCR).</li>
        <li>The Processing Buffer applied to any Managed AI request.</li>
        <li>The Managed Service Fee disclosed at the time of top-up.</li>
        <li>Any BYOK subscription period where the conditions in §3.2 are not met.</li>
        <li>BYOK renewals after the initial 14-day window.</li>
        <li>Charges billed to you directly by your own third-party AI provider on the BYOK plan — Cellilox has no ability to reverse those.</li>
        <li>Temporary service interruptions, isolated errors, or minor performance issues, so long as Cellilox is taking commercially reasonable steps to resolve them. See §7 for extended-outage credits.</li>
        <li>Dissatisfaction with AI-generated output where the Service was otherwise operating as intended. AI model output is inherently probabilistic and is not warranted to be accurate, complete, or fit for any particular purpose.</li>
        <li>Account closures initiated by Cellilox due to a breach of our Terms of Service, abuse, or fraudulent activity.</li>
      </ul>

      <h2>6. How to Request a Refund</h2>
      <h3>6.1 Submit a Request</h3>
      <p>
        Email us at{' '}
        <a href="mailto:hello@support.cellilox.com" className="text-blue-600 hover:underline">
          hello@support.cellilox.com
        </a>{' '}
        with the subject line &quot;Refund Request.&quot; Include:
      </p>
      <ul>
        <li>Your full name and the email address registered on your Cellilox account.</li>
        <li>The plan type (BYOK or Managed) and, for Managed, the date and amount of the top-up.</li>
        <li>Your Flutterwave (or other processor) transaction reference, if available.</li>
        <li>A brief explanation of the reason for the request.</li>
      </ul>

      <h3>6.2 Processing Time</h3>
      <p>
        We will review all refund requests within seven (7) business days of receipt. If
        approved, refunds will be issued to the original payment method within ten (10)
        business days of approval. Depending on your card issuer or bank, the funds may
        take additional time to appear on your statement.
      </p>

      <h3>6.3 Communication</h3>
      <p>
        We will notify you at the email address on file regarding approval or denial. If
        additional information is needed to evaluate the request, we may contact you for
        clarification; failure to respond within fourteen (14) days of our follow-up may
        result in the request being closed as abandoned.
      </p>

      <h2>7. Special Circumstances</h2>
      <p>
        <strong>Extended Service Outage:</strong> If the core Services are unavailable for more than
        seventy-two (72) consecutive hours for reasons attributable to Cellilox (excluding
        scheduled maintenance, third-party provider outages, and force-majeure events), you
        may request a service credit — <em>not</em> a cash refund — equal to one (1) full day&#39;s
        BYOK subscription fee, or a platform-credit equivalent for Managed users, for each
        24-hour period of continuous downtime.
      </p>
      <p>
        <strong>Billing Error on Our Side:</strong> If a bug or defect in Cellilox causes an incorrect
        deduction from a Managed balance (for example, a duplicated charge or a miscomputed
        buffer), we will restore the correct Remaining Balance as a credit on the account.
        Cash refunds for such events are available only at Cellilox&#39;s discretion and only
        where the user demonstrates actual monetary loss.
      </p>
      <p>
        <strong>Fraud or Unauthorized Charges:</strong> If you believe a charge to your account was
        unauthorized, contact us within seven (7) days of the charge. We will investigate
        in good faith and, where fraud is confirmed, issue a full refund and secure the
        account.
      </p>
      <p>
        <strong>Chargeback Policy:</strong> Filing a chargeback with your bank or card issuer without
        first contacting us may result in immediate suspension or termination of your account,
        forfeiture of any Remaining Balance, and liability for the chargeback amount plus
        any fees assessed by the processor. Please contact support first — in almost every
        case we can resolve legitimate concerns directly and faster than a chargeback.
      </p>

      <h2>8. Changes to This Policy and to Our Payment Terms</h2>
      <p>
        Cellilox reserves the right to revise, amend, or replace, at any time and at our
        sole discretion: (a) this Refund Policy; (b) the pricing of any plan, including
        the BYOK subscription fee and the minimum top-up amount; (c) the Service Fee tiers
        applied to Managed top-ups; (d) the Processing Buffer percentage applied to Managed
        AI requests; (e) the OCR per-page fee; (f) any other term relating to how we
        compute, charge, or refund payments. We may make such changes to reflect updates
        in our Services, our cost structure, changes in upstream provider pricing, new
        product offerings, applicable law, or any other legitimate business reason.
      </p>
      <p>
        <strong>Non-material changes</strong> — for example, clarifying language, typographical
        corrections, or adjustments that do not affect the economic terms of an existing
        balance or subscription — take effect as soon as the revised Policy is posted on
        this page, and the &quot;Effective Date&quot; at the top of this Policy will be updated
        accordingly.
      </p>
      <p>
        <strong>Material changes</strong> — for example, a change to the Service Fee tiers, the
        Processing Buffer percentage, the BYOK subscription price, or the 14-day refund
        window — will not take effect for at least thirty (30) days after we notify you.
        Notice will be given by email to the address on your account and/or by a prominent
        notice inside the application. The notice will describe what is changing and when
        the change takes effect.
      </p>
      <p>
        <strong>Effect on existing balances and subscriptions.</strong> Any change to the Service Fee,
        Processing Buffer, or pricing applies only to transactions that occur on or after
        the Effective Date of the change. Managed top-ups purchased before the change keep
        the Service Fee rate disclosed at the time of their purchase; your Remaining Balance
        will continue to be consumed under the Processing Buffer rate in effect at the time
        of each AI request, which we display in the Recent Activity panel. BYOK subscribers
        on an existing billing cycle will not see a price change take effect until their
        next renewal.
      </p>
      <p>
        <strong>Your options if you do not agree.</strong> If you do not agree to a material change,
        you may, prior to its Effective Date: (i) cancel your BYOK subscription to prevent
        the next renewal under the new terms; or (ii) for Managed users, request a refund
        of your Remaining Balance under §3.3, with the 90%-unconsumed and 14-day limits
        waived solely for refund requests tied to a notified material change and submitted
        before its Effective Date. Continuing to use the Services after the Effective Date
        of a change constitutes acceptance of the revised Policy and payment terms.
      </p>

      <h2>9. Contact Information</h2>
      <p>For any question, concern, or request relating to this Policy, please contact:</p>
      <pre className="bg-gray-100 p-4 rounded text-black text-sm overflow-x-auto">
        Cellilox Support
        Email: hello@support.cellilox.com
      </pre>

      <h2>Acknowledgment</h2>
      <p>
        By making any payment to Cellilox, you acknowledge that you have read, understood,
        and agreed to be bound by this Refund Policy. If you do not agree with any part of
        this Policy, do not complete the payment.
      </p>
    </article>
  );
}
