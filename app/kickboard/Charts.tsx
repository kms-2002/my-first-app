"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const ink = { primary: "#0b0b0b", secondary: "#52514e", muted: "#898781" };
const grid = "#e1e0d9";
const axisLine = "#c3c2b7";

const nationalTrend = [
  { year: "2022", count: 2386 },
  { year: "2023", count: 2389 },
  { year: "2024", count: 2232 },
];

const gyeongnamTrend = [
  { year: "2022", count: 80 },
  { year: "2023", count: 76 },
  { year: "2024", count: 76 },
];

const ageDistribution = [
  { age: "15세 이하", count: 1441 },
  { age: "16~19세", count: 1648 },
  { age: "20대", count: 1783 },
];

function ChartTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  unit: string;
}) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      style={{
        background: "#fcfcfb",
        border: "1px solid rgba(11,11,11,0.10)",
        borderRadius: "8px",
        padding: "8px 12px",
        fontSize: "13px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ color: ink.secondary, fontWeight: 600 }}>{label}</div>
      <div style={{ color: ink.primary, fontWeight: 700 }}>
        {payload[0].value.toLocaleString()}
        {unit}
      </div>
    </div>
  );
}

function MiniBarChart({
  data,
  dataKey,
  labelKey,
  color,
  unit,
}: {
  data: Record<string, string | number>[];
  dataKey: string;
  labelKey: string;
  color: string;
  unit: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={grid} strokeWidth={1} />
        <XAxis
          dataKey={labelKey}
          tickLine={false}
          axisLine={{ stroke: axisLine }}
          tick={{ fill: ink.muted, fontSize: 12 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: ink.muted, fontSize: 12 }}
          width={40}
        />
        <Tooltip
          cursor={{ fill: "rgba(11,11,11,0.04)" }}
          content={<ChartTooltip unit={unit} />}
        />
        <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function NationalTrendChart() {
  return (
    <MiniBarChart
      data={nationalTrend}
      dataKey="count"
      labelKey="year"
      color="#2a78d6"
      unit="건"
    />
  );
}

export function GyeongnamTrendChart() {
  return (
    <MiniBarChart
      data={gyeongnamTrend}
      dataKey="count"
      labelKey="year"
      color="#2a78d6"
      unit="건"
    />
  );
}

export function AgeDistributionChart() {
  return (
    <MiniBarChart
      data={ageDistribution}
      dataKey="count"
      labelKey="age"
      color="#eb6834"
      unit="명"
    />
  );
}
