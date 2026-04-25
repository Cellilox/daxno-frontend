import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Cellilox | Cookie Policy',
  description: 'How Cellilox uses cookies and similar technologies — including the cookies set by our authentication provider Clerk — and how to manage them.'
};

export default function CookiePolicyPage() {
  return (
    <article className="prose lg:prose-lg max-w-3xl mx-auto px-6 py-12">
      <h1>Cookie Policy</h1>
      <p>
        <strong>Effective Date:</strong> April 25, 2026
      </p>

      <hr />

      <h2>1. Introduction</h2>
      <p>
        This Cookie Policy explains how Cellilox Limited (&quot;Cellilox,&quot; &quot;Company,&quot; &quot;we,&quot;
        &quot;us,&quot; or &quot;our&quot;) uses cookies and similar technologies on the Cellilox website
        and web application (collectively, the &quot;Services&quot;). It is intended to be read
        alongside our{' '}
        <a href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</a>{' '}
        (in particular §10 of that policy) and our{' '}
        <a href="/terms-of-service" className="text-blue-600 hover:underline">Terms of Service</a>.
      </p>
      <p>
        Cellilox sets only a minimal set of strictly-necessary first-party cookies and
        relies primarily on its third-party authentication provider (Clerk) for session
        management. We do not use cookies for advertising or behavioral profiling.
      </p>

      <h2>2. What Are Cookies and Similar Technologies?</h2>
      <p>
        <strong>Cookies</strong> are small text files placed on your device when you visit a
        website. They allow the site to remember information about your visit so it can
        function correctly and improve subsequent visits.
      </p>
      <p>
        <strong>Web beacons (tracking pixels)</strong> are tiny invisible images embedded in
        web pages or emails that can record whether you opened a page or message.
      </p>
      <p>
        <strong>Local storage</strong> and <strong>session storage</strong> are browser-based
        storage mechanisms that the Services use to keep small amounts of state (such as
        your UI preferences) on your device between page loads.
      </p>
      <p>
        For brevity we refer to all of the above as &quot;cookies&quot; in this Policy.
      </p>

      <h2>3. Categories of Cookies We Use</h2>

      <h3>3.1 Strictly Necessary Cookies</h3>
      <p>
        These are required for the Services to function. They keep you authenticated,
        protect against cross-site request forgery, and remember the project or page you
        were viewing across page loads. You cannot opt out of strictly-necessary cookies
        without breaking the application.
      </p>
      <p>
        Sources: a small number of first-party cookies set by Cellilox (e.g. a Next.js
        session token, project context cookies) and the authentication cookies set by
        Clerk on its own domain (see §4).
      </p>

      <h3>3.2 Functional Cookies</h3>
      <p>
        These remember your preferences within the application (for example, the last
        selected billing tab, or the open/closed state of certain UI panels). They are
        used purely to improve your experience and are not shared with third parties.
      </p>

      <h3>3.3 Performance Cookies</h3>
      <p>
        Clerk may set a small number of cookies to measure the performance and reliability
        of its authentication widgets (login latency, error rates, A/B-test variant). We
        do not run our own analytics cookies on the Services.
      </p>

      <h3>3.4 Advertising and Targeting Cookies</h3>
      <p>
        We do <strong>not</strong> serve advertisements through the Services and we do not use
        advertising or targeting cookies. If you sign in through a social-login option that
        Clerk supports (e.g. Google), the social-login provider may set its own cookies on
        its own domain when you complete the sign-in flow. Those cookies are governed by
        the social-login provider&#39;s policies, not this Policy.
      </p>

      <h2>4. Third-Party Cookies — Clerk Authentication</h2>
      <p>
        Clerk is our authentication and session-management provider. When you sign in,
        register, or interact with Clerk&#39;s authentication widgets on Cellilox, Clerk may
        set cookies on its own domain (typically <code>.clerk.com</code> or a sub-domain
        delegated to us). The list below is illustrative — Clerk may add, remove, or
        rename cookies at any time. For the most current information, see{' '}
        <a
          href="https://clerk.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          clerk.com/privacy
        </a>.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-200 px-4 py-2">Cookie</th>
              <th className="border border-gray-200 px-4 py-2">Purpose</th>
              <th className="border border-gray-200 px-4 py-2">Expiration</th>
              <th className="border border-gray-200 px-4 py-2">Category</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-200 px-4 py-2"><code>__session</code> / <code>__client</code></td>
              <td className="border border-gray-200 px-4 py-2">Authenticates the active session and links the browser to the signed-in user.</td>
              <td className="border border-gray-200 px-4 py-2">Session or short-lived (typically &lt; 1 hour, refreshed)</td>
              <td className="border border-gray-200 px-4 py-2">Strictly Necessary</td>
            </tr>
            <tr>
              <td className="border border-gray-200 px-4 py-2"><code>__clerk_db_jwt</code></td>
              <td className="border border-gray-200 px-4 py-2">Stores a JWT used to verify your session against Clerk&#39;s backend.</td>
              <td className="border border-gray-200 px-4 py-2">Session</td>
              <td className="border border-gray-200 px-4 py-2">Strictly Necessary</td>
            </tr>
            <tr>
              <td className="border border-gray-200 px-4 py-2"><code>__clerk_csrf</code></td>
              <td className="border border-gray-200 px-4 py-2">CSRF protection for authentication actions.</td>
              <td className="border border-gray-200 px-4 py-2">Session</td>
              <td className="border border-gray-200 px-4 py-2">Strictly Necessary</td>
            </tr>
            <tr>
              <td className="border border-gray-200 px-4 py-2"><code>__clerk_features</code></td>
              <td className="border border-gray-200 px-4 py-2">Stores feature flags / experimental settings for Clerk widgets.</td>
              <td className="border border-gray-200 px-4 py-2">Up to 30 days</td>
              <td className="border border-gray-200 px-4 py-2">Functional</td>
            </tr>
            <tr>
              <td className="border border-gray-200 px-4 py-2"><code>__clerk_ab_test</code></td>
              <td className="border border-gray-200 px-4 py-2">A/B-test variant identifier used to optimize sign-in flows.</td>
              <td className="border border-gray-200 px-4 py-2">Up to 14 days</td>
              <td className="border border-gray-200 px-4 py-2">Performance</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>5. First-Party Cookies Set by Cellilox</h2>
      <p>
        Where we set cookies on the Cellilox domain itself, they are strictly-necessary
        and short-lived. They include:
      </p>
      <ul>
        <li>
          A session/identity token issued by our application after Clerk verifies you, used
          server-side by our Next.js application during the request lifecycle.
        </li>
        <li>
          A project-context cookie that remembers which project you are viewing so that
          page navigations resolve the correct workspace.
        </li>
        <li>
          A small UI-preference cookie (open/closed state of certain panels, last-selected
          billing tab, etc.).
        </li>
      </ul>
      <p>
        We do not run analytics cookies, advertising cookies, or behavioral-profiling
        cookies on the Cellilox domain.
      </p>

      <h2>6. Why We Use Cookies</h2>
      <ul>
        <li><strong>Authentication and session management</strong> — keep you signed in across page loads and devices.</li>
        <li><strong>Security and fraud prevention</strong> — CSRF tokens, abuse-detection counters.</li>
        <li><strong>Functionality</strong> — remember UI preferences and the project you are working on.</li>
        <li><strong>Performance monitoring (Clerk)</strong> — measure the reliability of authentication.</li>
      </ul>

      <h2>7. Your Choices and Controls</h2>
      <ul>
        <li>
          <strong>Browser settings.</strong> Most browsers let you view, block, or delete cookies
          in their privacy/security preferences. Blocking strictly-necessary cookies will
          prevent you from signing in or staying signed in.
        </li>
        <li>
          <strong>Privacy extensions.</strong> If you use a tool like Ghostery, Privacy Badger,
          or uBlock Origin, allow cookies from <code>clerk.com</code> (and any Clerk
          subdomain we use) so authentication works.
        </li>
        <li>
          <strong>Mobile devices.</strong> Use your mobile browser&#39;s privacy settings to manage
          cookies. Deleting them will sign you out of the Services.
        </li>
        <li>
          <strong>Clearing existing cookies.</strong> Clearing your browser cache and cookies
          will remove all cookies for all sites, including Cellilox and Clerk; you will
          need to sign back in.
        </li>
      </ul>
      <p>
        Because we do not use non-essential cookies (analytics, advertising, profiling),
        we do not display a cookie-consent banner.
      </p>

      <h2>8. Changes to This Cookie Policy</h2>
      <p>
        We may update this Cookie Policy from time to time to reflect changes in our
        cookie usage, in third-party providers (such as Clerk), or in applicable law.
      </p>
      <ul>
        <li>
          <strong>Non-material changes</strong> — clarifying language, typographical
          corrections, or updates to the illustrative cookie list — take effect when the
          revised Policy is posted on this page.
        </li>
        <li>
          <strong>Material changes</strong> — for example, adding a new category of cookie
          (such as analytics) or a new third-party cookie source — will not take effect
          for at least thirty (30) days after we notify you. Notice will be given by email
          to the address on your account and/or by a prominent in-app notice.
        </li>
        <li>
          The &quot;Effective Date&quot; at the top of this Policy will be updated to reflect each
          change. Continuing to use the Services after the Effective Date constitutes
          acceptance of the revised Policy.
        </li>
      </ul>

      <h2>9. Additional Resources and Contact</h2>
      <p>For general information about cookies and how to manage them in your browser:</p>
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
            Your Online Choices (EU)
          </a>
        </li>
      </ul>
      <p>For questions about this Cookie Policy, contact us:</p>
      <pre className="bg-gray-100 p-4 rounded text-black text-sm overflow-x-auto">
Cellilox Limited
Privacy &amp; Data Protection
Email: hello@support.cellilox.com
Registered office: Republic of Rwanda
      </pre>

      <h2>Acknowledgment</h2>
      <p>
        By using the Services, you acknowledge that you have read and understood this
        Cookie Policy. If you do not agree, do not use the Services or, where possible,
        disable Clerk&#39;s authentication cookies in your browser — note that doing so will
        prevent you from signing in.
      </p>
    </article>
  );
}
