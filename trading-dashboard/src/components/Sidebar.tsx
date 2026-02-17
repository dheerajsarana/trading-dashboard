import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
  BarChart3,
  LineChart,
  PanelLeftClose,
  PanelLeft,
  List,
  BookOpen,
  PlayCircle,
  LogOut,
  User,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { toggleSidebar } from "../store/tradingSlice";
import { logoutUser } from "../store/authSlice";

interface SidebarProps {
  activeSection: string;
  onMenuChange: (section: string) => void;
}

const Sidebar = ({ activeSection, onMenuChange }: SidebarProps) => {
  const dispatch = useAppDispatch();
  const isSidebarOpen = useAppSelector((state) => state.trading.isSidebarOpen);
  const { user } = useAppSelector((state) => state.auth);

  const menuItems = [
    { id: "analytics", label: "Analytics", icon: LineChart, description: "Performance metrics" },
    { id: "trades", label: "Trades", icon: List, description: "Trade history" },
    { id: "journal", label: "Journal", icon: BookOpen, description: "Trade notes" },
    { id: "backtest", label: "FX Replay", icon: PlayCircle, description: "Practice trading" },
  ];

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <>
      {/* Sidebar Toggle Button - Fixed position */}
      {!isSidebarOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch(toggleSidebar())}
          className="fixed top-2 left-4 z-50 bg-card border shadow-sm hover:bg-muted"
        >
          <PanelLeft className="h-5 w-5" />
        </Button>
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-72 border-r bg-card transition-transform duration-300 flex flex-col",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo/Header */}
        <div className="flex h-14 items-center justify-between px-5 border-b flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            <span className="text-base font-bold tracking-tight">TradeLens</span>
          </div>
          {isSidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => dispatch(toggleSidebar())}
              className="h-8 w-8 hover:bg-muted"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-auto py-4 px-3">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
            Menu
          </p>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                    isActive
                      ? "bg-primary/10 text-primary font-medium nav-active"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                  onClick={() => onMenuChange(item.id)}
                >
                  <Icon className={cn("h-[18px] w-[18px]", isActive && "text-primary")} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile Footer */}
        <div className="border-t p-3 flex-shrink-0">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.name || user?.email?.split('@')[0] || 'Trader'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email || ''}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-8 w-8 text-muted-foreground hover:text-loss hover:bg-loss/10 flex-shrink-0"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
