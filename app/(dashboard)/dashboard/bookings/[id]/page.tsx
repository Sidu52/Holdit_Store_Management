"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import { 
  ArrowLeft, 
  Package, 
  User, 
  Truck, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  DollarSign, 
  AlertCircle, 
  Lock, 
  CheckCircle2, 
  Store, 
  Calendar,
  ImageOff,
  Copy,
  Check,
  Eye,
  EyeOff,
  Printer,
  FileText,
  Loader2,
  KeyRound
} from "lucide-react";
import { bookingApi } from "@/services/bookingApi";
import { useAuth } from "@/hooks/useAuth";
import EarningStatementCard from "@/components/earnings/EarningStatementCard";

function maskPhoneNumber(phone: string) {
  if (!phone || phone === "—") return "—";
  const digitsOnly = phone.replace(/\D/g, "");
  if (digitsOnly.length >= 6) {
    const prefix = digitsOnly.slice(0, 3);
    return `${prefix}${"*".repeat(digitsOnly.length - 3)}`;
  }
  return phone.slice(0, 3) + "*******";
}

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params?.id as string;
  const { user, role, isLoading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [showReturnOtp, setShowReturnOtp] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isOwner = role === "store_owner";

  // SWR call based on role
  const { data: bookingRes, error, isLoading, mutate } = useSWR(
    bookingId && !authLoading ? `booking_detail_${bookingId}_${role}` : null,
    async () => {
      if (isOwner) {
        return await bookingApi.getOwnerBookingDetail(bookingId);
      } else {
        return await bookingApi.getBookingDetail(bookingId);
      }
    }
  );

  const booking = bookingRes?.data?.booking || bookingRes?.data || bookingRes?.booking;

  if (!mounted || authLoading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-bold text-sm">Loading Booking Details...</p>
      </div>
    );
  }

  // ACCESS CONTROL CHECK:
  // Store only accesses own booking details.
  // Check if store user matches booking store ID/Name if role is "store"
  const isUnauthorizedStore = (() => {
    if (isOwner) return false; // Store owner gets all synced bookings
    if (error || !booking) return false; // Will handle error / not found separately

    const storeUserId = user?._id || user?.id || user?.store_id;
    const storeUserStoreName = (user?.store_name || "").toLowerCase().trim();

    const bookingStoreObj = booking.storeId || booking.store_id || {};
    const bookingStoreId = typeof bookingStoreObj === "string" ? bookingStoreObj : (bookingStoreObj._id || bookingStoreObj.id);
    const bookingStoreName = (bookingStoreObj.store_name || booking.store_name || "").toLowerCase().trim();

    // If storeId or storeName exist, check match
    if (storeUserId && bookingStoreId) {
      return storeUserId.toString() !== bookingStoreId.toString();
    }

    if (storeUserStoreName && bookingStoreName) {
      return storeUserStoreName !== bookingStoreName;
    }

    return false;
  })();

  if (isUnauthorizedStore) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 space-y-6">
        <button
          onClick={() => router.push("/dashboard/bookings")}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Bookings
        </button>

        <div className="bg-rose-50 border border-rose-200 rounded-[2rem] p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <Lock size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-rose-900">Access Restricted</h2>
            <p className="text-rose-700 text-sm font-medium mt-2 max-w-md mx-auto">
              Store staff can only access booking details for their own assigned store location. You do not have permission to view this booking record.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/dashboard/bookings"
              className="inline-flex px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm transition-all shadow-md shadow-rose-600/20"
            >
              Return to Store Bookings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-bold text-sm">Fetching Booking Data #{bookingId}...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 space-y-6">
        <button
          onClick={() => router.push("/dashboard/bookings")}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Bookings
        </button>

        <div className="bg-white border border-slate-200 rounded-[2rem] p-12 text-center space-y-4">
          <AlertCircle size={48} className="text-slate-400 mx-auto opacity-40" />
          <h2 className="text-xl font-bold text-slate-800">Booking Record Not Found</h2>
          <p className="text-slate-500 text-xs max-w-sm mx-auto">
            The booking ID <span className="font-mono font-bold text-slate-700">{bookingId}</span> could not be located or you may not have authorization to view it.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard/bookings"
              className="inline-flex px-6 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 transition-all"
            >
              Return to Bookings List
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Extract variables
  const code = booking.bookingCode || booking._id;
  const status = booking.status || "pending";
  const isDelivered = status.toLowerCase() === "delivered";

  const guestName = booking.userInfo?.firstName
    ? `${booking.userInfo.firstName} ${booking.userInfo.lastName || ""}`.trim()
    : booking.userId?.first_name
    ? `${booking.userId.first_name} ${booking.userId.last_name || ""}`.trim()
    : "Guest Client";

  const rawPhone = booking.userInfo?.phone || booking.userId?.phone || "—";
  const guestPhone = isDelivered && rawPhone !== "—" ? maskPhoneNumber(rawPhone) : rawPhone;
  const storeName = booking.storeId?.store_name || booking.store_name || "Vault Outlet";
  const totalLuggage = booking.luggage?.totalCount || booking.itemsCount || 1;

  const storeHourlyRate = booking.pricing?.pricingSnapshot?.storeStorageHourlyRateMinor
    ? (booking.pricing.pricingSnapshot.storeStorageHourlyRateMinor / 100)
    : (booking.pricing?.perHourRate ? booking.pricing.perHourRate * 0.7 : 14);

  const startedAt = booking.storage?.startedAt || booking.storage?.storedAt;
  const releasedAt = booking.storage?.releasedAt;
  let billableHours = booking.pricing?.storageHours || booking.storage?.expectedDurationHours || 1;
  if (startedAt && releasedAt) {
    const diffMs = new Date(releasedAt).getTime() - new Date(startedAt).getTime();
    billableHours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
  }

  const storeStorageCharge = +(storeHourlyRate * billableHours).toFixed(2);
  const address = booking.pickupLocation?.address || booking.deliveryLocation?.address || "Registered Outlet Storage";

  const pickupPhotos = booking.luggagePhotos?.pickup || [];
  const storagePhotos = booking.luggagePhotos?.storage || [];
  const deliveryPhotos = booking.luggagePhotos?.delivery || [];
  const allPhotos = [...pickupPhotos, ...storagePhotos, ...deliveryPhotos];

  const hasReturnOtp = !isDelivered && Boolean(booking.delivery?.assignment?.storageReturnOtp || booking.delivery?.assignment?.returnOtp);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Top Bar Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => router.push("/dashboard/bookings")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm"
        >
          <ArrowLeft size={16} /> Back to Bookings
        </button>

        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
            isOwner ? "bg-teal-100 text-teal-800" : "bg-indigo-100 text-indigo-800"
          }`}>
            {isOwner ? "Owner Synced Ticket" : "Store Vault Ticket"}
          </span>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-xl font-black text-slate-800">{code}</span>
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              status === "stored"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                : status === "delivered"
                ? "bg-teal-50 text-teal-700 border border-teal-100"
                : status === "cancelled"
                ? "bg-rose-50 text-rose-700 border border-rose-100"
                : "bg-amber-50 text-amber-700 border border-amber-100"
            }`}>
              {status}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 mt-2">{guestName}</h1>
          <p className="text-xs text-slate-400 font-medium mt-1 flex items-center gap-2">
            <Store size={14} className="text-slate-400" />
            <span>{storeName}</span>
            <span>•</span>
            <Clock size={14} className="text-slate-400" />
            <span>Duration: {billableHours} Hour(s)</span>
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-left md:text-right shrink-0">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Store Storage Charge</p>
          <p className="text-2xl font-black text-[#0D9488] mt-0.5">₹{storeStorageCharge}</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{totalLuggage} Luggage Items</p>
        </div>
      </div>

      {/* Store Earning Statement Card */}
      <EarningStatementCard bookingId={booking._id} />

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <User size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Customer Info</h3>
              <p className="text-xs text-slate-400">Guest details & contact</p>
            </div>
          </div>
          <div className="space-y-2 pt-2 border-t border-slate-50 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium text-xs">Name:</span>
              <span className="font-bold text-slate-700">{guestName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium text-xs">Phone:</span>
              <span className="font-mono font-bold text-slate-700">{guestPhone}</span>
            </div>
          </div>
        </div>

        {/* Store Outlet Info */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <Store size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Storage Outlet</h3>
              <p className="text-xs text-slate-400">Assigned vault location</p>
            </div>
          </div>
          <div className="space-y-2 pt-2 border-t border-slate-50 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium text-xs">Outlet:</span>
              <span className="font-bold text-slate-700">{storeName}</span>
            </div>
            <div className="flex items-start gap-2 pt-1 text-xs text-slate-500">
              <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
              <span>{address}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Luggage Breakdown & Security Card */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-50 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Package size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800">Luggage Manifest Breakdown</h3>
              <p className="text-xs text-slate-400">Itemized count of stored items</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-black text-slate-700">
            {totalLuggage} Total Bags
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Small</p>
            <p className="text-xl font-black text-slate-800 mt-1">{booking.luggage?.small || 0}</p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Medium</p>
            <p className="text-xl font-black text-slate-800 mt-1">{booking.luggage?.medium || 0}</p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Large</p>
            <p className="text-xl font-black text-slate-800 mt-1">{booking.luggage?.large || 0}</p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Special / Other</p>
            <p className="text-xl font-black text-slate-800 mt-1">{booking.luggage?.other || 0}</p>
          </div>
        </div>

        {/* Security OTP section */}
        {hasReturnOtp && (
          <div className="p-5 bg-violet-50/60 border border-violet-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound size={18} className="text-violet-600" />
                <span className="text-sm font-bold text-slate-800">Return Luggage Security OTP</span>
              </div>
              <button
                onClick={() => setShowReturnOtp(!showReturnOtp)}
                className="text-xs font-bold text-violet-600 hover:text-violet-800 flex items-center gap-1"
              >
                {showReturnOtp ? <EyeOff size={14} /> : <Eye size={14} />}
                {showReturnOtp ? "Hide OTP" : "Show OTP"}
              </button>
            </div>
            {showReturnOtp && (
              <div className="p-4 bg-white rounded-xl border border-violet-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Return Passcode</p>
                  <p className="font-mono text-xl font-black tracking-widest text-slate-800 mt-0.5">
                    {booking.delivery?.assignment?.storageReturnOtp || booking.delivery?.assignment?.returnOtp}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Driver Assignments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Truck size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Pickup Driver</h3>
              <p className="text-xs text-slate-400">Assigned collection agent</p>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-50 text-xs text-slate-600 space-y-1 font-medium">
            <p>Driver: <span className="font-bold text-slate-800">{booking.pickup?.assignment?.driverId?.first_name || "Assigned Driver"}</span></p>
            <p>Status: <span className="font-bold text-amber-700 capitalize">{booking.pickup?.assignment ? "Assigned" : "Pending"}</span></p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Truck size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Delivery Driver</h3>
              <p className="text-xs text-slate-400">Assigned return agent</p>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-50 text-xs text-slate-600 space-y-1 font-medium">
            <p>Driver: <span className="font-bold text-slate-800">{booking.delivery?.assignment?.driverId?.first_name || "Unassigned"}</span></p>
            <p>Status: <span className="font-bold text-emerald-700 capitalize">{booking.delivery?.assignment ? "Assigned" : "Pending Request"}</span></p>
          </div>
        </div>
      </div>

      {/* Photos Gallery */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-base font-black text-slate-800">Luggage Inspection Photos</h3>
        {allPhotos.length === 0 ? (
          <div className="p-8 bg-slate-50 border border-slate-100 rounded-2xl text-center text-slate-400 text-xs font-bold">
            No inspection photos attached for this booking ticket.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {allPhotos.map((imgUrl: string, idx: number) => (
              <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 relative">
                <img src={imgUrl} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded">
                  #{idx + 1}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
