"use client";

import React from "react";
import { DollarSign, Package, Store, TrendingUp } from "lucide-react";
import useSWR from "swr";
import { bookingApi } from "../../../services/bookingApi";
import StatusCard from "../../../components/atom/StatusCard";
import RecentBookingList, { RecentBooking } from "../../../components/atom/RecentBooking";
import EarningsChart, { EarningsPoint } from "../../../components/charts/EarningsPoint";
import BookingMixChart, { BookingMixSlice } from "../../../components/charts/BookingMixSlice";

export default function OwnerDashboard() {
  const { data: statsRes, isLoading } = useSWR("/store-owner/dashboard", bookingApi.getOwnerDashboardStats);
  const dashboardData = statsRes?.data || {};

  const summary = dashboardData.summary || {
    revenue: 0,
    activeVault: 0,
    locations: 0,
    growth: "0%",
    currency: "INR",
    currencySymbol: "₹",
  };

  const currencySymbol = summary.currencySymbol || (summary.currency === "USD" ? "$" : (summary.currency === "EUR" ? "€" : "₹"));

  const recentBookingsRaw = dashboardData.recentBookings || [];

  // Map API recentBookings to RecentBooking format for RecentBooking atom component
  const formattedRecentBookings: RecentBooking[] = recentBookingsRaw.map((b: any) => {
    const clientName = b.userInfo?.firstName
      ? `${b.userInfo.firstName} ${b.userInfo.lastName || ""}`.trim()
      : b.userId?.first_name
      ? `${b.userId.first_name} ${b.userId.last_name || ""}`.trim()
      : b.customer?.name || "Guest User";

    const dateStr = b.updatedAt || b.createdAt;
    const formattedDate = dateStr
      ? new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "Just now";

    // Format status nicely for status badge matching
    let statusLabel = "Stored";
    if (b.status === "stored") statusLabel = "Stored";
    else if (b.status === "delivered") statusLabel = "Delivered";
    else if (b.status === "cancelled") statusLabel = "Cancelled";
    else if (b.status === "at_store") statusLabel = "At Store";
    else if (b.status === "out_for_return") statusLabel = "Out for Return";
    else if (b.status === "driver_assigned") statusLabel = "Driver Assigned";
    else statusLabel = b.status || "Stored";

    return {
      code: b.bookingCode || b._id?.slice(-8).toUpperCase() || "N/A",
      guest: clientName,
      status: statusLabel,
      items: b.itemsCount || b.storage?.bagCount || 1,
      updatedAt: formattedDate,
    };
  });

  // Prepare chart data for EarningsChart & BookingMixChart
  const charts = dashboardData.charts || {};
  
  // Real daily earnings from backend or 0 for inactive days (Zero Hardcoded Values)
  const defaultWeekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const earningsData: EarningsPoint[] = Array.isArray(charts.weeklyEarnings) && charts.weeklyEarnings.length > 0
    ? charts.weeklyEarnings
    : defaultWeekDays.map((day) => ({ day, amount: 0 }));

  // Real booking mix from luggage segment breakdown (Zero Hardcoded Values)
  const bookingMixData: BookingMixSlice[] = Array.isArray(charts.bookingMix)
    ? charts.bookingMix
    : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Title */}
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Overview Dashboard</h1>
        <p className="text-slate-500 font-medium mt-1">Real-time statistics & business performance metrics across all store outlets.</p>
      </div>

      {/* Stats Cards using StatusCard atom */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatusCard
          icon={DollarSign}
          title="Revenue"
          value={`${currencySymbol}${Number(summary.revenue || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          color="teal"
        />
        <StatusCard
          icon={Package}
          title="Active Vault"
          value={summary.activeVault}
          color="rust"
        />
        <StatusCard
          icon={Store}
          title="Locations"
          value={summary.locations}
          color="brass"
        />
        <StatusCard
          icon={TrendingUp}
          title="Growth"
          value={summary.growth}
          color="ink"
        />
      </div>

      {/* Analytics Row using EarningsChart & BookingMixChart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <EarningsChart
          data={earningsData}
          title="Weekly Revenue Overview"
          currency={currencySymbol}
          loading={isLoading}
          barColor="#0D9488"
        />
        <BookingMixChart
          data={bookingMixData}
          title="Booking & Service Mix"
          loading={isLoading}
        />
      </div>

      {/* Recent Bookings using RecentBooking atom */}
      <RecentBookingList
        bookings={formattedRecentBookings}
        loading={isLoading}
      />
    </div>
  );
}

