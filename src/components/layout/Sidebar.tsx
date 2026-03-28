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
    <aside className="w-64 border-r border-white/5 bg-bg-surface/50 backdrop-blur-md flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
            <Send className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-display font-bold text-white">Gemini Bridge</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {filteredItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
              location.pathname === item.path 
                ? "bg-brand-primary/10 text-brand-primary" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5 transition-transform group-hover:scale-110",
              location.pathname === item.path ? "text-brand-primary" : "text-slate-400"
            )} />
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button 
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
