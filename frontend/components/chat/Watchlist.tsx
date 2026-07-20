"use client";
import { Target, TrendingUp, TrendingDown } from "lucide-react";

interface WatchItem {
  ticker: string;
  reason: string;
  signal: "BUY" | "SELL" | "HOLD";
  targetPrice: number;
}

const sigColor = { BUY: "#32E07E", SELL: "#ff4d6a", HOLD: "#EAB308" };

export default function Watchlist({ title, items }: { title: string; items: WatchItem[] }) {
  return (
    <div style={{
      background: "rgba(19, 45, 43, 0.6)", border: "1px solid rgba(255, 255, 255, 0.08)",
      borderRadius: 12, overflow: "hidden",
    }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", alignItems: "center", gap: 8 }}>
        <Target size={14} color="#32E07E" />
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: "#fff" }}>{title}</span>
      </div>
      <div style={{ padding: "8px 0" }}>
        {items.map((item, i) => (
          <div key={item.ticker} style={{
            padding: "12px 20px",
            borderBottom: i < items.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            transition: "background 0.15s", cursor: "pointer",
          }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, color: "#fff" }}>{item.ticker}</span>
                <span style={{
                  color: sigColor[item.signal], background: `${sigColor[item.signal]}15`,
                  border: `1px solid ${sigColor[item.signal]}30`,
                  padding: "1px 7px", borderRadius: 3, fontSize: 10, fontWeight: 600,
                }}>{item.signal}</span>
              </div>
              <div style={{ fontSize: 12, color: "#7A9E9C" }}>{item.reason}</div>
            </div>
            <div style={{ textAlign: "right", marginLeft: 16 }}>
              <div style={{ fontSize: 11, color: "#7A9E9C", marginBottom: 2 }}>TARGET</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: sigColor[item.signal] }}>
                ${item.targetPrice.toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
