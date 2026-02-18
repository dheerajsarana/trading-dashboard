import { useAppSelector } from '../store/hooks';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Lock } from 'lucide-react';

interface SubscriptionGateProps {
  children: React.ReactNode;
  feature?: string;
}

export default function SubscriptionGate({ children, feature = 'This feature' }: SubscriptionGateProps) {
  const { plan } = useAppSelector((state) => state.subscription);
  const navigate = useNavigate();

  if (plan === 'pro') {
    return <>{children}</>;
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Lock className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Pro Feature</h2>
            <p className="text-sm text-muted-foreground mt-2">
              {feature} is available with TradeLens Pro. Upgrade to unlock full analytics, journaling, and more.
            </p>
          </div>
          <Button onClick={() => navigate('/dashboard/pricing')} className="w-full">
            Upgrade to Pro — $15/mo
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
