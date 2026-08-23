"use client";

import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { earningsApi } from "@/services/earningsApi";

interface DownloadInvoiceButtonProps {
  bookingId: string;
  bookingCode?: string;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
}

export default function DownloadInvoiceButton({
  bookingId,
  variant = "primary",
  className = "",
}: DownloadInvoiceButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await earningsApi.downloadEarningStatementPdf(bookingId);
    } catch (err) {
      console.error("Failed to download earning statement:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        variant === "primary"
          ? "bg-[#0D9488] hover:bg-[#0F766E] text-white shadow-sm"
          : "bg-slate-900 text-white"
      } ${className}`}
      title="Download Store Earning Statement PDF"
    >
      {downloading ? (
        <>
          <Loader2 size={15} className="animate-spin text-teal-200" />
          <span>Downloading PDF...</span>
        </>
      ) : (
        <>
          <Download size={15} />
          <span>Download Earning Statement (PDF)</span>
        </>
      )}
    </button>
  );
}
