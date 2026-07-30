import { LucideIcon } from "lucide-react";

interface StatusCardProps {
  icon: LucideIcon;
  title: string;
  value: number | string;
  color?: "rust" | "teal" | "brass" | "ink";
  selected?: boolean;
  onClick?: () => void;
}

const COLOR_MAP: Record<
  NonNullable<StatusCardProps["color"]>,
  { text: string; bg: string; ring: string }
> = {
  rust: { text: "text-orange-800", bg: "bg-orange-100", ring: "ring-orange-400" },
  teal: { text: "text-teal-800", bg: "bg-teal-100", ring: "ring-teal-400" },
  brass: { text: "text-amber-800", bg: "bg-amber-100", ring: "ring-amber-400" },
  ink: { text: "text-slate-800", bg: "bg-slate-100", ring: "ring-slate-400" },
};

export default function StatusCard({
  icon: Icon,
  title,
  value,
  color = "ink",
  selected = false,
  onClick,
}: StatusCardProps) {
  const c = COLOR_MAP[color];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        "flex items-center gap-4 w-full rounded-xl border px-5 py-4 text-left",
        "transition-all duration-150",
        selected
          ? `border-transparent ring-2 ${c.ring} bg-white shadow-md`
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm",
      ].join(" ")}
    >
      <div
        className={[
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
          c.bg,
          c.text,
        ].join(" ")}
      >
        <Icon size={22} strokeWidth={1.75} />
      </div>

      <div className="flex flex-1 items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <span className="font-mono text-2xl font-bold text-slate-900">
          {value}
        </span>
      </div>
    </button>
  );
}