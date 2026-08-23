"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import {
  X,
  User,
  Package,
  Truck,
  MapPin,
  Clock,
  ShieldCheck,
  ImageOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Check,
  KeyRound,
  EyeOff,
  Eye,
  Copy,
  Timer,
} from "lucide-react";
import { bookingApi } from "../../services/bookingApi";
import { Booking, BookingDriver } from "@/types/booking";
import { driverName, formatDateTime, getStatusMeta } from "@/types/Bookingdisplay";

interface BookingDetailDrawerProps {
  bookingId: string | null;
  open: boolean;
  onClose: () => void;
}

function isAwaitingPickupVerification(status?: string) {
  if (!status) return false;
  const normalized = status.toLowerCase().replace(/[\s-]/g, "_");
  return normalized === "at_store";
}

function resolveLuggagePhotos(photos?: Booking["luggagePhotos"]) {
  if (!photos) return { label: null as string | null, images: [] as string[] };
  if (photos.pickup?.length) return { label: "From pickup", images: photos.pickup };
  if (photos.storage?.length) return { label: "In storage", images: photos.storage };
  if (photos.delivery?.length) return { label: "From delivery", images: photos.delivery };
  return { label: null, images: [] };
}

function resolveLuggageCount(luggage?: Booking["luggage"]) {
  if (!luggage) return 0;
  if (typeof luggage.totalCount === "number") return luggage.totalCount;
  if (luggage.small) return luggage.small + luggage.medium + luggage.large + luggage.other;
    return luggage.small + luggage.medium + luggage.large + luggage.other;
  }


const OTP_LENGTH = 4;

