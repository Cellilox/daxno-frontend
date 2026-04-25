import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Cellilox | Privacy Policy',
  description: 'How Cellilox collects, uses, stores, and shares your information — including uploaded documents — across our Standard, BYOK, and Managed plans.'
};

export const dynamic = "force-dynamic";

export default function PrivacyPolicyPage() {
  return (
    <article className="prose lg:prose-lg max-w-3xl mx-auto px-6 py-12">
      <h1>Privacy Policy</h1>
      <p>
        <strong>Effective Date:</strong> April 25, 2026
      </p>

      <hr />

      <h2>1. Introduction</h2>
      <p>
        Cellilox Limited (&quot;Cellilox,&quot; &quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is a
        company registered in the Republic of Rwanda. This Privacy Policy explains how
        we collect, use, store, share, and protect information when you visit our website,
        create an account, or use the Cellilox document-analysis and chat platform
        (collectively, the &quot;Services&quot;). It applies to individuals and organizations
        (&quot;you&quot; or &quot;your&quot;) regardless of plan tier (Standard, BYOK, or Managed).
      </p>
      <p>
        We process personal data in accordance with Rwanda Law N° 058/2021 of 13/10/2021
        relating to the protection of personal data and privacy, and — where applicable —
        the EU General Data Protection Regulation (GDPR), the UK GDPR, and other local
        data-protection laws applicable to users who access the Services from those
        jurisdictions.
      </p>
      <p>
        By accessing or using the Services, you agree to this Privacy Policy in addition
        to our Terms of Service and Refund Policy. If you do not agree, please do not use
        the Services.
      </p>

      <h2>2. Definitions</h2>
      <ul>
        <li><strong>Account:</strong> Your registered user profile on the Cellilox platform, including your authentication credentials and the settings stored against your user ID.</li>
        <li><strong>Personal Information:</strong> Any information that identifies you directly or can be combined with other information to identify you (e.g. name, email, IP address, billing details).</li>
        <li><strong>Customer Content:</strong> The files (PDFs, images, spreadsheets, emails, etc.) that you upload to the Services, the fields/questions you define against them, the answers produced by AI extraction, and any chat messages you send through the platform&#39;s retrieval chat.</li>
        <li><strong>Usage Data:</strong> Metadata about how you interact with the Services — for example, access timestamps, device/browser information, pages viewed, and actions performed.</li>
        <li><strong>Services:</strong> The Cellilox SaaS platform, including its web application, APIs, chat, and any feature offered under the Cellilox brand.</li>
        <li><strong>Subprocessor:</strong> A third-party vendor engaged by Cellilox to process data on our behalf (listed in §6).</li>
        <li><strong>Your AI Provider:</strong> For BYOK users, the third-party AI provider (e.g. OpenRouter, OpenAI, Anthropic, DeepSeek, or Google) whose API key you supply to the Services and who independently processes and bills you for AI requests.</li>
        <li><strong>Daxno-Managed Subkey:</strong> For Managed-plan users, a dedicated API subkey that Cellilox provisions on OpenRouter on your behalf and funds from your credit balance.</li>
      </ul>

      <h2>3. Information We Collect</h2>

      <h3>3.1 Information You Provide Directly</h3>
      <ul>
        <li>
          <strong>Registration &amp; Account Setup.</strong> When you create an account we collect your
          name, email address, and (where applicable) your organization. Authentication is
          handled by our identity provider (Clerk). Passwords, OAuth tokens, and
          multi-factor-authentication factors are managed by Clerk — Cellilox never stores
          plaintext passwords on its own servers.
        </li>
        <li>
          <strong>Payment Information.</strong> Card numbers, CVCs, and similar sensitive payment
          details are collected and processed directly by our payment processor
          (Flutterwave). Cellilox does not see or store full card numbers. From Flutterwave
          we receive transaction metadata (amount, currency, status, transaction reference,
          masked card summary) which we retain to manage your balance, invoices, and
          refunds.
        </li>
        <li>
          <strong>Profile &amp; Communication.</strong> Any optional profile details you provide
          (phone number, job title, etc.) and the content of support correspondence you
          send us.
        </li>
        <li>
          <strong>Customer Content.</strong> Files you upload for extraction, the field names
          and descriptions you define, the answers extracted by AI, and messages you send
          in chat. See §5 for how Customer Content is processed.
        </li>
      </ul>

      <h3>3.2 Information Collected Automatically</h3>
      <ul>
        <li>
          <strong>Usage Data.</strong> IP address, approximate geolocation derived from the IP,
          browser type and version, operating system, timestamps, pages/screens viewed,
          and actions performed within the application.
        </li>
        <li>
          <strong>Cookies &amp; Similar Technologies.</strong> We use session cookies and local
          storage to keep you signed in, remember your preferences, and collect
          aggregate analytics. See §10 and our Cookie Policy for details.
        </li>
        <li>
          <strong>Security &amp; Abuse Telemetry.</strong> Rate-limit counters, failed-authentication
          events, and request fingerprints used to detect fraud or abuse.
        </li>
      </ul>

      <h3>3.3 Information from Third Parties</h3>
      <ul>
        <li>
          <strong>Social Logins (via Clerk).</strong> If you sign in with a third-party identity
          provider (such as Google), Clerk receives your name, email, and profile picture
          where permitted by that provider and passes a verified identity to us. We receive
          the email and a stable user ID — not your social-provider password.
        </li>
        <li>
          <strong>User-Initiated Integrations.</strong> If you connect a data source such as
          Google Drive or HubSpot, we receive, with your explicit consent, an OAuth access
          token and the scopes you authorize. We use that access only to perform the
          actions you initiate inside Cellilox (e.g. importing a file).
        </li>
        <li>
          <strong>AI Provider Responses.</strong> When we call an AI provider on your behalf, the
          provider returns a response (extracted fields, chat answer, usage metadata). That
          response is associated with your account for billing and display.
        </li>
      </ul>

      <h2>4. How We Use Your Information</h2>
      <ul>
        <li>
          <strong>Provide and operate the Services.</strong> Authenticate you, route requests,
          run file analysis and chat, store your project and Customer Content, enforce quotas,
          and maintain your balance (Managed plan) or subscription (BYOK plan).
        </li>
        <li>
          <strong>Billing and payments.</strong> Charge you for BYOK subscriptions or Managed
          top-ups through Flutterwave, apply the disclosed Service Fee to Managed top-ups,
          deduct consumption from your Managed balance, generate receipts, and handle
          refunds under our Refund Policy.
        </li>
        <li>
          <strong>Communications.</strong> Send transactional emails (account verification,
          password/OTP, receipts, security alerts, quota notices, refund confirmations,
          policy updates). Transactional email is sent through our email provider (Resend).
        </li>
        <li>
          <strong>Marketing (with consent).</strong> With your consent we may send product news
          or newsletters. You can withdraw consent at any time via the unsubscribe link in
          any marketing email or by emailing{' '}
          <a href="mailto:hello@support.cellilox.com" className="text-blue-600 hover:underline">
            hello@support.cellilox.com
          </a>.
        </li>
        <li>
          <strong>Security, fraud prevention, and abuse detection.</strong> Detect and mitigate
          abuse, rate-limit requests, investigate suspicious activity, and enforce our Terms
          of Service.
        </li>
        <li>
          <strong>Product improvement (aggregated / de-identified).</strong> We analyze
          aggregated, non-identifying usage patterns to diagnose issues, prioritize features,
          and measure performance. We do <strong>not</strong> use Customer Content to train AI
          models (see §5).
        </li>
        <li>
          <strong>Legal and regulatory compliance.</strong> Comply with applicable law,
          responding to lawful requests from public authorities, and enforcing or defending
          our legal rights.
        </li>
      </ul>

      <h2>5. How Your Customer Content Is Processed</h2>
      <p>
        Because the core of the Services is document analysis, it is important for you to
        understand exactly how Customer Content moves through our infrastructure and
        third-party providers. We describe it below by plan, because the data flow differs.
      </p>

      <h3>5.1 All Plans — Upload, OCR, and Indexing</h3>
      <ul>
        <li>
          <strong>Storage:</strong> Uploaded files are stored encrypted at rest on Amazon S3 and
          referenced by our application servers hosted on DigitalOcean.
        </li>
        <li>
          <strong>OCR:</strong> For image and PDF uploads, the raw file (or a preprocessed
          version) is sent to Amazon Web Services (AWS Textract) for text and geometry
          extraction. Textract processes the file, returns the extracted blocks to us, and
          operates under AWS&#39;s own privacy and security terms.
        </li>
        <li>
          <strong>Retrieval Indexing (Chat).</strong> Extracted text from your files is indexed
          into our self-hosted retrieval engine (a fork of the open-source project Onyx)
          so you can ask questions about your data in chat. The index lives on the same
          DigitalOcean infrastructure and is scoped to your project.
        </li>
      </ul>

      <h3>5.2 Standard Plan</h3>
      <p>
        AI extraction requests are routed through OpenRouter using a per-user subkey that
        Cellilox provisions on your behalf. The prompt (containing text from your file plus
        the fields you asked for) is sent to an OpenRouter-routed model (currently a
        Gemini-family model by default). Cellilox pays the OpenRouter cost for Standard users.
      </p>

      <h3>5.3 BYOK Plan (Bring Your Own Key)</h3>
      <p>
        You supply your own API key for a third-party AI provider (OpenRouter, OpenAI,
        Anthropic, DeepSeek, or Google). On each request Cellilox forwards your prompt —
        including relevant Customer Content — to that provider under your key.
        <strong> Processing by your chosen provider is governed by that provider&#39;s own
        privacy policy and terms, not by this Policy.</strong> Cellilox has no ability to
        control how your chosen provider stores or uses the content you route through it.
        We store your API key encrypted at rest and only decrypt it to make calls on your
        behalf.
      </p>

      <h3>5.4 Managed Plan</h3>
      <p>
        Cellilox provisions a dedicated OpenRouter subkey on your behalf and funds it from
        your Managed credit balance. Your prompts and Customer Content are forwarded to
        OpenRouter under that subkey. OpenRouter&#39;s own privacy policy applies to the
        onward processing of that content. Cellilox does not send your Customer Content to
        any AI provider other than the one you have selected for extraction or chat.
      </p>

      <h3>5.5 AI Model Training — Explicit Statement</h3>
      <p>
        <strong>Cellilox does not train, fine-tune, or otherwise develop any proprietary AI
        model using Customer Content.</strong> Customer Content is sent to third-party AI
        providers solely to produce the response you have requested. Whether a specific
        AI provider uses your content for its own model training depends on that
        provider&#39;s policies and account settings (many, including OpenRouter&#39;s zero-data-
        retention routes and OpenAI&#39;s API, offer opt-outs or default no-training terms).
        For BYOK, you control that relationship directly.
      </p>

      <h2>6. Sharing and Disclosure — Our Subprocessors</h2>
      <p>
        We share data with the following categories of trusted third parties, limited to
        the purpose of delivering, billing, or supporting the Services. Each is
        contractually bound to confidentiality and to using the data solely for the
        purpose we engage them for.
      </p>

      <h3>6.1 Current Subprocessors</h3>
      <table className="border-collapse w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-3 py-2 text-left">Subprocessor</th>
            <th className="border px-3 py-2 text-left">Purpose</th>
            <th className="border px-3 py-2 text-left">Data Involved</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border px-3 py-2">Clerk</td>
            <td className="border px-3 py-2">Authentication, session management, MFA</td>
            <td className="border px-3 py-2">Email, name, social-login identifiers, session tokens</td>
          </tr>
          <tr>
            <td className="border px-3 py-2">Flutterwave</td>
            <td className="border px-3 py-2">Payment processing (BYOK subscriptions, Managed top-ups)</td>
            <td className="border px-3 py-2">Card details (processed by Flutterwave; not stored by us), transaction metadata, billing name/email</td>
          </tr>
          <tr>
            <td className="border px-3 py-2">DigitalOcean</td>
            <td className="border px-3 py-2">Primary application hosting, database, Redis, chat/retrieval index</td>
            <td className="border px-3 py-2">All data stored on our infrastructure: account, Customer Content metadata, balances, logs</td>
          </tr>
          <tr>
            <td className="border px-3 py-2">Amazon Web Services (AWS)</td>
            <td className="border px-3 py-2">File storage (S3) and OCR (Textract)</td>
            <td className="border px-3 py-2">Uploaded files; file contents passed to Textract for OCR</td>
          </tr>
          <tr>
            <td className="border px-3 py-2">OpenRouter</td>
            <td className="border px-3 py-2">AI request routing for Standard and Managed plans (and for BYOK when the user selects OpenRouter)</td>
            <td className="border px-3 py-2">Prompts containing extracted text, model selection, usage metadata</td>
          </tr>
          <tr>
            <td className="border px-3 py-2">OpenAI, Anthropic, DeepSeek, Google</td>
            <td className="border px-3 py-2">AI processing for BYOK users who elect to use those providers directly</td>
            <td className="border px-3 py-2">Prompts you choose to route to the provider under your own API key</td>
          </tr>
          <tr>
            <td className="border px-3 py-2">Resend</td>
            <td className="border px-3 py-2">Transactional and notification email delivery</td>
            <td className="border px-3 py-2">Your email address, the content of messages sent to you</td>
          </tr>
          <tr>
            <td className="border px-3 py-2">Google (Drive) &amp; HubSpot</td>
            <td className="border px-3 py-2">User-initiated integrations (optional)</td>
            <td className="border px-3 py-2">OAuth tokens and data you authorize us to read/write</td>
          </tr>
        </tbody>
      </table>
      <p>
        We review our subprocessors periodically and may add or replace them. Material
        changes to this list will be communicated under §13.
      </p>

      <h3>6.2 Business Transfers</h3>
      <p>
        If Cellilox undergoes a merger, acquisition, reorganization, insolvency, or sale
        of all or a portion of its assets, Personal Information and Customer Content may
        be transferred to the successor entity. We will notify affected users by email or
        in-app notice before the change takes effect.
      </p>

      <h3>6.3 Legal Requirements &amp; Protection of Rights</h3>
      <p>
        We may disclose information if required by law, subpoena, court order, or valid
        request from a public authority, or when we reasonably believe disclosure is
        necessary to investigate, prevent, or act against suspected illegal activity,
        fraud, or threats to safety. Where legally permitted, we will notify the affected
        user before disclosure.
      </p>

      <h3>6.4 Aggregated and De-Identified Data</h3>
      <p>
        We may share aggregated, de-identified statistics (e.g. total pages processed,
        feature-usage distributions) that cannot reasonably be used to identify an
        individual user or tenant.
      </p>

      <h3>6.5 Selling Personal Information</h3>
      <p>
        <strong>We do not sell your Personal Information or your Customer Content.</strong>
      </p>

      <h2>7. Data Retention</h2>
      <p>
        We retain different categories of data for different periods. In general, we keep
        data for as long as we need it to deliver the Services and then for as long as
        legitimately required for legal, tax, accounting, audit, or dispute-resolution
        purposes.
      </p>
      <ul>
        <li>
          <strong>Account information:</strong> retained for the lifetime of your account.
          Upon account deletion, we remove your profile and project records from production
          systems within thirty (30) days.
        </li>
        <li>
          <strong>Customer Content (files and extracted answers):</strong> retained while the
          record or project exists. When you delete a record, project, or account, the
          corresponding files are removed from S3 and the associated entries are removed
          from the Onyx retrieval index, typically within seventy-two (72) hours.
        </li>
        <li>
          <strong>Billing and transaction records:</strong> retained for the period required
          by Rwandan tax and accounting law (currently up to ten (10) years for
          transactional records), regardless of account deletion, in order to support
          audits and regulatory obligations.
        </li>
        <li>
          <strong>Usage logs and security telemetry:</strong> retained up to twelve (12)
          months for debugging, incident response, and abuse detection.
        </li>
        <li>
          <strong>Backups:</strong> encrypted backups of production data are retained for
          rolling periods of up to ninety (90) days and are purged on a rolling basis.
          Deletion of a record in production propagates to backups as those backups expire.
        </li>
      </ul>

      <h2>8. Security of Your Information</h2>
      <p>
        We implement technical, administrative, and physical safeguards proportionate to
        the sensitivity of the data we hold, including:
      </p>
      <ul>
        <li><strong>Encryption in transit:</strong> TLS for all connections between your browser, our servers, and our subprocessors.</li>
        <li><strong>Encryption at rest:</strong> files stored in S3 are encrypted at rest; sensitive credentials (your BYOK API key, Daxno-managed subkey secret) are additionally encrypted at the application layer using keys managed by Cellilox.</li>
        <li><strong>Access controls:</strong> access to production systems is restricted to authorized Cellilox personnel on a need-to-know basis and protected by multi-factor authentication.</li>
        <li><strong>Secrets management:</strong> API keys, database credentials, and webhook secrets are stored in environment-segregated secret stores, never checked into source code.</li>
        <li><strong>Monitoring and incident response:</strong> logs and anomaly alerts are reviewed regularly; we maintain a documented incident-response procedure.</li>
        <li><strong>Secure development:</strong> code is reviewed before deployment and dependencies are monitored for known vulnerabilities.</li>
      </ul>
      <p>
        No system can be guaranteed 100% secure. If we become aware of a security breach
        that affects your Personal Information or Customer Content, we will notify you
        and the relevant authorities as required by Rwanda Law N° 058/2021 and any other
        applicable law.
      </p>

      <h2>9. Third-Party Links &amp; Embedded Content</h2>
      <p>
        The Services may link to third-party websites or embed content from third parties
        (e.g. payment redirects, AI-provider dashboards). We do not control those third
        parties and their privacy practices are governed by their own policies. Please
        review those policies before providing them with Personal Information.
      </p>

      <h2>10. Cookies and Tracking Technologies</h2>
      <p>We use cookies and similar technologies to:</p>
      <ul>
        <li>Keep you authenticated and maintain your session.</li>
        <li>Remember your preferences and settings.</li>
        <li>Analyze aggregate usage trends to improve the Services.</li>
      </ul>
      <p>
        Most browsers allow you to control cookies through their settings. Disabling
        strictly-necessary cookies may prevent the Services from functioning correctly.
        See our{' '}
        <a href="/cookie-policy" className="text-blue-600 hover:underline">Cookie Policy</a>{' '}
        for more detail.
      </p>

      <h2>11. Children&#39;s Privacy</h2>
      <p>
        The Services are not directed at children. We do not knowingly collect Personal
        Information from users under the age of sixteen (16) in the European Economic
        Area, the United Kingdom, or any jurisdiction where that is the applicable digital
        minimum age; or under the age of thirteen (13) in other jurisdictions. If you
        believe a child has provided us with Personal Information, please contact{' '}
        <a href="mailto:hello@support.cellilox.com" className="text-blue-600 hover:underline">
          hello@support.cellilox.com
        </a>{' '}
        and we will promptly delete it.
      </p>

      <h2>12. Your Rights and Choices</h2>
      <p>
        Subject to the law applicable to you — including Rwanda Law N° 058/2021, the GDPR
        (for EEA users), and the UK GDPR — you may have the following rights over your
        Personal Information:
      </p>
      <ul>
        <li><strong>Access:</strong> receive confirmation of whether we hold data about you and obtain a copy.</li>
        <li><strong>Rectification:</strong> correct inaccurate or incomplete data.</li>
        <li><strong>Erasure (&quot;right to be forgotten&quot;):</strong> request deletion, subject to legal retention obligations (e.g. tax law).</li>
        <li><strong>Restriction:</strong> ask us to limit how we process your data in certain circumstances.</li>
        <li><strong>Portability:</strong> receive your data in a structured, commonly-used, machine-readable format where processing is based on contract or consent.</li>
        <li><strong>Objection:</strong> object to processing based on legitimate interests or for direct marketing.</li>
        <li><strong>Withdraw consent:</strong> where we rely on consent, you may withdraw it at any time without affecting prior lawful processing.</li>
        <li><strong>Complaint:</strong> lodge a complaint with a supervisory authority — the National Cyber Security Authority (NCSA) in Rwanda, or your local data-protection regulator in another jurisdiction.</li>
      </ul>
      <p>
        To exercise any of these rights, email{' '}
        <a href="mailto:hello@support.cellilox.com" className="text-blue-600 hover:underline">
          hello@support.cellilox.com
        </a>. We may request reasonable information to verify your identity before
        responding. We will respond within thirty (30) days of a valid request or the
        period required by applicable law, whichever is shorter. If we are unable to
        fulfill a request — for example, because we must retain certain records to comply
        with tax law — we will explain why.
      </p>

      <h2>13. International Data Transfers</h2>
      <p>
        Cellilox operates from Rwanda, but the infrastructure and subprocessors that
        deliver the Services are located in multiple regions. In particular:
      </p>
      <ul>
        <li>Application servers, databases, Redis, and the Onyx retrieval index are hosted on DigitalOcean.</li>
        <li>File storage and OCR run on AWS (S3 and Textract).</li>
        <li>AI providers (OpenRouter, OpenAI, Anthropic, DeepSeek, Google) operate globally; their regional processing locations are governed by their own policies.</li>
        <li>Authentication (Clerk), payments (Flutterwave), and email (Resend) are operated by their respective providers and may process data outside Rwanda.</li>
      </ul>
      <p>
        Where Personal Information originating in the EEA, UK, or another jurisdiction
        with cross-border transfer restrictions is transferred to a country with a
        different data-protection framework, we rely on lawful transfer mechanisms such
        as Standard Contractual Clauses, the UK International Data Transfer Addendum, or
        equivalent safeguards.
      </p>

      <h2>14. Changes to This Privacy Policy</h2>
      <p>
        We may update this Privacy Policy from time to time to reflect changes in our
        practices, technology, subprocessors, or applicable law.
      </p>
      <ul>
        <li>
          <strong>Non-material changes</strong> — for example, clarifying language or typographical
          corrections — take effect when the revised Policy is posted on this page. The
          &quot;Effective Date&quot; at the top of the Policy will be updated accordingly.
        </li>
        <li>
          <strong>Material changes</strong> — for example, adding a new category of data collected,
          a new subprocessor with materially different processing, or a change to retention
          periods — will not take effect for at least thirty (30) days after we notify you.
          Notice will be given by email to the address on your account and/or by a prominent
          in-app notice.
        </li>
        <li>
          <strong>Your options if you do not agree.</strong> If you disagree with a material
          change, you may delete your account before the change&#39;s Effective Date (see §12).
          Continuing to use the Services after the Effective Date constitutes acceptance of
          the revised Policy.
        </li>
      </ul>

      <h2>15. Contact Us</h2>
      <p>
        For any question, concern, complaint, or rights request relating to this Privacy
        Policy or our handling of your data, please contact:
      </p>
      <pre className="bg-gray-100 p-4 rounded text-black text-sm overflow-x-auto">
        Cellilox Limited
        Privacy &amp; Data Protection
        Email: hello@support.cellilox.com
        Registered office: Republic of Rwanda
      </pre>
      <p>
        Rwandan users may also contact the National Cyber Security Authority (NCSA), the
        supervisory authority for personal-data protection under Rwanda Law N° 058/2021.
        Users in the EEA, the United Kingdom, or another jurisdiction may contact their
        local data-protection regulator.
      </p>

      <h2>Acknowledgment</h2>
      <p>
        By accessing or using the Services, you acknowledge that you have read and
        understood this Privacy Policy and agree to be bound by it. If you do not agree,
        please do not use the Services.
      </p>
    </article>
  );
}
