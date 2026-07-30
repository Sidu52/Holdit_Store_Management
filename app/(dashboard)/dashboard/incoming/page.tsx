"use client";

import { useState } from "react";
import useSWR from "swr";
import { bookingApi } from "../../../../services/bookingApi";
import IncomingBanner from "../../../../components/atom/IncomingBanner";
import BookingCard from "../../../../components/models/BookingCard";
import BookingDetailDrawer from "../../../../components/models/BookingDetailDrawer";
import { Booking } from "../../../../types/booking";

export default function IncomingBookingsPage() {
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: incomingBookings, isLoading } = useSWR(
    "/store/bookings/incoming",
    bookingApi.getIncomingBookings
  );

  const incomingList: Booking[] = incomingBookings?.data?.bookings ?? [];

  const handleOpenDetail = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    // clear the id after the close transition finishes so SWR key drops cleanly
    setTimeout(() => setSelectedBookingId(null), 300);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <IncomingBanner count={incomingList.length} />

      <div className="mt-6 flex flex-col gap-3">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-32 w-full animate-pulse rounded-xl bg-slate-100" />
          ))
        ) : incomingList.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-16 text-center text-sm text-slate-400">
            No incoming bookings right now.
          </div>
        ) : (
          incomingList.map((booking) => (
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