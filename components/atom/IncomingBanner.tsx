import { PackageCheck } from "lucide-react";

interface IncomingBannerProps {
  count: number;
}

export default function IncomingBanner({ count }: IncomingBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 px-6 py-8 text-white sm:px-8">
      {/* decorative ring pattern */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -right-4 top-10 h-32 w-32 rounded-full border border-white/10" />

      <div className="relative flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
          <PackageCheck size={24} strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-white/60">
            Incoming Bookings
          </p>
          <h1 className="mt-0.5 text-2xl font-bold sm:text-3xl">
            {count} {count === 1 ? "booking" : "bookings"} on the way
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Track pickups, driver assignments, and arrivals in real time.
          </p>
        </div>
      </div>
    </div>
  );
}