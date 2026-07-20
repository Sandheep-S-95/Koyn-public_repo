"use client";
import { TrendingUp, TrendingDown, Minus, Zap } from "lucide-react";

interface StockCardProps {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  pe: number;
  signal: "BUY" | "SELL" | "HOLD";
  signalStrength: number;
}

const signalConfig = {
  BUY: { color: "#32E07E", bg: "rgba(50,224,126,0.08)", border: "rgba(50,224,126,0.25)" },
  SELL: { color: "#ff4d6a", bg: "rgba(255,77,106,0.08)", border: "rgba(255,77,106,0.25)" },
  HOLD: { color: "#EAB308", bg: "rgba(234,179,8,0.08)", border: "rgba(234,179,8,0.25)" },
};

export default function StockCard(props: StockCardProps) {
  const { ticker, name, price, change, changePercent, volume, marketCap, pe, signal, signalStrength } = props;
  const isUp = change >= 0;
  const sig = signalConfig[signal];

  return (
    <div style={{
      background: "rgba(19, 45, 43, 0.6)",
      border: `1px solid ${sig.border}`,
      borderRadius: 12,
      padding: "20px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Glow top border */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, ${sig.color}80, transparent)`,
      }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, color: "#fff" }}>{ticker}</span>
            <span style={{
              background: sig.bg, border: `1px solid ${sig.border}`,
              color: sig.color, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
              letterSpacing: "0.1em",
            }}>{signal}</span>
          </div>
          <div style={{ color: "#7A9E9C", fontSize: 12 }}>{name}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 700, color: "#fff" }}>
            ${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end", marginTop: 2 }}>
            {isUp ? <TrendingUp size={14} color="#32E07E" /> : <TrendingDown size={14} color="#ff4d6a" />}
            <span style={{ color: isUp ? "#32E07E" : "#ff4d6a", fontSize: 13, fontWeight: 500 }}>
              {isUp ? "+" : ""}{change.toFixed(2)} ({isUp ? "+" : ""}{changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Signal strength bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: "#7A9E9C", letterSpacing: "0.08em" }}>SIGNAL STRENGTH</span>
          <span style={{ fontSize: 11, color: sig.color, fontWeight: 600 }}>{signalStrength}%</span>
        </div>
        <div style={{ height: 4, background: "rgba(26, 59, 57, 0.6)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 2,
            width: `${signalStrength}%`,
            background: `linear-gradient(90deg, ${sig.color}60, ${sig.color})`,
            transition: "width 1s ease",
            boxShadow: `0 0 8px ${sig.color}40`,
          }} />
        </div>
      </div>

      {/* Metrics grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {[
          { label: "VOLUME", value: volume },
          { label: "MKT CAP", value: marketCap },
          { label: "P/E RATIO", value: pe?.toFixed(1) ?? "N/A" },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: "rgba(26, 59, 57, 0.6)", borderRadius: 8, padding: "10px 12px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}>
            <div style={{ fontSize: 9, color: "#7A9E9C", letterSpacing: "0.1em", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#E0F2F1" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Zap icon decoration */}
      <div style={{ position: "absolute", bottom: 16, right: 16, opacity: 0.06 }}>
        <Zap size={48} color={sig.color} />
      </div>
    </div>
  );
}
