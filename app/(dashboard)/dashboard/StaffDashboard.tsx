"use client";

import React from "react";
import { 
  Package, 
  Inbox,
  Send,
  ArrowUpRight,
  MoreVertical,
  CheckCircle2
} from "lucide-react";
import useSWR from "swr";
import { bookingApi } from "../../../services/bookingApi";
import Link from "next/link";

export default function StaffDashboard() {
  const { data: incoming } = useSWR("/store/bookings/incoming", bookingApi.getIncomingBookings);
  const { data: statsRes } = useSWR("/store/dashboard", bookingApi.getDashboardStats);
  
  const dashboardData = statsRes?.data || {};
  const store = dashboardData.store || {};
  const stats = dashboardData.stats || {
    incoming: 0,
    stored: 0,
    delivered: 0,
    cancelled: 0,
    capacityUsed: 0,
    capacityAvailable: 0
  };

  const totalSlots = store.max_booking_capacity || 100;
  const capacityUsed = stats.capacityUsed || 0;
  const capacityAvailable = stats.capacityAvailable || totalSlots;
  const utilizedPercent = Math.min(Math.round((capacityUsed / Math.max(totalSlots, 1)) * 100), 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Quick Action Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/incoming" className="flex flex-col items-center justify-center p-8 bg-[#0D9488] text-white rounded-[2rem] shadow-lg shadow-[#0D9488]/20 hover:scale-[1.02] transition-all group">
          <div className="p-4 rounded-2xl bg-white/20 mb-4 group-hover:scale-110 transition-transform">
            <Inbox size={32} strokeWidth={2.5} />
          </div>
          <h3 className="text-xl font-bold">Incoming</h3>
          <p className="text-white/70 text-sm mt-1">Accept arriving parcels</p>
        </Link>

        <Link href="/dashboard/inventory" className="flex flex-col items-center justify-center p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-md transition-all group">
          <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
            <Package size={32} />
          </div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Active Vault</h3>
          <p className="text-slate-500 text-sm mt-1">
            <span className="font-bold text-slate-800">{capacityUsed}</span> items currently stored
          </p>
        </Link>

        <Link href="/dashboard/outgoing" className="flex flex-col items-center justify-center p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-md transition-all group">
          <div className="p-4 rounded-2xl bg-teal-50 text-teal-600 mb-4 group-hover:scale-110 transition-transform">
            <Send size={32} />
          </div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Release</h3>
          <p className="text-slate-500 text-sm mt-1">
            <span className="font-bold text-slate-800">{stats.incoming}</span> pending collection
          </p>
        </Link>
      </div>

      {/* Operational Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Incoming Preview */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-800">Incoming Parcels</h3>
            <Link href="/dashboard/incoming" className="text-[#0D9488] text-sm font-bold hover:underline flex items-center gap-1">
              View Full Queue <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="space-y-4">
            {incoming?.data?.bookings?.slice(0, 3).map((item: any) => (
              <div key={item._id} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:border-[#0D9488]/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-[#0D9488] transition-colors">
                    <Package size={24} />
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-sm">#{item.bookingCode || item._id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter mt-0.5">
                      Client: {item.userInfo?.firstName || "Guest"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black px-3 py-1 bg-teal-100 text-teal-700 rounded-full uppercase">Arriving Soon</span>
                  <button className="p-2 text-slate-300 hover:text-slate-800">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>
            ))}
            
            {(!incoming?.data?.bookings || incoming.data.bookings.length === 0) && (
              <div className="py-12 flex flex-col items-center justify-center text-slate-300">
                <CheckCircle2 size={48} strokeWidth={1} className="mb-4 opacity-20" />
                <p className="font-bold text-slate-400">All clear! No incoming parcels.</p>
              </div>
            )}
          </div>
        </div>

        {/* Capacity Widget */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
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
              <div className="text-center p-4 rounded-2xl bg-slate-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Slots</p>
                <p className="text-xl font-black text-slate-800">{totalSlots}</p>
              </div>
              <div className="text-center p-4 rounded-2xl bg-slate-50">
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
