"use client";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MarketOverviewProps {
  sentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
  fearGreedIndex: number;
  indices: Array<{ name: string; value: number; change: number }>;
}

const sentimentConfig = {
  BULLISH: { color: "#32E07E", label: "BULLISH", icon: TrendingUp },
  BEARISH: { color: "#ff4d6a", label: "BEARISH", icon: TrendingDown },
  NEUTRAL: { color: "#00c9ff", label: "NEUTRAL", icon: Minus },
};

const fgZones = [
  { color: "#ff4d6a", from: 0, to: 25 },
  { color: "#ff8c42", from: 25, to: 45 },
  { color: "#EAB308", from: 45, to: 55 },
  { color: "#7dde92", from: 55, to: 75 },
  { color: "#32E07E", from: 75, to: 100 },
];

function getZoneColor(v: number) {
  for (const z of fgZones) if (v >= z.from && v <= z.to) return z.color;
  return "#32E07E";
}

function FearGreedGauge({ value }: { value: number }) {
  const angle = (value / 100) * 180 - 90;
  const toRad = (a: number) => (a * Math.PI) / 180;

  return (
    <div style={{ textAlign: "center", padding: "12px 0" }}>
      <div style={{ position: "relative", display: "inline-block" }}>
        <svg width="160" height="90" viewBox="0 0 160 90">
          {fgZones.map((z) => {
            const startAngle = (z.from / 100) * 180 - 90;
            const endAngle = (z.to / 100) * 180 - 90;
            const r = 65, innerR = 45, cx = 80, cy = 80;
            const x1 = cx + r * Math.cos(toRad(startAngle));
            const y1 = cy + r * Math.sin(toRad(startAngle));
            const x2 = cx + r * Math.cos(toRad(endAngle));
            const y2 = cy + r * Math.sin(toRad(endAngle));
            const largeArc = endAngle - startAngle > 180 ? 1 : 0;
            const ix1 = cx + innerR * Math.cos(toRad(startAngle));
            const iy1 = cy + innerR * Math.sin(toRad(startAngle));
            const ix2 = cx + innerR * Math.cos(toRad(endAngle));
            const iy2 = cy + innerR * Math.sin(toRad(endAngle));
            return (
              <path key={z.from}
                d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix1} ${iy1} Z`}
                fill={z.color} opacity={0.75}
              />
            );
          })}
          <line
            x1="80" y1="80"
            x2={80 + 55 * Math.cos(toRad(angle))}
            y2={80 + 55 * Math.sin(toRad(angle))}
            stroke="white" strokeWidth="2" strokeLinecap="round"
          />
          <circle cx="80" cy="80" r="5" fill="white" />
        </svg>
      </div>
      <div style={{ fontSize: 28, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: getZoneColor(value), marginTop: -8 }}>{value}</div>
      <div style={{ fontSize: 10, color: "#7A9E9C", letterSpacing: "0.1em", marginTop: 2 }}>FEAR & GREED INDEX</div>
    </div>
  );
}

export default function MarketOverview({ sentiment, fearGreedIndex, indices }: MarketOverviewProps) {
  const cfg = sentimentConfig[sentiment];
  const Icon = cfg.icon;

  return (
    <div style={{
      background: "rgba(19, 45, 43, 0.6)", border: "1px solid rgba(255, 255, 255, 0.08)",
      borderRadius: 12, padding: "20px", overflow: "hidden",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: "#fff" }}>MARKET OVERVIEW</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: cfg.color, fontSize: 12, fontWeight: 600, letterSpacing: "0.08em" }}>
          <Icon size={14} />
          {cfg.label}
        </div>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FearGreedGauge value={fearGreedIndex} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
          {indices.map((idx) => (
            <div key={idx.name} style={{
              background: "rgba(26, 59, 57, 0.6)", borderRadius: 8, padding: "10px 12px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}>
              <div style={{ fontSize: 10, color: "#7A9E9C", marginBottom: 3 }}>{idx.name}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{idx.value.toLocaleString()}</span>
                <span style={{ fontSize: 12, color: idx.change >= 0 ? "#32E07E" : "#ff4d6a" }}>
                  {idx.change >= 0 ? "+" : ""}{idx.change.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
