import { ReactNode, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Shield, Map, Radio, FileWarning, Users, LogOut,
  ChevronLeft, ChevronRight, LayoutDashboard, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  icon: typeof Shield;
  path: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Threat Map", icon: Map, path: "/threats" },
  { label: "Comms Monitor", icon: Radio, path: "/communications" },
  { label: "Incidents", icon: FileWarning, path: "/incidents" },
  { label: "User Management", icon: Users, path: "/admin/users", adminOnly: true },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { profile, isAdmin, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const filteredNav = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "h-screen sticky top-0 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
          <Shield className="w-7 h-7 text-primary flex-shrink-0" />
          {!collapsed && (
            <span className="font-bold text-sm tracking-wider">ATIEWS</span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {filteredNav.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                  active
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User info & collapse */}
        <div className="border-t border-sidebar-border p-3 space-y-2">
          {!collapsed && (
            <div className="px-2 mb-2">
              <p className="text-sm font-medium truncate">{profile?.full_name}</p>
              <p className="text-xs text-muted-foreground font-mono">
                {isAdmin ? "ADMIN" : "OPERATOR"}
              </p>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="text-muted-foreground hover:text-foreground"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
            {!collapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-destructive flex-1 justify-start gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 sticky top-0 bg-background/80 backdrop-blur-xl z-10">
          <div>
            <h2 className="font-semibold text-sm">
              {filteredNav.find((n) => n.path === location.pathname)?.label || "Dashboard"}
            </h2>
            <p className="text-xs text-muted-foreground font-mono">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </Button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 border border-border/50">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-mono text-muted-foreground">SYSTEM ONLINE</span>
            </div>
          </div>
        </header>

        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
