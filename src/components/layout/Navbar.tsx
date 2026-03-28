import { Link } from "react-router-dom";
import { User as UserIcon, Bell, Search } from "lucide-react";
import { UserProfile } from "../../types";

interface NavbarProps {
  user?: UserProfile | null;
}

export function Navbar({ user }: NavbarProps) {
  return (
    <header className="h-20 border-b-4 border-text-main bg-brand-primary flex items-center justify-between px-8 sticky top-0 z-50">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-main font-bold z-10 transition-transform group-focus-within:-translate-y-1 group-focus-within:-translate-x-1" />
          <input 
            type="text" 
            aria-label="Search incidents, victims, or locations"
            placeholder="Search incidents, victims, or locations..." 
            className="w-full bg-bg-surface border-4 border-text-main shadow-[4px_4px_0px_0px_#1C293C] rounded-none pl-12 pr-4 py-3 text-sm font-bold text-text-main focus:outline-none focus:ring-0 focus:-translate-y-1 focus:-translate-x-1 focus:shadow-[8px_8px_0px_0px_#1C293C] transition-all placeholder:text-text-main/70"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button aria-label="Notifications" className="relative p-2 text-text-main hover:-translate-y-1 transition-transform">
          <Bell className="w-6 h-6 stroke-[3]" aria-hidden="true" />
          <span className="absolute top-1 right-1 w-3 h-3 bg-crit-critical border-2 border-text-main"></span>
        </button>

        <div className="flex items-center gap-3 pl-6 border-l-4 border-text-main h-10">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-text-main leading-none">{user?.displayName || "Guest"}</p>
            <p className="text-xs font-bold text-text-main/80 capitalize mt-1">{user?.role || "Visitor"}</p>
          </div>
          <div className="w-12 h-12 bg-bg-surface border-4 border-text-main shadow-[2px_2px_0px_0px_#1C293C] flex items-center justify-center overflow-hidden">
            {user?.displayName ? (
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-6 h-6 text-text-main stroke-[3]" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
