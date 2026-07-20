"use client";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Metric {
  label: string;
  value: string;
  change?: string;
  trend?: "UP" | "DOWN" | "FLAT";
}

const trendColor = { UP: "#32E07E", DOWN: "#ff4d6a", FLAT: "#5a6070" };

export default function MetricGrid({ title, metrics }: { title: string; metrics: Metric[] }) {
  return (
    <div style={{
      background: "rgba(19, 45, 43, 0.6)", border: "1px solid rgba(255, 255, 255, 0.08)",
      borderRadius: 12, padding: "20px",
    }}>
      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: "#fff", marginBottom: 14 }}>{title}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8 }}>
        {metrics.map((m) => {
          const trend = m.trend ?? "FLAT";
          const color = trendColor[trend as keyof typeof trendColor];
          const Icon = trend === "UP" ? TrendingUp : trend === "DOWN" ? TrendingDown : Minus;
          return (
            <div key={m.label} style={{
              background: "rgba(26, 59, 57, 0.6)", borderRadius: 8, padding: "12px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}>
              <div style={{ fontSize: 10, color: "#7A9E9C", letterSpacing: "0.08em", marginBottom: 6 }}>{m.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{m.value}</div>
              {m.change && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, color }}>
                  <Icon size={11} />
                  <span style={{ fontSize: 11 }}>{m.change}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
