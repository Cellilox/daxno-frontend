import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Cellilox | Privacy Policy',
  description: 'Learn how Daxno collects, uses, and protects your personal information. Your privacy matters to us.'
};

export default function PrivacyPolicyPage() {
  return (
    <article className="prose lg:prose-lg max-w-3xl mx-auto px-6 py-12">
      <h1>Privacy Policy</h1>
      <p>
        <strong>Effective Date:</strong> Jun 05, 2025
      </p>

      <hr />

      <h2>1. Introduction</h2>
      <p>
        Cellilox Limited (“Company,” “we,” “us,” or “our”) is committed to protecting the privacy and security of the personal information we collect from our users (“you” or “your”). This Privacy Policy explains how we collect, use, disclose, and safeguard your
        information when you visit our website, use our SaaS applications, or otherwise interact with us. By accessing or using our Services, you agree to this Privacy Policy in addition to our Terms of Service.
      </p>

      <h2>2. Definitions</h2>
      <ul>
        <li><strong>Account:</strong> Your registered user profile on our platform, including credentials (e.g., email, password) and associated data.</li>
        <li><strong>Personal Information:</strong> Any information that can be used to identify you, either directly or indirectly (e.g., name, email address, billing address).</li>
        <li><strong>Usage Data:</strong> Information about how you interact with our Services (e.g., IP address, device type, pages viewed, actions taken).</li>
        <li><strong>Services:</strong> All features, functionalities, and offerings provided through our SaaS platform, including web and mobile interfaces.</li>
        <li><strong>Third-Party Services:</strong> Services provided by vendors or partners (e.g., payment processors, analytics providers) that we might integrate with or utilize to operate our platform.</li>
      </ul>

      <h2>3. Information We Collect</h2>
      <h3>3.1 Information You Provide Directly</h3>
      <ul>
        <li>
          <strong>Registration & Account Setup:</strong> When you create an account, we collect your name, email address, organization, and a password.
        </li>
        <li>
          <strong>Payment Information:</strong> We collect billing details (e.g., credit card number, billing address) when you subscribe to a paid plan. Payment data is processed by a reputable third-party payment processor (e.g., Stripe, PayPal) and is not stored on our servers.
        </li>
        <li>
          <strong>Profile & Communication:</strong> You may choose to provide additional profile information (e.g., phone number, job title) and communicate with us via support tickets, chat, or email.
        </li>
      </ul>

      <h3>3.2 Automatically Collected Information</h3>
      <ul>
        <li>
          <strong>Usage Data:</strong> Each time you access or use our Services, we collect data about your device (IP address, browser type/version, operating system), access times, pages/screens viewed, and actions performed within the application.
        </li>
        <li>
          <strong>Cookies & Tracking Technologies:</strong> We use cookies, web beacons, and similar technologies to recognize your browser or device, enable certain features, and collect analytics data (see Section 7 for details).
        </li>
      </ul>

      <h3>3.3 Information from Third Parties</h3>
      <ul>
        <li>
          <strong>Social Logins:</strong> If you choose to log in via a third-party service (e.g., Google, LinkedIn), we receive your name, email address, and profile picture (where permitted by that service).
        </li>
        <li>
          <strong>Third-Party Integrations:</strong> If you integrate our Service with other platforms (e.g., GitHub, Slack, CRMs), we may receive data from those services as necessary to provide the integration.
        </li>
      </ul>

      <h2>4. How We Use Your Information</h2>
      <ul>
        <li>
          <strong>Provide, Maintain, and Improve Our Services:</strong>
          <ul>
            <li>To authenticate and manage your account.</li>
            <li>To process payments and manage subscription billing.</li>
            <li>To monitor, analyze, and optimize platform performance, feature usage, and overall user experience.</li>
          </ul>
        </li>
        <li>
          <strong>Communication & Support:</strong>
          <ul>
            <li>To respond to your inquiries, provide customer support, and send administrative messages (e.g., account confirmations, password resets, security alerts).</li>
            <li>To send you technical notices, updates, and policy changes.</li>
          </ul>
        </li>
        <li>
          <strong>Marketing & Promotions (With Consent):</strong>
          <ul>
            <li>To send newsletters, promotional materials, or targeted advertisements about new features, events, or other news we think may interest you.</li>
            <li>
              You can opt out of marketing communications at any time by following the unsubscribe link in those emails or contacting us:{' '}
              <a href="mailto:hello@support.cellilox.com" className="text-blue-600 hover:underline">
                hello@support.cellilox.com
              </a>.
            </li>
          </ul>
        </li>
        <li>
          <strong>Analytics & Research:</strong>
          <ul>
            <li>To understand how users interact with our Services, develop new features, and refine existing ones.</li>
            <li>To detect and prevent fraud, abuse, or security incidents.</li>
          </ul>
        </li>
        <li>
          <strong>Compliance & Legal Obligations:</strong>
          <ul>
            <li>To comply with applicable legal requirements, industry standards, or lawful requests by public authorities (e.g., to meet national security or law enforcement requirements).</li>
            <li>To enforce our Terms of Service, policies, or protect our rights, property, or safety, and those of our users or others.</li>
          </ul>
        </li>
      </ul>

      <h2>5. Sharing and Disclosure of Your Information</h2>
      <h3>5.1 Service Providers & Partners</h3>
      <p>
        We may share your Personal Information with trusted third-party service providers who perform functions on our behalf, such as:
      </p>
      <ul>
        <li><strong>Payment Processors:</strong> To bill you and process subscription payments.</li>
        <li><strong>Cloud Hosting & Infrastructure Providers:</strong> To store and serve your data securely.</li>
        <li><strong>Analytics & Monitoring Tools:</strong> To collect and analyze Usage Data.</li>
        <li><strong>Customer Support Platforms:</strong> To manage and respond to support tickets.</li>
        <li><strong>Marketing & Email Service Providers:</strong> To send you marketing communications (with your consent).</li>
      </ul>
      <p>All third parties are contractually obligated to keep your data confidential and use it solely to provide the requested services.</p>

      <h3>5.2 Business Transfers</h3>
      <p>
        If the Company undergoes a merger, acquisition, reorganization, bankruptcy, or sale of assets, Personal Information may be transferred as part of that transaction. We will notify you via email or prominent notice on our website if ownership or control of your
        Personal Information changes.
      </p>

      <h3>5.3 Legal Requirements & Protection of Rights</h3>
      <p>
        We may disclose your Personal Information if required to do so by law or subpoena, in response to valid governmental requests, or to comply with other legal obligations. We may also share information when we believe, in good faith, that disclosure is necessary to:
      </p>
      <ul>
        <li>Enforce our Terms of Service or other agreements.</li>
        <li>Investigate, prevent, or take action regarding illegal activities, suspected fraud, threats to safety, or violation of our policies.</li>
      </ul>

      <h3>5.4 Aggregated/De-identified Information</h3>
      <p>
        We may aggregate or de-identify the data we collect to produce reports or analytics that do not personally identify you. This information may be shared publicly or with third parties for any purpose.
      </p>

      <h2>6. Cookies and Tracking Technologies</h2>
      <p>
        We use cookies, web beacons, and other tracking technologies to:
      </p>
      <ul>
        <li>Authenticate your session and keep you logged in.</li>
        <li>Remember your preferences and settings.</li>
        <li>Analyze usage trends and collect analytics.</li>
        <li>Provide targeted marketing and advertising.</li>
      </ul>
      <p>
        Most browsers allow you to reject or delete cookies. However, disabling cookies may prevent you from fully utilizing certain features of our Services. For more details, see our{' '}
        <a href="/cookie-policy" className="text-blue-600 hover:underline">
          Cookie Policy
        </a>.
      </p>

      <h2>7. Data Retention</h2>
      <p>
        We retain your Personal Information for as long as necessary to provide our Services and for legitimate and lawful business purposes, such as:
      </p>
      <ul>
        <li>Account maintenance and record-keeping.</li>
        <li>Complying with legal obligations (e.g., tax, regulatory).</li>
        <li>Resolving disputes, enforcing our agreements, and preventing abuse.</li>
      </ul>
      <p>
        After retention periods expire, we securely delete or anonymize your information in accordance with applicable laws and regulations. If you choose to delete your account, we will remove your Personal Information within thirty (30) days after your request,
        except for data we are required to retain for legal or auditing purposes or de-identified/aggregated data that cannot be tied back to you.
      </p>

      <h2>8. Security of Your Information</h2>
      <p>
        We implement a variety of technical, administrative, and physical safeguards to protect your Personal Information from unauthorized access, disclosure, alteration, or destruction, including but not limited to:
      </p>
      <ul>
        <li><strong>Encryption:</strong> We use industry-standard encryption (TLS/SSL) for data in transit and encryption at rest for sensitive data stored on our servers.</li>
        <li><strong>Access Controls:</strong> Access to Personal Information is limited to authorized personnel on a "need-to-know" basis.</li>
        <li><strong>Regular Audits & Monitoring:</strong> We conduct routine security assessments and vulnerability scans to identify and remediate potential risks.</li>
        <li><strong>Secure Development Practices:</strong> Our engineering teams follow secure coding standards and conduct code reviews and penetration testing.</li>
      </ul>
      <p>Despite these measures, no method of transmission or storage can be guaranteed 100% secure. You acknowledge that you provide Personal Information at your own risk.</p>

      <h2>9. Third-Party Links & Embedded Content</h2>
      <p>
        Our website or application may contain links to third-party websites, services, or integrations (e.g., social media platforms, payment gateways). We do not control and are not responsible for the privacy practices of those third parties. We encourage you to review
        the privacy policies of any third-party sites you visit. This Privacy Policy applies only to information we collect.
      </p>

      <h2>10. Children's Privacy</h2>
      <p>
        Our Services are not directed at children under the age of 13 (or the applicable age in jurisdictions where higher). We do not knowingly collect Personal Information from children under the age of 13. If you become aware that a child has provided us with
        Personal Information, please contact us immediately at{' '}
        <a href="mailto:hello@support.cellilox.com" className="text-blue-600 hover:underline">
          hello@support.cellilox.com
        </a>, and we will take steps to delete such information promptly.
      </p>

      <h2>11. Your Rights and Choices</h2>
      <p>Depending on your jurisdiction, you may have the following rights regarding your Personal Information:</p>
      <ul>
        <li>
          <strong>Access & Portability:</strong> You can request a copy of the Personal Information we hold about you in a portable, machine-readable format.
        </li>
        <li>
          <strong>Correction:</strong> You can update or correct inaccurate or incomplete information.
        </li>
        <li>
          <strong>Deletion ("Right to Be Forgotten"):</strong> You can request that we delete your Personal Information, subject to exceptions (e.g., legal obligations).
        </li>
        <li>
          <strong>Restriction of Processing:</strong> You can ask us to limit how we process your data.
        </li>
        <li>
          <strong>Data Portability:</strong> You can request to receive your data in a structured, commonly used, and machine-readable format for transfer to another controller.
        </li>
        <li>
          <strong>Objection:</strong> You can object to certain processing activities, such as direct marketing or profiling.
        </li>
        <li>
          <strong>Withdraw Consent:</strong> If we process your Personal Information based on consent, you can withdraw that consent at any time without affecting prior lawful processing.
        </li>
      </ul>
      <p>
        To exercise any of these rights, please contact us at{' '}
        <a href="mailto:hello@support.cellilox.com" className="text-blue-600 hover:underline">
          hello@support.cellilox.com
        </a>. We may request reasonable information to confirm your identity before fulfilling your request. Note that certain legal obligations or legitimate
        business interests may prevent us from fully honoring your request, in which case we will inform you.
      </p>

      <h2>12. International Data Transfers</h2>
      <p>
        If you are located outside of Rwanda and use our Services, your Personal Information may be transferred to, stored, and processed in Rwanda or other jurisdictions. These countries may have data protection laws
        that are different from those in your jurisdiction. Whenever we transfer Personal Information internationally, we ensure that it is protected in accordance with this Privacy Policy and applicable law (e.g., using Standard Contractual Clauses or other
        approved transfer mechanisms).
      </p>

      <h2>13. Changes to This Privacy Policy</h2>
      <p>
        We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or for other operational reasons.
      </p>
      <ul>
        <li>
          <strong>Notification of Changes:</strong> If we make material changes, we will notify you by email (sent to the address on file) or by posting a notice on our website 30 days before the changes take effect.
        </li>
        <li>
          <strong>Your Continued Use:</strong> By continuing to access or use our Services after those changes become effective, you agree to be bound by the revised Privacy Policy. If you do not agree with the changes, you must stop using the Services and may
          request deletion of your account as described above.
        </li>
      </ul>

      <h2>14. Contact Us</h2>
      <p>If you have questions, concerns, or complaints regarding this Privacy Policy or our privacy practices, please contact us:</p>
      <pre className="bg-gray-100 p-4 rounded text-black text-sm overflow-x-auto">
Support
Email: hello@support.cellilox.com
      </pre>

      <h2>Acknowledgment</h2>
      <p>
        By accessing or using our Services, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy. If you do not agree, please do not use our Services.
      </p>
    </article>
  );
}
