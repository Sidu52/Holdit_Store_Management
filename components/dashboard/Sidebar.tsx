"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  PlusCircle,
  LogOut
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "../../lib/utils";
import { NAVIGATION_ITEMS } from "../../lib/navigation";
import { useRouter } from "next/navigation";
import { serverLogout } from "../../app/actions/logout";


export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { role, user, mutate } = useAuth();

  const links = NAVIGATION_ITEMS.filter(item => item.roles.includes(role || ""));

  const handleLogout = async () => {
    try {
      await serverLogout(role || "");
      mutate(null, false); // Clear SWR cache
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col sticky top-0">
      <div className="px-6 my-6">
        <div className="bg-[#EAFBF6] p-3 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0D9488] flex items-center justify-center text-white font-bold">
            {user?.store_name?.charAt(0) || user?.first_name?.charAt(0) || "S"}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-800 truncate">
              {user?.store_name 
                ? user.store_name 
                : (user?.first_name || user?.last_name)
                  ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
                  : "Cloak Room"}
            </p>
            <p className="text-[10px] font-bold text-[#0D9488] uppercase tracking-wider">
              {role === "store_owner" ? "Store Owner" : "Store Manager"}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                isActive 
                  ? "bg-[#0D9488] text-white shadow-lg shadow-[#0D9488]/20" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              )}
            >
              <link.icon size={20} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 flex flex-col gap-2">
        {role === "store_owner" && (
          <button 
            onClick={() => router.push("/dashboard/stores")}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold text-white bg-[#0D9488] hover:bg-[#0F766E] transition-all"
          >
            <PlusCircle size={20} />
            Add New Location
          </button>
        )}
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all mt-2"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}
