import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface EarningsPoint {
  day: string;
  amount: number;
}

interface EarningsChartProps {
  data: EarningsPoint[];
  title?: string;
  currency?: string; // e.g. "₹", "$"
  loading?: boolean;
  barColor?: string;
}

export default function EarningsChart({
  data,
  title = "Earnings",
  currency = "₹",
  loading = false,
  barColor = "#B98B2A",
}: EarningsChartProps) {
  const total = data.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        <div className="text-right">
          <div className="font-mono text-lg font-bold text-slate-900">
            {currency}
            {total.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400">this period</div>
        </div>
      </div>

      <div className="mt-3 h-52">
        {loading ? (
          <div className="h-full w-full animate-pulse rounded-lg bg-slate-100" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 4, left: -20, bottom: 0 }}
            >
              <CartesianGrid vertical={false} stroke="#eef2f6" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip
                cursor={{ fill: "rgba(185,139,42,0.08)" }}
                formatter={(value) => [
                  `${currency}${(value ?? 0).toLocaleString()}`,
                  "Earnings",
                ]}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                }}
              />
              <Bar dataKey="amount" fill={barColor} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
