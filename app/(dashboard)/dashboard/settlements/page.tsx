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
  AlertCircle,
  Receipt,
  FileText,
  DollarSign
} from "lucide-react";
import { earningsApi, PeriodicSettlement } from "@/services/earningsApi";
import SettlementStatementCard from "@/components/earnings/SettlementStatementCard";

export default function SettlementsPage() {
  const { data: resData, error, isLoading, mutate } = useSWR(
    "store_periodic_settlements",
    async () => {
      return await earningsApi.getPeriodicSettlements();
    }
  );

  const settlements: PeriodicSettlement[] =
    resData?.data?.settlements || resData?.settlements || [];

  const totalDisbursed = settlements.reduce(
    (sum, item) => sum + (item.totalNetPayout || 0),
    0
  );

  const totalOrders = settlements.reduce(
    (sum, item) => sum + (item.earningsCount || 0),
    0
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Header Banner */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold shadow-sm">
              <Wallet size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800">Payout Statements & Settlements</h1>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Consolidated period rollups for store partner earnings & bank disbursements
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Disbursed</p>
            <p className="text-2xl font-black text-teal-700 mt-0.5">₹{totalDisbursed.toFixed(2)}</p>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="text-left">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Settled Orders</p>
            <p className="text-xl font-black text-slate-800 mt-0.5">{totalOrders}</p>
          </div>
        </div>
      </div>

      {/* Info Callout */}
      <div className="p-4 bg-teal-50/70 border border-teal-200/80 rounded-2xl flex items-center gap-3 text-teal-900 text-xs font-medium">
        <CheckCircle2 size={18} className="text-teal-700 shrink-0" />
        <span>
          Payout statements reflect actual bank disbursements tied to completed store storage bookings. Click on any period statement to view order details or download official settlement documents.
        </span>
      </div>

      {/* Settlement Cards List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white p-12 rounded-[2rem] border border-slate-100 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 size={24} className="animate-spin text-teal-600" />
            <p className="text-xs font-bold text-slate-400">Loading Periodic Settlement Statements...</p>
          </div>
        ) : error || settlements.length === 0 ? (
          <div className="bg-white p-12 rounded-[2rem] border border-slate-100 text-center space-y-3">
            <Receipt size={40} className="text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No Settled Payout Statements Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
              Periodic settlement statements will appear here once your store earnings enter the disbursement cycle.
            </p>
          </div>
        ) : (
          settlements.map((period) => (
            <SettlementStatementCard key={period.periodId} settlement={period} />
          ))
        )}
      </div>
    </div>
  );
}
