"use client";

import React from "react";
import { 
  Package, 
  Inbox,
  Send
} from "lucide-react";
import useSWR from "swr";
import { bookingApi } from "../../../services/bookingApi";
import StatusCard from "../../../components/atom/StatusCard";
import RecentBookingList, { RecentBooking } from "../../../components/atom/RecentBooking";
import { useRouter } from "next/navigation";

export default function StaffDashboard() {
  const router = useRouter();
  const { data: incoming, isLoading: isLoadingIncoming } = useSWR("/store/bookings/incoming", bookingApi.getIncomingBookings);
  const { data: statsRes, isLoading: isLoadingStats } = useSWR("/store/dashboard", bookingApi.getDashboardStats);
  
  const dashboardData = statsRes?.data || {};
  const store = dashboardData.store || {};
  const stats = dashboardData.stats || {
    incoming: 0,
    stored: 0,
    returned: 0,
    delivered: 0,
    cancelled: 0,
    capacityUsed: 0,
    capacityAvailable: 0
  };

  const totalSlots = store.max_booking_capacity || 100;
  const capacityUsed = stats.capacityUsed || 0;
  const capacityAvailable = stats.capacityAvailable || totalSlots;
  const utilizedPercent = Math.min(Math.round((capacityUsed / Math.max(totalSlots, 1)) * 100), 100);

  const rawIncomingBookings = incoming?.data?.bookings || [];

  // Format incoming bookings into RecentBooking format
  const formattedIncoming: RecentBooking[] = rawIncomingBookings.map((item: any) => {
    const clientName = item.userInfo?.firstName
      ? `${item.userInfo.firstName} ${item.userInfo.lastName || ""}`.trim()
      : "Guest User";

    const dateStr = item.updatedAt || item.createdAt;
    const formattedDate = dateStr
      ? new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "Just now";

    return {
      code: item.bookingCode || item._id?.slice(-8).toUpperCase() || "N/A",
      guest: clientName,
      status: "At Store",
      items: item.itemsCount || item.storage?.bagCount || 1,
      updatedAt: formattedDate,
    };
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Quick Action & Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatusCard
          icon={Inbox}
          title="Incoming Queue"
          value={stats.incoming || rawIncomingBookings.length}
          color="teal"
          onClick={() => router.push("/dashboard/incoming")}
        />
        <StatusCard
          icon={Package}
          title="Active Vault Stored"
          value={stats.stored || 0}
          color="rust"
          onClick={() => router.push("/dashboard/inventory")}
        />
        <StatusCard
          icon={Send}
          title="Ready for Collection"
          value={stats.returned || 0}
          color="brass"
          onClick={() => router.push("/dashboard/outgoing")}
        />
      </div>

      {/* Operational Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Incoming Preview using RecentBooking atom */}
        <div className="lg:col-span-2 space-y-4">
          <RecentBookingList
            bookings={formattedIncoming}
            loading={isLoadingIncoming}
            onViewAll={() => router.push("/dashboard/incoming")}
          />
        </div>

        {/* Capacity Widget */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 mb-6">Vault Capacity</h3>
          <div className="space-y-8">
            <div className="relative h-48 w-48 mx-auto">
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-slate-800">{utilizedPercent}%</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Utilized</span>
               </div>
               <svg className="h-full w-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-slate-100"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={552.92}
                    strokeDashoffset={552.92 * (1 - (utilizedPercent / 100))}
                    className="text-[#0D9488] transition-all duration-550"
                  />
               </svg>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Slots</p>
                <p className="text-xl font-black text-slate-800">{totalSlots}</p>
              </div>
              <div className="text-center p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Available</p>
                <p className="text-xl font-black text-teal-600">{capacityAvailable}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

