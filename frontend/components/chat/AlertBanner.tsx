"use client";
import { AlertTriangle, Zap, Info } from "lucide-react";

interface AlertBannerProps {
  severity: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  body: string;
}

const config = {
  HIGH: { color: "#ff4d6a", bg: "rgba(255,77,106,0.06)", border: "rgba(255,77,106,0.3)", Icon: AlertTriangle },
  MEDIUM: { color: "#EAB308", bg: "rgba(234,179,8,0.06)", border: "rgba(234,179,8,0.3)", Icon: Zap },
  LOW: { color: "#00c9ff", bg: "rgba(0,201,255,0.06)", border: "rgba(0,201,255,0.3)", Icon: Info },
};

export default function AlertBanner({ severity, title, body }: AlertBannerProps) {
  const { color, bg, border, Icon } = config[severity];
  return (
    <div style={{
      background: bg, border: `1px solid ${border}`,
      borderRadius: 10, padding: "14px 16px",
      display: "flex", gap: 12, alignItems: "flex-start",
    }}>
      <div style={{ marginTop: 1, flexShrink: 0 }}>
        <Icon size={16} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color, marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.5 }}>{body}</div>
      </div>
      <div style={{ marginLeft: "auto", flexShrink: 0 }}>
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: "0.1em",
          color, background: `${color}15`, border: `1px solid ${color}30`,
          padding: "2px 7px", borderRadius: 3,
        }}>{severity}</span>
      </div>
    </div>
  );
}
