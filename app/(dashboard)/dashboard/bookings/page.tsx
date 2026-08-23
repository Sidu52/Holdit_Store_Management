"use client";

import React, { useState, useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Calendar, 
  Clock, 
  Package, 
  User, 
  ArrowUpRight, 
  MapPin, 
  DollarSign, 
  Layers, 
  ChevronRight, 
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Store as StoreIcon,
  Filter,
  Eye,
  ExternalLink
} from "lucide-react";
import { bookingApi } from "@/services/bookingApi";
import { useAuth } from "@/hooks/useAuth";

export const getStoreStorageCharge = (b: any) => {
  if (!b) return 0;
  const storeHourlyRate = b.pricing?.pricingSnapshot?.storeStorageHourlyRateMinor
    ? (b.pricing.pricingSnapshot.storeStorageHourlyRateMinor / 100)
    : (b.pricing?.perHourRate ? b.pricing.perHourRate * 0.7 : 14);

  const startedAt = b.storage?.startedAt || b.storage?.storedAt;
  const releasedAt = b.storage?.releasedAt;
  let billableHours = b.pricing?.storageHours || b.storage?.expectedDurationHours || 1;
  if (startedAt && releasedAt) {
    const diffMs = new Date(releasedAt).getTime() - new Date(startedAt).getTime();
    billableHours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
  }

  return +(storeHourlyRate * billableHours).toFixed(2);
};

