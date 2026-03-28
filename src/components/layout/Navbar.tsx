import { Link } from "react-router-dom";
import { User as UserIcon, Bell, Search } from "lucide-react";
import { UserProfile } from "../../types";

interface NavbarProps {
  user?: UserProfile | null;
}

export function Navbar({ user }: NavbarProps) {
  return (
    <header className="h-16 border-b border-white/5 bg-bg-base/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-50">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search incidents, victims, or locations..." 
            className="w-full bg-bg-elevated border border-white/5 rounded-full pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-bg-base"></span>
        </button>

        <div className="flex items-center gap-3 pl-6 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white leading-none">{user?.displayName || "Guest"}</p>
            <p className="text-xs text-slate-500 capitalize mt-1">{user?.role || "Visitor"}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-bg-elevated border border-white/10 flex items-center justify-center overflow-hidden">
            {user?.displayName ? (
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} alt="avatar" />
            ) : (
              <UserIcon className="w-5 h-5 text-slate-500" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
