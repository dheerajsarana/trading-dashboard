import { Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';

export default function TermsPage() {
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
        <h1>Terms and Conditions</h1>
        <p className="text-muted-foreground">Last updated: February 18, 2026</p>

        <h2>1. Agreement to Terms</h2>
        <p>
          By accessing or using TradeLens ("the Service"), you agree to be bound by these Terms and
          Conditions. If you do not agree, do not use the Service.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          TradeLens is a trading analytics and journaling platform. The Service allows users to
          upload, analyze, and review their trading history. TradeLens does <strong>not</strong> provide
          financial advice, execute trades, manage funds, or act as a broker, dealer, or investment
          advisor. The Service is purely an analytical and record-keeping tool.
        </p>

        <h2>3. No Financial Advice</h2>
        <p>
          Nothing on TradeLens constitutes financial, investment, or trading advice. All analytics,
          statistics, and metrics are provided for informational and educational purposes only. You
          are solely responsible for your trading decisions. Past performance shown in the Service
          does not guarantee future results.
        </p>

        <h2>4. Account Registration</h2>
        <p>
          You must provide accurate information when creating an account. You are responsible for
          maintaining the confidentiality of your credentials and for all activity under your account.
        </p>

        <h2>5. Subscription and Payments</h2>
        <p>
          TradeLens offers a free tier and a paid Pro subscription. Payments are processed by
          Paddle.com (our Merchant of Record). By subscribing, you agree to Paddle's terms of
          service. Subscriptions renew automatically each billing period unless cancelled. You can
          cancel your subscription at any time; access continues until the end of the current billing
          period.
        </p>

        <h2>6. Refund Policy</h2>
        <p>
          If you are not satisfied with TradeLens Pro, you may request a refund within 7 days of
          your initial purchase. Refund requests should be sent to support. Subsequent billing cycle
          charges are non-refundable but you may cancel to prevent future charges.
        </p>

        <h2>7. User Data</h2>
        <p>
          You retain ownership of all trading data you upload to TradeLens. We do not sell, share,
          or distribute your trading data to third parties. You may export or delete your data at any
          time.
        </p>

        <h2>8. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Service for any unlawful purpose</li>
          <li>Attempt to gain unauthorized access to the Service</li>
          <li>Interfere with or disrupt the Service</li>
          <li>Resell or redistribute the Service without permission</li>
        </ul>

        <h2>9. Limitation of Liability</h2>
        <p>
          TradeLens is provided "as is" without warranties of any kind. We are not liable for any
          trading losses, data loss, or damages arising from use of the Service. Our total liability
          is limited to the amount you paid for the Service in the 12 months preceding the claim.
        </p>

        <h2>10. Modifications</h2>
        <p>
          We may update these Terms from time to time. Continued use of the Service after changes
          constitutes acceptance of the updated Terms. We will notify users of material changes via
          email or in-app notification.
        </p>

        <h2>11. Termination</h2>
        <p>
          We may suspend or terminate your account if you violate these Terms. You may delete your
          account at any time by contacting support.
        </p>

        <h2>12. Contact</h2>
        <p>
          For questions about these Terms, contact us at{' '}
          <a href="mailto:support@tradelens.app">support@tradelens.app</a>.
        </p>
      </main>
    </div>
  );
}
