export const STATUS_META: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  store_assigned: { label: "Store Assigned", bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-400" },
  driver_assigned: { label: "Driver Assigned", bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
  driver_arrived: { label: "Driver Arrived", bg: "bg-indigo-100", text: "text-indigo-700", dot: "bg-indigo-500" },
  picked_up: { label: "Picked Up", bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500" },
  at_store: { label: "At Store", bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" },
};

export function getStatusMeta(status: string) {
  return (
    STATUS_META[status] ?? {
      label: status?.replace(/_/g, " ") ?? "Unknown",
      bg: "bg-slate-100",
      text: "text-slate-600",
      dot: "bg-slate-400",
    }
  );
}

export function formatDateTime(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export function driverName(driver?: { first_name?: string; last_name?: string } | string) {
  if (!driver || typeof driver === "string") return null;
  const name = `${driver.first_name ?? ""} ${driver.last_name ?? ""}`.trim();
  return name || null;
}