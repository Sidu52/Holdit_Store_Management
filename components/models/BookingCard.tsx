import { Booking } from "@/types/booking";
import { driverName, formatTime, getStatusMeta } from "@/types/Bookingdisplay";
import { User, Package, Truck, ChevronRight, Clock } from "lucide-react";
import { useMemo } from "react";


interface BookingCardProps {
  booking: Booking;
  onClick: (bookingId: string) => void;
}

export default function BookingCard({ booking, onClick }: BookingCardProps) {
  const status = getStatusMeta(booking.status);
  const assignment = booking.pickup?.assignment;
  const dName = driverName(assignment?.driverId);
  const luggageCount = useMemo(() => booking.luggage?.totalCount ?? 0, [booking.luggage]);
  
  console.log("booking", booking);

  return (
    <button
      type="button"
      onClick={() => onClick(booking._id)}
      className="group flex w-full flex-col rounded-xl border border-slate-200 bg-white text-left transition-all hover:border-slate-300 hover:shadow-md"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold text-slate-800">
            {booking.bookingCode}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${status.bg} ${status.text}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full capitalize ${status.dot}`} />
            {status.label}
          </span>
        </div>
        <ChevronRight
          size={18}
          className="text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500"
        />
      </div>

      {/* 3-section body */}
      <div className="flex flex-col divide-y divide-slate-100 sm:flex-row sm:divide-x sm:divide-y-0">
        {/* 1. User details */}
        <div className="flex flex-1 items-start gap-3 px-5 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <User size={16} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-800">
              {booking.userId?.first_name} {booking.userId?.last_name}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">{booking.userId?.phone ?? "—"}</p>
            <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
              <Clock size={11} />
              Pickup {formatTime(booking.pickup?.scheduledAt)}
            </p>
          </div>
        </div>

        {/* 2. Booking info */}
        <div className="flex flex-1 items-start gap-3 px-5 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600">
            <Package size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800">
              {luggageCount} {luggageCount === 1 ? "item" : "items"}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              {booking.luggagePhotos?.pickup?.length ?? 0} photo{(booking.luggagePhotos?.pickup?.length ?? 0) === 1 ? "" : "s"}
            </p>
           <p className="mt-1.5 truncate text-xs text-slate-400">
              {booking.deliveryLocation?.address ?? "No address on file"}
            </p>
          </div>
        </div>

        {/* 3. Driver details */}
        <div className="flex flex-1 items-start gap-3 px-5 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <Truck size={16} />
          </div>
          <div className="min-w-0">
            {dName ? (
              <>
                <p className="truncate text-sm font-medium text-slate-800">{dName}</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  Assigned {formatTime(assignment?.assignedAt)}
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-400">Not assigned yet</p>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}