"use client";
import { Gauge, ArrowRight, Info } from "lucide-react";

interface TechnicalGaugeProps {
  ticker: string;
  summary: "STRONG_BUY" | "BUY" | "NEUTRAL" | "SELL" | "STRONG_SELL";
  score: number; // 0 to 100
  rsi?: number;
  macd?: string;
  movingAverages?: string;
  oscillators?: string;
}

const summaryConfig = {
  STRONG_BUY: { label: "STRONG BUY", color: "#32E07E", bg: "rgba(50,224,126,0.08)", border: "rgba(50,224,126,0.25)" },
  BUY: { label: "BUY", color: "#38bdf8", bg: "rgba(56,189,248,0.08)", border: "rgba(56,189,248,0.25)" },
  NEUTRAL: { label: "NEUTRAL", color: "#EAB308", bg: "rgba(234,179,8,0.08)", border: "rgba(234,179,8,0.25)" },
  SELL: { label: "SELL", color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.25)" },
  STRONG_SELL: { label: "STRONG SELL", color: "#ff4d6a", bg: "rgba(255,77,106,0.08)", border: "rgba(255,77,106,0.25)" },
};

export default function TechnicalGauge(props: TechnicalGaugeProps) {
  const { ticker, summary, score, rsi, macd, movingAverages, oscillators } = props;
  const config = summaryConfig[summary] || summaryConfig.NEUTRAL;

  // Calculate needle rotation angle based on score (0 to 100 maps to -90deg to +90deg)
  const angle = (score / 100) * 180 - 90;

  return (
    <div style={{
      background: "rgba(19, 45, 43, 0.6)",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      borderRadius: 12,
      padding: "20px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Decorative Top Glow */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, ${config.color}50, transparent)`,
      }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: "#fff" }}>
              {ticker} Indicators
            </span>
            <span style={{
              background: config.bg, border: `1px solid ${config.border}`,
              color: config.color, fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 4,
              letterSpacing: "0.05em",
            }}>{config.label}</span>
          </div>
          <div style={{ color: "#7A9E9C", fontSize: 12 }}>Technical Analysis Summary</div>
        </div>
        <Gauge size={20} color="#32E07E" style={{ opacity: 0.8 }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "center" }}>
        {/* Visual semi-circular Gauge Graphic */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", height: 100 }}>
          <svg width="140" height="80" viewBox="0 0 140 80" style={{ overflow: "visible" }}>
            {/* Gray background arc */}
            <path
              d="M10 75 A60 60 0 0 1 130 75"
              fill="none"
              stroke="rgba(26, 59, 57, 0.6)"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Active filled arc */}
            <path
              d={`M10 75 A60 60 0 0 1 ${10 + (score / 100) * 120} ${75 - Math.sin((score/100) * Math.PI) * 60}`}
              fill="none"
              stroke={`url(#gauge-gradient-${ticker})`}
              strokeWidth="10"
              strokeLinecap="round"
              style={{ opacity: 0.85 }}
            />
            {/* Needle Pivot */}
            <circle cx="70" cy="75" r="5" fill="#fff" />
            {/* Needle Line */}
            <line
              x1="70"
              y1="75"
              x2="70"
              y2="20"
              stroke="#fff"
              strokeWidth="3"
              strokeLinecap="round"
              transform={`rotate(${angle} 70 75)`}
              style={{ transition: "transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
            />
            
            {/* Color Gradients */}
            <defs>
              <linearGradient id={`gauge-gradient-${ticker}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ff4d6a" />
                <stop offset="50%" stopColor="#EAB308" />
                <stop offset="100%" stopColor="#32E07E" />
              </linearGradient>
            </defs>
          </svg>
          <div style={{ textAlign: "center", marginTop: 4 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{score}</span>
            <span style={{ fontSize: 12, color: "#7A9E9C" }}>/100</span>
          </div>
        </div>

        {/* Detailed Indicator Lists */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rsi !== undefined && (
            <div style={{ background: "rgba(26, 59, 57, 0.6)", padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#7A9E9C", fontWeight: 500 }}>RSI (14)</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: rsi > 70 ? "#ff4d6a" : rsi < 30 ? "#32E07E" : "#fff" }}>
                {rsi} ({rsi > 70 ? "Overbought" : rsi < 30 ? "Oversold" : "Neutral"})
              </span>
            </div>
          )}
          {macd && (
            <div style={{ background: "rgba(26, 59, 57, 0.6)", padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#7A9E9C", fontWeight: 500 }}>MACD (12, 26)</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: macd.toLowerCase().includes("bullish") || macd.toLowerCase().includes("buy") ? "#32E07E" : "#fff" }}>
                {macd}
              </span>
            </div>
          )}
          {movingAverages && (
            <div style={{ background: "rgba(26, 59, 57, 0.6)", padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontSize: 9, color: "#7A9E9C", letterSpacing: "0.05em" }}>MOVING AVERAGES</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#fff" }}>{movingAverages}</span>
            </div>
          )}
        </div>
      </div>

      {oscillators && (
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#7A9E9C", background: "rgba(255,255,255,0.02)", padding: "6px 10px", borderRadius: 6 }}>
          <Info size={12} color="#32E07E" />
          <span>Oscillators: <strong>{oscillators}</strong></span>
        </div>
      )}
    </div>
  );
}
