import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { cancelSubscription, fetchSubscriptionStatus, setPlan } from '../../store/subscriptionSlice';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Check } from 'lucide-react';

declare global {
  interface Window {
    Paddle?: any;
  }
}

const features = [
  'Full Analytics Dashboard',
  'Trade Journal & Notes',
  'Session Kill-Zone Analysis',
  'Drawdown Intelligence',
  'Equity Curve Tracking',
  'Calendar Heatmap',
  'Advanced Trade Filters',
  'Unlimited Trade History',
];

export default function PricingPage() {
  const dispatch = useAppDispatch();
  const { plan, isActive, expiresAt, isLoading } = useAppSelector((state) => state.subscription);
  const { user } = useAppSelector((state) => state.auth);

  // Load Paddle.js
  useEffect(() => {
    if (window.Paddle) return;

    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    script.async = true;
    script.onload = () => {
      const paddleEnv = import.meta.env.VITE_PADDLE_ENVIRONMENT;
      if (paddleEnv === 'sandbox') {
        window.Paddle?.Environment?.set('sandbox');
      }
      window.Paddle?.Initialize({
        token: import.meta.env.VITE_PADDLE_CLIENT_TOKEN,
        eventCallback: (event: any) => {
          if (event.name === 'checkout.completed') {
            // Refresh subscription status after successful checkout
            setTimeout(() => {
              dispatch(fetchSubscriptionStatus());
              dispatch(setPlan('pro'));
            }, 2000);
          }
        },
      });
    };
    document.head.appendChild(script);
  }, [dispatch]);

  const handleSubscribe = useCallback(() => {
    if (!window.Paddle) {
      console.error('Paddle.js not loaded');
      return;
    }

    window.Paddle.Checkout.open({
      items: [{ priceId: import.meta.env.VITE_PADDLE_PRICE_ID, quantity: 1 }],
      customer: { email: user?.email },
      customData: { userId: user?.id },
    });
  }, [user]);

  const handleCancel = () => {
    dispatch(cancelSubscription());
  };

  return (
    <div className="max-w-lg mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">TradeLens Pro</h1>
        <p className="text-muted-foreground mt-2">
          Unlock the full power of your trading analytics
        </p>
      </div>

      <Card className="border-primary/50">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-lg">Pro Plan</CardTitle>
          <div className="mt-2">
            <span className="text-4xl font-bold">$15</span>
            <span className="text-muted-foreground">/month</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <ul className="space-y-3">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <Check className="h-3 w-3 text-green-500" />
                </div>
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          {isActive ? (
            <div className="space-y-3">
              <div className="text-center p-3 bg-green-500/10 rounded-lg">
                <p className="text-sm font-medium text-green-600">Active Pro Subscription</p>
                {expiresAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Renews {new Date(expiresAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel Subscription
              </Button>
            </div>
          ) : (
            <Button
              className="w-full"
              size="lg"
              onClick={handleSubscribe}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Subscribe Now'}
            </Button>
          )}
        </CardContent>
      </Card>

      {plan === 'free' && (
        <p className="text-center text-xs text-muted-foreground mt-6">
          Free plan includes: Dashboard overview and trade management.
          <br />
          Upgrade anytime to access all Pro features.
        </p>
      )}
    </div>
  );
}
