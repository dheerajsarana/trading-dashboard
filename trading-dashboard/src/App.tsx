import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { checkAuth } from './store/authSlice';
import { cn } from './lib/utils';
import Sidebar from './components/Sidebar';
import AnalyticsMenu from './components/menus/AnalyticsMenu';
import TradesPage from './components/pages/TradesPage';
import JournalPage from './components/pages/JournalPage';
import BacktestPage from './components/pages/BacktestPage';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ThemeToggle from './components/ThemeToggle';
import { Toaster } from './components/ui/toaster';
import { BarChart3 } from 'lucide-react';

const menus = [
  {
    id: "analytics",
    path: "/dashboard/analytics",
    component: <AnalyticsMenu />
  },
  {
    id: "trades",
    path: "/dashboard/trades",
    component: <TradesPage />
  },
  {
    id: "journal",
    path: "/dashboard/journal",
    component: <JournalPage />
  },
  {
    id: "backtest",
    path: "/dashboard/backtest",
    component: <BacktestPage />
  }
]

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSidebarOpen } = useAppSelector((state) => state.trading);

  const activeMenu = menus.find(m => location.pathname.startsWith(m.path))?.id || 'analytics';

  const setMenu = (sectionId: string) => {
    const menu = menus.find(m => m.id === sectionId);
    if (menu) {
      navigate(menu.path);
    }
  };

  const getPageInfo = () => {
    switch (activeMenu) {
      case 'analytics':
        return { title: 'Analytics', description: 'Track performance and uncover patterns' };
      case 'trades':
        return { title: 'Trades', description: 'View and manage your trade history' };
      case 'journal':
        return { title: 'Journal', description: 'Document and review your decisions' };
      case 'backtest':
        return { title: 'FX Replay', description: 'Practice with historical price data' };
      default:
        return { title: 'Dashboard', description: 'Your trading overview' };
    }
  };

  const { title: pageTitle, description: pageDescription } = getPageInfo();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeSection={activeMenu} onMenuChange={setMenu} />

      <div
        className={cn(
          'transition-all duration-300 min-h-screen',
          isSidebarOpen ? 'ml-72' : 'ml-0'
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-xl">
          <div className="container flex h-14 items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-lg font-bold tracking-tight leading-none">{pageTitle}</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {pageDescription}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="container py-6 page-enter">
          {children}
        </div>
      </div>
    </div>
  );
}

function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-5 w-5 text-primary animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground">Loading TradeLens...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Routes>
                  <Route path="analytics" element={<AnalyticsMenu />} />
                  <Route path="trades" element={<TradesPage />} />
                  <Route path="journal" element={<JournalPage />} />
                  <Route path="backtest" element={<BacktestPage />} />
                  <Route path="" element={<Navigate to="/dashboard/analytics" replace />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        >
          <Route path="*" element={<Navigate to="/dashboard/analytics" replace />} />
        </Route>

        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard/analytics" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
