"use client";

import React from "react";
import { Search, Bell, Settings, User } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function Navbar() {
  const { user } = useAuth();

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex-1 max-w-md">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0D9488] transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search baggage ID or client..." 
            className="w-full h-11 pl-12 pr-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] transition-all text-sm font-medium"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-slate-500 hover:text-slate-800 transition-colors">
          <Bell size={22} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
        </button>
        <button className="p-2 text-slate-500 hover:text-slate-800 transition-colors">
          <Settings size={22} />
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200 shadow-sm">
            <User size={18} />
          </div>
          <p className="text-sm font-bold text-slate-800 hidden sm:block">
            {user?.name || "Admin"}
          </p>
        </div>
      </div>
    </header>
  );
}
