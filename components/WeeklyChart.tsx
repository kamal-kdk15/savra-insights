"use client";

// ── FILE: components/WeeklyChart.tsx ─────────────────────────────────────────
// Area chart for weekly activity trends.
// Uses vanilla JS date formatting — no date-fns needed.

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { WeeklyStats } from "@/lib/types";

// "2026-02-10" → "Feb 10"
function fmtWeek(dateStr: string) {
  // Append T00:00:00 to force local-time parsing (avoids UTC off-by-one on some systems)
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day:   "numeric",
  });
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-xl p-3.5 min-w-[160px]">
      <p className="font-semibold text-gray-700 mb-2 pb-2 border-b border-gray-100 text-sm">
        {label}
      </p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-2 text-gray-500">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-xs">{p.name}</span>
          </div>
          <span className="font-semibold text-gray-800 text-xs">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

interface Props {
  data:   WeeklyStats[];
  title?: string;
}

export function WeeklyChart({ data, title = "Weekly Activity Trends" }: Props) {
  // Map week ISO string to a readable label for the X axis
  const chartData = data.map((d) => ({
    ...d,
    label: fmtWeek(d.week),
  }));

  // Debug: log if no data so it's obvious in the console
  if (chartData.length === 0) {
    console.warn("[WeeklyChart] No data passed — chart will be empty");
  }

  return (
    <div className="bg-white rounded-2xl p-6">
      <div className="mb-5">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-400 mt-0.5">
          Daily content creation · {chartData.length} days
        </p>
      </div>

      {chartData.length === 0 ? (
        // Empty state — better than a blank chart
        <div className="h-[260px] flex items-center justify-center text-gray-300 text-sm">
          No activity data to display yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} style={{ overflow: "visible" }}>
            <defs>
              <linearGradient id="gL" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}    />
              </linearGradient>
              <linearGradient id="gQ" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}    />
              </linearGradient>
              <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#059669" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0}    />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
              formatter={(v) => <span className="text-gray-500">{v}</span>}
            />

            <Area type="monotone" dataKey="lessons"        name="Lesson Plans"    stroke="#7c3aed" strokeWidth={2.5} fill="url(#gL)" dot={{ fill: "#7c3aed", r: 5, strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 7 }} connectNulls />
            <Area type="monotone" dataKey="quizzes"        name="Quizzes"         stroke="#2563eb" strokeWidth={2.5} fill="url(#gQ)" dot={{ fill: "#2563eb", r: 5, strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 7 }} connectNulls />
            <Area type="monotone" dataKey="questionPapers" name="Question Papers" stroke="#059669" strokeWidth={2.5} fill="url(#gP)" dot={{ fill: "#059669", r: 5, strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 7 }} connectNulls />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
