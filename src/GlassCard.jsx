// ── Liquid Glass components ────────────────────────────────────────────────
// Translucent surfaces with hover lift. Used throughout the app for cards,
// grids, and interactive tiles.

import { useState } from "react";

const GLASS_VARS = {
  regular: {
    bg: "oklch(0.95 0.015 145 / 0.10)", bgHover: "oklch(0.95 0.015 145 / 0.14)",
    border: "oklch(0.95 0.015 145 / 0.15)",
  },
  interactive: {
    bg: "oklch(0.95 0.015 145 / 0.12)", bgHover: "oklch(0.95 0.015 145 / 0.18)",
    border: "oklch(0.95 0.015 145 / 0.18)",
  },
  prominent: {
    bg: "rgba(100,220,80,0.15)", bgHover: "rgba(100,220,80,0.22)",
    border: "rgba(150,255,100,0.25)",
  },
};

export function GlassContainer({ children, gap = 10, style = {}, className = "" }) {
  return (
    <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr", gap, ...style }} className={className}>
      {children}
    </div>
  );
}

export function GlassCard({ children, variant = "regular", borderRadius = 20, style = {}, className = "", onClick }) {
  const v = GLASS_VARS[variant] || GLASS_VARS.regular;
  const [hovered, setHovered] = useState(false);
  const isInteractive = !!onClick || variant === "interactive" || variant === "prominent";

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => isInteractive && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", borderRadius,
        background: hovered ? v.bgHover : v.bg,
        border: `1px solid ${v.border}`,
        transition: "background 0.18s ease, transform 0.18s ease",
        transform: hovered && isInteractive ? "translateY(-1px)" : "none",
        cursor: isInteractive ? "pointer" : "default",
        overflow: "hidden", zIndex: 1, ...style,
      }}
      className={className}
    >
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}
