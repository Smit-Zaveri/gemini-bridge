import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileWarning, 
  Stethoscope, 
  Send, 
  LogOut,
  User as UserIcon
} from "lucide-react";
import { cn } from "../../lib/utils";
import { UserRole } from "../../types";

interface SidebarProps {
  role?: UserRole;
  onLogout: () => void;
}

export function Sidebar({ role, onLogout }: SidebarProps) {
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard", roles: [UserRole.RESPONDER, UserRole.ADMIN] },
    { name: "Report", icon: FileWarning, path: "/report", roles: [UserRole.CIVILIAN, UserRole.RESPONDER, UserRole.ADMIN] },
    { name: "Medical", icon: Stethoscope, path: "/medical", roles: [UserRole.NURSE, UserRole.ADMIN] },
    { name: "Dispatch", icon: Send, path: "/dispatch", roles: [UserRole.RESPONDER, UserRole.ADMIN] },
  ];

  const filteredItems = menuItems.filter(item => !role || item.roles.includes(role));

  return (
    <aside className="w-64 border-r-4 border-text-main bg-bg-surface flex flex-col h-screen sticky top-0 z-40">
      <div className="p-6 border-b-4 border-text-main bg-brand-primary">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-bg-surface border-2 border-text-main shadow-[2px_2px_0px_0px_#1C293C] flex items-center justify-center">
            <Send className="w-6 h-6 text-text-main stroke-[3]" />
          </div>
          <span className="text-xl font-display font-black text-text-main uppercase tracking-tight">Gemini Bridge</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-4 pt-8 overflow-y-auto">
        {filteredItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-4 py-3 border-4 border-transparent font-bold transition-all group",
              location.pathname === item.path 
                ? "bg-brand-primary text-text-main border-text-main shadow-[4px_4px_0px_0px_#1C293C] -translate-y-1 -translate-x-1" 
                : "text-text-main/70 hover:text-text-main hover:bg-brand-secondary/10 hover:border-text-main hover:shadow-[4px_4px_0px_0px_#1C293C] hover:-translate-y-1 hover:-translate-x-1"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5 transition-transform stroke-[2.5] group-hover:scale-110",
              location.pathname === item.path ? "text-text-main" : "text-text-main/70 group-hover:text-text-main"
            )} />
            <span className="text-sm uppercase tracking-wider">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t-4 border-text-main bg-bg-base">
        <button 
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 w-full border-4 border-text-main bg-bg-surface text-text-main font-bold shadow-[4px_4px_0px_0px_#1C293C] hover:bg-crit-critical hover:text-white transition-all hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_#1C293C] active:translate-y-0 active:translate-x-0 active:shadow-none"
        >
          <LogOut className="w-5 h-5 stroke-[2.5]" />
          <span className="text-sm uppercase tracking-wider">Logout</span>
        </button>
      </div>
    </aside>
  );
}
