import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { checkAuth, logoutUser } from './store/authSlice';
import { cn } from './lib/utils';
import Sidebar from './components/Sidebar';
import AnalyticsMenu from './components/menus/AnalyticsMenu';
import TradesPage from './components/pages/TradesPage';
import JournalPage from './components/pages/JournalPage';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ThemeToggle from './components/ThemeToggle';
import { Button } from './components/ui/button';

const menus = [
  // {
  //   id: "overview",
  //   path: "/dashboard/overview",
  //   component: <DashboardPage />
  // },
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
  }
]

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isSidebarOpen } = useAppSelector((state) => state.trading);
  const { user } = useAppSelector((state) => state.auth);

  // Determine active menu from current path
  const activeMenu = menus.find(m => location.pathname.startsWith(m.path))?.id || 'analytics';

  const setMenu = (sectionId: string) => {
    const menu = menus.find(m => m.id === sectionId);
    if (menu) {
      navigate(menu.path);
    }
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
  };

  const getPageInfo = () => {
    switch (activeMenu) {
      case 'overview':
        return {
          title: 'Dashboard',
          description: 'Quick overview of your trading performance'
        };
      case 'analytics':
        return {
          title: 'Performance Analytics',
          description: 'Analyze your trading patterns and improve your strategy'
        };
      case 'trades':
        return {
          title: 'Trades Management',
          description: 'Manage your trades and MT5 accounts'
        };
      case 'journal':
        return {
          title: 'Trade Journal',
          description: 'Document and reflect on your trading decisions'
        };
      default:
        return {
          title: 'Dashboard',
          description: 'Quick overview of your trading performance'
        };
    }
  };

  const { title: pageTitle, description: pageDescription } = getPageInfo();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeSection={activeMenu} onMenuChange={setMenu} />

      {/* Main Content */}
      <div
        className={cn(
          'transition-all duration-300',
          isSidebarOpen ? 'ml-72' : 'ml-0'
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{pageTitle}</h1>
              <p className="text-sm text-muted-foreground">
                {pageDescription}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user?.email}
              </span>
              <ThemeToggle />
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="container py-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  // Check authentication on mount
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />

        {/* Protected dashboard routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Routes>
                  {/* <Route path="overview" element={<DashboardPage />} /> */}
                  <Route path="analytics" element={<AnalyticsMenu />} />
                  <Route path="trades" element={<TradesPage />} />
                  <Route path="journal" element={<JournalPage />} />
                  <Route path="" element={<Navigate to="/dashboard/overview" replace />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        >
          <Route path="*" element={<Navigate to="/dashboard/overview" replace />} />
        </Route>

        {/* Default route */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard/overview" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;