export default function BookingDetailDrawer({ bookingId, open, onClose }: BookingDetailDrawerProps) {
  const { data, isLoading, mutate } = useSWR(
    bookingId ? `/store/bookings/${bookingId}` : null,
    () => bookingApi.getBookingDetail(bookingId as string)
  );
 const [showReturnOtp, setShowReturnOtp] = useState(false);
  const booking: Booking | undefined = data?.data?.booking;
  const status = booking ? getStatusMeta(booking.status) : null;
  const awaitingVerification = isAwaitingPickupVerification(booking?.status);
 const hasReturnOtp = Boolean(booking?.delivery?.assignment?.storageReturnOtp);
  const luggageCount = resolveLuggageCount(booking?.luggage);
  const { label: photoLabel, images: luggagePhotos } = resolveLuggagePhotos(booking?.luggagePhotos);

  const storedStartTime = booking?.storage?.storedAt || (booking?.status === "stored" ? (booking as any).updatedAt : undefined);
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!storedStartTime || booking?.storage?.releasedAt) return;
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, [storedStartTime, booking?.storage?.releasedAt]);

  const storageDuration = useMemo(() => {
    if (!storedStartTime) return null;
    const start = new Date(storedStartTime).getTime();
    if (Number.isNaN(start)) return null;
    const end = booking?.storage?.releasedAt ? new Date(booking.storage.releasedAt).getTime() : now;
    const diffMs = Math.max(0, end - start);
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${Math.max(1, minutes)}m`;
  }, [storedStartTime, booking?.storage?.releasedAt, now]);

  const isInVault = booking?.status === "stored";

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Panel — scales with the viewport, capped at 80% width */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-[80%] max-w-[80%] min-w-[320px] transform bg-white shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                Booking
              </p>
              <p className="mt-0.5 font-mono text-xl font-bold text-slate-900">
                {booking?.bookingCode ?? "—"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {storageDuration && (
                <div className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold shadow-xs ${
                  isInVault
                    ? "bg-teal-50 text-teal-700 border border-teal-200"
                    : "bg-slate-100 text-slate-700 border border-slate-200"
                }`}>
                  <Timer size={14} className={isInVault ? "animate-pulse text-teal-600" : "text-slate-500"} />
                  <span>{isInVault ? `In Vault: ${storageDuration}` : `Stored: ${storageDuration}`}</span>
                </div>
              )}
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            {isLoading || !booking ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-100" />
                ))}
              </div>
            ) : (
              <div className="mx-auto max-w-2xl space-y-5">
                {/* Status */}
                {status && (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold ${status.bg} ${status.text}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                    {status.label}
                  </span>
                )}

                {/* Pickup OTP verification — shown only while the booking is sitting at the store */}
                {awaitingVerification && (
                  <PickupVerificationCard bookingId={booking._id} onVerified={() => mutate()} onClose={onClose} />
                )}

                 {/* Show OTP Code here */}
                 {hasReturnOtp && (
                  <ReturnOtpCard
                    visible={showReturnOtp}
                    onToggle={() => setShowReturnOtp((v) => !v)}
                    returnOtp={booking.delivery?.assignment?.returnOtp}
                    storageReturnOtp={booking.delivery?.assignment?.storageReturnOtp}
                  />
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Guest */}
                  <InfoCard icon={<User size={15} />} label="Guest" accent="bg-indigo-50 text-indigo-600">
                    <p className="text-sm font-semibold text-slate-800">
                      {booking.userId?.first_name} {booking.userId?.last_name}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-500">{booking.userId?.phone ?? "—"}</p>
                  </InfoCard>

                  {/* Pickup driver */}
                  <DriverLegCard
                    label="Pickup driver"
                    accent="bg-amber-50 text-amber-600"
                    driverId={booking.pickup?.assignment?.driverId}
                    assignedAt={booking.pickup?.assignment?.assignedAt}
                    completedAt={booking.pickup?.assignment?.completedAt}
                  />

                  {/* Delivery driver — only once that leg has been assigned */}
                  {booking.delivery?.assignment && (
                    <DriverLegCard
                      label="Delivery driver"
                      accent="bg-violet-50 text-violet-600"
                      driverId={booking.delivery.assignment.driverId}
                      assignedAt={booking.delivery.assignment.assignedAt}
                      completedAt={booking.delivery.assignment.completedAt}
                    />
                  )}
                </div>

                {/* Location & timing */}
                <InfoCard
                  icon={<MapPin size={15} />}
                  label="Delivery location"
                  accent="bg-emerald-50 text-emerald-600"
                >
                  <p className="text-sm text-slate-700">
                    {booking.deliveryLocation?.address ?? "No address on file"}
                  </p>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock size={12} />
                    Pickup scheduled {formatDateTime(booking.pickup?.scheduledAt)}
                  </div>
                </InfoCard>

                {/* Luggage */}
                <section className="rounded-2xl border border-slate-200 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                        <Package size={15} />
                      </span>
                      Luggage
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                      {luggageCount} item{luggageCount === 1 ? "" : "s"}
                    </span>
                  </div>

                  {photoLabel && <p className="mb-2 text-xs font-medium text-slate-400">{photoLabel}</p>}
                  <LuggageGrid count={luggageCount} photos={luggagePhotos} />
                </section>

                {booking.cancelReason && (
                  <section className="rounded-2xl border border-red-100 bg-red-50 p-5">
                    <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-red-500">
                      <AlertCircle size={13} />
                      Cancelled
                    </div>
                    <p className="text-sm text-red-700">{booking.cancelReason}</p>
                    <p className="mt-0.5 text-xs text-red-400">{formatDateTime(booking.cancelledAt)}</p>
                  </section>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------------- */
/* Reusable info card                                                      */
/* ---------------------------------------------------------------------- */

function InfoCard({
  icon,
  label,
  accent,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 p-5 transition-colors hover:border-slate-300">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${accent}`}>{icon}</span>
        {label}
      </div>
      {children}
    </section>
  );
}

function DriverLegCard({
  label,
  accent,
  driverId,
  assignedAt,
  completedAt,
}: {
  label: string;
  accent: string;
  driverId?: BookingDriver | string;
  assignedAt?: string;
  completedAt?: string;
}) {
  const name = driverName(driverId);
  return (
    <InfoCard icon={<Truck size={15} />} label={label} accent={accent}>
      {name ? (
        <>
          <p className="text-sm font-semibold text-slate-800">{name}</p>
          <p className="mt-0.5 text-xs text-slate-400">
            {completedAt
              ? `Completed ${formatDateTime(completedAt)}`
              : `Assigned ${formatDateTime(assignedAt)}`}
          </p>
        </>
      ) : (
        <p className="text-sm text-slate-400">Not assigned yet</p>
      )}
    </InfoCard>
  );
}

export function getImageUrl(path?: string | null) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const baseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl.replace(/\/$/, "")}${cleanPath}`;
}

/* ---------------------------------------------------------------------- */
/* Luggage image grid                                                      */
/* ---------------------------------------------------------------------- */

function LuggageGrid({ count, photos }: { count: number; photos: string[] }) {
  if (count === 0 && photos.length === 0) {
    return <p className="text-sm text-slate-400">No luggage recorded for this booking.</p>;
  }

  // Show one tile per counted item; overlay a photo where one exists.
  const slots = Math.max(count, photos.length);
  const items = Array.from({ length: slots }, (_, i) => photos[i] ?? null);

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
      {items.map((rawSrc, i) => {
        const src = getImageUrl(rawSrc);
        return (
          <div
            key={i}
            className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
          >
            {src ? (
              <a href={src} target="_blank" rel="noopener noreferrer" className="block h-full w-full">
                <img
                  src={src}
                  alt={`Luggage ${i + 1}`}
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src.includes('/pickup/')) {
                      target.src = target.src.replace('/pickup/', '/');
                    }
                  }}
                />
              </a>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-slate-300">
                <ImageOff size={18} />
              </div>
            )}
            <span className="absolute bottom-1 left-1 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white">
              {i + 1}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function OtpChip({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
 
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard permission denied — silently ignore
    }
  };
 
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-0.5 font-mono text-lg font-bold tracking-[0.3em] text-slate-800">{value}</p>
      </div>
      <button
        onClick={handleCopy}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        aria-label={`Copy ${label}`}
      >
        {copied ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
      </button>
    </div>
  );
}

function ReturnOtpCard({
  visible,
  onToggle,
  returnOtp,
  storageReturnOtp,
}: {
  visible: boolean;
  onToggle: () => void;
  returnOtp?: string;
  storageReturnOtp?: string;
}) {
  return (
    <section className="rounded-2xl border border-violet-200 bg-violet-50/60 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
            <KeyRound size={16} />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">Return luggage OTP</p>
            <p className="text-xs text-slate-500">Share this with the driver collecting the luggage.</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-violet-200 bg-white px-3 py-1.5 text-xs font-semibold text-violet-600 transition-colors hover:bg-violet-50"
        >
          {visible ? <EyeOff size={13} /> : <Eye size={13} />}
          {visible ? "Hide" : "Show"}
        </button>
      </div>
 
      {visible && (
        <div className="mt-4 space-y-2">
          {returnOtp && <OtpChip label="Return OTP" value={returnOtp} />}
          {storageReturnOtp && <OtpChip label="Storage return OTP" value={storageReturnOtp} />}
        </div>
      )}
    </section>
  );
}

function PickupVerificationCard({
  bookingId,
  onVerified,
  onClose,
}: {
  bookingId: string;
  onVerified: () => void;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleConfirmStorage = async () => {
    setStatus("verifying");
    setErrorMessage("");
    try {
      await bookingApi.confirmStored(bookingId);
      setStatus("success");
      onVerified();
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err?.response?.data?.message ?? "Failed to confirm storage. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <section className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 size={20} />
        </span>
        <div>
          <p className="text-sm font-semibold text-emerald-800">Luggage Accepted Into Vault</p>
          <p className="text-xs text-emerald-600">Booking marked as stored successfully.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-teal-200 bg-teal-50/60 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
            <Package size={20} />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900">Driver Arrived with Luggage</p>
            <p className="text-xs text-slate-500">
              Collect and inspect the customer luggage from the driver, then confirm storage.
            </p>
          </div>
        </div>
      </div>

      {status === "error" && (
        <p className="mb-3 flex items-center gap-1 text-xs font-medium text-red-500">
          <AlertCircle size={14} /> {errorMessage}
        </p>
      )}

      <button
        onClick={handleConfirmStorage}
        disabled={status === "verifying"}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-sm font-bold text-white shadow-md shadow-teal-600/20 transition-all hover:bg-teal-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
      >
        {status === "verifying" ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Confirming Storage…
          </>
        ) : (
          <>
            <CheckCircle2 size={16} /> Collect Luggage & Confirm Storage
          </>
        )}
      </button>
    </section>
  );
}