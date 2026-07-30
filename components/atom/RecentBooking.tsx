import { Clock3, ChevronRight } from "lucide-react";

export interface RecentBooking {
  code: string;
  guest: string;
  status: string;
  items: number;
  updatedAt: string;
}

interface RecentBookingsProps {
  bookings: RecentBooking[];
  loading?: boolean;
  onViewAll?: () => void;
  statusColors?: Record<string, { bg: string; text: string }>;
}

const DEFAULT_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  "At Store": { bg: "bg-orange-100", text: "text-orange-800" },
  "Stored": { bg: "bg-teal-100", text: "text-teal-800" },
  "Out for Return": { bg: "bg-amber-100", text: "text-amber-800" },
  "Driver Assigned": { bg: "bg-slate-100", text: "text-slate-700" },
  "Delivered": { bg: "bg-emerald-100", text: "text-emerald-800" },
  "Cancelled": { bg: "bg-red-100", text: "text-red-700" },
};

export default function RecentBookings({
  bookings,
  loading = false,
  onViewAll,
  statusColors = DEFAULT_STATUS_COLORS,
}: RecentBookingsProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h3 className="text-base font-semibold text-slate-800">Recent Bookings</h3>
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="flex items-center gap-0.5 text-xs font-medium text-teal-700 hover:text-teal-900"
          >
            View all <ChevronRight size={14} />
          </button>
        )}
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-slate-50">
            {["Code", "Guest", "Status", "Items", "Updated"].map((h) => (
              <th
                key={h}
                className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? [...Array(4)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={5} className="px-5 py-3">
                    <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                  </td>
                </tr>
              ))
            : bookings.map((b) => {
                const s = statusColors[b.status] ?? {
                  bg: "bg-slate-100",
                  text: "text-slate-700",
                };
                return (
                  <tr
                    key={b.code}
                    className="border-t border-slate-100 transition-colors hover:bg-slate-50"
                  >
                    <td className="px-5 py-3 font-mono text-sm font-semibold text-slate-800">
                      {b.code}
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-700">{b.guest}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${s.bg} ${s.text}`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-sm text-slate-700">{b.items}</td>
                    <td className="px-5 py-3 text-sm text-slate-400">
                      <Clock3 size={12} className="mr-1 inline -translate-y-px" />
                      {b.updatedAt}
                    </td>
                  </tr>
                );
              })}

          {!loading && bookings.length === 0 && (
            <tr>
              <td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-400">
                No recent bookings.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}