import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Cellilox | Cookie Policy',
  description: 'Understand how Cellilox uses cookies to enhance your experience and provide essential functionality.'
};

export default function CookiePolicyPage() {
  return (
    <article className="prose lg:prose-lg max-w-3xl mx-auto px-6 py-12">
      <h1>Cookie Policy</h1>
      <p>
        <strong>Effective Date:</strong> Jun 05, 2025
      </p>

      <hr />

      <h2>1. Introduction</h2>
      <p>
        This Cookie Policy explains how Cellilox Limited (“Company,” “we,” “us,” or “our”) uses cookies and similar tracking technologies on our website and web application (collectively, the “Services”). We respect your privacy and are committed to protecting
        your personal data. By accessing or using our Services, you agree to this Cookie Policy in conjunction with our Privacy Policy.
      </p>
      <p>
        <strong>Note:</strong> We do not set any first-party cookies directly. However, because we utilize a third-party authentication service (Clerk) to manage user login and sessions, certain cookies may be set by Clerk on our behalf. This policy outlines
        those cookies and how you can manage them.
      </p>

      <h2>2. What Are Cookies and Similar Technologies?</h2>
      <p>
        <strong>Cookies</strong> are small text files that are placed on your device (computer, tablet, or mobile) when you visit a website. Cookies help websites remember information about your visit, which can make subsequent visits faster and more useful.
      </p>
      <p>
        <strong>Web Beacons (Pixels)</strong> are tiny invisible graphics files embedded in web pages or emails that, when loaded, can track whether a user has visited a page or opened an email.
      </p>
      <p>
        <strong>Local Storage and Session Storage</strong> are browser-based storage mechanisms that websites use to save data on your device. While not technically cookies, they serve similar purposes—storing small amounts of information to improve user
        experience.
      </p>
      <p>For simplicity, we refer to cookies and related tracking technologies collectively as “cookies” throughout this policy.</p>

      <h2>3. Types of Cookies We May Use</h2>
      <p>
        Because we rely on Clerk for authentication, the following categories of cookies may be set by Clerk’s domain when you log in or interact with our Services:
      </p>

      <h3>3.1 Strictly Necessary Cookies</h3>
      <ul>
        <li>
          These cookies are essential for enabling core functionality of the Services. Without these cookies, you would not be able to log in, maintain a session, or use secure areas of the website.
        </li>
        <li>
          <strong>Example (Clerk):</strong>
          <ul>
            <li>
              <code>_session_token</code> (or equivalent): A session cookie set by Clerk to authenticate your identity after logging in. It typically expires when you log out or close your browser.
            </li>
          </ul>
        </li>
      </ul>

      <h3>3.2 Performance and Analytics Cookies (Optional)</h3>
      <ul>
        <li>
          These cookies collect anonymous information about how visitors use our Services (e.g., which pages are visited most often, any error messages encountered). This data helps us improve the performance and user experience.
        </li>
        <li>
          We do not directly set any analytics cookies, but Clerk may utilize such cookies to monitor login performance, error rates, or usage metrics.
        </li>
        <li>
          <strong>Example (Clerk):</strong>
          <ul>
            <li>
              <code>__clerk_ab_test</code> (or similar): Tracks A/B testing or performance metrics to optimize authentication flows.
            </li>
          </ul>
        </li>
      </ul>

      <h3>3.3 Functional Cookies (Optional)</h3>
      <ul>
        <li>
          These cookies enable enhanced functionality and personalization. They may be set by Clerk to remember choices you make, such as language preferences or interface options related to authentication widgets.
        </li>
        <li>
          <strong>Example (Clerk):</strong>
          <ul>
            <li>
              <code>clerk_choice</code> (or equivalent): Remembers certain preferences in the login/signup widget, such as which OAuth provider (Google, GitHub, etc.) you last used.
            </li>
          </ul>
        </li>
      </ul>

      <h3>3.4 Advertising and Targeting Cookies</h3>
      <p>
        We do <strong>not</strong> serve advertisements, nor do we use any advertising or targeting cookies on our own site. However, if Clerk integrates with third-party identity providers or social logins, those providers may set additional cookies on their
        own domains. Those cookies are outside our control, and you should consult their individual privacy and cookie policies for details.
      </p>

      <h2>4. Specific Third-Party Cookies: Clerk</h2>
      <p>
        Clerk is a third-party identity and authentication provider. When you sign in, register, or otherwise interact with Clerk’s authentication widgets on our site, Clerk may set cookies on your device under their domain (e.g., <code>.clerk.com</code>). Below
        are some examples of cookies that Clerk typically uses (subject to change by Clerk at any time; refer to Clerk’s documentation for the most up-to-date information):
      </p>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-200 px-4 py-2">Cookie Name</th>
              <th className="border border-gray-200 px-4 py-2">Purpose</th>
              <th className="border border-gray-200 px-4 py-2">Expiration</th>
              <th className="border border-gray-200 px-4 py-2">Domain</th>
              <th className="border border-gray-200 px-4 py-2">Category</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-200 px-4 py-2">
                <code>_clerk_session</code>
              </td>
              <td className="border border-gray-200 px-4 py-2">
                Maintains the user’s authenticated session once logged in.
              </td>
              <td className="border border-gray-200 px-4 py-2">Session (browser close)</td>
              <td className="border border-gray-200 px-4 py-2">
                <code>.clerk.com</code>
              </td>
              <td className="border border-gray-200 px-4 py-2">Strictly Necessary</td>
            </tr>
            <tr>
              <td className="border border-gray-200 px-4 py-2">
                <code>__clerk_features</code>
              </td>
              <td className="border border-gray-200 px-4 py-2">
                Stores feature flags or experimental settings for Clerk’s widgets.
              </td>
              <td className="border border-gray-200 px-4 py-2">30 days</td>
              <td className="border border-gray-200 px-4 py-2">
                <code>.clerk.com</code>
              </td>
              <td className="border border-gray-200 px-4 py-2">Functional</td>
            </tr>
            <tr>
              <td className="border border-gray-200 px-4 py-2">
                <code>__clerk_ab_test</code>
              </td>
              <td className="border border-gray-200 px-4 py-2">
                Used to run A/B tests on the authentication flow to optimize performance.
              </td>
              <td className="border border-gray-200 px-4 py-2">14 days</td>
              <td className="border border-gray-200 px-4 py-2">
                <code>.clerk.com</code>
              </td>
              <td className="border border-gray-200 px-4 py-2">Performance & Analytics</td>
            </tr>
            <tr>
              <td className="border border-gray-200 px-4 py-2">
                <code>__clerk_csrf</code>
              </td>
              <td className="border border-gray-200 px-4 py-2">
                Contains a CSRF token to protect against cross-site request forgery attacks during authentication.
              </td>
              <td className="border border-gray-200 px-4 py-2">Session (browser close)</td>
              <td className="border border-gray-200 px-4 py-2">
                <code>.clerk.com</code>
              </td>
              <td className="border border-gray-200 px-4 py-2">Strictly Necessary</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p>
        <strong>Note:</strong> This table is for illustrative purposes. Clerk may modify cookie names or usage at any time. For the most current details, refer to Clerk’s Privacy & Cookie Policy:{' '}
        <a
          href="https://clerk.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          https://clerk.com/privacy
        </a>
      </p>

      <h2>5. How We Use Third-Party Cookies</h2>
      <h3>5.1 Authentication & Session Management</h3>
      <p>
        Clerk’s cookies authenticate you after you log in so that you remain signed in as you navigate our Services. Without these cookies, you would be logged out immediately after authentication.
      </p>

      <h3>5.2 Security & Fraud Prevention</h3>
      <p>
        Clerk uses certain cookies (e.g., CSRF tokens) to protect against unauthorized requests, session hijacking, and cross-site scripting (XSS) attacks.
      </p>

      <h3>5.3 Performance Monitoring (by Clerk)</h3>
      <p>
        Clerk may use analytics cookies to measure the performance and reliability of its authentication widgets (e.g., login latency, failure rates) in order to improve user experience.
      </p>

      <h2>6. Your Cookie Choices and Controls</h2>
      <p>
        Although we do not set any first-party cookies, you may still want to manage or block cookies from Clerk or other third parties. Below are some ways to control cookies:
      </p>
      <ul>
        <li>
          <strong>Browser Settings:</strong>
          Most web browsers allow you to view, manage, block, or delete cookies via your browser settings or preferences. Instructions vary by browser but typically can be found under options like “Privacy,” “Security,” or “Cookies.”
          <em> Important:</em> Blocking all cookies may prevent you from using our Services—specifically, you will not be able to log in or remain authenticated. If you choose to block third-party cookies, you may need to whitelist Clerk’s domain (
          <code>.clerk.com</code> ).
        </li>
        <li>
          <strong>Cookie Consent Tools:</strong>
          Because we do not directly use non-essential cookies, we do not display a cookie consent banner. However, if you use a browser extension or privacy-focused tool (e.g., Ghostery, Privacy Badger), ensure that you allow Clerk’s cookies if you
          intend to remain logged in.
        </li>
        <li>
          <strong>Device-Level Controls:</strong>
          On mobile devices, you can manage cookies in your mobile browser settings (e.g., Safari, Chrome). Keep in mind that deleting cookies will log you out of our Services.
        </li>
        <li>
          <strong>Clearing Existing Cookies:</strong>
          To clear cookies that Clerk or other providers have set, you can clear your browser’s cache and cookies. Note that this action will remove all website cookies, which may log you out of all sites, not just ours.
        </li>
      </ul>

      <h2>7. Changes to This Cookie Policy</h2>
      <p>
        We may update this Cookie Policy to reflect changes in our practices, applicable laws, or because Clerk modifies its own cookie usage.
      </p>
      <ul>
        <li>
          When we make changes to this policy, the updated version will be posted on this page with the revised “Effective Date.”
        </li>
        <li>We encourage you to review this Cookie Policy periodically to stay informed about how we use cookies.</li>
      </ul>

      <h2>8. Additional Information and Contact</h2>
      <p>For more information about cookies in general, or to learn how to manage them using your specific browser, visit:</p>
      <ul>
        <li>
          <a
            href="https://www.allaboutcookies.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            All About Cookies
          </a>
        </li>
        <li>
          <a
            href="https://youronlinechoices.eu/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Your Europe: Cookies
          </a>
        </li>
      </ul>
      <p>If you have any questions, concerns, or requests regarding this Cookie Policy, please contact us at:</p>
      <pre className="bg-gray-100 p-4 rounded text-black text-sm overflow-x-auto">
Support
Email: hello@support.cellilox.com
      </pre>

      <h2>Acknowledgment</h2>
      <p>
        By using our Services, you acknowledge that you have read, understood, and agree to the terms of this Cookie Policy. If you do not agree, please do not use our Services or disable Clerk’s cookies via your browser settings (noting that this will
        prevent authentication).
      </p>
    </article>
  );
}
