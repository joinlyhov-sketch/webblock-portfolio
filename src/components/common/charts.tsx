"use client";

// The only place that imports recharts. Colours are CSS variables from globals.css, never hex.
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

export type TrendPoint = { label: string; value: number };

/**
 * Area line chart (Figma "Revenue"): dashed gridlines, month labels, soft fill, tooltip with the
 * formatted value. `formatted` holds the display text per point (format on the server with lib/format).
 */
export function AreaTrendChart({
  data,
  formatted,
  label,
  height = 248,
  highlightLast = false,
}: {
  data: TrendPoint[];
  formatted: string[];
  label: string;
  height?: number;
  /** Pin the latest point (Figma "Revenue"): dot, dashed guide to the axis, value label shown on load. */
  highlightLast?: boolean;
}) {
  const last = data[data.length - 1];
  return (
    <div role="img" aria-label={label} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 16, right: 12, bottom: 0, left: 12 }}
        >
          <defs>
            <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--color-primary)"
                stopOpacity={0.22}
              />
              <stop
                offset="100%"
                stopColor="var(--color-primary)"
                stopOpacity={0.02}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="var(--color-border)"
            strokeDasharray="4 4"
          />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tickMargin={10}
            interval={0}
            tick={{ fill: "var(--color-placeholder)", fontSize: 12 }}
          />
          {highlightLast && last && (
            <ReferenceLine
              x={last.label}
              stroke="var(--color-primary)"
              strokeDasharray="4 4"
              strokeOpacity={0.6}
            />
          )}
          {highlightLast && last && (
            <ReferenceDot
              x={last.label}
              y={last.value}
              r={5}
              fill="var(--color-background)"
              stroke="var(--color-brand)"
              strokeWidth={2.5}
            />
          )}
          <Tooltip
            defaultIndex={highlightLast ? data.length - 1 : undefined}
            // Value label sits at the top of the chart, above the point (Figma).
            position={highlightLast ? { y: 0 } : undefined}
            cursor={{ stroke: "var(--color-primary)", strokeDasharray: "4 4" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const index = data.findIndex(
                (d) => d.label === payload[0].payload.label,
              );
              return (
                <div className="rounded-[10px] border border-border bg-background px-3.5 py-2 text-center shadow-card">
                  <p className="font-heading text-[15px] font-semibold text-brand">
                    {formatted[index]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {payload[0].payload.label}
                  </p>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--color-brand)"
            strokeWidth={2.5}
            fill="url(#trend-fill)"
            activeDot={{
              r: 5,
              fill: "var(--color-background)",
              stroke: "var(--color-brand)",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export type DonutSegment = {
  label: string;
  value: number;
  /** A colour token name from globals.css, e.g. "danger", "warning", "primary". */
  color: string;
};

/** Donut with a big number in the middle (Figma "Needs attention"). */
export function DonutChart({
  segments,
  total,
  caption,
  size = 168,
}: {
  segments: DonutSegment[];
  total: number;
  caption: string;
  size?: number;
}) {
  return (
    <div
      role="img"
      aria-label={`${total} ${caption}: ${segments.map((s) => `${s.label} ${s.value}`).join(", ")}`}
      className="relative shrink-0"
      style={{ width: size, height: size }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={segments}
            dataKey="value"
            nameKey="label"
            innerRadius="68%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
            paddingAngle={1.5}
            stroke="none"
            isAnimationActive={false}
          >
            {segments.map((s) => (
              <Cell key={s.label} fill={`var(--color-${s.color})`} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-[34px] leading-none font-bold text-foreground">
          {total}
        </span>
        <span className="mt-1 text-xs text-muted-foreground">{caption}</span>
      </div>
    </div>
  );
}
