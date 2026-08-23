"use client";

import React from "react";
import { 
  Printer, 
  Download, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  Package, 
  Store,
  DollarSign,
  CreditCard,
  Check
} from "lucide-react";
import Link from "next/link";
import DownloadInvoiceButton from "./DownloadInvoiceButton";

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  invoiceTriggerEvent: "Advance Payment" | "Luggage Check-In" | "Overtime Extension" | "Cancellation Refund" | "Store Settlement";
  paymentStatus: "paid" | "advance_paid" | "pending" | "refunded" | "overdue";
  bookingCode: string;
  bookingDate: string;
  
  // Customer Info
  customer: {
    name: string;
    phone: string;
    email?: string;
  };

  // Store Outlet Info
  store: {
    name: string;
    address: string;
    phone?: string;
    gstin?: string;
  };

  // Luggage Manifest
  luggage: {
    small: number;
    medium: number;
    large: number;
    other: number;
    totalCount: number;
  };

  // Storage Duration
  storage: {
    expectedDurationHours: number;
    storedAt?: string;
    releasedAt?: string;
  };

  // Pricing & Tax Breakdown
  pricing: {
    advancePaid: number;
    balanceDue: number;
    storageFee: number;
    insuranceFee: number;
    courierFee: number;
    subtotal: number;
    taxAmount: number; // GST 18%
    cgstAmount: number; // CGST 9%
    sgstAmount: number; // SGST 9%
    discount: number;
    totalAmount: number;
  };

  // Verification & Security
  security: {
    storageOtp?: string;
    returnOtp?: string;
  };
}

interface InvoiceTemplateProps {
  data: InvoiceData;
  bookingId: string;
  onPrint?: () => void;
  showBackBtn?: boolean;
}

