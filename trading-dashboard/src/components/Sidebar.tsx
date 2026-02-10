import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import {
  BarChart3,
  TrendingDown,
  Clock,
  Globe,
  Calendar,
  Target,
  Award,
  LineChart,
  PanelLeftClose,
  PanelLeft,
  List,
  BookOpen,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { toggleSidebar } from "../store/tradingSlice";

interface SidebarProps {
  activeSection: string;
  onMenuChange: (section: string) => void;
}

const Sidebar = ({ activeSection, onMenuChange }: SidebarProps) => {
  const dispatch = useAppDispatch();
  const isSidebarOpen = useAppSelector((state) => state.trading.isSidebarOpen);

  const menuItems = [
    // { id: "overview", label: "Dashboard", icon: BarChart3 },
    { id: "analytics", label: "Analytics", icon: LineChart },
    { id: "trades", label: "Trades", icon: List },
    { id: "journal", label: "Journal", icon: BookOpen },
  ];

  return (
    <>
      {/* Sidebar Toggle Button - Fixed position */}
      {!isSidebarOpen && <Button
        variant="ghost"
        size="icon"
        onClick={() => dispatch(toggleSidebar())}
        className="fixed top-4 left-4 z-50 bg-card border hover:bg-muted"
      >
        <PanelLeft className="h-5 w-5" />
      </Button>}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-72 border-r bg-card transition-transform duration-300",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col gap-2">
          {/* Logo/Header */}
          <div className="flex h-16 items-center justify-between border-b pl-4 pr-2">
            <div className="flex h-16 items-center">
              <BarChart3 className="mr-2 h-6 w-6 text-blue-500" />
              <span className="text-lg font-semibold">Trading Analytics</span>
            </div>
            {isSidebarOpen && <Button
              variant="ghost"
              size="icon"
              onClick={() => dispatch(toggleSidebar())}
              className="z-50 bg-card border hover:bg-muted"
            >
              <PanelLeftClose className="h-5 w-5" />
            </Button>}
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-2 text-sm font-medium">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className={cn(
                      "justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-muted",
                      activeSection === item.id && "bg-muted text-blue-500"
                    )}
                    onClick={() => onMenuChange(item.id)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>

            <Separator className="my-4" />
          </div>

          {/* Footer */}
          <div className="border-t p-4">
            <p className="text-xs text-muted-foreground text-center">
              © 2026 Trading Dashboard
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;