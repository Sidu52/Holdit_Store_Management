"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, Users, Home, Menu, X, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { hasAccess, mockUser } from "@/lib/permissions";

const navItems = [
  { name: "Dashboard", href: "/", icon: Home, permission: "view_dashboard" as const },
  { name: "Stores", href: "/admin/stores", icon: Store, permission: "manage_stores" as const },
  { name: "Store Owners", href: "/admin/storeowners", icon: Users, permission: "manage_storeowners" as const },
];

export function Navigation() {
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Filter items based on user role
  const permittedItems = navItems.filter((item) =>
    hasAccess(mockUser.role, item.permission)
  );

  return (
    <>
      {/* --- DESKTOP TOP NAVBAR --- */}
      <nav className="hidden md:flex h-16 items-center justify-between px-8 bg-white/70 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl tracking-tight mr-4 flex items-center gap-2 text-indigo-600">
            <ShieldAlert className="w-6 h-6" />
            HoldIt Admin
          </Link>
          <div className="flex gap-1">
            {permittedItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out",
                    isActive
                      ? "bg-indigo-50 text-indigo-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* User Info Mock */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 font-medium">
            Role: <span className="text-gray-800 bg-gray-100 px-2 py-1 rounded">{mockUser.role}</span>
          </span>
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            {mockUser.name.charAt(0)}
          </div>
        </div>
      </nav>

      {/* --- MOBILE --- */}
      <nav className="md:hidden flex h-16 items-center justify-between px-4 bg-white border-b border-gray-200 sticky top-0 z-40">
        <Link href="/" className="font-bold text-lg tracking-tight flex items-center gap-2 text-indigo-600">
          <ShieldAlert className="w-5 h-5" />
          HoldIt
        </Link>
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-md"
        >
          <Menu className="w-6 h-6" />
        </button>
      </nav>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Sidebar */}
          <div className="relative flex w-64 flex-col bg-white border-r h-full shadow-2xl transition-transform animate-in slide-in-from-left-full">
            <div className="flex items-center justify-between px-4 h-16 border-b">
              <span className="font-bold text-indigo-600 flex items-center gap-2">
                 <ShieldAlert className="w-5 h-5" /> Admin
              </span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-3 py-4 flex flex-col gap-1">
              {permittedItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
