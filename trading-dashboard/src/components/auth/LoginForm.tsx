import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginUser, clearError } from '../../store/authSlice';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { Eye, EyeOff, BarChart3, TrendingUp, Shield, Zap } from 'lucide-react';

export default function LoginForm() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard/analytics');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      await dispatch(loginUser({ email, password })).unwrap();
      navigate('/dashboard/analytics');
    } catch (err: any) {
      console.error('Login failed:', err);
      toast({
        title: 'Login Failed',
        description: err || error || 'Invalid credentials. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden gradient-mesh">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight">TradeLens</span>
          </div>

          {/* Hero Content */}
          <div className="max-w-lg">
            <h1 className="text-5xl font-bold leading-tight tracking-tight mb-6">
              Trade smarter,<br />
              <span className="text-primary">not harder.</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-10">
              Analyze your MT5 trades, track performance across sessions, and uncover patterns that move your P&L.
            </p>

            {/* Feature pills */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-profit/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-4 w-4 text-profit" />
                </div>
                <span className="text-muted-foreground">Equity curves, drawdown analysis & session kill-zones</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-forex/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="h-4 w-4 text-forex" />
                </div>
                <span className="text-muted-foreground">FX Replay — practice with real historical candles</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-crypto/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-4 w-4 text-crypto" />
                </div>
                <span className="text-muted-foreground">Trade journaling with screenshots & execution checklists</span>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <p className="text-xs text-muted-foreground/60">
            Built for forex & crypto traders
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight">TradeLens</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Sign in to your trading dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 text-sm text-loss bg-loss/10 border border-loss/20 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="input-base"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="input-base pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-medium"
              disabled={isLoading || !email || !password}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Create one
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