export default function BookingManagerPage() {
  const router = useRouter();
  const { user, role, isLoading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Tab State
  // For store_owner: "all" | "incoming" | "active" | "past" | "delivered" | "cancelled"
  // For store: "all" | "delivered" | "cancelled"
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedStoreId, setSelectedStoreId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch Store Owner stores (for dropdown filter if store_owner)
  const { data: storesRes } = useSWR(
    role === "store_owner" ? "/store-owner/stores" : null,
    bookingApi.getStores
  );
  const storesList = storesRes?.data?.stores || storesRes?.data || [];

  // Fetching data depending on role
  // Store Manager fetches incoming, active, history
  const { data: storeIncomingRes } = useSWR(
    role === "store" ? "/store/bookings/incoming" : null,
    bookingApi.getIncomingBookings
  );
  const { data: storeActiveRes } = useSWR(
    role === "store" ? "/store/bookings/active" : null,
    bookingApi.getActiveBookings
  );
  const { data: storeHistoryRes } = useSWR(
    role === "store" ? "/store/bookings/history" : null,
    () => bookingApi.getBookingHistory(1, 100)
  );

  // Store Owner fetches all owner bookings or combined
  const { data: ownerBookingsRes } = useSWR(
    role === "store_owner" ? "/store-owner/bookings" : null,
    () => bookingApi.getOwnerBookings()
  );

  if (!mounted || authLoading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-bold text-sm">Loading Booking Vault Manager...</p>
      </div>
    );
  }

  const isOwner = role === "store_owner";

  // Build booking lists based on role
  let rawBookings: any[] = [];

  if (isOwner) {
    // Combine or use owner bookings API response
    const ownerData = ownerBookingsRes?.data?.bookings || ownerBookingsRes?.data || ownerBookingsRes?.bookings;
    if (Array.isArray(ownerData)) {
      rawBookings = ownerData;
    } else {
      // Fallback combined list if endpoint returns object
      const incoming = storeIncomingRes?.data?.bookings || [];
      const active = storeActiveRes?.data?.bookings || [];
      const history = storeHistoryRes?.data?.bookings || [];
      rawBookings = [...incoming, ...active, ...history];
    }
  } else {
    // Store role: Show ONLY store past bookings (history)
    rawBookings = storeHistoryRes?.data?.bookings || storeHistoryRes?.data || [];
  }

  // Filter list by selected status tab, store filter, and search term
  const getFilteredBookings = () => {
    let result = [...rawBookings];

    // Filter by Store Outlet dropdown (for Store Owner)
    if (isOwner && selectedStoreId !== "all") {
      result = result.filter((b: any) => {
        const id = b.storeId?._id || b.storeId || b.store_id;
        return id === selectedStoreId;
      });
    }

    // Helper: Check if a cancelled booking was accepted and stored in storage vault
    const isStoredCancelled = (b: any) => {
      const isCancelled = ["cancelled", "canceled"].includes(b.status?.toLowerCase());
      if (!isCancelled) return false;
      // Show ONLY cancelled bookings that were accepted & stored in storage
      const wasStored = Boolean(
        b.storage?.storedAt || 
        b.storedAt || 
        b.wasStored || 
        b.was_stored || 
        b.acceptedForStorage ||
        b.pickup?.assignment?.completedAt ||
        (b.luggagePhotos?.storage && b.luggagePhotos.storage.length > 0)
      );
      return wasStored;
    };

    // Filter by Tab
    if (isOwner) {
      if (activeTab === "incoming") {
        result = result.filter((b: any) => 
          ["incoming", "driver_assigned", "at_store", "pending"].includes(b.status?.toLowerCase())
        );
      } else if (activeTab === "active") {
        result = result.filter((b: any) => 
          ["stored", "active", "in_vault", "storing"].includes(b.status?.toLowerCase())
        );
      } else if (activeTab === "past") {
        result = result.filter((b: any) => {
          const st = b.status?.toLowerCase();
          if (["delivered", "completed", "released"].includes(st)) return true;
          if (["cancelled", "canceled"].includes(st)) return isStoredCancelled(b);
          return false;
        });
      } else if (activeTab === "delivered") {
        result = result.filter((b: any) => 
          ["delivered", "completed"].includes(b.status?.toLowerCase())
        );
      } else if (activeTab === "cancelled") {
        result = result.filter((b: any) => isStoredCancelled(b));
      }
    } else {
      // For Store: filters for past bookings
      if (activeTab === "all") {
        result = result.filter((b: any) => {
          const st = b.status?.toLowerCase();
          if (["cancelled", "canceled"].includes(st)) {
            return isStoredCancelled(b);
          }
          return true;
        });
      } else if (activeTab === "delivered") {
        result = result.filter((b: any) => 
          ["delivered", "completed"].includes(b.status?.toLowerCase())
        );
      } else if (activeTab === "cancelled") {
        result = result.filter((b: any) => isStoredCancelled(b));
      }
    }

    // Search query filter
    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase();
      result = result.filter((booking: any) => {
        const code = (booking.bookingCode || booking._id || "").toLowerCase();
        const client = `${booking.userInfo?.firstName || booking.userId?.first_name || ""} ${booking.userInfo?.lastName || booking.userId?.last_name || ""}`.toLowerCase();
        const store = (booking.storeId?.store_name || booking.store_name || "").toLowerCase();
        return code.includes(term) || client.includes(term) || store.includes(term);
      });
    }

    return result;
  };

  const filteredList = getFilteredBookings();
  const selectedBooking = rawBookings.find(b => b._id === selectedBookingId);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Header Banner */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Vault Bookings & History</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              isOwner ? "bg-teal-100 text-teal-800" : "bg-indigo-100 text-indigo-800"
            }`}>
              {isOwner ? "Store Owner View" : "Store Vault View"}
            </span>
          </div>
          <p className="text-slate-500 font-medium text-xs mt-1">
            Manage incoming arrivals, active storage parcels, and past completed tickets across outlets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filtered Bookings</p>
            <p className="text-lg font-black text-slate-800">{filteredList.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs & Controls */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl w-full lg:w-auto overflow-x-auto">
          {isOwner ? (
            <>
              <button
                onClick={() => { setActiveTab("all"); setSelectedBookingId(null); }}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  activeTab === "all" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                All Outlets
              </button>
              <button
                onClick={() => { setActiveTab("incoming"); setSelectedBookingId(null); }}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  activeTab === "incoming" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Incoming
              </button>
              <button
                onClick={() => { setActiveTab("active"); setSelectedBookingId(null); }}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  activeTab === "active" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Active Stored
              </button>
              <button
                onClick={() => { setActiveTab("past"); setSelectedBookingId(null); }}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  activeTab === "past" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Past
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { setActiveTab("all"); setSelectedBookingId(null); }}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  activeTab === "all" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                All Past
              </button>
            </>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 max-w-xl">
          {isOwner && storesList.length > 0 && (
            <div className="relative w-full sm:w-48">
              <StoreIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={selectedStoreId}
                onChange={(e) => setSelectedStoreId(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0D9488] text-xs font-bold text-slate-700 rounded-2xl focus:outline-none appearance-none transition-all cursor-pointer"
              >
                <option value="all">All Outlets</option>
                {storesList.map((s: any) => (
                  <option key={s._id} value={s._id}>
                    {s.store_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by code, customer, or outlet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0D9488] text-xs font-bold text-slate-700 placeholder-slate-400 rounded-2xl focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {filteredList.length === 0 ? (
            <div className="bg-white rounded-[2rem] border border-slate-100 p-16 text-center shadow-sm flex flex-col items-center justify-center">
              <Layers className="text-slate-300 mb-3" size={48} />
              <p className="font-bold text-slate-600 text-base">No matching bookings found</p>
            </div>
          ) : (
            filteredList.map((booking: any) => {
              const clientName = booking.userInfo?.firstName
                ? `${booking.userInfo.firstName} ${booking.userInfo.lastName || ""}`.trim()
                : booking.userId?.first_name
                ? `${booking.userId.first_name} ${booking.userId.last_name || ""}`.trim()
                : "Guest Client";

              const storeName = booking.storeId?.store_name || booking.store_name || "Outlet Vault";
              const isSelected = selectedBookingId === booking._id;
              const itemStorageCharge = getStoreStorageCharge(booking);

              return (
                <div
                  key={booking._id}
                  className={`bg-white p-6 rounded-[2rem] border shadow-sm transition-all duration-300 hover:-translate-y-0.5 ${
                    isSelected ? "border-[#0D9488] bg-teal-50/20 ring-1 ring-[#0D9488]/40" : "border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div 
                      className="flex items-start gap-4 cursor-pointer flex-1"
                      onClick={() => setSelectedBookingId(booking._id)}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        booking.status === "stored" ? "bg-emerald-50 text-emerald-600" :
                        booking.status === "delivered" ? "bg-teal-50 text-teal-600" :
                        booking.status === "cancelled" ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-600"
                      }`}>
                        <Package size={22} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-slate-800 text-xs">
                            {booking.bookingCode || booking._id}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-700 mt-1">{clientName}</h4>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                          {storeName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <p className="text-sm font-black text-slate-850">
                          ₹{itemStorageCharge}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                          {booking.luggage?.totalCount || booking.itemsCount || 1} Bags
                        </p>
                      </div>

                      <Link
                        href={`/dashboard/bookings/${booking._id}`}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-[#0D9488] text-slate-600 hover:text-white text-xs font-bold transition-colors"
                      >
                        <Eye size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm h-fit space-y-6">
          {selectedBooking ? (
            <>
              <div className="flex items-start justify-between border-b border-slate-50 pb-6">
                <div>
                  <h3 className="text-lg font-black text-slate-800">
                    {selectedBooking.userInfo?.firstName || selectedBooking.userId?.first_name}{" "}
                    {selectedBooking.userInfo?.lastName || selectedBooking.userId?.last_name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedBookingId(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Billing Log</h4>
                <div className="p-4 bg-teal-50/20 border border-teal-100/50 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-teal-600" />
                    <span className="text-sm font-bold text-slate-700">Store Storage Charge</span>
                  </div>
                  <span className="text-base font-black text-teal-700">
                    ₹{getStoreStorageCharge(selectedBooking)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Drop Location</h4>
                <div className="flex items-start gap-2.5 text-xs text-slate-500 font-medium">
                  <MapPin size={16} className="text-slate-400 flex-shrink-0 mt-0.5" />
                  <p>{selectedBooking.pickupLocation?.address || selectedBooking.deliveryLocation?.address || "Address registered in vault system"}</p>
                </div>
              </div>

              {/* Security OTP */}
              {selectedBooking.status?.toLowerCase() !== "delivered" && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Storage Verification</h4>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                    <ShieldCheck size={20} className="text-teal-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-700">PIN Verification</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Booking requires OTP validation on drop-off and pickup.</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-20 text-center text-slate-350 flex flex-col items-center justify-center">
              <Calendar size={48} strokeWidth={1} className="mb-3 opacity-20" />
              <p className="font-bold text-slate-400">Select a Booking</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                Click any booking card on the left to inspect its detailed manifest or open its direct page.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
