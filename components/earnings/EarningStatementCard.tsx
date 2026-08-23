"use client";

import React, { useState } from "react";
import useSWR from "swr";
import {
  Download,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Receipt,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  FileText
} from "lucide-react";
import { earningsApi, SettlementData } from "@/services/earningsApi";

interface EarningStatementCardProps {
  bookingId: string;
  className?: string;
}

export default function EarningStatementCard({
  bookingId,
  className = "",
}: EarningStatementCardProps) {
  const [downloading, setDownloading] = useState(false);

  const { data: resData, error, isLoading } = useSWR(
    bookingId ? `earning_statement_${bookingId}` : null,
    async () => {
      return await earningsApi.getBookingSettlement(bookingId);
    }
  );

  const settlement: SettlementData | null =
    resData?.data?.settlement || resData?.settlement || resData?.data || null;

  const handleDownload = async () => {
    if (!settlement?.isDownloadable) return;
    setDownloading(true);
    try {
      await earningsApi.downloadEarningStatementPdf(bookingId);
    } catch (err) {
      console.error("Failed to download earning statement:", err);
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-center space-x-3 py-10">
        <Loader2 size={20} className="animate-spin text-teal-600" />
        <span className="text-xs font-bold text-slate-500">Loading Store Earning Statement...</span>
      </div>
    );
  }

  if (error || !settlement) {
    return (
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-rose-600 text-xs font-bold">
          <AlertCircle size={16} />
          <span>Earning statement unavailable for this booking</span>
        </div>
      </div>
    );
  }

  const status = settlement.earningStatus || "PENDING";
  const isPending = status === "PENDING";
  const isProvisional = status === "ELIGIBLE" || status === "PAYABLE";
  const isPaid = status === "PAID";

  const startedAtStr = settlement.storagePeriod.startedAt
    ? new Date(settlement.storagePeriod.startedAt).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  const releasedAtStr = settlement.storagePeriod.releasedAt
    ? new Date(settlement.storagePeriod.releasedAt).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Active in Storage";

  return (
    <div className={`bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6 ${className}`}>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold shadow-sm">
            <Receipt size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-800">Store Earning Statement</h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  isPaid
                    ? "bg-emerald-100 text-emerald-800"
                    : isProvisional
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {settlement.statementClassification === "IN_PROGRESS"
                  ? "In Progress"
                  : settlement.statementClassification}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Ref: <span className="font-mono font-bold text-slate-600">{settlement.settlementId}</span>
            </p>
          </div>
        </div>

        {/* Action Button: Gated on Status */}
        <div>
          {isPending ? (
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 text-xs font-bold">
              <Clock size={14} className="animate-pulse" />
              <span>Earning in progress</span>
            </div>
          ) : (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer shadow-md shadow-teal-700/10 ${
                isPaid
                  ? "bg-teal-700 hover:bg-teal-800 text-white"
                  : "bg-amber-600 hover:bg-amber-700 text-white"
              }`}
            >
              {downloading ? (
                <>
                  <Loader2 size={14} className="animate-spin text-teal-200" />
                  <span>Preparing PDF...</span>
                </>
              ) : (
                <>
                  <Download size={14} />
                  <span>
                    Download {isProvisional ? "Provisional" : "Settled"} Statement (PDF)
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Storage Period & Applied Rate Metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Storage Period</p>
          <div className="mt-1.5 space-y-1">
            <p className="text-xs text-slate-700 font-bold">Start: {startedAtStr}</p>
            <p className="text-xs text-slate-700 font-bold">End: {releasedAtStr}</p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Billable Hours</p>
          <p className="text-xl font-black text-slate-800 mt-1">
            {settlement.storagePeriod.billableHours} <span className="text-xs font-bold text-slate-500">Hour(s)</span>
          </p>
          <p className="text-[10px] text-slate-400 font-bold mt-1">Ceiled storage duration</p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Store Payout Rate</p>
          <p className="text-xl font-black text-teal-700 mt-1">
            ₹{settlement.rates.storeStorageHourlyRate} <span className="text-xs font-bold text-slate-500">/ hr</span>
          </p>
          <p className="text-[10px] text-slate-400 font-bold mt-1">Contractual Store Partner Rate</p>
        </div>
      </div>

      {/* Itemized Earning Table */}
      <div className="overflow-hidden border border-slate-100 rounded-2xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Line Item Description</th>
              <th className="py-3 px-4 text-right">Units</th>
              <th className="py-3 px-4 text-right">Rate</th>
              <th className="py-3 px-4 text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            <tr>
              <td className="py-3.5 px-4 font-bold text-slate-800">
                Vault Storage Facility Allocation
              </td>
              <td className="py-3.5 px-4 text-right">{settlement.storagePeriod.billableHours} hrs</td>
              <td className="py-3.5 px-4 text-right">₹{settlement.rates.storeStorageHourlyRate}/hr</td>
              <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                ₹{settlement.financials.grossStoreAmount.toFixed(2)}
              </td>
            </tr>
            {settlement.financials.commissionDeduction > 0 && (
              <tr className="text-slate-500">
                <td className="py-3 px-4">Platform Service Fee Deduction</td>
                <td className="py-3 px-4 text-right">—</td>
                <td className="py-3 px-4 text-right">—</td>
                <td className="py-3 px-4 text-right text-rose-600 font-bold">
                  -₹{settlement.financials.commissionDeduction.toFixed(2)}
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
            <tr>
              <td colSpan={3} className="py-3.5 px-4 text-right text-slate-600 uppercase tracking-wider text-[11px]">
                Net Store Payout:
              </td>
              <td className="py-3.5 px-4 text-right text-base font-black text-teal-800">
                ₹{settlement.financials.netStorePayout.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Status & Payout Audit Banner */}
      {isPaid && settlement.payout ? (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} className="text-emerald-700 shrink-0" />
            <div>
              <p className="text-xs font-black text-emerald-900">
                Disbursed to Store Owner Bank Account
              </p>
              <p className="text-[11px] text-emerald-700 font-medium">
                Transfer Ref: <span className="font-mono font-bold">{settlement.payout.providerTransferId}</span> • Settled on {new Date(settlement.payout.completedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-700 text-white text-[10px] font-black uppercase rounded-full tracking-wider">
            Settled
          </span>
        </div>
      ) : isProvisional ? (
        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-900 text-xs font-medium">
          <Sparkles size={18} className="text-amber-700 shrink-0" />
          <span>
            This earning statement is <strong>Provisional</strong>. Luggage storage is finalized and funds will be automatically disbursed to your bank account in the upcoming payout cycle.
          </span>
        </div>
      ) : (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3 text-slate-600 text-xs font-medium">
          <Clock size={18} className="text-slate-500 shrink-0" />
          <span>
            Storage is currently active. Final billable hours and gross earnings will be calculated once luggage is physically released to the driver.
          </span>
        </div>
      )}
    </div>
  );
}
