"use client";

import React, { useState } from "react";
import { Download, Loader2, Calendar, CheckCircle2, ChevronDown, ChevronUp, DollarSign } from "lucide-react";
import { PeriodicSettlement, earningsApi } from "@/services/earningsApi";

interface SettlementStatementCardProps {
  settlement: PeriodicSettlement;
  className?: string;
}

export default function SettlementStatementCard({
  settlement,
  className = "",
}: SettlementStatementCardProps) {
  const [downloading, setDownloading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await earningsApi.downloadPeriodicSettlementPdf(settlement.periodId);
    } catch (err) {
      console.error("Failed to download periodic settlement PDF:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className={`bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <Calendar size={22} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-800">{settlement.periodLabel}</h3>
            <p className="text-xs text-slate-400 font-medium">
              Period ID: <span className="font-mono font-bold text-slate-600">{settlement.periodId}</span> • {settlement.earningsCount} Settled Orders
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right pr-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Consolidated Payout</p>
            <p className="text-xl font-black text-teal-800">₹{settlement.totalNetPayout.toFixed(2)}</p>
          </div>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-black transition-all cursor-pointer shadow-sm"
          >
            {downloading ? (
              <>
                <Loader2 size={14} className="animate-spin text-teal-200" />
                <span>PDF...</span>
              </>
            ) : (
              <>
                <Download size={14} />
                <span>Download Statement</span>
              </>
            )}
          </button>

          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
            title={expanded ? "Collapse order list" : "Expand order list"}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded Order List Breakdown */}
      {expanded && (
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <p className="text-xs font-black text-slate-700 uppercase tracking-wider">
            Orders Included in Statement ({settlement.earnings.length})
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Booking Code</th>
                  <th className="py-2.5 px-3">Storage Date</th>
                  <th className="py-2.5 px-3 text-right">Gross Earning</th>
                  <th className="py-2.5 px-3 text-right">Net Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {settlement.earnings.map((e, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{e.bookingCode}</td>
                    <td className="py-2.5 px-3">
                      {e.startedAt ? new Date(e.startedAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-right">₹{e.grossEarning.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-teal-800">₹{e.netEarning.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
