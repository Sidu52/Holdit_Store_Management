import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import OwnerDashboard from "./OwnerDashboard";
import StaffDashboard from "./StaffDashboard";
import { getServerUser, fetchServerData } from "../../../lib/serverAuth";
import { SWRProvider } from "../../../components/providers/SWRProvider";

export default async function DashboardPage() {
  const user = await getServerUser();

  // If unauthorized on the server, redirect directly to login
  if (!user) {
    redirect("/login");
  }

  // Pre-fetch all necessary stats and active/incoming bookings on the server in parallel
  const statsPromise = user.role === "store_owner"
    ? fetchServerData("/store-owner/dashboard")
    : fetchServerData("/store/dashboard");

  const incomingPromise = user.role !== "store_owner"
    ? fetchServerData("/store/bookings/incoming")
    : Promise.resolve(null);

  const [statsRes, incomingRes] = await Promise.all([statsPromise, incomingPromise]);

  const dashboardKey = user.role === "store_owner" ? "/store-owner/dashboard" : "/store/dashboard";

  // Build the SWR cache fallback map to fully pre-render and hydrate components on the client
  const fallback: Record<string, any> = {
    "/me": { success: true, data: user },
    [dashboardKey]: statsRes || { success: true, data: null },
  };

  if (incomingRes) {
    fallback["/store/bookings/incoming"] = incomingRes;
  }

  return (
    <SWRProvider fallback={fallback}>
      {user.role === "store_owner" ? (
        <OwnerDashboard />
      ) : (
        <StaffDashboard />
      )}
    </SWRProvider>
  );
}
