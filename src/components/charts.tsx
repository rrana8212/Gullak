import { useEffect, useState, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatAxisINR, formatINR } from "@/lib/format";
import type { DayPoint, MonthPoint } from "@/lib/stats";

function ClientOnly({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return ready ? children : fallback;
}

function ChartFallback({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted ${className}`} />;
}

function formatTooltipValue(value: number | string) {
  return formatINR(typeof value === "number" ? value : Number(value) || 0);
}

export function DualBarChart({
  data,
  heightClass = "h-44",
  showAxis = false,
}: {
  data: DayPoint[] | MonthPoint[];
  heightClass?: string;
  showAxis?: boolean;
}) {
  return (
    <ClientOnly fallback={<ChartFallback className={heightClass} />}>
      <div className={heightClass}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={3} barCategoryGap="18%">
            {showAxis ? (
              <CartesianGrid
                vertical={false}
                stroke="var(--color-border)"
                strokeDasharray="3 6"
              />
            ) : null}
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
              dy={6}
            />
            {showAxis ? (
              <YAxis
                axisLine={false}
                tickLine={false}
                width={36}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                tickFormatter={formatAxisINR}
              />
            ) : (
              <YAxis hide />
            )}
            <Tooltip
              cursor={{ fill: "var(--color-muted)" }}
              formatter={(value) => formatTooltipValue(value as number)}
              labelStyle={{ color: "var(--color-muted-foreground)", fontSize: 12 }}
              itemStyle={{ fontSize: 12 }}
              contentStyle={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: 12,
                boxShadow: "var(--shadow-card)",
              }}
            />
            <Bar
              dataKey="incoming"
              name="Incoming"
              fill="var(--color-income)"
              radius={[4, 4, 0, 0]}
              maxBarSize={16}
            />
            <Bar
              dataKey="outgoing"
              name="Outgoing"
              fill="var(--color-expense)"
              radius={[4, 4, 0, 0]}
              maxBarSize={16}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ClientOnly>
  );
}

export function ChartLegend() {
  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-income" />
        Incoming
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-expense" />
        Outgoing
      </span>
    </div>
  );
}
