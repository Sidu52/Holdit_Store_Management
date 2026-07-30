"use client";

import { useRef, useState } from "react";
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
} from "lucide-react";
import { bookingApi } from "../../services/bookingApi";
import { Booking, BookingDriver } from "@/types/booking";
import {
  driverName,
  formatDateTime,
  getStatusMeta,
} from "@/types/Bookingdisplay";

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
  if (photos.pickup?.length)
    return { label: "From pickup", images: photos.pickup };
  if (photos.storage?.length)
    return { label: "In storage", images: photos.storage };
  if (photos.delivery?.length)
    return { label: "From delivery", images: photos.delivery };
  return { label: null, images: [] };
}

function resolveLuggageCount(luggage?: Booking["luggage"]) {
  if (!luggage) return 0;
  if (typeof luggage.totalCount === "number") return luggage.totalCount;
  if (luggage.small)
    return luggage.small + luggage.medium + luggage.large + luggage.other;
  return luggage.small + luggage.medium + luggage.large + luggage.other;
}

const OTP_LENGTH = 4;

export default function BookingDetailDrawer({
  bookingId,
  open,
  onClose,
}: BookingDetailDrawerProps) {
  const { data, isLoading, mutate } = useSWR(
    bookingId ? `/store/bookings/${bookingId}` : null,
    () => bookingApi.getBookingDetail(bookingId as string),
  );
  const [showReturnOtp, setShowReturnOtp] = useState(false);
  const booking: Booking | undefined = data?.data?.booking;
  const status = booking ? getStatusMeta(booking.status) : null;
  const awaitingVerification = isAwaitingPickupVerification(booking?.status);
  const hasReturnOtp = Boolean(booking?.delivery?.assignment?.storageReturnOtp);
  const luggageCount = resolveLuggageCount(booking?.luggage);
  const { label: photoLabel, images: luggagePhotos } = resolveLuggagePhotos(
    booking?.luggagePhotos,
  );

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
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            {isLoading || !booking ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-2xl bg-slate-100"
                  />
                ))}
              </div>
            ) : (
              <div className="mx-auto max-w-2xl space-y-5">
                {/* Status */}
                {status && (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold ${status.bg} ${status.text}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                    />
                    {status.label}
                  </span>
                )}

                {/* Pickup OTP verification — shown only while the booking is sitting at the store */}
                {awaitingVerification && (
                  <PickupVerificationCard
                    bookingId={booking._id}
                    onVerified={() => mutate()}
                    onClose={onClose}
                  />
                )}

                {/* Show OTP Code here */}
                {hasReturnOtp && (
                  <ReturnOtpCard
                    visible={showReturnOtp}
                    onToggle={() => setShowReturnOtp((v) => !v)}
                    returnOtp={booking.delivery?.assignment?.returnOtp}
                    storageReturnOtp={
                      booking.delivery?.assignment?.storageReturnOtp
                    }
                  />
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Guest */}
                  <InfoCard
                    icon={<User size={15} />}
                    label="Guest"
                    accent="bg-indigo-50 text-indigo-600"
                  >
                    <p className="text-sm font-semibold text-slate-800">
                      {booking.userId?.first_name} {booking.userId?.last_name}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {booking.userId?.phone ?? "—"}
                    </p>
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
                    Pickup scheduled{" "}
                    {formatDateTime(booking.pickup?.scheduledAt)}
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

                  {photoLabel && (
                    <p className="mb-2 text-xs font-medium text-slate-400">
                      {photoLabel}
                    </p>
                  )}
                  <LuggageGrid count={luggageCount} photos={luggagePhotos} />
                </section>

                {booking.cancelReason && (
                  <section className="rounded-2xl border border-red-100 bg-red-50 p-5">
                    <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-red-500">
                      <AlertCircle size={13} />
                      Cancelled
                    </div>
                    <p className="text-sm text-red-700">
                      {booking.cancelReason}
                    </p>
                    <p className="mt-0.5 text-xs text-red-400">
                      {formatDateTime(booking.cancelledAt)}
                    </p>
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
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-lg ${accent}`}
        >
          {icon}
        </span>
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

/* ---------------------------------------------------------------------- */
/* Luggage image grid                                                      */
/* ---------------------------------------------------------------------- */

function LuggageGrid({ count, photos }: { count: number; photos: string[] }) {
  if (count === 0 && photos.length === 0) {
    return (
      <p className="text-sm text-slate-400">
        No luggage recorded for this booking.
      </p>
    );
  }

  // Show one tile per counted item; overlay a photo where one exists.
  const slots = Math.max(count, photos.length);
  const items = Array.from({ length: slots }, (_, i) => photos[i] ?? null);

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
      {items.map((src, i) => (
        <div
          key={i}
          className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
        >
          {src ? (
            <img
              src={src}
              alt={`Luggage ${i + 1}`}
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-slate-300">
              <ImageOff size={18} />
            </div>
          )}
          <span className="absolute bottom-1 left-1 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white">
            {i + 1}
          </span>
        </div>
      ))}
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
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 font-mono text-lg font-bold tracking-[0.3em] text-slate-800">
          {value}
        </p>
      </div>
      <button
        onClick={handleCopy}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        aria-label={`Copy ${label}`}
      >
        {copied ? (
          <Check size={15} className="text-emerald-500" />
        ) : (
          <Copy size={15} />
        )}
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
            <p className="text-sm font-semibold text-slate-800">
              Return luggage OTP
            </p>
            <p className="text-xs text-slate-500">
              Share this with the driver collecting the luggage.
            </p>
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
          {storageReturnOtp && (
            <OtpChip label="Storage return OTP" value={storageReturnOtp} />
          )}
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
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [status, setStatus] = useState<
    "idle" | "verifying" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const otp = digits.join("");
  const complete = otp.length === OTP_LENGTH;

  const handleChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = clean;
    setDigits(next);
    if (status === "error") {
      setStatus("idle");
      setErrorMessage("");
    }
    if (clean && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    inputsRef.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleVerify = async () => {
    if (!complete) return;
    setStatus("verifying");
    setErrorMessage("");
    try {
      await bookingApi.confirmStored(bookingId, otp);
      setStatus("success");
      onVerified();
      onClose();
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(
        err?.response?.data?.message ?? "That code doesn't match. Try again.",
      );
    }
  };

  if (status === "success") {
    return (
      <section className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 size={20} />
        </span>
        <div>
          <p className="text-sm font-semibold text-emerald-800">
            Luggage accepted into store
          </p>
          <p className="text-xs text-emerald-600">
            Pickup OTP verified successfully.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
          <ShieldCheck size={16} />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-800">
            Verify pickup from driver
          </p>
          <p className="text-xs text-slate-500">
            Ask the driver for the pickup code and enter it below to accept the
            luggage.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            inputMode="numeric"
            maxLength={1}
            disabled={status === "verifying"}
            className={`h-12 w-11 rounded-xl border text-center text-lg font-semibold text-slate-800 outline-none transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-200 ${
              status === "error"
                ? "border-red-300 bg-red-50"
                : "border-slate-300 bg-white"
            }`}
          />
        ))}
      </div>

      {status === "error" && (
        <p className="mt-2 flex items-center gap-1 text-xs font-medium text-red-500">
          <AlertCircle size={12} /> {errorMessage}
        </p>
      )}

      <button
        onClick={handleVerify}
        disabled={!complete || status === "verifying"}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
      >
        {status === "verifying" ? (
          <>
            <Loader2 size={15} className="animate-spin" /> Verifying…
          </>
        ) : (
          "Verify & accept luggage"
        )}
      </button>
    </section>
  );
}
