import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Cellilox | Terms of Service',
  description: 'The Terms of Service governing your use of Cellilox — including the Standard, BYOK, and Managed plans, AI processing, and your rights and responsibilities.'
};

export const dynamic = "force-dynamic";

export default function TermsOfServicePage() {
  return (
    <article className="prose lg:prose-lg max-w-3xl mx-auto px-6 py-12">
      <h1>Terms of Service</h1>
      <p>
        <strong>Effective Date:</strong> April 25, 2026
      </p>

      <hr />

      <h2>1. Introduction</h2>
      <p>
        Welcome to Cellilox. These Terms of Service (&quot;Terms&quot; or &quot;Agreement&quot;) form a
        binding contract between you and <strong>Cellilox Limited</strong>, a company
        registered in the Republic of Rwanda (&quot;Cellilox,&quot; &quot;Company,&quot; &quot;we,&quot;
        &quot;us,&quot; or &quot;our&quot;), and govern your access to and use of our website,
        web application, APIs, chat, and any related features (collectively, the
        &quot;Services&quot;).
      </p>
      <p>
        Cellilox offers the Services under three plan types: a free tier (&quot;Standard&quot;),
        a recurring subscription that allows you to use your own AI provider API key
        (&quot;BYOK&quot;), and a pay-as-you-go credit-based plan (&quot;Managed&quot;). Specific billing
        rules for each plan are set out in our{' '}
        <a href="/refund-policy" className="text-blue-600 hover:underline">Refund Policy</a>.
        How we handle your data is set out in our{' '}
        <a href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</a>.
      </p>
      <p>
        By accessing or using the Services, you agree to these Terms, the Privacy Policy,
        and the Refund Policy. If you do not agree, do not use the Services.
      </p>

      <h2>2. Definitions</h2>
      <ul>
        <li><strong>Account:</strong> Your registered profile on the Services, identified by a unique user ID and email.</li>
        <li><strong>Authorized User:</strong> An individual you invite to a project that you own; their access is governed by the project owner&#39;s plan and quotas.</li>
        <li><strong>Customer / User:</strong> Any individual or entity that registers for or uses the Services.</li>
        <li><strong>Customer Content:</strong> Files you upload, the field definitions you create, the AI-extracted answers tied to those files, and any chat messages you send through the Services.</li>
        <li><strong>Plan:</strong> Standard, BYOK, or Managed, as described in §6.</li>
        <li><strong>Subscription Fees:</strong> Recurring fees payable on the BYOK plan.</li>
        <li><strong>Top-Up:</strong> A one-time credit purchase under the Managed plan, governed by §6 and the Refund Policy.</li>
        <li><strong>Your AI Provider:</strong> For BYOK, the third-party AI provider (e.g. OpenRouter, OpenAI, Anthropic, DeepSeek, Google) whose API key you supply to the Services.</li>
        <li><strong>Services:</strong> The web application, APIs, chat, and any feature offered under the Cellilox brand.</li>
      </ul>

      <h2>3. Eligibility and Acceptance</h2>
      <p>By creating an Account or otherwise using the Services, you represent that:</p>
      <ol>
        <li>You are at least eighteen (18) years of age, or the age of legal majority in your jurisdiction;</li>
        <li>You have the legal capacity to enter into a binding contract;</li>
        <li>You have not been previously suspended or removed from the Services; and</li>
        <li>If you are using the Services on behalf of an organization, you have the authority to bind that organization to these Terms.</li>
      </ol>

      <h2>4. Modifications to These Terms</h2>
      <p>
        We may amend or replace these Terms at any time. Non-material changes (clarifying
        language, typographical corrections, or updates that do not affect economic terms
        or material rights) take effect when the revised Terms are posted on this page.
      </p>
      <p>
        For material changes (for example, changes to liability, dispute resolution, or
        the scope of the license you grant us in §7.2), we will provide at least thirty
        (30) days&#39; advance notice by email to the address on your Account and/or by a
        prominent in-app notice. If you do not agree to a material change, your remedy is
        to stop using the Services and, where applicable, request a refund under the
        Refund Policy before the Effective Date of the change. Continuing to use the
        Services after the Effective Date constitutes acceptance of the revised Terms.
      </p>

      <h2>5. Accounts and Security</h2>
      <h3>5.1 Account Creation</h3>
      <p>
        To use most features of the Services you must register an Account through our
        authentication provider, Clerk. You agree to provide accurate, current, and
        complete information and to keep it up to date. You are responsible for keeping
        your sign-in credentials confidential and for all activity carried out under your
        Account.
      </p>

      <h3>5.2 Authorized Users (Project Invitees)</h3>
      <p>
        Cellilox lets you invite other people to a project you own. Authorized Users have
        access only to the projects you invite them to and operate under your Plan&#39;s
        limits and balance — for example, an invitee&#39;s file uploads count against the
        owner&#39;s credit balance on Managed, or against the owner&#39;s monthly page quota on
        BYOK. You are responsible for the conduct of your Authorized Users and for
        ensuring they comply with these Terms.
      </p>

      <h3>5.3 Account Security</h3>
      <p>
        Notify us immediately at{' '}
        <a href="mailto:hello@support.cellilox.com" className="text-blue-600 hover:underline">
          hello@support.cellilox.com
        </a>{' '}
        if you suspect unauthorized access to your Account. We may suspend or terminate
        an Account if we reasonably believe it has been compromised, used for fraud, or
        used in breach of these Terms.
      </p>

      <h2>6. Plans, Fees, and Payment</h2>

      <h3>6.1 Plans</h3>
      <ul>
        <li><strong>Standard (Free):</strong> Free of charge, subject to usage quotas published in the application (for example, daily document and monthly page caps). No payment is required.</li>
        <li><strong>BYOK:</strong> A monthly or yearly subscription that unlocks the ability to use your own AI provider API key inside the Services. The subscription fee is paid to Cellilox; AI request costs are billed by your chosen AI Provider directly to you, not by Cellilox.</li>
        <li><strong>Managed:</strong> A pay-as-you-go plan in which you purchase credits via top-up. A Service Fee (disclosed at checkout, currently 20–35% depending on the amount) is retained by Cellilox at purchase; the remaining net credits are added to your spendable balance and consumed on a per-request basis at the real OpenRouter token price plus a small Processing Buffer (currently 10%, disclosed in the in-app Recent Activity panel).</li>
      </ul>
      <p>
        We reserve the right to modify Plan offerings, quotas, the Service Fee tiers, the
        Processing Buffer, or BYOK subscription pricing. Such changes are governed by §8
        of the Refund Policy and §4 of these Terms (advance notice for material changes,
        with grandfathering of existing Managed top-ups at the Service Fee rate disclosed
        at the time of purchase).
      </p>

      <h3>6.2 Billing and Payment</h3>
      <p>
        All fees are quoted in United States Dollars (USD) unless otherwise indicated and
        are exclusive of any applicable taxes (VAT, GST, withholding, etc.). You are
        responsible for any taxes payable in your jurisdiction. Cellilox uses{' '}
        <strong>Flutterwave</strong> as its primary payment processor; by submitting payment
        you authorize Cellilox and Flutterwave to charge your selected payment method.
        Sensitive payment details (card numbers, CVCs) are handled by Flutterwave and are
        not stored by Cellilox.
      </p>
      <p>
        For BYOK subscriptions, fees are charged at the start of each billing period. If
        a renewal payment fails, we will notify you by email; if payment remains
        outstanding fourteen (14) days after the due date, we may suspend or downgrade
        your access until payment is made.
      </p>

      <h3>6.3 No Auto-Charging Free Trial</h3>
      <p>
        Cellilox does not currently offer a paid-tier free trial that automatically
        charges your card on conversion. The Standard plan provides limited free access
        without entering payment information.
      </p>

      <h3>6.4 Plan Changes</h3>
      <p>
        You may change Plans through your Account settings. Switching to a higher Plan
        takes effect after the new Plan is provisioned (typically within minutes).
        Switching away from BYOK or Managed does not refund any portion of an active
        BYOK billing cycle or any consumed Managed credits; remaining Managed balance is
        retained on your Account and remains available for spending under whichever Plan
        you switch to that supports it. Refund eligibility for Plan changes is governed by
        the Refund Policy.
      </p>

      <h3>6.5 Refunds</h3>
      <p>
        Refunds are governed entirely by our{' '}
        <a href="/refund-policy" className="text-blue-600 hover:underline">Refund Policy</a>,
        which is incorporated into these Terms by reference.
      </p>

      <h2>7. Use of the Services</h2>

      <h3>7.1 Permitted Use</h3>
      <p>You may use the Services for any lawful business or personal purpose, in compliance with these Terms. You agree not to:</p>
      <ul>
        <li>Use the Services for any unlawful purpose or in violation of any applicable law or regulation;</li>
        <li>Circumvent or attempt to circumvent quota, rate-limit, or access controls;</li>
        <li>Reverse engineer, decompile, or attempt to derive the source code of the Services, except to the extent expressly permitted by law;</li>
        <li>Resell, sublicense, or otherwise commercially exploit the Services without a separate written agreement with Cellilox;</li>
        <li>Use the Services to develop or train a competing product, AI model, or extraction service, including by systematically scraping AI outputs;</li>
        <li>Interfere with the integrity, security, or performance of the Services;</li>
        <li>Attempt to gain unauthorized access to other Accounts, projects, or back-end systems.</li>
      </ul>

      <h3>7.2 Customer Content — Ownership and License</h3>
      <p>
        You retain all rights, title, and interest in and to your Customer Content. You
        represent and warrant that you own or have the necessary rights and licenses to
        upload Customer Content to the Services and that doing so does not infringe any
        third-party right.
      </p>
      <p>
        You grant Cellilox a worldwide, non-exclusive, royalty-free, sublicensable license
        to host, store, transmit, process, display, and create technical or derivative
        versions of your Customer Content <strong>solely for the purpose of providing the
        Services to you</strong> — for example, running OCR, sending the content to your
        chosen or Cellilox-managed AI provider on your request, indexing the content into
        our retrieval engine for chat, generating answers, and securely backing up the
        content. The license terminates when you delete the corresponding record or your
        Account, subject to retention requirements set out in the Privacy Policy.
      </p>
      <p>
        <strong>No model training.</strong> Cellilox does not use Customer Content to train,
        fine-tune, or otherwise develop any proprietary AI model. Customer Content is sent
        to a third-party AI provider only to fulfill the request you have initiated, and
        the onward processing by that provider is governed by that provider&#39;s own terms
        and your relationship with it.
      </p>

      <h3>7.3 Acceptable Use of AI</h3>
      <p>You will not use the Services or any AI feature within the Services to:</p>
      <ul>
        <li>Generate content that is unlawful, defamatory, obscene, or that infringes another person&#39;s rights;</li>
        <li>Generate or assist in generating content that promotes violence, self-harm, child sexual abuse, or other content prohibited by applicable law or by the policies of the underlying AI provider;</li>
        <li>Impersonate another person, generate deceptive or fraudulent content, or attempt to evade safety controls of an AI provider;</li>
        <li>Generate political or election-targeting content in a manner that violates applicable election or political-advertising law;</li>
        <li>Exfiltrate or systematically capture AI outputs for the purpose of training a competing model;</li>
        <li>Process the personal data of others in violation of applicable data-protection law.</li>
      </ul>
      <p>
        Underlying AI providers (OpenRouter, OpenAI, Anthropic, DeepSeek, Google, etc.)
        each impose their own usage policies. Your use of the Services is also subject to
        those providers&#39; policies; a breach of an AI provider&#39;s policy is also a breach
        of these Terms.
      </p>

      <h3>7.4 No Warranty as to AI Output</h3>
      <p>
        AI output is inherently probabilistic. The Services may produce inaccurate,
        incomplete, biased, or otherwise unsuitable results. You are solely responsible
        for reviewing AI output before relying on it. The Services are not a substitute
        for professional advice (legal, medical, financial, accounting, regulatory, or
        otherwise) and you should consult a qualified professional where appropriate.
      </p>

      <h3>7.5 BYOK — Your Responsibility for Your AI Provider</h3>
      <p>
        Under the BYOK plan, you are entering into a separate contractual and billing
        relationship with Your AI Provider. Cellilox forwards your requests to Your AI
        Provider under your API key but is not a party to that relationship. You are
        solely responsible for:
      </p>
      <ul>
        <li>The fees Your AI Provider charges you for processing your requests;</li>
        <li>Compliance with Your AI Provider&#39;s terms of service, content policies, and acceptable-use rules;</li>
        <li>The privacy and security implications of routing Customer Content to Your AI Provider;</li>
        <li>The security of your API key, including rotating it if you believe it has been exposed.</li>
      </ul>
      <p>
        Cellilox is not liable for any charge billed to you by Your AI Provider, any
        action Your AI Provider takes against your account, or any loss arising from Your
        AI Provider&#39;s processing of your data.
      </p>

      <h3>7.6 Backups and Data Loss</h3>
      <p>
        We employ reasonable measures to preserve and back up data on the Services (see
        §8 of the Privacy Policy). You are nonetheless responsible for keeping your own
        copies of business-critical Customer Content. Cellilox is not liable for loss or
        corruption of Customer Content except where caused by our gross negligence or
        willful misconduct.
      </p>

      <h2>8. Intellectual Property</h2>
      <h3>8.1 Our IP</h3>
      <p>
        The Services, including all software, models, trademarks (&quot;Cellilox&quot;,
        the Cellilox logo), service marks, designs, copy, documentation, and the
        compilation of the foregoing, are owned by Cellilox Limited or its licensors.
        Nothing in these Terms grants you any rights in our IP except the limited right
        to use the Services as set out in §7.
      </p>

      <h3>8.2 Third-Party and Open-Source Components</h3>
      <p>
        The Services include third-party and open-source software components used under
        their respective licenses. Notably, our retrieval engine is a derivative of the
        open-source Onyx project. These components remain governed by their original
        licenses; nothing in these Terms purports to override those licenses.
      </p>

      <h3>8.3 Feedback</h3>
      <p>
        If you submit feedback, ideas, or suggestions about the Services
        (&quot;Feedback&quot;), you grant Cellilox a worldwide, perpetual, irrevocable,
        royalty-free license to use that Feedback for any purpose without obligation to
        you.
      </p>

      <h2>9. Prohibited Conduct</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Upload Customer Content that is unlawful, defamatory, obscene, malicious, or that infringes a third party&#39;s rights;</li>
        <li>Impersonate any person or entity or misrepresent your affiliation;</li>
        <li>Engage in automated abuse such as bots, scrapers, or denial-of-service attacks;</li>
        <li>Introduce viruses, worms, ransomware, or any other malicious code;</li>
        <li>Probe, scan, or test the vulnerability of the Services without our prior written consent;</li>
        <li>Use the Services to send unsolicited bulk communications (spam);</li>
        <li>Encourage or facilitate any of the above.</li>
      </ul>

      <h2>10. Third-Party Services</h2>
      <p>
        The Services depend on third parties to operate, including the subprocessors
        listed in §6.1 of the Privacy Policy (Clerk, Flutterwave, DigitalOcean, AWS,
        OpenRouter and other AI providers, Resend, and user-initiated integrations such
        as Google Drive and HubSpot). Use of those third-party services is also subject
        to their respective terms and privacy policies. Cellilox is not responsible for
        the availability, security, or practices of those third parties.
      </p>

      <h2>11. Confidentiality</h2>
      <h3>11.1 Definition</h3>
      <p>
        &quot;Confidential Information&quot; means any non-public information disclosed by one
        party to the other in connection with these Terms that is marked confidential or
        that, given its nature and the circumstances of disclosure, should reasonably be
        understood to be confidential. It includes, without limitation, technical and
        product information, pricing, security details, and business plans.
      </p>

      <h3>11.2 Obligations</h3>
      <p>
        The receiving party will (a) use Confidential Information solely to perform its
        obligations under these Terms; (b) limit access to its personnel, contractors,
        and advisors who need to know it and are bound by confidentiality duties at least
        as protective as these; and (c) protect it with at least the same care it uses to
        protect its own confidential information, and in no case less than reasonable
        care. Confidential Information does not include information that is or becomes
        public through no fault of the receiving party, was already lawfully known, was
        rightfully received from a third party, or was independently developed without
        reference to the disclosing party&#39;s information.
      </p>

      <h3>11.3 Compelled Disclosure</h3>
      <p>
        If the receiving party is legally compelled to disclose Confidential Information,
        it will, where lawful, give the disclosing party prompt written notice so that the
        disclosing party may seek a protective order or other appropriate remedy.
      </p>

      <h2>12. Disclaimers</h2>
      <h3>12.1 &quot;As Is&quot; and &quot;As Available&quot;</h3>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE SERVICES ARE PROVIDED
        &quot;AS IS&quot; AND &quot;AS AVAILABLE,&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS, IMPLIED,
        STATUTORY, OR OTHERWISE. CELLILOX DISCLAIMS ALL WARRANTIES OF MERCHANTABILITY,
        FITNESS FOR A PARTICULAR PURPOSE, TITLE, NON-INFRINGEMENT, AND ANY WARRANTY
        ARISING FROM COURSE OF DEALING OR USAGE OF TRADE. WE DO NOT WARRANT THAT THE
        SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR FREE OF MALICIOUS CODE.
      </p>

      <h3>12.2 No Professional Advice</h3>
      <p>
        Output produced through the Services is for informational purposes only and does
        not constitute legal, medical, financial, accounting, or other professional
        advice. Always seek qualified professional advice where appropriate.
      </p>

      <h3>12.3 No Warranty as to Third-Party Providers</h3>
      <p>
        Cellilox does not warrant the availability, accuracy, or behavior of any
        third-party AI provider, payment processor, hosting provider, or other
        subprocessor. Outages, model deprecations, pricing changes, or content-policy
        decisions of those third parties are outside our control.
      </p>

      <h2>13. Limitation of Liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT WILL CELLILOX
        LIMITED, ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR:
      </p>
      <ul>
        <li>ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES (INCLUDING LOST PROFITS, LOST REVENUE, LOST SAVINGS, LOSS OF DATA, LOSS OF GOODWILL, OR BUSINESS INTERRUPTION) ARISING OUT OF OR RELATED TO THESE TERMS OR YOUR USE OF OR INABILITY TO USE THE SERVICES, REGARDLESS OF THE THEORY OF LIABILITY;</li>
        <li>ANY DAMAGES OR LOSS ARISING FROM CHARGES BILLED BY YOUR AI PROVIDER UNDER THE BYOK PLAN;</li>
        <li>ANY MATTER BEYOND OUR REASONABLE CONTROL (INCLUDING THE OUTAGES OR ACTIONS OF SUBPROCESSORS LISTED IN THE PRIVACY POLICY);</li>
        <li>THE COST OF PROCURING SUBSTITUTE GOODS OR SERVICES.</li>
      </ul>
      <p>
        IN NO CASE WILL OUR AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THESE TERMS
        EXCEED THE TOTAL AMOUNT YOU PAID TO CELLILOX FOR THE SERVICES IN THE TWELVE (12)
        MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE LIABILITY OR ONE
        HUNDRED US DOLLARS (US$100), WHICHEVER IS GREATER. SOME JURISDICTIONS DO NOT
        ALLOW THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES; IN THOSE JURISDICTIONS THE
        ABOVE LIMITATIONS APPLY ONLY TO THE EXTENT PERMITTED.
      </p>

      <h2>14. Indemnification</h2>
      <p>
        You agree to defend, indemnify, and hold harmless Cellilox Limited, its
        affiliates, officers, directors, employees, and agents from and against any and
        all third-party claims, losses, liabilities, damages, costs, and expenses
        (including reasonable attorneys&#39; fees) arising out of or related to:
      </p>
      <ul>
        <li>Your breach of these Terms or any policy incorporated by reference;</li>
        <li>Your Customer Content, including any claim that it infringes a third party&#39;s rights or violates applicable law;</li>
        <li>Your use of an AI Provider under the BYOK plan or any breach of that provider&#39;s terms;</li>
        <li>Your willful misconduct or negligence.</li>
      </ul>
      <p>
        Cellilox may, at its own expense, assume the exclusive defense and control of any
        matter otherwise subject to indemnification, in which case you will cooperate as
        reasonably requested.
      </p>

      <h2>15. Termination</h2>
      <h3>15.1 Termination by You</h3>
      <p>
        You may stop using the Services at any time. To delete your Account, contact{' '}
        <a href="mailto:hello@support.cellilox.com" className="text-blue-600 hover:underline">
          hello@support.cellilox.com
        </a>{' '}
        or use the Account-deletion control in the application. Account deletion triggers
        the data-removal process described in §7 of the Privacy Policy. Subscription
        cancellation rules are governed by §3.2 and §4 of the Refund Policy.
      </p>

      <h3>15.2 Termination by Us</h3>
      <p>
        We may suspend or terminate your Account, with or without notice, if you:
      </p>
      <ul>
        <li>Materially breach these Terms (including non-payment);</li>
        <li>Engage in fraud, abuse, or unlawful conduct;</li>
        <li>Compromise the security or integrity of the Services;</li>
        <li>Use the Services in a manner that violates the policies of an underlying AI provider, payment processor, or other subprocessor.</li>
      </ul>
      <p>
        On termination for cause, you remain liable for all amounts owed through the date
        of termination. No refund is owed for terminations for cause.
      </p>

      <h3>15.3 Effect of Termination</h3>
      <p>
        Upon termination, your right to use the Services ends. The following sections
        survive termination: §4 (Modifications), §6 (Fees), §7.2 (Customer Content
        license, to the extent necessary to complete in-flight processing or backups),
        §7.4 (No Warranty as to AI Output), §8 (IP), §11 (Confidentiality), §12 (Disclaimers),
        §13 (Limitation of Liability), §14 (Indemnification), §15 (Termination), §16
        (Governing Law), and §17 (General).
      </p>

      <h2>16. Governing Law and Dispute Resolution</h2>
      <h3>16.1 Governing Law</h3>
      <p>
        These Terms and any dispute arising out of or related to them or the Services are
        governed by and construed in accordance with the laws of the Republic of Rwanda,
        without regard to its conflict-of-laws principles.
      </p>

      <h3>16.2 Informal Resolution</h3>
      <p>
        Before bringing any formal claim, you agree to contact us at{' '}
        <a href="mailto:hello@support.cellilox.com" className="text-blue-600 hover:underline">
          hello@support.cellilox.com
        </a>{' '}
        to attempt to resolve the matter informally. We will respond within thirty (30)
        days of receipt and use good-faith efforts to resolve the dispute.
      </p>

      <h3>16.3 Arbitration / Forum</h3>
      <p>
        If a dispute is not resolved informally within sixty (60) days of first notice,
        the dispute will be referred to and finally resolved by arbitration administered
        by the Kigali International Arbitration Centre (KIAC) under its rules then in
        force. The seat of arbitration will be Kigali, Rwanda. The language of the
        arbitration will be English. The arbitral award will be final and binding, and
        judgment on the award may be entered in any court of competent jurisdiction.
        Notwithstanding the foregoing, either party may seek interim or injunctive relief
        in a court of competent jurisdiction in Rwanda to protect its intellectual
        property or Confidential Information.
      </p>

      <h3>16.4 Class-Action Waiver</h3>
      <p>
        To the extent permitted by applicable law, you and Cellilox each agree that any
        proceeding to resolve a dispute will be conducted on an individual basis only and
        will not be consolidated with or joined to any class, collective, or
        representative action.
      </p>

      <h2>17. General Provisions</h2>
      <h3>17.1 Entire Agreement</h3>
      <p>
        These Terms, together with the Privacy Policy, the Cookie Policy, and the Refund
        Policy, constitute the entire agreement between you and Cellilox Limited
        regarding the Services and supersede all prior or contemporaneous agreements,
        understandings, or representations relating to the same subject matter.
      </p>

      <h3>17.2 Severability</h3>
      <p>
        If any provision of these Terms is held invalid or unenforceable, the remaining
        provisions will remain in full force and effect, and the invalid or unenforceable
        provision will be modified to the minimum extent necessary to make it valid and
        enforceable.
      </p>

      <h3>17.3 Waiver</h3>
      <p>
        Failure or delay by either party in exercising a right under these Terms is not a
        waiver of that right. A waiver of any breach must be in writing and signed by the
        waiving party.
      </p>

      <h3>17.4 Assignment</h3>
      <p>
        You may not assign or transfer these Terms or any rights under them without
        Cellilox&#39;s prior written consent. Cellilox may assign these Terms to an
        affiliate or to a successor-in-interest in connection with a merger, acquisition,
        reorganization, or sale of assets.
      </p>

      <h3>17.5 Notices</h3>
      <p>
        Notices to you under these Terms will be sent to the email address associated with
        your Account or posted in the application. Notices to Cellilox must be in writing
        and sent to:
      </p>
      <pre className="bg-gray-100 p-4 text-black rounded text-sm overflow-x-auto">
Cellilox Limited
Email: hello@support.cellilox.com
Address: Rwanda — Kigali — Gasabo — Rusororo — Kabuga
      </pre>

      <h3>17.6 Force Majeure</h3>
      <p>
        Neither party will be liable for any delay or failure to perform its obligations
        under these Terms (other than payment obligations) due to causes beyond its
        reasonable control, including acts of nature, government action, war, terrorism,
        civil unrest, labor disputes, internet or telecommunication outages, third-party
        provider failures, and pandemics. The affected party will notify the other
        promptly and use reasonable efforts to resume performance.
      </p>

      <h3>17.7 No Agency</h3>
      <p>
        These Terms do not create any partnership, joint venture, employment, or agency
        relationship between you and Cellilox.
      </p>

      <h2>18. Contact</h2>
      <p>For questions about these Terms, contact us:</p>
      <pre className="bg-gray-100 p-4 rounded text-black text-sm overflow-x-auto">
Cellilox Limited
Email: hello@support.cellilox.com
Registered office: Republic of Rwanda
      </pre>

      <h2>Acknowledgment</h2>
      <p>
        By creating an Account or using the Services, you acknowledge that you have read,
        understood, and agree to be bound by these Terms of Service, the Privacy Policy,
        the Cookie Policy, and the Refund Policy. If you do not agree, do not use the
        Services.
      </p>
    </article>
  );
}
