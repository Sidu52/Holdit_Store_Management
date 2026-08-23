"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import EarningStatementCard from "@/components/earnings/EarningStatementCard";
import { ArrowLeft } from "lucide-react";

export default function BookingInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params?.id as string;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-16">
      <button
        onClick={() => router.push(`/dashboard/bookings/${bookingId}`)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-600 hover:text-slate-900 transition-all shadow-sm"
      >
        <ArrowLeft size={16} /> Back to Booking Detail
      </button>

      <EarningStatementCard bookingId={bookingId} />
    </div>
  );
}
