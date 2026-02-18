import { Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container flex h-14 items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            <span className="text-base font-bold tracking-tight">TradeLens</span>
          </Link>
        </div>
      </header>

      <main className="container max-w-3xl py-12 prose prose-sm dark:prose-invert">
        <h1>Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: February 18, 2026</p>

        <h2>1. Introduction</h2>
        <p>
          TradeLens ("we", "us", "our") respects your privacy. This Privacy Policy explains how we
          collect, use, and protect your information when you use our trading analytics platform.
        </p>

        <h2>2. Information We Collect</h2>
        <h3>Account Information</h3>
        <p>
          When you register, we collect your email address, name, and password (stored as a
          cryptographic hash — we never store plain-text passwords).
        </p>

        <h3>Trading Data</h3>
        <p>
          You may upload trading history (trade entries, exits, P&L, symbols, etc.). This data is
          stored securely and used solely to provide analytics within your account.
        </p>

        <h3>Payment Information</h3>
        <p>
          Payment processing is handled by Paddle.com (our Merchant of Record). We do not store
          your credit card details. Paddle may collect payment information in accordance with their
          privacy policy.
        </p>

        <h3>Usage Data</h3>
        <p>
          We collect basic usage data (page views, feature usage) to improve the Service. We do not
          use third-party tracking or advertising cookies.
        </p>

        <h2>3. How We Use Your Information</h2>
        <ul>
          <li>To provide and maintain the Service</li>
          <li>To calculate trading analytics and statistics</li>
          <li>To process subscription payments (via Paddle)</li>
          <li>To send account-related communications (password resets, billing notices)</li>
          <li>To improve the Service</li>
        </ul>

        <h2>4. Data Sharing</h2>
        <p>We do <strong>not</strong> sell, rent, or share your personal data or trading data with third parties, except:</p>
        <ul>
          <li><strong>Paddle.com</strong> — for payment processing only</li>
          <li><strong>Legal requirements</strong> — if required by law or legal process</li>
        </ul>

        <h2>5. Data Security</h2>
        <p>
          We implement industry-standard security measures including encrypted connections (HTTPS),
          hashed passwords (bcrypt), and secure database access. However, no method of transmission
          over the Internet is 100% secure.
        </p>

        <h2>6. Data Retention</h2>
        <p>
          Your data is retained as long as your account is active. If you delete your account, all
          associated data (trading history, journals, analytics) will be permanently deleted within
          30 days.
        </p>

        <h2>7. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access your personal data</li>
          <li>Export your trading data</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your account and data</li>
          <li>Withdraw consent for data processing</li>
        </ul>

        <h2>8. Cookies</h2>
        <p>
          We use essential cookies for authentication (JWT tokens stored in cookies/localStorage).
          We do not use advertising or tracking cookies.
        </p>

        <h2>9. Children's Privacy</h2>
        <p>
          The Service is not intended for users under 18. We do not knowingly collect data from
          minors.
        </p>

        <h2>10. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify users of material
          changes via email or in-app notification.
        </p>

        <h2>11. Contact</h2>
        <p>
          For privacy-related questions, contact us at{' '}
          <a href="mailto:support@tradelens.app">support@tradelens.app</a>.
        </p>
      </main>
    </div>
  );
}
