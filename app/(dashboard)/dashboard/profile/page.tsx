"use client";

import React from "react";
import useSWR from "swr";
import { 
  User, 
  Phone, 
  Shield, 
  Calendar, 
  CheckCircle2, 
  Sparkles,
  Info
} from "lucide-react";

export default function ProfilePage() {
  const { data: userRes } = useSWR("/me");
  const user = userRes?.data || {};

  const name = user.first_name
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : user.store_name || "Authorized Member";

  const registeredDate = user.createdAt 
    ? new Date(user.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })
    : "Verified Registration";

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Account Profile</h1>
        <p className="text-slate-500 font-medium mt-1">Manage your secure dashboard identity, login phone numbers and scopes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Card - Badge info */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-teal-50 text-teal-655 flex items-center justify-center">
              <User size={48} />
            </div>
            <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center" title="Online Verified">
              <div className="w-2.5 h-2.5 bg-emerald-100 rounded-full animate-ping" />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">{name}</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{user.role || "Store Representative"}</p>
          </div>

          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-700 border border-teal-100 rounded-full text-xs font-black uppercase tracking-wider">
              <CheckCircle2 size={12} />
              Verified Status
            </span>
          </div>
        </div>

        {/* Right Card - Profile details */}
        <div className="md:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-lg font-black text-slate-800 border-b border-slate-50 pb-4">
            Security & Identity Credentials
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">First Name</p>
              <p className="font-bold text-slate-700 text-sm bg-slate-50 p-3 rounded-xl border border-slate-100">
                {user.first_name || "N/A"}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last Name</p>
              <p className="font-bold text-slate-700 text-sm bg-slate-50 p-3 rounded-xl border border-slate-100">
                {user.last_name || "N/A"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Primary Login Phone</p>
              <div className="flex items-center gap-2 font-bold text-slate-700 text-sm bg-slate-50 p-3 rounded-xl border border-slate-100">
                <Phone size={14} className="text-slate-400" />
                <span>{user.phone || "N/A"}</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registration Date</p>
              <div className="flex items-center gap-2 font-bold text-slate-700 text-sm bg-slate-50 p-3 rounded-xl border border-slate-100">
                <Calendar size={14} className="text-slate-400" />
                <span>{registeredDate}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-3">
            <Shield size={18} className="text-indigo-650 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-slate-700">Enterprise Access Scope</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Your role credentials authorize actions within this partner dashboard. Ensure your OTP credentials remain confidential.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
