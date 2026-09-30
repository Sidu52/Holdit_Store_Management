"use client";

import React, { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { 
  User, 
  Phone, 
  Shield, 
  Calendar, 
  CheckCircle2, 
  Landmark,
  Lock,
  ShieldCheck,
  Clock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Headphones,
  CreditCard
} from "lucide-react";
import { authApi } from "@/services/authApi";

export default function ProfilePage() {
  const { data: userRes } = useSWR("/me");
  const user = userRes?.data || {};
  const isStoreOwner = user.role === "store_owner";

  // Only store_owner should ever fetch or access store-owner profile
  const { data: ownerProfileRes } = useSWR(
    isStoreOwner ? "/store-owner/profile" : null,
    () => authApi.getOwnerProfile().catch(() => null)
  );

  const [showFullAccount, setShowFullAccount] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const owner = ownerProfileRes?.data?.owner || {};
  const bankDetails = isStoreOwner ? (user.bankDetails || owner.bankDetails || {}) : {};

  const name = user.first_name
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : user.store_name || "Authorized Member";

  const registeredDate = user.createdAt 
    ? new Date(user.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })
    : "Verified Registration";

  const copyToClipboard = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const rawAccount = bankDetails.accountNumber || "";
  const maskedAccount = rawAccount.length > 4
    ? `•••• •••• •••• ${rawAccount.slice(-4)}`
    : rawAccount || "Not configured during signup";

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Account Profile</h1>
        <p className="text-slate-500 font-medium mt-1">Manage your secure dashboard identity, login credentials and settlement accounts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Card - Badge info */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center">
              <User size={48} />
            </div>
            <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center" title="Online Verified">
              <div className="w-2.5 h-2.5 bg-emerald-100 rounded-full animate-ping" />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">{name}</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
              {user.role === "store_owner" ? "Store Owner (Multi-Outlet)" : (user.role || "Store Representative")}
            </p>
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
            <Shield size={18} className="text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-slate-700">Enterprise Access Scope</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Your role credentials authorize actions within this partner dashboard. Ensure your OTP credentials remain confidential.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bank & Settlement Credentials (Read-Only) - ONLY for Store Owner */}
      {isStoreOwner && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <Landmark size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">
                  Bank & Settlement Credentials
                </h3>
                <p className="text-xs font-medium text-slate-400 mt-0.5">
                  Payout account provided during onboarding for monthly store earnings disbursement.
                </p>
              </div>
            </div>

            {/* Strict Read-Only Lock Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-xs font-black uppercase tracking-wider self-start sm:self-auto">
              <Lock size={12} className="text-slate-500" />
              Locked (Read-Only)
            </div>
          </div>

          {/* Bank Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Beneficiary Name */}
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Beneficiary</p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-700 text-sm truncate">
                  {bankDetails.beneficiaryName || "Not provided during signup"}
                </span>
                {bankDetails.beneficiaryName && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(bankDetails.beneficiaryName, "beneficiary")}
                    className="text-slate-400 hover:text-slate-600 ml-2"
                    title="Copy Beneficiary Name"
                  >
                    {copiedField === "beneficiary" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                )}
              </div>
            </div>

            {/* Bank Account Number */}
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Number</p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between font-mono">
                <span className="font-bold text-slate-700 text-sm">
                  {showFullAccount ? (rawAccount || "Not configured") : maskedAccount}
                </span>
                <div className="flex items-center gap-1.5 ml-2">
                  {rawAccount && (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowFullAccount(!showFullAccount)}
                        className="text-slate-400 hover:text-slate-600 p-0.5"
                        title={showFullAccount ? "Hide account number" : "Show full account number"}
                      >
                        {showFullAccount ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(rawAccount, "account")}
                        className="text-slate-400 hover:text-slate-600 p-0.5"
                        title="Copy Account Number"
                      >
                        {copiedField === "account" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* IFSC Code */}
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bank IFSC Code</p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between font-mono">
                <span className="font-bold text-slate-700 text-sm">
                  {bankDetails.ifscCode || "N/A"}
                </span>
                {bankDetails.ifscCode && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(bankDetails.ifscCode, "ifsc")}
                    className="text-slate-400 hover:text-slate-600 ml-2"
                    title="Copy IFSC Code"
                  >
                    {copiedField === "ifsc" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                )}
              </div>
            </div>

            {/* UPI ID */}
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">UPI ID (VPA)</p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between font-mono">
                <span className="font-bold text-slate-700 text-sm">
                  {bankDetails.upiId || "Not configured"}
                </span>
                {bankDetails.upiId && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(bankDetails.upiId, "upi")}
                    className="text-slate-400 hover:text-slate-600 ml-2"
                    title="Copy UPI ID"
                  >
                    {copiedField === "upi" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                )}
              </div>
            </div>

            {/* Preferred Mode */}
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Disbursement Mode</p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                <CreditCard size={14} className="text-teal-700" />
                <span className="font-black text-slate-800 text-sm">
                  {bankDetails.preferredMode || "IMPS"}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold ml-auto">Automated</span>
              </div>
            </div>

            {/* Verification Status */}
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verification Status</p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center">
                {bankDetails.isVerified ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 size={12} />
                    Verified Account
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-50 text-amber-700 border border-amber-200">
                    <Clock size={12} />
                    Pending Verification
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Security Policy Alert Banner */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 mt-0.5 border border-teal-100">
                <ShieldCheck size={18} />
              </div>
              <div className="text-xs text-slate-600 leading-relaxed">
                <p className="font-bold text-slate-800">Bank Details Locked for Payout Security</p>
                <p className="mt-0.5 text-slate-500">
                  To prevent fraud and protect your monthly settlement revenue, you cannot edit bank details directly. Only <span className="font-bold text-slate-700">Contact Support Team</span> can help you update your bank credentials.
                </p>
              </div>
            </div>

            <Link
              href="/dashboard/support"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-teal-300 hover:bg-teal-50 text-slate-700 hover:text-teal-800 text-xs font-bold transition-all shrink-0 shadow-xs"
            >
              <Headphones size={14} />
              <span>Contact Support</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
