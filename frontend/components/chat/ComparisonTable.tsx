"use client";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Stock {
  ticker: string;
  name: string;
  price: number;
  change: number;
  pe: number;
  beta: number;
  signal: "BUY" | "SELL" | "HOLD";
}

const sigColor = { BUY: "#32E07E", SELL: "#ff4d6a", HOLD: "#EAB308" };

export default function ComparisonTable({ stocks }: { stocks: Stock[] }) {
  return (
    <div style={{
      background: "rgba(19, 45, 43, 0.6)", border: "1px solid rgba(255, 255, 255, 0.08)",
      borderRadius: 12, overflow: "hidden",
    }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: "#fff" }}>COMPARISON</span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
              {["TICKER", "PRICE", "CHANGE", "P/E", "BETA", "SIGNAL"].map((h) => (
                <th key={h} style={{
                  padding: "10px 16px", textAlign: "left",
                  fontSize: 10, color: "#7A9E9C", letterSpacing: "0.1em", fontWeight: 600,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stocks.map((s, i) => (
              <tr key={s.ticker} style={{
                borderBottom: i < stocks.length - 1 ? "1px solid rgba(255, 255, 255, 0.08)" : "none",
                transition: "background 0.15s",
              }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, color: "#fff" }}>{s.ticker}</div>
                  <div style={{ fontSize: 11, color: "#7A9E9C" }}>{s.name}</div>
                </td>
                <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 500, color: "#fff" }}>
                  ${s.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, color: s.change >= 0 ? "#32E07E" : "#ff4d6a" }}>
                    {s.change >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{s.change >= 0 ? "+" : ""}{s.change.toFixed(2)}%</span>
                  </div>
                </td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-dim)" }}>{s.pe?.toFixed(1)}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-dim)" }}>{s.beta?.toFixed(2)}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{
                    color: sigColor[s.signal],
                    background: `${sigColor[s.signal]}15`,
                    border: `1px solid ${sigColor[s.signal]}40`,
                    padding: "3px 10px", borderRadius: 4,
                    fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
                  }}>{s.signal}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
