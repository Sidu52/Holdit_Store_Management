"use client";

import React, { useState } from "react";
import useSWR from "swr";
import {
  Wallet,
  Calendar,
  Download,
  Loader2,
  TrendingUp,
  CheckCircle2,
  Receipt,
  FileText,
  Clock,
  ArrowUpRight,
  Filter,
  DollarSign,
  Landmark
} from "lucide-react";
import { earningsApi, PeriodicSettlement, MonthlyEarningSummary } from "@/services/earningsApi";
import SettlementStatementCard from "@/components/earnings/SettlementStatementCard";

export default function SettlementsPage() {
  const [activeTab, setActiveTab] = useState<"ALL" | "UPCOMING" | "IN_PROGRESS" | "SETTLED">("ALL");

  const { data: userRes, isLoading: isUserLoading } = useSWR("/me");
  const user = userRes?.data || {};
  const isStoreOwner = user.role === "store_owner";

  const { data: resData, error, isLoading } = useSWR(
    isStoreOwner ? "store_periodic_settlements" : null,
    async () => {
      return await earningsApi.getPeriodicSettlements();
    }
  );

  const settlements: PeriodicSettlement[] =
    resData?.data?.settlements || resData?.settlements || [];
  const monthlyEarnings: MonthlyEarningSummary[] =
    resData?.data?.monthlyEarnings || [];

  // Metrics
  const settledList = settlements.filter((s) => s.status === "SETTLED");
  const inProgressList = settlements.filter((s) => s.status === "IN_PROGRESS");
  const upcomingList = settlements.filter((s) => s.status === "UPCOMING");

  const totalDisbursed = settledList.reduce(
    (sum, item) => sum + (item.totalNetPayout || 0),
    0
  );
  const totalUpcoming = upcomingList.reduce(
    (sum, item) => sum + (item.totalNetPayout || 0),
    0
  );
  const totalInProgress = inProgressList.reduce(
    (sum, item) => sum + (item.totalNetPayout || 0),
    0
  );

  const currencySymbol =
    resData?.data?.currencySymbol ||"₹";

  const filteredSettlements = settlements.filter((s) => {
    if (activeTab === "ALL") return true;
    return s.status === activeTab;
  });

  if (!isUserLoading && !isStoreOwner) {
    return (
      <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-sm text-center max-w-xl mx-auto space-y-4 my-12">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
          <Landmark size={32} />
        </div>
        <h2 className="text-xl font-black text-slate-800 tracking-tight">Access Restricted</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          Bank & Settlement credentials and payout statements are strictly accessible to Store Owners only. Store accounts and representatives do not have authorization to view financial settlements.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-800 shadow-sm">
            <Landmark size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">
              Settlement Cycles & Statements
            </h1>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">
              Monthly store payout statements, upcoming accruals, and disbursement tracking.
            </p>
          </div>
        </div>

        {/* Financial KPI Rollups */}
        <div className="grid grid-cols-3 gap-3 bg-slate-50 border border-slate-100 p-3 rounded-2xl">
          <div className="px-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Settled</p>
            <p className="text-xl font-black text-emerald-700 mt-0.5">{currencySymbol}{totalDisbursed.toFixed(2)}</p>
            <p className="text-[10px] text-slate-400 font-semibold">{settledList.length} statement(s)</p>
          </div>
          <div className="w-px h-full bg-slate-200" />
          <div className="px-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Upcoming</p>
            <p className="text-xl font-black text-teal-800 mt-0.5">{currencySymbol}{totalUpcoming.toFixed(2)}</p>
            <p className="text-[10px] text-slate-400 font-semibold">Accruing</p>
          </div>
          <div className="w-px h-full bg-slate-200" />
          <div className="px-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">In Progress</p>
            <p className="text-xl font-black text-amber-700 mt-0.5">{currencySymbol}{totalInProgress.toFixed(2)}</p>
            <p className="text-[10px] text-slate-400 font-semibold">{inProgressList.length} batch</p>
          </div>
        </div>
      </div>

      {/* Monthly Base Earnings Overview Card */}
      {monthlyEarnings.length > 0 && (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-teal-700" />
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                Monthly Base Earnings from Store
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              {monthlyEarnings.length} Month(s) Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {monthlyEarnings.map((m) => (
              <div
                key={m.monthKey}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-teal-200 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-700">{m.monthLabel}</span>
                  {m.status === "SETTLED" ? (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Settled
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                      Accruing
                    </span>
                  )}
                </div>
                <div className="flex items-baseline justify-between pt-1 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 font-medium">{m.bookingsCount} orders</span>
                  <span className="text-base font-black text-teal-800">{currencySymbol}{m.netEarning.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Multi-Store Owner Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-900 text-white rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <FileText className="text-teal-400" size={20} />
          <div>
            <p className="text-xs font-bold">Multi-Store Consolidated Settlement Statement</p>
            <p className="text-[11px] text-slate-400">
              Download current aggregated multi-store settlement document
            </p>
          </div>
        </div>
        {/* <button
          onClick={() => earningsApi.downloadStoreOwnerSettlementPdf("current")}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Download size={14} />
          Download Multi-Store PDF
        </button> */}
      </div>

      {/* Filter Tabs: ALL | UPCOMING | IN_PROGRESS | SETTLED */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === "ALL"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          All Statements ({settlements.length})
        </button>
        <button
          onClick={() => setActiveTab("UPCOMING")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "UPCOMING"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          <Clock size={13} />
          Upcoming ({upcomingList.length})
        </button>
        <button
          onClick={() => setActiveTab("IN_PROGRESS")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "IN_PROGRESS"
              ? "bg-amber-600 text-white shadow-sm"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          <Loader2 size={13} />
          In Progress ({inProgressList.length})
        </button>
        <button
          onClick={() => setActiveTab("SETTLED")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "SETTLED"
              ? "bg-emerald-700 text-white shadow-sm"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          <CheckCircle2 size={13} />
          Settled Payout Statements ({settledList.length})
        </button>
      </div>

      {/* Settlement Cards List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white p-12 rounded-[2rem] border border-slate-100 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 size={24} className="animate-spin text-teal-600" />
            <p className="text-xs font-bold text-slate-400">Loading Settlement Statements...</p>
          </div>
        ) : error || filteredSettlements.length === 0 ? (
          <div className="bg-white p-12 rounded-[2rem] border border-slate-100 text-center space-y-3">
            <Receipt size={40} className="text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">
              {activeTab === "SETTLED"
                ? "No Settled Payout Statements Yet"
                : activeTab === "IN_PROGRESS"
                ? "No Settlements Currently In Progress"
                : activeTab === "UPCOMING"
                ? "No Upcoming Storage Earnings"
                : "No Settlement Statements Found"}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
              {activeTab === "SETTLED"
                ? "Completed bank disbursements will appear here with official settled payout statements."
                : "Periodic settlement statements will automatically track your store storage earnings across monthly cycles."}
            </p>
          </div>
        ) : (
          filteredSettlements.map((period) => (
            <SettlementStatementCard key={period.periodId} settlement={period} />
          ))
        )}
      </div>
    </div>
  );
}
