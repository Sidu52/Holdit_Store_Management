"use client";

import React from "react";
import { 
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  Store,
  Package,
  Calendar,
  Layers
} from "lucide-react";
import { Chart } from "react-google-charts";
import useSWR from "swr";
import { bookingApi } from "../../../services/bookingApi";

const defaultBookingVolume = [
  ["Time", "Bookings"],
  ["Mon", 0],
  ["Tue", 0],
  ["Wed", 0],
  ["Thu", 0],
  ["Fri", 0],
  ["Sat", 0],
  ["Sun", 0]
];

const defaultEarnings = [
  ["Category", "Revenue"],
  ["Luggage Storage", 0],
  ["Insurance", 0],
  ["Courier Service", 0],
];

export default function OwnerDashboard() {
  const { data: statsRes } = useSWR("/store-owner/dashboard", bookingApi.getOwnerDashboardStats);
  const dashboardData = statsRes?.data || {};

  const summary = dashboardData.summary || {
    revenue: 0,
    activeVault: 0,
    locations: 0,
    growth: "0%"
  };

  const chartData = dashboardData.charts || {};
  const bookingVolume = chartData.bookingVolume || defaultBookingVolume;
  const earningsData = chartData.earningsData || defaultEarnings;
  const recentBookings = dashboardData.recentBookings || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Title */}
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Overview Dashboard</h1>
        <p className="text-slate-500 font-medium mt-1">Real-time statistics & business performance metrics across all store outlets.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 transition-all duration-300 hover:shadow-md hover:border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Revenue</p>
            <h3 className="text-2xl font-black text-slate-800">
              ₹{Number(summary.revenue).toLocaleString("en-IN")}
            </h3>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 transition-all duration-300 hover:shadow-md hover:border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Active Vault</p>
            <h3 className="text-2xl font-black text-slate-800">{summary.activeVault}</h3>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 transition-all duration-300 hover:shadow-md hover:border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Store size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Locations</p>
            <h3 className="text-2xl font-black text-slate-800">{summary.locations}</h3>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 transition-all duration-300 hover:shadow-md hover:border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Growth</p>
            <h3 className="text-2xl font-black text-slate-850 text-rose-600">{summary.growth}</h3>
          </div>
        </div>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-800">Booking Volume</h3>
              <p className="text-slate-400 text-sm font-medium">Storage trends over the past 7 days</p>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button className="px-3 py-1 text-[10px] font-bold uppercase rounded-lg bg-[#0D9488] text-white shadow-sm">Week</button>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <Chart
              chartType="LineChart"
              width="100%"
              height="100%"
              data={bookingVolume}
              options={{
                curveType: "function",
                legend: { position: "none" },
                colors: ["#0D9488"],
                lineWidth: 4,
                chartArea: { width: "92%", height: "80%" },
                hAxis: { textStyle: { color: "#94a3b8", fontSize: 11, fontName: "inherit" }, gridlines: { count: 0 } },
                vAxis: { textStyle: { color: "#94a3b8", fontSize: 11, fontName: "inherit" }, gridlines: { count: 0 }, baselineColor: "transparent", viewWindow: { min: 0 } },
                pointSize: 8,
                backgroundColor: "transparent",
              }}
            />
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-black text-slate-800">Earnings Overview</h3>
              <p className="text-slate-400 text-sm font-medium">Revenue by business category</p>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button className="px-3 py-1 text-[10px] font-bold uppercase rounded-lg bg-indigo-600 text-white shadow-sm">All Time</button>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <Chart
              chartType="PieChart"
              width="100%"
              height="100%"
              data={earningsData}
              options={{
                pieHole: 0.6,
                legend: { position: "bottom", textStyle: { color: "#64748b", fontSize: 12, fontName: "inherit" } },
                slices: {
                  0: { color: "#0D9488" },
                  1: { color: "#6366f1" },
                  2: { color: "#f43f5e" },
                },
                chartArea: { width: "100%", height: "80%" },
                backgroundColor: "transparent",
                pieSliceText: "none",
              }}
            />
          </div>
        </div>
      </div>

      {/* Recent Bookings Table (Replaces Managed Locations) */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black text-slate-800">Recent Bookings activity</h3>
            <p className="text-slate-400 text-sm font-medium">Live logs of incoming customer drops and collections.</p>
          </div>
          <div className="p-2 rounded-xl bg-teal-50 text-teal-650 flex items-center gap-1.5 text-xs font-bold uppercase">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            Live Feed
          </div>
        </div>

        {recentBookings.length === 0 ? (
          <div className="py-16 text-center text-slate-450 flex flex-col items-center justify-center">
            <Layers className="text-slate-300 mb-3" size={48} />
            <p className="font-semibold text-slate-500">No bookings logged yet</p>
            <p className="text-xs text-slate-400 mt-1">Bookings will display here in real time once customers start ordering.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-4 font-bold">Booking Code</th>
                  <th className="py-4 px-4 font-bold">Client</th>
                  <th className="py-4 px-4 font-bold">Outlet Location</th>
                  <th className="py-4 px-4 font-bold">Duration</th>
                  <th className="py-4 px-4 font-bold">Billing</th>
                  <th className="py-4 px-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {recentBookings.map((booking: any) => {
                  const clientName = booking.userInfo?.firstName
                    ? `${booking.userInfo.firstName} ${booking.userInfo.lastName || ""}`.trim()
                    : "Guest User";
                  
                  return (
                    <tr key={booking._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-slate-800 text-xs">
                        {booking.bookingCode}
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-700">
                        {clientName}
                      </td>
                      <td className="py-4 px-4 text-slate-500 font-medium">
                        {booking.storeId?.store_name || "Unassigned Outlet"}
                      </td>
                      <td className="py-4 px-4 text-slate-500 font-bold">
                        {booking.storage?.expectedDurationHours || 0} Hours
                      </td>
                      <td className="py-4 px-4 text-slate-800 font-black">
                        ₹{booking.pricing?.totalAmount || 0}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          booking.status === "stored"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : booking.status === "delivered"
                            ? "bg-teal-50 text-teal-700 border border-teal-100"
                            : booking.status === "cancelled"
                            ? "bg-rose-50 text-rose-700 border border-rose-100"
                            : "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
