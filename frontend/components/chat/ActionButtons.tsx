"use client";

interface ActionButton { label: string; query: string; }

export default function ActionButtons({ buttons, onSelect }: { buttons: ActionButton[]; onSelect: (q: string) => void }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {buttons.map((b) => (
        <button
          key={b.label}
          onClick={() => onSelect(b.query)}
          style={{
            background: "transparent",
            border: "1px solid rgba(50,224,126,0.2)",
            borderRadius: 6,
            color: "#32E07E",
            fontSize: 12,
            padding: "7px 14px",
            cursor: "pointer",
            fontFamily: "'DM Mono', monospace",
            transition: "all 0.15s ease",
            letterSpacing: "0.03em",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(50,224,126,0.06)";
            e.currentTarget.style.borderColor = "rgba(50,224,126,0.5)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "rgba(50,224,126,0.2)";
          }}
        >
          {b.label}
        </button>
      ))}
    </div>
  );
}
