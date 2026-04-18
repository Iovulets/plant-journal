// ─── Pin ──────────────────────────────────────────────────────────────────
// Thumbtack visual. Two size variants: "large" (detail/hero polaroids) and
// "mini" (plant list rows). `color` is the head color.
export function Pin({ color, size = "large" }) {
  if (size === "mini") {
    return (
      <div style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)", zIndex: 10 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, boxShadow: "0 1px 3px rgba(0,0,0,0.3)", margin: "0 auto" }} />
        <div style={{ width: 1.5, height: 5, background: "#bbb", margin: "0 auto" }} />
      </div>
    );
  }
  // Large: 18px head with radial gradient + inset shading + highlight dot
  return (
    <div style={{ position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)", zIndex: 11, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>
      <div style={{
        width: 18, height: 18, borderRadius: "50%",
        background: `radial-gradient(circle at 35% 35%, ${color}dd, ${color})`,
        boxShadow: "inset -2px -2px 4px rgba(0,0,0,0.25), inset 1px 1px 3px oklch(0.95 0.015 145 / 0.35)",
        margin: "0 auto", position: "relative"
      }}>
        <div style={{ position: "absolute", top: 3, left: 3, width: 5, height: 5, borderRadius: "50%", background: "oklch(0.95 0.015 145 / 0.50)" }} />
      </div>
      <div style={{ width: 2, height: 9, background: "linear-gradient(to bottom, #aaa, #ddd)", margin: "0 auto", borderRadius: "0 0 1px 1px" }} />
    </div>
  );
}

// ─── Polaroid ─────────────────────────────────────────────────────────────
// Unified polaroid frame used for hero photos, photo stacks, gallery lightbox,
// and plant list thumbnails.
//
// Props:
//   src         — image URL (omit or falsy to show `placeholder` instead)
//   size        — "large" (300x375) | "mini" (44x40)
//   tilt        — rotation in degrees (default 0)
//   pinColor    — if set, renders a Pin in matching size
//   caption     — text shown under the photo (typically a date)
//   captionStyle— "caveat" (handwritten) | "italic" (gray italic)
//   shadow      — "soft" | "medium" | "strong" | "deep"
//   placeholder — node shown when src is missing (e.g. a "+" icon)
export function Polaroid({
  src,
  size = "large",
  tilt = 0,
  pinColor,
  caption,
  captionStyle = "caveat",
  shadow = "medium",
  placeholder,
}) {
  const isLarge = size === "large";
  const photoW = isLarge ? 300 : 44;
  const photoH = isLarge ? 375 : 40;
  const padSide = isLarge ? 12 : 3;
  const padTop = isLarge ? 12 : 3;
  const padBottom = isLarge ? 44 : 10;

  const shadows = {
    soft:   "0 2px 8px rgba(60,30,10,0.15)",
    medium: "0 4px 16px rgba(60,30,10,0.14)",
    strong: "0 6px 24px rgba(60,30,10,0.18), 0 2px 6px rgba(60,30,10,0.10)",
    deep:   "0 8px 40px rgba(0,0,0,0.5)", // GalleryLightbox variant
  };

  const imageOrPlaceholder = src
    ? <img src={src} alt="" style={{ display: "block", width: photoW, height: photoH, objectFit: "cover" }} />
    : placeholder || <div style={{ width: photoW, height: photoH, background: "rgba(74,222,128,0.12)" }} />;

  const captionNode = caption ? (
    captionStyle === "italic" ? (
      <div style={{ position: "absolute", bottom: 10, left: 0, right: 0, textAlign: "center", fontSize: 11, color: "#aaa", fontStyle: "italic" }}>
        {caption}
      </div>
    ) : (
      <div style={{ position: "absolute", bottom: 10, left: 0, right: 0, textAlign: "center", fontFamily: "'Caveat', cursive", fontSize: 16, color: "#3a3a3a", letterSpacing: "0.5px" }}>
        {caption}
      </div>
    )
  ) : null;

  return (
    <div style={{ position: "relative", display: "inline-block", transform: tilt ? `rotate(${tilt}deg)` : undefined }}>
      {pinColor && <Pin color={pinColor} size={size === "mini" ? "mini" : "large"} />}
      <div style={{
        background: "#fff",
        padding: `${padTop}px ${padSide}px ${padBottom}px`,
        boxShadow: shadows[shadow] || shadows.medium,
        position: "relative",
      }}>
        {imageOrPlaceholder}
        {captionNode}
      </div>
    </div>
  );
}
