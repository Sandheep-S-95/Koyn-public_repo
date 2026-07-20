"use client";
import { Newspaper, Flame, ExternalLink, Calendar } from "lucide-react";

interface NewsItem {
  headline: string;
  source: string;
  time: string;
  sentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
  impact: "HIGH" | "MEDIUM" | "LOW";
  summary: string;
}

interface NewsFeedProps {
  title?: string;
  items: NewsItem[];
}

const sentimentStyles = {
  BULLISH: { color: "#32E07E", border: "rgba(50,224,126,0.2)", bg: "rgba(50,224,126,0.05)" },
  BEARISH: { color: "#ff4d6a", border: "rgba(255,77,106,0.2)", bg: "rgba(255,77,106,0.05)" },
  NEUTRAL: { color: "#EAB308", border: "rgba(234,179,8,0.2)", bg: "rgba(234,179,8,0.05)" },
};

const impactStyles = {
  HIGH: { bg: "rgba(239,68,68,0.15)", color: "#f87171", border: "rgba(239,68,68,0.3)", icon: true },
  MEDIUM: { bg: "rgba(245,158,11,0.1)", color: "#fbbf24", border: "rgba(245,158,11,0.2)", icon: false },
  LOW: { bg: "rgba(107,114,128,0.1)", color: "#9ca3af", border: "rgba(107,114,128,0.15)", icon: false },
};

export default function NewsFeed(props: NewsFeedProps) {
  const { title = "Catalysts & Events", items } = props;

  return (
    <div style={{
      background: "rgba(19, 45, 43, 0.6)",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      borderRadius: 12,
      padding: "20px",
      position: "relative",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <Newspaper size={18} color="#32E07E" />
        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "0.02em" }}>
          {title}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {items.map((item, idx) => {
          const sent = sentimentStyles[item.sentiment] || sentimentStyles.NEUTRAL;
          const imp = impactStyles[item.impact] || impactStyles.LOW;

          return (
            <div key={idx} style={{
              background: "rgba(26, 59, 57, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 10,
              padding: "14px",
              position: "relative",
              transition: "transform 0.2s ease, border-color 0.2s ease",
            }}>
              {/* Top metadata row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: "#32E07E" }}>{item.source}</span>
                  <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 10 }}>•</span>
                  <span style={{ fontSize: 10, color: "#7A9E9C", display: "flex", alignItems: "center", gap: 3 }}>
                    <Calendar size={10} /> {item.time}
                  </span>
                </div>
                
                <div style={{ display: "flex", gap: 6 }}>
                  {/* Impact badge */}
                  <span style={{
                    background: imp.bg, border: `1px solid ${imp.border}`, color: imp.color,
                    fontSize: 9, fontWeight: 600, padding: "1px 6px", borderRadius: 4,
                    display: "flex", alignItems: "center", gap: 3
                  }}>
                    {imp.icon && <Flame size={10} />}
                    {item.impact} IMPACT
                  </span>

                  {/* Sentiment tag */}
                  <span style={{
                    background: sent.bg, border: `1px solid ${sent.border}`, color: sent.color,
                    fontSize: 9, fontWeight: 600, padding: "1px 6px", borderRadius: 4,
                  }}>
                    {item.sentiment}
                  </span>
                </div>
              </div>

              {/* Headline */}
              <div style={{
                fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 600, color: "#fff",
                lineHeight: 1.4, marginBottom: 6, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10
              }}>
                {item.headline}
                <ExternalLink size={12} style={{ color: "#7A9E9C", marginTop: 2, flexShrink: 0, opacity: 0.7 }} />
              </div>

              {/* Summary */}
              <div style={{ fontSize: 12, color: "#7A9E9C", lineHeight: 1.5 }}>
                {item.summary}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
