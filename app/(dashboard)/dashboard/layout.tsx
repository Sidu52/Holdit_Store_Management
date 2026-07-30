import React from "react";
import { redirect } from "next/navigation";
import Sidebar from "../../../components/dashboard/Sidebar";
import { getServerUser } from "../../../lib/serverAuth";
import { SWRProvider } from "../../../components/providers/SWRProvider";
import Navbar from "@/components/dashboard/Navbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const user = await getServerUser();

  // If unauthorized on the server, redirect directly to login
  if (!user) {
    redirect("/login");
  }

  // Pre-seed the client-side SWR cache for "/me" using fallback data
  const fallback = {
    "/me": { success: true, data: user }
  };

  return (
    <SWRProvider fallback={fallback}>
      <div className="flex min-h-screen bg-slate-50 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 sm:p-8">
            <div className="w-full max-w-7xl mx-auto space-y-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SWRProvider>
  );
}
