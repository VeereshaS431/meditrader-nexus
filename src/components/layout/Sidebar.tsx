import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, Building2, ShoppingCart, Store, TrendingUp,
  FileText, BarChart3, Settings, Pill, LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Medicines", href: "/medicines", icon: Pill },
  { name: "Vendors", href: "/vendors", icon: Building2 },
  { name: "Purchases", href: "/purchases", icon: ShoppingCart },
  { name: "Medical Shops", href: "/shops", icon: Store },
  { name: "Sales", href: "/sales", icon: TrendingUp },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  onLogout?: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  return (
    <div className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
          <Pill className="h-6 w-6 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-sidebar-foreground">MediTrade</h1>
          <p className="text-xs text-sidebar-foreground/70">Manager</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-4 space-y-2">
        <div className="rounded-lg bg-sidebar-accent/30 p-3">
          <p className="text-xs font-medium text-sidebar-foreground">Logged in as admin</p>
          <p className="mt-0.5 text-xs text-sidebar-foreground/60">MediTrade Manager</p>
        </div>
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-all"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        )}
      </div>
    </div>
  );
}
