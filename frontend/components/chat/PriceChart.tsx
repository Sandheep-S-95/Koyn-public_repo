"use client";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface PriceChartProps {
  ticker: string;
  period: string;
  data: Array<{ date: string; price: number; volume?: number }>;
  trend: "UP" | "DOWN" | "SIDEWAYS";
}

const trendColor = { UP: "#32E07E", DOWN: "#ff4d6a", SIDEWAYS: "#00c9ff" };

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "#0d1017", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 8, padding: "8px 12px", fontSize: 12,
      }}>
        <div style={{ color: "#7A9E9C", marginBottom: 2 }}>{label}</div>
        <div style={{ color: "#fff", fontWeight: 600 }}>
          ${payload[0].value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </div>
      </div>
    );
  }
  return null;
};

export default function PriceChart({ ticker, period, data, trend }: PriceChartProps) {
  const color = trendColor[trend];
  const minPrice = Math.min(...data.map(d => d.price)) * 0.998;
  const maxPrice = Math.max(...data.map(d => d.price)) * 1.002;
  const startPrice = data[0]?.price ?? 0;
  const endPrice = data[data.length - 1]?.price ?? 0;
  const pct = ((endPrice - startPrice) / startPrice * 100).toFixed(2);

  return (
    <div style={{
      background: "rgba(19, 45, 43, 0.6)", border: "1px solid rgba(255, 255, 255, 0.08)",
      borderRadius: 12, padding: "20px", overflow: "hidden",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color: "#fff" }}>{ticker}</span>
          <span style={{ color: "#7A9E9C", fontSize: 12, marginLeft: 8 }}>{period} Performance</span>
        </div>
        <div style={{
          color: parseFloat(pct) >= 0 ? "#32E07E" : "#ff4d6a",
          fontSize: 14, fontWeight: 600,
        }}>
          {parseFloat(pct) >= 0 ? "+" : ""}{pct}%
        </div>
      </div>
      
      <div style={{ height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`grad-${ticker}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "#5a6070", fontSize: 10, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
            <YAxis domain={[minPrice, maxPrice]} hide />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone" dataKey="price"
              stroke={color} strokeWidth={2}
              fill={`url(#grad-${ticker})`}
              dot={false} activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
