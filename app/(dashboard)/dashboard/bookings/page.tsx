"use client";

import React, { useState } from "react";
import useSWR from "swr";
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
  AlertCircle
} from "lucide-react";
import { bookingApi } from "../../../../services/bookingApi";

export default function BookingManagerPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"incoming" | "active" | "history">("incoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // SWR Hook calls
  const { data: incomingRes, mutate: mutateIncoming } = useSWR("/store/bookings/incoming", bookingApi.getIncomingBookings);
  const { data: activeRes, mutate: mutateActive } = useSWR("/store/bookings/active", bookingApi.getActiveBookings);
  const { data: historyRes, mutate: mutateHistory } = useSWR("/store/bookings/history", () => bookingApi.getBookingHistory(1, 100));

  const [confirming, setConfirming] = useState(false);

  const handleConfirmStorage = async (bookingId: string) => {
    if (!confirm("Confirm you have received all luggage items for this booking?")) return;
    setConfirming(true);
    try {
      await bookingApi.confirmStored(bookingId, "");
      mutateIncoming();
      mutateActive();
      mutateHistory();
      setSelectedBookingId(null);
    } catch (error) {
      console.error(error);
      alert("Failed to confirm storage. Please try again.");
    } finally {
      setConfirming(false);
    }
  };

  const incomingList = incomingRes?.data?.bookings || [];
  const activeList = activeRes?.data?.bookings || [];
  const historyList = historyRes?.data?.bookings || [];

  if (!mounted) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-bold text-sm">Loading Booking Vault Manager...</p>
      </div>
    );
  }

  // Filter list based on selected tab and search query
  const getFilteredList = () => {
    let currentList = [];
    if (activeTab === "incoming") currentList = incomingList;
    else if (activeTab === "active") currentList = activeList;
    else currentList = historyList;

    if (!searchQuery.trim()) return currentList;

    const term = searchQuery.toLowerCase();
    return currentList.filter((booking: any) => {
      const code = (booking.bookingCode || "").toLowerCase();
      const client = `${booking.userInfo?.firstName || ""} ${booking.userInfo?.lastName || ""}`.toLowerCase();
      const store = (booking.storeId?.store_name || "").toLowerCase();
      return code.includes(term) || client.includes(term) || store.includes(term);
    });
  };

  const filteredList = getFilteredList();

  // Find selected booking full details
  const allBookings = [...incomingList, ...activeList, ...historyList];
  const selectedBooking = allBookings.find(b => b._id === selectedBookingId);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Booking Vault Manager</h1>
        <p className="text-slate-500 font-medium mt-1">
          Browse active luggage vault tickets, manage drop-offs, and track secure storage lifecycles.
        </p>
      </div>

      {/* Control Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        {/* Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => { setActiveTab("incoming"); setSelectedBookingId(null); }}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === "incoming" ? "bg-white text-[#0D9488] shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Incoming ({incomingList.length})
          </button>
          <button
            onClick={() => { setActiveTab("active"); setSelectedBookingId(null); }}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === "active" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Stored Vault ({activeList.length})
          </button>
          <button
            onClick={() => { setActiveTab("history"); setSelectedBookingId(null); }}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === "history" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Completed / History ({historyList.length})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by code, customer, or outlet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0D9488] text-sm font-bold text-slate-700 placeholder-slate-400 rounded-2xl focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bookings List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredList.length === 0 ? (
            <div className="bg-white rounded-[2rem] border border-slate-100 p-16 text-center shadow-sm flex flex-col items-center justify-center">
              <Layers className="text-slate-300 mb-3" size={48} />
              <p className="font-bold text-slate-550 text-base">No matching bookings found</p>
              <p className="text-xs text-slate-400 mt-1">Refine your search term or select another category tab above.</p>
            </div>
          ) : (
            filteredList.map((booking: any) => {
              const clientName = booking.userInfo?.firstName
                ? `${booking.userInfo.firstName} ${booking.userInfo.lastName || ""}`.trim()
                : "Guest Client";
              const isSelected = selectedBookingId === booking._id;

              return (
                <div
                  key={booking._id}
                  onClick={() => setSelectedBookingId(booking._id)}
                  className={`bg-white p-6 rounded-[2rem] border shadow-sm flex items-center justify-between cursor-pointer transition-all duration-300 hover:-translate-y-0.5 ${
                    isSelected ? "border-[#0D9488] bg-teal-50/20 ring-1 ring-[#0D9488]/40" : "border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      activeTab === "incoming" ? "bg-teal-50 text-teal-650" : activeTab === "active" ? "bg-indigo-50 text-indigo-650" : "bg-slate-100 text-slate-550"
                    }`}>
                      <Package size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-800 text-xs">
                          {booking.bookingCode}
                        </span>
                        <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                          booking.status === "stored"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : booking.status === "delivered"
                            ? "bg-teal-50 text-teal-700 border border-teal-100"
                            : booking.status === "cancelled"
                            ? "bg-rose-50 text-rose-700 border border-rose-100"
                            : "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-700 mt-1">{clientName}</h4>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        {booking.storeId?.store_name || "Outlet Storage"} • {booking.storage?.expectedDurationHours || 0} Hours Duration
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-sm font-black text-slate-850">
                        ₹{booking.pricing?.totalAmount || 0}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                        {booking.luggage?.totalCount || 1} Bags
                      </p>
                    </div>
                    <ChevronRight size={18} className="text-slate-400" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Details Drawer */}
        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm h-fit space-y-6">
          {selectedBooking ? (
            <>
              {/* Header Details */}
              <div className="flex items-start justify-between border-b border-slate-50 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-slate-805 text-sm">{selectedBooking.bookingCode}</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-800 mt-1">
                    {selectedBooking.userInfo?.firstName} {selectedBooking.userInfo?.lastName}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedBookingId(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Luggage break down */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-450 uppercase tracking-wider">Luggage Vault Manifest</h4>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl grid grid-cols-2 gap-4 text-center">
                  <div className="border-r border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Total Items</p>
                    <p className="text-lg font-black text-slate-850 mt-0.5">{selectedBooking.luggage?.totalCount || 1}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Duration Expected</p>
                    <p className="text-lg font-black text-slate-850 mt-0.5">{selectedBooking.storage?.expectedDurationHours || 0} Hrs</p>
                  </div>
                </div>
                <div className="text-xs space-y-1.5 px-1 font-medium text-slate-500">
                  <p>• Small bags/items: <span className="font-bold text-slate-700">{selectedBooking.luggage?.small || 0}</span></p>
                  <p>• Medium bags: <span className="font-bold text-slate-700">{selectedBooking.luggage?.medium || 0}</span></p>
                  <p>• Large bags/suitcases: <span className="font-bold text-slate-700">{selectedBooking.luggage?.large || 0}</span></p>
                  <p>• Special items: <span className="font-bold text-slate-700">{selectedBooking.luggage?.other || 0}</span></p>
                </div>
              </div>

              {/* Billing */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-450 uppercase tracking-wider">Billing Log</h4>
                <div className="p-4 bg-teal-50/20 border border-teal-100/50 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-teal-650" />
                    <span className="text-sm font-bold text-slate-700">Total Price Charged</span>
                  </div>
                  <span className="text-base font-black text-teal-700">₹{selectedBooking.pricing?.totalAmount || 0}</span>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-450 uppercase tracking-wider">Drop Location</h4>
                <div className="flex items-start gap-2.5 text-xs text-slate-500 font-medium">
                  <MapPin size={16} className="text-slate-400 flex-shrink-0 mt-0.5" />
                  <p>{selectedBooking.pickupLocation?.address}</p>
                </div>
              </div>

              {/* Security OTP */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-450 uppercase tracking-wider">Storage Verification</h4>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                  <ShieldCheck size={20} className="text-teal-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-700">Secure Pin verification</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">This booking requires OTP validation on drop-off and collection.</p>
                  </div>
                </div>
              </div>

              {/* Confirm Receipt & Store CTA */}
              {selectedBooking.status === "at_store" && (
                <button
                  onClick={() => handleConfirmStorage(selectedBooking._id)}
                  disabled={confirming}
                  className="w-full py-4 bg-[#0D9488] hover:bg-[#0F766E] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-teal-500/10 hover:shadow-teal-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <CheckCircle2 size={16} />
                  {confirming ? "Confirming Receipt..." : "Confirm Receipt & Store"}
                </button>
              )}
            </>
          ) : (
            <div className="py-20 text-center text-slate-350 flex flex-col items-center justify-center">
              <Calendar size={48} strokeWidth={1} className="mb-3 opacity-20" />
              <p className="font-bold text-slate-400">Select a Booking</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Click any booking card on the left to inspect its detailed manifest.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
