"use client";

import { useState } from "react";
import useSWR from "swr";
import { bookingApi } from "../../../../services/bookingApi";
import BookingCard from "../../../../components/models/BookingCard";
import BookingDetailDrawer from "../../../../components/models/BookingDetailDrawer";
import { Booking } from "../../../../types/booking";
import { Vault } from "lucide-react";

export default function InventoryVaultPage() {
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: activeBookings, isLoading } = useSWR(
    "/store/bookings/active",
    bookingApi.getActiveBookings
  );

  console.log("activeBookings", activeBookings);

  const vaultList: Booking[] = activeBookings?.data?.bookings ?? [];

  const handleOpenDetail = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedBookingId(null), 300);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 px-6 py-8 text-white sm:px-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-4 top-10 h-32 w-32 rounded-full border border-white/10" />

        <div className="relative flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
            <Vault size={24} strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/60">
              Inventory Vault
            </p>
            <h1 className="mt-0.5 text-2xl font-bold sm:text-3xl">
              {vaultList.length} {vaultList.length === 1 ? "parcel" : "parcels"} in storage
            </h1>
            <p className="mt-1 text-sm text-white/60">
              Currently stored items securely held in the store vault.
            </p>
          </div>
        </div>
      </div>

      {/* Item List */}
      <div className="mt-6 flex flex-col gap-3">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-32 w-full animate-pulse rounded-xl bg-slate-100" />
          ))
        ) : vaultList.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-16 text-center text-sm text-slate-400">
            No parcels currently stored in the vault.
          </div>
        ) : (
          vaultList.map((booking) => (
            <BookingCard key={booking._id} booking={booking} onClick={handleOpenDetail} />
          ))
        )}
      </div>

      <BookingDetailDrawer
        bookingId={selectedBookingId}
        open={drawerOpen}
        onClose={handleCloseDrawer}
      />
    </div>
  );
}
