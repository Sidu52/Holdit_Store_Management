import { Booking } from "@/types/booking";
import { driverName, formatTime, getStatusMeta } from "@/types/Bookingdisplay";
import { User, Package, Truck, ChevronRight, Clock, Timer } from "lucide-react";
import { useMemo, useState, useEffect } from "react";

interface BookingCardProps {
  booking: Booking;
  onClick: (bookingId: string) => void;
}

function useStorageDuration(storedAt?: string, releasedAt?: string) {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!storedAt || releasedAt) return;
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 60000);
    return () => clearInterval(interval);
  }, [storedAt, releasedAt]);

  if (!storedAt) return null;

  const start = new Date(storedAt).getTime();
  if (Number.isNaN(start)) return null;
  const end = releasedAt ? new Date(releasedAt).getTime() : now;
  const diffMs = Math.max(0, end - start);

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${Math.max(1, minutes)}m`;
}

export default function BookingCard({ booking, onClick }: BookingCardProps) {
  const status = getStatusMeta(booking.status);
  const assignment = booking.pickup?.assignment;
  const dName = driverName(assignment?.driverId);
  const luggageCount = useMemo(() => booking.luggage?.totalCount ?? 0, [booking.luggage]);
  
  const storedStartTime = booking.storage?.storedAt || (booking.status === "stored" ? (booking as any).updatedAt : undefined);
  const storageDuration = useStorageDuration(storedStartTime, booking.storage?.releasedAt);
  const isInVault = booking.status === "stored";

  return (
    <button
      type="button"
      onClick={() => onClick(booking._id)}
      className="group flex w-full flex-col rounded-xl border border-slate-200 bg-white text-left transition-all hover:border-slate-300 hover:shadow-md"
    >
      {/* Header: Left ID & Status, Right Timer & Chevron */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-sm font-bold text-slate-800">
            {booking.bookingCode}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${status.bg} ${status.text}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full capitalize ${status.dot}`} />
            {status.label}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {storageDuration && (
            <div className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold shadow-xs ${
              isInVault
                ? "bg-teal-50 text-teal-700 border border-teal-200"
                : "bg-slate-100 text-slate-700 border border-slate-200"
            }`}>
              <Timer size={13} className={isInVault ? "animate-pulse text-teal-600" : "text-slate-500"} />
              <span>{isInVault ? `In Vault: ${storageDuration}` : `Stored: ${storageDuration}`}</span>
            </div>
          )}
          <ChevronRight
            size={18}
            className="text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500"
          />
        </div>
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