export default function InvoiceTemplate({ data, bookingId, onPrint, showBackBtn = true }: InvoiceTemplateProps) {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans print:bg-white print:p-0">
      {/* Global CSS for Clean Print / Save as PDF */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          aside, nav, header, .print\\:hidden {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
          }
          .print-sheet {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>

      {/* Top Action Bar (Hidden on Print) */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
        {showBackBtn ? (
          <Link
            href={`/dashboard/bookings/${bookingId}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            <ArrowLeft size={14} /> Back to Booking Detail
          </Link>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-3">
          {/* Download Invoice PDF Button */}
          <DownloadInvoiceButton 
            bookingId={bookingId} 
            bookingCode={data.bookingCode} 
            variant="secondary" 
          />

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition-all shadow-sm cursor-pointer"
          >
            <Printer size={15} /> Print Invoice
          </button>
        </div>
      </div>

      {/* Main Printable Invoice Sheet */}
      <div className="max-w-4xl mx-auto bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden print:shadow-none print:border-none print:rounded-none">
        {/* Invoice Top Header Banner */}
        <div className="bg-slate-900 text-white p-8 sm:p-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 print:bg-slate-900 print:text-white">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0D9488] flex items-center justify-center font-black text-white text-xl">
                V
              </div>
              <span className="text-xl font-black tracking-tight text-white uppercase">Luggage Vault Storage</span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">Official Tax Invoice & Storage Receipt</p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              data.paymentStatus === "paid" 
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                : data.paymentStatus === "advance_paid"
                ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
            }`}>
              {data.paymentStatus === "advance_paid" ? "Advance Payment Cleared" : `Payment ${data.paymentStatus}`}
            </span>
            <p className="font-mono text-xs font-bold text-slate-300 mt-2">Invoice #: {data.invoiceNumber}</p>
            <p className="text-[11px] text-slate-400">Date: {data.invoiceDate}</p>
            <p className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">Trigger: {data.invoiceTriggerEvent}</p>
          </div>
        </div>

        {/* Invoice Body Content */}
        <div className="p-8 sm:p-10 space-y-8">
          {/* Advance Payment Banner Notice if Applicable */}
          {data.pricing.advancePaid > 0 && (
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                  <CreditCard size={16} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800">Online Advance Deposit Verified</p>
                  <p className="text-[11px] text-slate-500">Advance paid online prior to luggage vault check-in.</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase">Advance Amount</p>
                <p className="text-base font-black text-teal-700">₹{data.pricing.advancePaid}</p>
              </div>
            </div>
          )}

          {/* Key Reference Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-slate-100">
            {/* Billed To */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Customer (Billed To)</p>
              <h3 className="text-base font-black text-slate-800 mt-1">{data.customer.name}</h3>
              <p className="text-xs font-mono text-slate-500 mt-0.5">{data.customer.phone}</p>
              {data.customer.email && <p className="text-xs text-slate-500">{data.customer.email}</p>}
            </div>

            {/* Storage Outlet */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Storage Facility</p>
              <h3 className="text-base font-black text-slate-800 mt-1">{data.store.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{data.store.address}</p>
              {data.store.gstin && <p className="text-[11px] font-mono text-slate-400 mt-1">GSTIN: {data.store.gstin}</p>}
            </div>

            {/* Booking Details */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Booking Ticket</p>
              <h3 className="text-base font-mono font-black text-[#0D9488] mt-1">{data.bookingCode}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Booked: {data.bookingDate}</p>
              <p className="text-xs text-slate-500">Duration: {data.storage.expectedDurationHours} Hours</p>
            </div>
          </div>

          {/* Itemized Manifest Table */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Itemized Storage Services</h4>
            <div className="border border-slate-100 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-black tracking-wider text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-4">Service Description</th>
                    <th className="py-3.5 px-4 text-center">Category / Items</th>
                    <th className="py-3.5 px-4 text-center">Duration</th>
                    <th className="py-3.5 px-4 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  <tr>
                    <td className="py-4 px-4 font-bold text-slate-800">
                      Luggage Storage Vault Base Fee
                      <p className="text-[10px] text-slate-400 font-normal mt-0.5">Secure luggage storage for {data.luggage.totalCount} item(s)</p>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {data.luggage.small > 0 && <span>Small ({data.luggage.small}) </span>}
                      {data.luggage.medium > 0 && <span>Med ({data.luggage.medium}) </span>}
                      {data.luggage.large > 0 && <span>Large ({data.luggage.large}) </span>}
                      {data.luggage.other > 0 && <span>Special ({data.luggage.other}) </span>}
                    </td>
                    <td className="py-4 px-4 text-center font-mono">{data.storage.expectedDurationHours} Hrs</td>
                    <td className="py-4 px-4 text-right font-mono font-bold">₹{data.pricing.storageFee}</td>
                  </tr>

                  {data.pricing.insuranceFee > 0 && (
                    <tr>
                      <td className="py-4 px-4 font-bold text-slate-800">
                        Luggage Insurance Cover
                        <p className="text-[10px] text-slate-400 font-normal mt-0.5">Protection & guarantee against damage or loss</p>
                      </td>
                      <td className="py-4 px-4 text-center">—</td>
                      <td className="py-4 px-4 text-center">—</td>
                      <td className="py-4 px-4 text-right font-mono font-bold">₹{data.pricing.insuranceFee}</td>
                    </tr>
                  )}

                  {data.pricing.courierFee > 0 && (
                    <tr>
                      <td className="py-4 px-4 font-bold text-slate-800">
                        Express Pickup & Delivery Service
                        <p className="text-[10px] text-slate-400 font-normal mt-0.5">Doorstep luggage courier transfer</p>
                      </td>
                      <td className="py-4 px-4 text-center">Courier</td>
                      <td className="py-4 px-4 text-center">—</td>
                      <td className="py-4 px-4 text-right font-mono font-bold">₹{data.pricing.courierFee}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Totals & Tax Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t border-slate-100">
            {/* Security Verification Card */}
            <div className="max-w-xs space-y-3">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black uppercase text-slate-400">Security Verification PIN</p>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  Keep this invoice receipt safe. Show booking code <span className="font-mono font-bold text-slate-800">{data.bookingCode}</span> and verification OTP at drop-off or retrieval.
                </p>
              </div>
            </div>

            {/* Price Calculations Table */}
            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between py-1 text-slate-500">
                <span>Subtotal:</span>
                <span className="font-mono font-bold text-slate-800">₹{data.pricing.subtotal}</span>
              </div>

              {data.pricing.discount > 0 && (
                <div className="flex justify-between py-1 text-emerald-600 font-medium">
                  <span>Discount Applied:</span>
                  <span className="font-mono font-bold">-₹{data.pricing.discount}</span>
                </div>
              )}

              <div className="flex justify-between py-1 text-slate-500">
                <span>CGST (9%):</span>
                <span className="font-mono font-bold text-slate-800">₹{data.pricing.cgstAmount}</span>
              </div>

              <div className="flex justify-between py-1 text-slate-500 pb-2 border-b border-slate-100">
                <span>SGST (9%):</span>
                <span className="font-mono font-bold text-slate-800">₹{data.pricing.sgstAmount}</span>
              </div>

              <div className="flex justify-between py-2 text-xs text-slate-600">
                <span>Total Storage Amount:</span>
                <span className="font-mono font-bold text-slate-800">₹{data.pricing.totalAmount}</span>
              </div>

              {data.pricing.advancePaid > 0 && (
                <div className="flex justify-between py-1 text-teal-600 font-bold">
                  <span>Advance Deposit Paid:</span>
                  <span className="font-mono">-₹{data.pricing.advancePaid}</span>
                </div>
              )}

              <div className="flex justify-between py-3 text-base font-black text-slate-900 bg-slate-50 px-4 rounded-xl">
                <span>Balance Due:</span>
                <span className="font-mono text-[#0D9488]">₹{data.pricing.balanceDue}</span>
              </div>
            </div>
          </div>

          {/* Footer Terms */}
          <div className="pt-8 border-t border-slate-100 text-center space-y-1">
            <p className="text-xs font-bold text-slate-700">Thank you for choosing Luggage Vault Storage!</p>
            <p className="text-[10px] text-slate-400">
              For support or inquiries, please contact our help desk with your invoice number #{data.invoiceNumber}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
