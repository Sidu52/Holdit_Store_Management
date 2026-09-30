import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export interface BookingMixSlice {
  name: string;
  value: number;
  color: string;
}

interface BookingMixChartProps {
  data: BookingMixSlice[];
  title?: string;
  loading?: boolean;
}

export default function BookingMixChart({
  data,
  title = "Booking Mix",
  loading = false,
}: BookingMixChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        <span className="font-mono text-xs text-slate-400">{total} total</span>
      </div>

      <div className="h-52">
        {loading ? (
          <div className="h-full w-full animate-pulse rounded-lg bg-slate-100" />
        ) : total === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-slate-400">No booking breakdown yet</p>
            <p className="text-xs text-slate-400 mt-1">Mix will populate automatically as bookings arrive</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={52}
                outerRadius={78}
                paddingAngle={3}
                stroke="none"
              >
                {data.map((slice, i) => (
                  <Cell key={i} fill={slice.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any, name: any) => [value, name]}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-3">
        {data.map((slice, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-slate-500">
            <span
              className="h-2 w-2 rounded-sm"
              style={{ backgroundColor: slice.color }}
            />
            {slice.name}
          </div>
        ))}
      </div>
    </div>
  );
}