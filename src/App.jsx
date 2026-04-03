import { useState, useRef, useCallback, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import anthuriumImg from "./assets/plants/anthurium.jpg";
import chrysanthemumImg from "./assets/plants/chrysanthemum.jpg";
import ivyImg from "./assets/plants/ivy.jpg";
import dracaenaImg from "./assets/plants/dracaena.jpg";
import ficusImg from "./assets/plants/ficus.jpg";
import zzImg from "./assets/plants/zz.jpg";
import bgPhoto from "./assets/background.webp";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const TRACKING_SINCE = "27/03/2026";

const PLANTS = [
  {
    id: 1, name: "White Anthurium", species: "Anthurium andraeanum", emoji: "🌸",
    image: anthuriumImg, waterEveryDays: 7, light: "Bright indirect",
    care: "Keep soil moist but never soggy. Loves humidity — mist the leaves weekly. Wipe dust off leaves with a damp cloth occasionally.",
    warning: null, co2PerYear: 50, vocPerHour: 1000, vocStrengths: ["Ammonia", "Formaldehyde"],
  },
  {
    id: 2, name: "Chrysanthemum", species: "Chrysanthemum morifolium", emoji: "🌼",
    image: chrysanthemumImg, waterEveryDays: 3, light: "Bright direct",
    care: "Keep soil consistently moist. Buds are forming — do not let it dry out now. Remove spent flowers to encourage blooming.",
    warning: null, co2PerYear: 120, vocPerHour: 3500, vocStrengths: ["Benzene", "Formaldehyde", "Ammonia"],
  },
  {
    id: 3, name: "English Ivy", species: "Hedera helix", emoji: "🍃",
    image: ivyImg, waterEveryDays: 5, light: "Medium indirect",
    care: "Allow top inch of soil to dry between waterings. Prefers cooler temps. Mist occasionally to maintain humidity.",
    warning: null, co2PerYear: 90, vocPerHour: 2900, vocStrengths: ["Benzene", "Formaldehyde"],
  },
  {
    id: 4, name: "Dracaena", species: "Dracaena marginata", emoji: "🌿",
    image: dracaenaImg, waterEveryDays: 10, light: "Medium indirect",
    care: "Let soil dry out between waterings. Sensitive to fluoride — use filtered water if possible. Avoid cold drafts.",
    warning: null, co2PerYear: 100, vocPerHour: 2400, vocStrengths: ["Formaldehyde", "Toluene", "Xylene"],
  },
  {
    id: 5, name: "Weeping Fig", species: "Ficus benjamina", emoji: "🌳",
    image: ficusImg, waterEveryDays: 7, light: "Bright indirect",
    care: "Do NOT move it — Ficus drops leaves when relocated. Keep away from cold drafts and window glass at night. Water consistently. Scratch bare branches: green inside means alive.",
    warning: "Stressed from 1yr neglect + cat attack. Bare branches visible. Stable spot is critical.", co2PerYear: 90, vocPerHour: 1540, vocStrengths: ["Formaldehyde", "Xylene"],
  },
  {
    id: 6, name: "ZZ Plant", species: "Zamioculcas zamiifolia", emoji: "✨",
    image: zzImg, waterEveryDays: 21, light: "Low to medium indirect",
    care: "Extremely drought tolerant. Overwatering is the main killer. Water once every 3 weeks maximum. Thrives on neglect.",
    warning: null, co2PerYear: 30, vocPerHour: 400, vocStrengths: ["General VOCs"],
  },
];

function daysSince(iso) {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}
function getStatus(plant, lastWatered) {
  const d = daysSince(lastWatered);
  if (d === null) return "unknown";
  if (d >= plant.waterEveryDays) return "thirsty";
  if (d >= plant.waterEveryDays * 0.7) return "soon";
  return "happy";
}
const STATUS_LABEL = { happy: "Hydrated", soon: "Water soon", thirsty: "Needs water", unknown: "Not logged" };
const STATUS_COLOR = { happy: "#94b88a", soon: "#d4935a", thirsty: "#c46860", unknown: "#b0998e" };
const TILTS = [1.5, -2, 2.5, -1.2, 1.8, -2.3];
const PIN_COLORS = ["#e05c5c", "#5c7de0", "#e0b45c", "#5cba7d", "#c45ce0", "#e07a5c"];

function Pin({ color }) {
  return (
    <div style={{ position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)", zIndex: 10, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>
      <div style={{
        width: 18, height: 18, borderRadius: "50%", background: `radial-gradient(circle at 35% 35%, ${color}dd, ${color})`,
        boxShadow: `inset -2px -2px 4px rgba(0,0,0,0.25), inset 1px 1px 3px rgba(255,255,255,0.35)`,
        margin: "0 auto", position: "relative"
      }}>
        <div style={{ position: "absolute", top: 3, left: 3, width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.5)" }} />
      </div>
      <div style={{ width: 2, height: 9, background: "linear-gradient(to bottom, #aaa, #ddd)", margin: "0 auto", borderRadius: "0 0 1px 1px" }} />
    </div>
  );
}

function Polaroid({ src, tilt, pinColor, size = "large" }) {
  const isLarge = size === "large";
  const photoW = isLarge ? 260 : 40;
  const photoH = isLarge ? 260 : 36;
  const padSide = isLarge ? 12 : 3;
  const padBottom = isLarge ? 44 : 12;
  const padTop = isLarge ? 12 : 3;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <Pin color={pinColor} />
      <div style={{
        background: "#fff",
        padding: `${padTop}px ${padSide}px ${padBottom}px`,
        boxShadow: isLarge
          ? "0 6px 24px rgba(60,30,10,0.18), 0 2px 6px rgba(60,30,10,0.10)"
          : "0 2px 8px rgba(60,30,10,0.16)",
        transform: `rotate(${tilt}deg)`,
        display: "inline-block",
      }}>
        <img
          src={src}
          alt=""
          style={{ display: "block", width: photoW, height: photoH, objectFit: "cover" }}
        />
      </div>
    </div>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }

  :root {
    --green: #4ade80;
    --green-dim: #86efac;
    --green-mid: rgba(74,222,128,0.18);
    --text: #ffffff;
    --text-2: rgba(255,255,255,0.72);
    --text-3: rgba(255,255,255,0.38);
    --warn: #f87171;
    --warn-bg: rgba(248,113,113,0.15);
    --glass-bg: rgba(255,255,255,0.10);
    --glass-bg-hover: rgba(255,255,255,0.14);
    --glass-border: rgba(255,255,255,0.22);
    --glass-border-top: rgba(255,255,255,0.48);
    --glass-shadow: 0 8px 32px rgba(0,0,0,0.22), 0 1.5px 0 rgba(255,255,255,0.35) inset, 0 -1px 0 rgba(0,0,0,0.12) inset;
    --glass-filter: blur(20px) saturate(180%) brightness(1.12);
    --card: rgba(255,255,255,0.10);
    --card-border: rgba(255,255,255,0.22);
    --peach-dark: #4ade80;
    --peach-light: rgba(74,222,128,0.12);
    --peach-mid: rgba(74,222,128,0.28);
    --warm: rgba(255,255,255,0.72);
    --muted: rgba(255,255,255,0.48);
    --text-muted: rgba(255,255,255,0.48);
    --white: rgba(255,255,255,0.10);
    --cream: #1a3a1a;
    --peach: rgba(74,222,128,0.18);
    --soft-brown: rgba(255,255,255,0.5);
  }

  body { margin: 0; background: #0f1a0f; }

  .app {
    max-width: 430px;
    margin: 0 auto;
    min-height: 100vh;
    background: transparent;
    font-family: 'DM Sans', sans-serif;
    color: var(--text);
    user-select: none;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fade-up { animation: fadeUp 0.3s ease both; }

  .lg-wrap { position: relative; border-radius: 20px; }
  .lg-wrap-sm { border-radius: 18px; }

  .lg {
    background: var(--glass-bg);
    backdrop-filter: var(--glass-filter);
    -webkit-backdrop-filter: var(--glass-filter);
    border: 1px solid var(--glass-border);
    border-top-color: var(--glass-border-top);
    border-bottom-color: rgba(0,0,0,0.15);
    box-shadow: var(--glass-shadow);
    border-radius: inherit;
    position: relative;
    overflow: hidden;
  }
  .lg::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(145deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 30%, transparent 55%);
    border-radius: inherit;
    pointer-events: none;
    z-index: 1;
  }
  .lg::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 90% 60% at 90% -10%, rgba(180,255,120,0.18) 0%, rgba(120,220,60,0.06) 40%, transparent 70%);
    border-radius: inherit;
    pointer-events: none;
    z-index: 1;
  }

  @media (max-width: 430px) {
    .prow { background: rgba(255,255,255,0.04); }
  }
  .app > * { position: relative; z-index: 1; }

  .ov-hero { padding: 16px 24px 20px; background: transparent; }
  .ov-tag  { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--green); font-weight: 500; margin-bottom: 10px; }
  .ov-heading { font-family: 'DM Sans', sans-serif; font-size: 38px; font-weight: 600; line-height: 1.1; color: #ffffff; }
  .ov-heading em { font-style: normal; color: #c8f0a0; }
  .ov-since { margin-top: 8px; font-size: 12px; color: var(--text-2); font-weight: 300; }

  .stat { padding: 18px 16px 16px; position: relative; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-start; gap: 5px; }
  .stat > * { position: relative; z-index: 1; }
  .stat.span2 { grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; }
  .stat.warn  { background: rgba(248,113,113,0.12); border-color: rgba(248,113,113,0.3); border-top-color: rgba(255,180,180,0.45); }
  .stat-n { font-size: 36px; font-weight: 600; line-height: 1; color: var(--text); }
  .stat.warn .stat-n { color: var(--warn); }
  .stat-l { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-2); margin-top: 4px; }
  .stat.span2 .stat-l  { margin-top: 0; }
  .stat.span2 .stat-val { font-size: 14px; color: var(--text); }
  .action-tile { position: relative; }

  .stat::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(148deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.05) 35%, transparent 60%);
    border-radius: 20px;
    pointer-events: none;
    transition: opacity 0.4s ease;
  }
  .stat:hover::before { opacity: 1.4; }
  .stat::after {
    content: '';
    position: absolute;
    top: -30%; right: -15%;
    width: 75%; height: 130%;
    background: radial-gradient(ellipse at 75% 15%, rgba(170,255,100,0.14) 0%, transparent 60%);
    pointer-events: none;
  }

  .list-head { padding: 24px 22px 10px; font-size: 10px; letter-spacing: 2.5px; text-transform: uppercase; color: rgba(255,255,255,0.7); }

  .prow { padding: 12px 14px; display: flex; align-items: center; gap: 12px; position: relative; }
  .prow > * { position: relative; z-index: 1; }

  .prow-info { flex: 1; min-width: 0; }
  .prow-name { font-size: 15px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text); }
  .prow-sub  { font-size: 11px; color: var(--text-2); margin-top: 2px; font-style: italic; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .prow-right { display: flex; align-items: center; gap: 5px; flex-shrink: 0; }
  .sdot   { width: 6px; height: 6px; border-radius: 50%; }
  .slabel { font-size: 11px; }
  .parrow { font-size: 18px; color: var(--text-3); margin-left: 2px; }

  .detail-nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 18px;
    background: rgba(255,255,255,0.08);
    backdrop-filter: blur(24px) saturate(160%) brightness(1.1);
    -webkit-backdrop-filter: blur(24px) saturate(160%) brightness(1.1);
    z-index: 10;
    border-bottom: 1px solid rgba(255,255,255,0.15);
    position: relative;
  }
  .detail-nav::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.10) 0%, transparent 55%);
    pointer-events: none;
  }
  .dnav-back { background: none; border: none; font-size: 13px; color: var(--text-2); cursor: pointer; font-family: 'DM Sans', sans-serif; padding: 6px 0; }
  .dnav-counter { font-size: 11px; color: var(--text-2); letter-spacing: 1px; }
  .dnav-arrows { display: flex; gap: 4px; }
  .darrow {
    background: var(--glass-bg);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--glass-border);
    border-top-color: var(--glass-border-top);
    border-radius: 20px;
    width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; color: var(--text); cursor: pointer; transition: background 0.15s;
    box-shadow: 0 1px 0 rgba(255,255,255,0.25) inset;
  }
  .darrow:disabled { opacity: 0.3; cursor: default; }
  .darrow:not(:disabled):hover { background: rgba(255,255,255,0.16); transform: scale(1.08); }
  .darrow:not(:disabled):active { background: var(--glass-bg-hover); transform: scale(0.95); }

  .dots { display: flex; justify-content: center; gap: 5px; padding: 10px 0 4px; }
  .dot  { height: 5px; border-radius: 3px; background: rgba(255,255,255,0.22); transition: all 0.25s; width: 5px; cursor: pointer; }
  .dot.on { background: var(--green); width: 18px; }

  .polaroid-stage { display: flex; justify-content: center; align-items: center; padding: 20px 0 8px; }

  .detail-body { padding: 20px 20px 48px; }
  .d-species { font-size: 11px; color: var(--green); font-style: italic; margin-bottom: 4px; }
  .d-name    { font-size: 28px; font-weight: 600; color: var(--text); line-height: 1.1; }

  .nick-row { display: flex; align-items: center; gap: 8px; margin: 8px 0 20px; min-height: 30px; }
  .nick-show { font-size: 12px; color: var(--text-2); font-style: italic; }
  .nick-btn  {
    background: rgba(255,255,255,0.08);
    border: 1px dashed rgba(255,255,255,0.28);
    border-radius: 20px; padding: 4px 13px; font-size: 11px; color: var(--text-2);
    cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s;
  }
  .nick-btn:hover { background: rgba(255,255,255,0.13); border-style: solid; }
  .nick-input { border: 1px solid rgba(255,255,255,0.3); border-radius: 20px; padding: 5px 14px; font-size: 12px; font-family: 'DM Sans', sans-serif; color: var(--text); background: rgba(255,255,255,0.1); outline: none; width: 155px; }
  .nick-save  { background: var(--green); border: none; border-radius: 20px; padding: 5px 13px; font-size: 11px; color: #0a1a0a; cursor: pointer; font-family: 'DM Sans', sans-serif; font-weight: 600; }

  .rule { height: 1px; background: rgba(255,255,255,0.12); margin: 0 0 18px; }
  .d-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .d-key { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-2); }
  .d-val { font-size: 13px; color: var(--text); }

  /* Tappable date rows */
  .d-row-tap {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 12px; cursor: pointer; padding: 6px 10px; margin-left: -10px; margin-right: -10px;
    border-radius: 10px; transition: background 0.15s;
  }
  .d-row-tap:hover { background: rgba(255,255,255,0.07); }
  .d-row-tap:active { background: rgba(255,255,255,0.12); }
  .d-val-tap { font-size: 13px; color: var(--text); display: flex; align-items: center; gap: 5px; }
  .d-val-tap-hint { font-size: 10px; color: rgba(255,255,255,0.55); background: rgba(255,255,255,0.1); border-radius: 4px; padding: 1px 5px; letter-spacing: 0.5px; }

  .progress-wrap { margin-bottom: 20px; }
  .progress-labels { display: flex; justify-content: space-between; font-size: 11px; color: var(--text-2); margin-bottom: 6px; }
  .progress-track { height: 4px; background: rgba(255,255,255,0.12); border-radius: 2px; overflow: hidden; }
  .progress-fill  { height: 100%; border-radius: 2px; transition: width 0.5s ease; }

  .care-box {
    background: var(--glass-bg);
    backdrop-filter: blur(16px) saturate(160%);
    -webkit-backdrop-filter: blur(16px) saturate(160%);
    border: 1px solid var(--glass-border);
    border-top-color: var(--glass-border-top);
    border-radius: 16px;
    padding: 14px 16px; font-size: 13px; line-height: 1.7; color: var(--text-2); font-weight: 300; margin-bottom: 14px;
    position: relative; overflow: hidden;
  }
  .care-box::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 48%;
    background: linear-gradient(175deg, rgba(255,255,255,0.14) 0%, transparent 100%);
    border-radius: 16px 16px 0 0;
    pointer-events: none;
  }
  .warn-box {
    border: 1px solid rgba(248,113,113,0.35);
    background: rgba(248,113,113,0.12);
    border-radius: 16px; padding: 12px 16px; font-size: 12px; color: var(--warn); line-height: 1.65; margin-bottom: 16px;
  }

  .btn-water {
    width: 100%; padding: 12px 8px;
    background: rgba(100,220,80,0.22);
    backdrop-filter: blur(20px) saturate(200%) brightness(1.18);
    -webkit-backdrop-filter: blur(20px) saturate(200%) brightness(1.18);
    border: 1px solid rgba(150,255,100,0.40);
    border-top-color: rgba(200,255,160,0.70);
    border-bottom-color: rgba(40,120,20,0.20);
    border-radius: 20px;
    box-shadow: 0 4px 20px rgba(60,180,30,0.22), 0 1.5px 0 rgba(200,255,160,0.45) inset;
    color: #d4ffb0;
    font-size: 14px; font-family: 'DM Sans', sans-serif; font-weight: 500;
    letter-spacing: 0.5px;
    cursor: pointer; transition: all 0.22s ease;
    position: relative; overflow: hidden;
    text-align: center;
  }
  .btn-water::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 52%;
    background: linear-gradient(to bottom, rgba(255,255,255,0.22), rgba(255,255,255,0.02));
    border-radius: 20px 20px 0 0; pointer-events: none;
  }
  .btn-water:hover { transform: translateY(-2px); background: rgba(100,220,80,0.32); box-shadow: 0 8px 28px rgba(60,180,30,0.30), 0 1.5px 0 rgba(200,255,160,0.55) inset; }
  .btn-water:active { transform: scale(0.98); }

  .btn-fertilize {
    width: 100%; padding: 12px 8px; margin-top: 8px;
    background: rgba(212,147,90,0.18);
    backdrop-filter: blur(20px) saturate(200%) brightness(1.18);
    -webkit-backdrop-filter: blur(20px) saturate(200%) brightness(1.18);
    border: 1px solid rgba(212,147,90,0.35);
    border-top-color: rgba(240,190,140,0.60);
    border-radius: 20px;
    box-shadow: 0 4px 20px rgba(180,120,40,0.15), 0 1.5px 0 rgba(240,190,140,0.35) inset;
    color: #ffe0b0;
    font-size: 14px; font-family: 'DM Sans', sans-serif; font-weight: 500;
    letter-spacing: 0.5px;
    cursor: pointer; transition: all 0.22s ease;
    position: relative; overflow: hidden;
    text-align: center;
  }
  .btn-fertilize:hover { transform: translateY(-2px); background: rgba(212,147,90,0.28); }
  .btn-fertilize:active { transform: scale(0.98); }

  .btn-consult {
    width: 100%; padding: 10px 8px; margin-top: 8px;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 20px;
    color: rgba(255,255,255,0.55);
    font-size: 13px; font-family: 'DM Sans', sans-serif;
    cursor: pointer; transition: all 0.2s;
    text-align: center;
  }
  .btn-consult:hover { background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.8); }

  .btn-reset {
    width: 100%; padding: 12px; background: rgba(255,255,255,0.06);
    color: var(--text-2); border: 1px solid rgba(255,255,255,0.15); border-radius: 16px;
    font-size: 12px; font-family: 'DM Sans', sans-serif; cursor: pointer; margin-top: 8px;
  }
  .btn-reset:active { background: rgba(255,255,255,0.10); }

  .swipe-hint { text-align: center; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-3); margin-top: 20px; }

  .shine { position: relative; overflow: hidden; }
  .shine::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(148deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 38%, transparent 58%);
    border-radius: inherit; pointer-events: none; z-index: 1;
  }
  .shine::after {
    content: '';
    position: absolute; top: -40%; right: -20%;
    width: 70%; height: 140%;
    background: radial-gradient(ellipse at 70% 15%, rgba(160,255,100,0.12) 0%, transparent 60%);
    pointer-events: none; z-index: 1;
  }
`;

// ── Air Quality ────────────────────────────────────────────────────────────

const AIR_CARDS = [
  { id: "voc", label: "VOC Removal", subtitle: "toxin filtration", unit: "μg/hr", description: "WHO guideline: <300μg/m³ total VOC. Your plants remove toxins at roughly the rate of a mid-range air purifier running continuously. Tap a toxin to see which plants target it.", color: "#94b88a", colorLight: "rgba(148,184,138,0.15)" },
  { id: "co2", label: "CO₂ Offset", subtitle: "carbon absorption", unit: "g/day", description: "Your 35m² apartment holds ~87.5m³ of air. Plants offset a small % of your CO₂, but ventilation matters more here. Where plants truly shine is VOC and particulate filtration.", color: "#b8c894", colorLight: "rgba(184,200,148,0.15)" },
  { id: "humidity", label: "Humidity", subtitle: "transpiration boost", unit: "ml/day", description: "With no heating running, your indoor RH tracks outdoor levels (~68% in late March). You're already above the 40-60% optimal range — no humidity problem right now. This card becomes important when heating starts in autumn.", color: "#8ab4c8", colorLight: "rgba(138,180,200,0.15)" },
  { id: "pm25", label: "PM2.5 Filter", subtitle: "fine dust trapping", unit: "% reduction", description: "Leaf surfaces trap fine airborne particles (PM2.5). NASA studies show 20-30% reduction in a closed room. Larger, textured leaves (Ficus, Dracaena) are most effective.", color: "#c8a894", colorLight: "rgba(200,168,148,0.15)" },
  { id: "wellbeing", label: "Wellbeing", subtitle: "stress & cortisol", unit: "score", description: "Journal of Physiological Anthropology (2015): interacting with houseplants measurably reduces cortisol and systolic blood pressure. This is the most underrated benefit.", color: "#b894c8", colorLight: "rgba(184,148,200,0.15)" },
];

const VOC_COLORS = { "Benzene": "#e8a87a", "Formaldehyde": "#94b88a", "Ammonia": "#a89ed4", "Toluene": "#d4b88a", "Xylene": "#b8d4c8", "General VOCs": "#c4b4a4" };

function getMetrics(plants) {
  const totalVoc = plants.reduce((s, p) => s + (p.vocPerHour || 0), 0);
  const aptVocGen = 11000;
  const vocPct = Math.min((totalVoc / aptVocGen) * 100, 100);
  const vocMap = {};
  plants.forEach(p => {
    const share = (p.vocPerHour || 0) / (p.vocStrengths?.length || 1);
    (p.vocStrengths || []).forEach(v => { vocMap[v] = (vocMap[v] || 0) + share; });
  });

  const totalCo2Year = plants.reduce((s, p) => s + (p.co2PerYear || 0), 0);
  const offsetPerDay = totalCo2Year / 365;
  const humanPerDay = 400;
  const co2Pct = Math.min((offsetPerDay / humanPerDay) * 100, 100);

  const humidityMlPerDay = plants.length * 35;
  const rhBoost = humidityMlPerDay * 0.013;
  const targetRH = 60; const currentRH = 68;
  const humidityPct = Math.round((currentRH / targetRH) * 100);

  const pm25Scores = { 1: 15, 2: 20, 3: 22, 4: 25, 5: 18, 6: 10 };
  const totalPm25 = plants.reduce((s, p) => s + (pm25Scores[p.id] || 10), 0);
  const maxPm25 = 25 * plants.length;
  const pm25Pct = Math.min((totalPm25 / maxPm25) * 100, 100);
  const pm25Reduction = Math.round(totalPm25 / plants.length);

  const varietyScore = Math.min(plants.length / 6, 1) * 40;
  const placementScore = 35;
  const careScore = 25;
  const wellbeingTotal = varietyScore + placementScore + careScore;
  const wellbeingPct = Math.min(wellbeingTotal, 100);

  return {
    voc: { value: `${(totalVoc/1000).toFixed(1)}k`, pct: vocPct, vocMap, totalVoc, aptVocGen },
    co2: { value: `${offsetPerDay.toFixed(1)}g`, pct: co2Pct, offsetPerDay, humanPerDay },
    humidity: { value: `${humidityMlPerDay}ml`, pct: humidityPct, rhBoost: rhBoost.toFixed(1), currentRH },
    pm25: { value: `~${pm25Reduction}%`, pct: pm25Pct },
    wellbeing: { value: `${Math.round(wellbeingTotal)}/100`, pct: wellbeingPct },
  };
}

function VocDetail({ plants, metrics }) {
  const [activeVoc, setActiveVoc] = useState(null);
  const { vocMap } = metrics;
  const vocEntries = Object.entries(vocMap).sort((a, b) => b[1] - a[1]);
  const maxVoc = vocEntries[0]?.[1] || 1;
  const sortedPlants = [...plants].sort((a, b) => (b.vocPerHour||0) - (a.vocPerHour||0));
  const maxPlantVoc = sortedPlants[0]?.vocPerHour || 1;

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
        <div style={{ fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--muted)", marginBottom: 2 }}>By toxin type</div>
        {vocEntries.map(([voc, val]) => (
          <div key={voc} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", opacity: activeVoc && activeVoc !== voc ? 0.35 : 1, transition: "opacity 0.2s" }}
            onClick={() => setActiveVoc(activeVoc === voc ? null : voc)}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: VOC_COLORS[voc] || "#c4b4a4", flexShrink: 0 }} />
            <div style={{ fontSize: 11, color: "var(--text)", width: 88, flexShrink: 0 }}>{voc}</div>
            <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.14)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 2, width: `${(val/maxVoc)*100}%`, background: VOC_COLORS[voc] || "#c4b4a4" }} />
            </div>
            <div style={{ fontSize: 10, color: "var(--muted)", width: 40, textAlign: "right", flexShrink: 0 }}>{Math.round(val)}μg</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
        <div style={{ fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--muted)", marginBottom: 2 }}>By plant</div>
        {sortedPlants.map(p => {
          const highlighted = activeVoc ? (p.vocStrengths||[]).includes(activeVoc) : true;
          return (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, opacity: highlighted ? 1 : 0.25, transition: "opacity 0.2s" }}>
              <div style={{ fontSize: 9, width: 72, color: "var(--muted)", fontStyle: "italic", flexShrink: 0, lineHeight: 1.2 }}>{p.species}</div>
              <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.14)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 2, width: `${((p.vocPerHour||0)/maxPlantVoc)*100}%`, background: "linear-gradient(90deg, #c8b48a, #e8c4a0)" }} />
              </div>
              <div style={{ fontSize: 10, color: "var(--muted)", width: 52, textAlign: "right", flexShrink: 0 }}>{(p.vocPerHour/1000).toFixed(1)}k μg/h</div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function Co2Detail({ plants, metrics }) {
  const sortedPlants = [...plants].sort((a,b) => (b.co2PerYear||0) - (a.co2PerYear||0));
  const maxCo2 = sortedPlants[0]?.co2PerYear || 1;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
      <div style={{ fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--muted)", marginBottom: 2 }}>By plant</div>
      {sortedPlants.map(p => (
        <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 9, width: 72, color: "var(--muted)", fontStyle: "italic", flexShrink: 0, lineHeight: 1.2 }}>{p.species}</div>
          <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.14)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 2, width: `${((p.co2PerYear||0)/maxCo2)*100}%`, background: "linear-gradient(90deg, #b8c894, #d4e4b0)" }} />
          </div>
          <div style={{ fontSize: 10, color: "var(--muted)", width: 44, textAlign: "right", flexShrink: 0 }}>{p.co2PerYear}g/yr</div>
        </div>
      ))}
    </div>
  );
}

function HumidityDetail({ plants, metrics }) {
  const { rhBoost, currentRH } = metrics;
  const bars = [
    { label: "Current RH (no heating)", value: currentRH, color: "#4ade80" },
    { label: "After plants", value: Math.min(parseFloat(currentRH) + parseFloat(rhBoost), 100), color: "#86efac" },
    { label: "Optimal target", value: 50, color: "#94b88a" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
      {bars.map(b => (
        <div key={b.label}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>
            <span>{b.label}</span><span>{b.value.toFixed(0)}%</span>
          </div>
          <div style={{ height: 4, background: "rgba(255,255,255,0.14)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 2, width: `${b.value}%`, background: b.color }} />
          </div>
        </div>
      ))}
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2, fontStyle: "italic" }}>
        Humidity is fine right now. Bookmark this in October when heating drops RH below 35%.
      </div>
    </div>
  );
}

function Pm25Detail({ plants }) {
  const pm25Scores = { 1: 15, 2: 20, 3: 22, 4: 25, 5: 18, 6: 10 };
  const sortedPlants = [...plants].sort((a, b) => (pm25Scores[b.id]||10) - (pm25Scores[a.id]||10));
  const maxScore = 25;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
      <div style={{ fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--muted)", marginBottom: 2 }}>Filtration by plant</div>
      {sortedPlants.map(p => (
        <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 9, width: 72, color: "var(--muted)", fontStyle: "italic", flexShrink: 0, lineHeight: 1.2 }}>{p.species}</div>
          <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.14)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 2, width: `${((pm25Scores[p.id]||10)/maxScore)*100}%`, background: "linear-gradient(90deg, #c8a894, #e8c4b0)" }} />
          </div>
          <div style={{ fontSize: 10, color: "var(--muted)", width: 44, textAlign: "right", flexShrink: 0 }}>{pm25Scores[p.id]||10}%</div>
        </div>
      ))}
    </div>
  );
}

function WellbeingDetail({ plants }) {
  const factors = [
    { label: "Species variety", value: Math.min(plants.length / 6, 1) * 40, max: 40, note: `${plants.length} species` },
    { label: "Window placement", value: 35, max: 35, note: "Direct sunlight access" },
    { label: "Active care", value: 25, max: 25, note: "Engagement reduces cortisol" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
      {factors.map(f => (
        <div key={f.label}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>
            <span>{f.label}</span><span style={{ fontStyle: "italic" }}>{f.note}</span>
          </div>
          <div style={{ height: 4, background: "rgba(255,255,255,0.14)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 2, width: `${(f.value/f.max)*100}%`, background: "linear-gradient(90deg, #a78bfa, #c4b5fd)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function AirQualitySlider({ plants }) {
  const [activeCard, setActiveCard] = useState("voc");
  const metrics = getMetrics(plants);
  const card = AIR_CARDS.find(c => c.id === activeCard);
  const m = metrics[activeCard];

  const detailMap = {
    voc: <VocDetail plants={plants} metrics={metrics.voc} />,
    co2: <Co2Detail plants={plants} metrics={metrics.co2} />,
    humidity: <HumidityDetail plants={plants} metrics={metrics.humidity} />,
    pm25: <Pm25Detail plants={plants} metrics={metrics.pm25} />,
    wellbeing: <WellbeingDetail plants={plants} />,
  };

  return (
    <div style={{ margin: "16px 16px 0" }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 12, overflowX: "auto", paddingBottom: 2 }}>
        {AIR_CARDS.map(c => (
          <button key={c.id} onClick={() => setActiveCard(c.id)} style={{
            flexShrink: 0,
            background: activeCard === c.id ? c.color : "rgba(255,255,255,0.09)",
            border: `1px solid ${activeCard === c.id ? c.color : "rgba(255,255,255,0.22)"}`,
            borderRadius: 20, padding: "5px 13px", fontSize: 11,
            color: activeCard === c.id ? "#0a1a0a" : "rgba(255,255,255,0.72)",
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 400,
            letterSpacing: "0.3px", transition: "all 0.2s",
          }}>
            {c.label}
          </button>
        ))}
      </div>

      <div style={{
        background: "rgba(255,255,255,0.09)",
        backdropFilter: "blur(20px) saturate(180%) brightness(1.12)",
        WebkitBackdropFilter: "blur(20px) saturate(180%) brightness(1.12)",
        borderRadius: 20, padding: "20px 18px 18px",
        border: "1px solid rgba(255,255,255,0.22)",
        borderTop: `2px solid ${card.color}`,
        boxShadow: "0 8px 32px rgba(0,0,0,0.2), 0 1.5px 0 rgba(255,255,255,0.32) inset",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--muted)", marginBottom: 4 }}>Air quality</div>
            <div style={{ fontSize: 22, fontWeight: 300, color: "var(--text)", lineHeight: 1.1 }}>
              {card.label}<br /><em style={{ fontStyle: "normal", fontWeight: 500, color: card.color }}>{card.subtitle}</em>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 32, fontWeight: 300, color: card.color, lineHeight: 1 }}>{m.value}</div>
            <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.5px" }}>{card.unit}</div>
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 3, width: `${Math.min(m.pct, 100)}%`, background: `linear-gradient(90deg, ${card.color}, ${card.color}99)`, transition: "width 0.8s ease" }} />
          </div>
          <div style={{ textAlign: "right", fontSize: 10, color: card.color, marginTop: 4, letterSpacing: "0.5px", fontWeight: 500 }}>
            {m.pct.toFixed(0)}% of target
          </div>
        </div>

        {detailMap[activeCard]}

        <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 12px", fontSize: 11, color: "var(--text-2)", lineHeight: 1.6, fontWeight: 300 }}>
          {card.description}
        </div>
      </div>
    </div>
  );
}

// ── Single declaration of resizeImageForAPI ────────────────────────────────
async function resizeImageForAPI(file, maxWidth = 800) {
  const originalDataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("FileReader failed"));
    reader.readAsDataURL(file);
  });
  const img = await new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("Image decode failed"));
    i.src = originalDataUrl;
  });
  const scale = Math.min(1, maxWidth / img.width);
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  canvas.getContext("2d").drawImage(img, 0, 0, w, h);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.60);
  const base64 = dataUrl.split(",")[1];
  return { base64, dataUrl, mediaType: "image/jpeg" };
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function callClaude(base64Image, prompt, maxTokens = 256) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY || "",
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64Image } },
          { type: "text", text: prompt }
        ]
      }]
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  const text = data.content?.find(b => b.type === "text")?.text || "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON in response: " + text.slice(0, 100));
  return JSON.parse(jsonMatch[0]);
}

async function analyseWithClaude(base64Image, plant, careContext = {}) {
  const { lastWateredDaysAgo, lastFertilizedDaysAgo } = careContext;
  const waterCtx = lastWateredDaysAgo != null
    ? `Last watered ${lastWateredDaysAgo} day(s) ago (schedule: every ${plant.waterEveryDays} days).`
    : `Not yet watered (schedule: every ${plant.waterEveryDays} days).`;
  const fertCtx = lastFertilizedDaysAgo != null
    ? `Last fertilized ${lastFertilizedDaysAgo} day(s) ago (schedule: every 30 days).`
    : `Never fertilized.`;
  return callClaude(base64Image,
    `You are a botanist. Photo shows ${plant.name} (${plant.species}). Light: ${plant.light}. ${waterCtx} ${fertCtx}
Reply ONLY with JSON: {"status":"healthy","headline":"","recommendation":"","waitDays":null,"urgency":"low"}`,
    256
  );
}

const URGENCY_COLOR = { low: "#94b88a", medium: "#d4935a", high: "#c46860" };
const STATUS_ICON = { action: "✦", wait: "◷", healthy: "✓" };

function GalleryLightbox({ photos, onClose, startIndex = 0 }) {
  const [current, setCurrent] = useState(startIndex);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(30,15,5,0.96)", zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 24, cursor: "pointer", lineHeight: 1 }}>✕</button>
      <div style={{ position: "absolute", top: 24, left: 0, right: 0, textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 2 }}>
        {current + 1} / {photos.length}
      </div>
      <div onClick={e => e.stopPropagation()} style={{ position: "relative" }}>
        <div style={{ background: "#fff", padding: "12px 12px 44px", boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}>
          <img src={photos[current].dataUrl} alt="" style={{ display: "block", width: 300, height: 260, objectFit: "cover" }} />
          <div style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: "#aaa", fontStyle: "italic" }}>
            {new Date(photos[current].date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 24 }} onClick={e => e.stopPropagation()}>
        <button onClick={() => setCurrent(i => Math.max(0, i - 1))} disabled={current === 0} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: "50%", width: 40, height: 40, fontSize: 18, cursor: "pointer", opacity: current === 0 ? 0.3 : 1 }}>‹</button>
        <button onClick={() => setCurrent(i => Math.min(photos.length - 1, i + 1))} disabled={current === photos.length - 1} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: "50%", width: 40, height: 40, fontSize: 18, cursor: "pointer", opacity: current === photos.length - 1 ? 0.3 : 1 }}>›</button>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 16, overflowX: "auto", padding: "4px 20px", maxWidth: 380 }} onClick={e => e.stopPropagation()}>
        {photos.map((p, i) => (
          <img key={i} src={p.dataUrl} onClick={() => setCurrent(i)} style={{ width: 48, height: 48, objectFit: "cover", opacity: i === current ? 1 : 0.5, cursor: "pointer", border: i === current ? "2px solid #f2c4a0" : "2px solid transparent", flexShrink: 0 }} />
        ))}
      </div>
    </div>
  );
}

function PlantPhotoStack({ plant, tilt, pinColor, userPhotos, setUserPhotos, careContext, db }) {
  const [analysing, setAnalysing] = useState(false);
  const [gallery, setGallery] = useState(false);
  const [galleryStart, setGalleryStart] = useState(0);
  const fileRef = useRef();

  const allPhotos = [...userPhotos].reverse();
  const topPhoto = allPhotos[0] || null;
  const latestAnalysis = topPhoto?.analysis || null;
  const stackPhotos = allPhotos.slice(0, 4);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAnalysing(true);
    try {
      const { base64, dataUrl } = await resizeImageForAPI(file, 800);
      const tempPhoto = { dataUrl, base64, date: new Date().toISOString(), analysis: null, id: null };
      setUserPhotos(prev => [...prev, tempPhoto]);
      const result = await analyseWithClaude(base64, plant, careContext || {});
      const path = `plant-${plant.id}/${Date.now()}.jpg`;
      const blob = await fetch(dataUrl).then(r => r.blob());
      await db.storage.from("plant-photos").upload(path, blob, { contentType: "image/jpeg" });
      const { data: urlData } = db.storage.from("plant-photos").getPublicUrl(path);
      const publicUrl = urlData?.publicUrl || dataUrl;
      const { data: dbRow } = await db.from("plant_photos").insert({
        plant_id: plant.id, storage_path: path, data_url: publicUrl, analysis: result,
      }).select().single();
      setUserPhotos(prev => prev.map((p, i) =>
        i === prev.length - 1 ? { ...p, dataUrl: publicUrl, analysis: result, id: dbRow?.id } : p
      ));
    } catch(err) {
      console.error(err);
      setUserPhotos(prev => prev.map((p, i) =>
        i === prev.length - 1 ? { ...p, analysis: { status: "healthy", headline: "Could not analyse", recommendation: err?.message || "Try a clearer photo.", urgency: "low", waitDays: null } } : p
      ));
    }
    setAnalysing(false);
    e.target.value = "";
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "relative", width: 360, height: 328, marginBottom: 8 }}>
        {stackPhotos.slice(1).reverse().map((photo, i) => {
          const stackIdx = stackPhotos.length - 1 - i;
          const offset = stackIdx * 4;
          const rot = tilt + (stackIdx % 2 === 0 ? -stackIdx * 1.5 : stackIdx * 1.5);
          return (
            <div key={i} style={{ position: "absolute", top: offset, left: "50%", transform: `translateX(-50%) rotate(${rot}deg)`, zIndex: stackIdx }}>
              <div style={{ background: "#fff", padding: "12px 12px 44px", boxShadow: "0 4px 16px rgba(60,30,10,0.14)" }}>
                <img src={photo.dataUrl} alt="" style={{ display: "block", width: 300, height: 260, objectFit: "cover" }} />
              </div>
            </div>
          );
        })}
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", zIndex: 10 }}>
          <div style={{ position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)", zIndex: 11, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: `radial-gradient(circle at 35% 35%, ${pinColor}dd, ${pinColor})`, boxShadow: "inset -2px -2px 4px rgba(0,0,0,0.25), inset 1px 1px 3px rgba(255,255,255,0.35)", margin: "0 auto", position: "relative" }}>
              <div style={{ position: "absolute", top: 3, left: 3, width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.5)" }} />
            </div>
            <div style={{ width: 2, height: 9, background: "linear-gradient(to bottom, #aaa, #ddd)", margin: "0 auto", borderRadius: "0 0 1px 1px" }} />
          </div>
          <div style={{ transform: `rotate(${tilt}deg)` }}>
            <div style={{ background: "#fff", padding: "12px 12px 44px", boxShadow: "0 6px 24px rgba(60,30,10,0.18), 0 2px 6px rgba(60,30,10,0.10)" }}>
              <img src={topPhoto ? topPhoto.dataUrl : plant.image} alt={plant.name} style={{ display: "block", width: 300, height: 260, objectFit: "cover" }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: userPhotos.length > 0 ? 16 : 8 }}>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
        <button onClick={() => fileRef.current?.click()} disabled={analysing} style={{
          background: analysing ? "rgba(255,255,255,0.12)" : "var(--peach-dark)",
          border: "none", borderRadius: 20, padding: "7px 16px",
          fontSize: 12, color: "#fff", cursor: analysing ? "default" : "pointer",
          fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.5px", transition: "all 0.2s",
        }}>
          {analysing ? "Analysing…" : "+ Add photo"}
        </button>
        {userPhotos.length > 0 && (
          <button onClick={() => { setGalleryStart(0); setGallery(true); }} style={{
            background: "var(--white)", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 20, padding: "7px 14px", fontSize: 12, color: "var(--muted)",
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          }}>
            Gallery ({userPhotos.length})
          </button>
        )}
      </div>

      {analysing && (
        <div style={{ margin: "0 22px 16px", background: "var(--peach-light)", borderRadius: 14, padding: "14px 16px", fontSize: 13, color: "var(--muted)", fontStyle: "italic", textAlign: "center" }}>
          Examining your plant…
        </div>
      )}

      {latestAnalysis && !analysing && (
        <div style={{
          margin: "0 22px 16px", width: "calc(100% - 44px)",
          background: "var(--card)",
          backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
          border: `1px solid ${URGENCY_COLOR[latestAnalysis.urgency]}44`,
          borderLeft: `3px solid ${URGENCY_COLOR[latestAnalysis.urgency]}`,
          borderRadius: 14, padding: "14px 16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 14, color: URGENCY_COLOR[latestAnalysis.urgency] }}>{STATUS_ICON[latestAnalysis.status]}</span>
            <div style={{ fontSize: 16, fontWeight: 400, color: "var(--text)" }}>{latestAnalysis.headline}</div>
            {latestAnalysis.waitDays && (
              <div style={{ marginLeft: "auto", fontSize: 11, color: "var(--muted)", background: "var(--peach-light)", borderRadius: 10, padding: "2px 8px", flexShrink: 0 }}>~{latestAnalysis.waitDays}d</div>
            )}
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.65, fontWeight: 300 }}>{latestAnalysis.recommendation}</div>
          <div style={{ fontSize: 10, color: "rgba(176,153,142,0.6)", marginTop: 8, letterSpacing: "0.5px" }}>
            {new Date(allPhotos[0].date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
          </div>
        </div>
      )}

      {gallery && userPhotos.length > 0 && (
        <GalleryLightbox photos={[...userPhotos].reverse()} startIndex={galleryStart} onClose={() => setGallery(false)} />
      )}
    </div>
  );
}

// ── Liquid Glass components ────────────────────────────────────────────────

const GLASS_VARS = {
  regular: {
    bg: "rgba(255,255,255,0.11)", bgHover: "rgba(255,255,255,0.17)",
    border: "rgba(255,255,255,0.22)", borderTop: "rgba(255,255,255,0.50)",
    shadow: "0 2px 12px rgba(0,0,0,0.18), 0 1.5px 0 rgba(255,255,255,0.36) inset, 0 -1px 0 rgba(0,0,0,0.10) inset",
    blur: "blur(22px) saturate(190%) brightness(1.14)",
  },
  interactive: {
    bg: "rgba(255,255,255,0.13)", bgHover: "rgba(255,255,255,0.20)",
    border: "rgba(255,255,255,0.26)", borderTop: "rgba(255,255,255,0.58)",
    shadow: "0 3px 16px rgba(0,0,0,0.20), 0 1.5px 0 rgba(255,255,255,0.42) inset, 0 -1px 0 rgba(0,0,0,0.12) inset",
    blur: "blur(24px) saturate(200%) brightness(1.16)",
  },
  prominent: {
    bg: "rgba(100,220,80,0.22)", bgHover: "rgba(100,220,80,0.32)",
    border: "rgba(150,255,100,0.40)", borderTop: "rgba(200,255,160,0.70)",
    shadow: "0 4px 20px rgba(60,180,30,0.22), 0 1.5px 0 rgba(200,255,160,0.45) inset",
    blur: "blur(20px) saturate(200%) brightness(1.18)",
  },
};

const _glass = { mouseX: 0.5, mouseY: 0.5, time: 0, rafId: null, listeners: new Set(), turbIds: ["liquid-refraction", "liquid-refraction-sm"] };

function ensureGlassLoop() {
  if (_glass.rafId) return;
  let last = performance.now();
  const turbs = {}; const disps = {};

  function loop(now) {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    _glass.time += dt;
    const t = _glass.time;

    _glass.turbIds.forEach((id, i) => {
      if (!turbs[id]) turbs[id] = document.querySelector(`#${id} feTurbulence`);
      if (!disps[id]) disps[id] = document.querySelector(`#${id} feDisplacementMap`);
      const turb = turbs[id]; const disp = disps[id];
      if (!turb || !disp) return;

      const base = i === 0 ? [0.012, 0.048] : [0.015, 0.060];
      const fx = base[0] + Math.sin(t * 0.55 + i * 1.1) * 0.004;
      const fy = base[1] + Math.cos(t * 0.38 + i * 0.85) * 0.008;
      turb.setAttribute("baseFrequency", `${fx.toFixed(4)} ${fy.toFixed(4)}`);

      const baseScale = i === 0 ? 18 : 11;
      const target = baseScale * (0.35 + _glass.mouseX * 1.3 + _glass.mouseY * 0.2);
      const cur = parseFloat(disp.getAttribute("scale") || baseScale);
      disp.setAttribute("scale", (cur + (target - cur) * 0.055).toFixed(2));
    });

    _glass.listeners.forEach(fn => fn(t));
    _glass.rafId = requestAnimationFrame(loop);
  }
  _glass.rafId = requestAnimationFrame(loop);

  const onMove = (e) => {
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    _glass.mouseX = x / window.innerWidth;
    _glass.mouseY = y / window.innerHeight;
  };
  window.addEventListener("mousemove", onMove, { passive: true });
  window.addEventListener("touchmove", onMove, { passive: true });
}

function GlassContainer({ children, gap = 10, style = {}, className = "" }) {
  useEffect(() => { ensureGlassLoop(); }, []);
  return (
    <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr", gap, ...style }} className={className}>
      <div style={{
        position: "absolute", inset: 0,
        backdropFilter: GLASS_VARS.regular.blur,
        WebkitBackdropFilter: GLASS_VARS.regular.blur,
        borderRadius: 22, zIndex: 0, pointerEvents: "none",
      }} />
      {children}
    </div>
  );
}

function Specular({ borderRadius = 20 }) {
  return (
    <div style={{ position: "absolute", inset: 0, borderRadius, background: "linear-gradient(148deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.05) 32%, transparent 55%)", pointerEvents: "none", zIndex: 2 }} />
  );
}

function GlassCard({ children, variant = "regular", borderRadius = 20, style = {}, className = "", onClick }) {
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
        borderTopColor: v.borderTop, borderBottomColor: "rgba(0,0,0,0.12)",
        boxShadow: hovered ? v.shadow.replace("rgba(0,0,0,0.18)", "rgba(0,0,0,0.26)").replace("rgba(0,0,0,0.20)", "rgba(0,0,0,0.28)") : v.shadow,
        transform: hovered && isInteractive ? "translateY(-2px) scale(1.015)" : "none",
        transition: "background 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease",
        cursor: isInteractive ? "pointer" : "default",
        overflow: "hidden", zIndex: 1, ...style,
      }}
      className={className}
    >
      <Specular borderRadius={borderRadius} />
      <div style={{ position: "absolute", top: "-30%", right: "-15%", width: "75%", height: "130%", background: "radial-gradient(ellipse at 75% 15%, rgba(170,255,100,0.10) 0%, transparent 60%)", pointerEvents: "none", zIndex: 1 }} />
      <div style={{ position: "relative", zIndex: 3 }}>{children}</div>
    </div>
  );
}

// ── ScanButton ─────────────────────────────────────────────────────────────
function ScanButton({ onResult, onStart, renderTrigger }) {
  const fileRef = useRef();
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanning(true);
    setProgress(0);
    onStart?.();

    let prog = 0;
    const interval = setInterval(() => {
      prog += Math.random() * 3 + 1;
      if (prog < 82) setProgress(Math.round(prog));
    }, 150);

    let dataUrl = null;
    try {
      const base64 = await fileToBase64(file);
      dataUrl = `data:image/jpeg;base64,${base64}`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY || "",
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 200,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64 } },
              { type: "text", text: 'Identify this plant. Reply ONLY with JSON, no markdown:\n{"commonName":"","scientificName":"","family":"","confidence":"high","origin":"","funFact":"","careLevel":"easy","edible":false,"toxic":false,"toxicTo":null}' }
            ]
          }]
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.content?.find(b => b.type === "text")?.text || "";
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON: " + text.slice(0, 80));
      const result = JSON.parse(match[0]);

      clearInterval(interval);
      setProgress(100);
      await new Promise(r => setTimeout(r, 350));
      onResult({ ...result, dataUrl, date: new Date().toISOString(), id: Date.now() });
    } catch(err) {
      clearInterval(interval);
      setProgress(100);
      await new Promise(r => setTimeout(r, 300));
      onResult({
        commonName: "Scan failed", scientificName: err?.message || "Unknown error",
        family: "—", confidence: "low", origin: "—",
        funFact: "Error: " + (err?.message || "unknown"),
        careLevel: "—", edible: false, toxic: false, toxicTo: null,
        dataUrl: dataUrl || "", date: new Date().toISOString(), id: Date.now()
      });
    }
    setScanning(false);
    setProgress(0);
    e.target.value = "";
  }

  return (
    <>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleFile} />
      {renderTrigger ? renderTrigger(() => fileRef.current?.click(), scanning) : (
        <div className="stat action-tile" style={{ cursor: "pointer" }} onClick={() => fileRef.current?.click()}>
          {scanning ? (
            <>
              <div style={{ fontSize: 28, fontWeight: 600, lineHeight: 1, color: "var(--green)" }}>{progress}%</div>
              <div style={{ marginTop: 6, height: 2, background: "rgba(255,255,255,0.12)", borderRadius: 1, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progress}%`, background: "var(--green)", transition: "width 0.15s ease", borderRadius: 1 }} />
              </div>
              <div className="stat-l" style={{ marginTop: 4 }}>Scanning</div>
            </>
          ) : (
            <>
              <div className="stat-n" style={{ fontSize: 36, fontWeight: 600, lineHeight: 1 }}>⟡</div>
              <div className="stat-l">Scan plant</div>
            </>
          )}
        </div>
      )}
    </>
  );
}

// ── EditDateModal ──────────────────────────────────────────────────────────
function EditDateModal({ type, currentDate, onConfirm, onClose }) {
  const toInputVal = (iso) => {
    if (!iso) return new Date().toISOString().slice(0, 10);
    return new Date(iso).toISOString().slice(0, 10);
  };
  const [dateVal, setDateVal] = useState(toInputVal(currentDate));
  const isWater = type === "water";
  const accent = isWater ? "rgba(100,220,80,1)" : "rgba(212,147,90,1)";
  const accentBg = isWater ? "rgba(100,220,80,0.12)" : "rgba(212,147,90,0.10)";
  const accentBorder = isWater ? "rgba(100,220,80,0.3)" : "rgba(212,147,90,0.3)";
  const emoji = isWater ? "💧" : "🌿";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 201, display: "flex", flexDirection: "column", justifyContent: "flex-end", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#0f1a0f", borderTop: "1px solid rgba(255,255,255,0.15)", borderRadius: "24px 24px 0 0", padding: "24px 24px 40px", maxWidth: 430, width: "100%", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: accent, marginBottom: 2 }}>Edit date</div>
            <div style={{ fontSize: 18, fontWeight: 500, color: "var(--text)" }}>{emoji} When did you {isWater ? "water" : "fertilize"}?</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50%", width: 32, height: 32, color: "var(--text-2)", fontSize: 16, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ background: accentBg, border: `1px solid ${accentBorder}`, borderRadius: 16, padding: "4px 16px", marginBottom: 12 }}>
          <input
            type="date"
            value={dateVal}
            max={new Date().toISOString().slice(0, 10)}
            onChange={e => setDateVal(e.target.value)}
            style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontSize: 18, fontFamily: "'DM Sans', sans-serif", color: "var(--text)", padding: "12px 0", cursor: "pointer" }}
          />
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 20, textAlign: "center" }}>
          This edit will be logged in your care history.
        </div>
        <button onClick={() => onConfirm(dateVal)} style={{
          width: "100%", padding: "14px",
          background: isWater ? "rgba(100,220,80,0.22)" : "rgba(212,147,90,0.22)",
          backdropFilter: "blur(20px)",
          border: `1px solid ${isWater ? "rgba(150,255,100,0.4)" : "rgba(212,147,90,0.4)"}`,
          borderTopColor: isWater ? "rgba(200,255,160,0.7)" : "rgba(240,190,140,0.7)",
          borderRadius: 20, color: isWater ? "#d4ffb0" : "#ffe0b0",
          fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, cursor: "pointer", letterSpacing: "0.5px",
        }}>Save date</button>
      </div>
    </div>
  );
}

// ── FertilizeModal ─────────────────────────────────────────────────────────
function FertilizeModal({ onConfirm, onClose }) {
  const DOSES = [0, 0.5, 1];
  const DOSE_LABELS = { 0: "No dose", 0.5: "½ dose", 1: "Full dose" };
  const DOSE_DESC = { 0: "Log the event, no fertilizer applied", 0.5: "Half the recommended amount", 1: "Full recommended amount" };
  const [selected, setSelected] = useState(1);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", flexDirection: "column", justifyContent: "flex-end", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#0f1a0f", borderTop: "1px solid rgba(255,255,255,0.15)", borderRadius: "24px 24px 0 0", padding: "24px 24px 40px", maxWidth: 430, width: "100%", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(212,147,90,0.8)", marginBottom: 2 }}>Fertilize</div>
            <div style={{ fontSize: 18, fontWeight: 500, color: "var(--text)" }}>How much did you use?</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50%", width: 32, height: 32, color: "var(--text-2)", fontSize: 16, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ position: "relative", height: 48, display: "flex", alignItems: "center" }}>
            <div style={{ position: "absolute", left: 0, right: 0, height: 4, background: "rgba(255,255,255,0.12)", borderRadius: 2 }} />
            <div style={{ position: "absolute", left: 0, height: 4, borderRadius: 2, background: "linear-gradient(90deg, rgba(212,147,90,0.6), rgba(212,147,90,1))", width: selected === 0 ? "0%" : selected === 0.5 ? "50%" : "100%", transition: "width 0.2s ease" }} />
            {DOSES.map((dose, i) => (
              <button key={dose} onClick={() => setSelected(dose)} style={{
                position: "absolute", left: i === 0 ? "0%" : i === 1 ? "50%" : "100%",
                transform: "translateX(-50%)", width: 28, height: 28, borderRadius: "50%",
                background: selected === dose ? "rgba(212,147,90,1)" : "rgba(255,255,255,0.15)",
                border: selected === dose ? "2px solid rgba(240,190,140,0.8)" : "2px solid rgba(255,255,255,0.2)",
                cursor: "pointer", transition: "all 0.15s",
                boxShadow: selected === dose ? "0 0 12px rgba(212,147,90,0.5)" : "none", zIndex: 1,
              }} />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            {DOSES.map(dose => (
              <div key={dose} onClick={() => setSelected(dose)} style={{
                fontSize: 11, cursor: "pointer",
                color: selected === dose ? "rgba(212,147,90,1)" : "rgba(255,255,255,0.4)",
                fontWeight: selected === dose ? 500 : 400, transition: "color 0.15s",
                width: "33%", textAlign: dose === 0 ? "left" : dose === 0.5 ? "center" : "right",
              }}>{DOSE_LABELS[dose]}</div>
            ))}
          </div>
        </div>
        <div style={{ background: "rgba(212,147,90,0.08)", border: "1px solid rgba(212,147,90,0.2)", borderRadius: 12, padding: "10px 14px", fontSize: 12, color: "rgba(255,255,255,0.55)", marginBottom: 20, minHeight: 38 }}>
          {DOSE_DESC[selected]}
        </div>
        <button onClick={() => onConfirm(selected)} style={{
          width: "100%", padding: "14px",
          background: "rgba(212,147,90,0.22)", backdropFilter: "blur(20px)",
          border: "1px solid rgba(212,147,90,0.4)", borderTopColor: "rgba(240,190,140,0.7)",
          borderRadius: 20, color: "#ffe0b0", fontSize: 14, fontFamily: "'DM Sans', sans-serif",
          fontWeight: 500, cursor: "pointer", letterSpacing: "0.5px",
        }}>Log {DOSE_LABELS[selected]}</button>
      </div>
    </div>
  );
}

// ── ConsultGardener ────────────────────────────────────────────────────────
function ConsultGardener({ plant, latestAnalysis, latestPhotoBase64, careContext, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text }]);
    setLoading(true);
    try {
      const systemContext = [
        `You are a helpful plant care assistant. The user is asking about their ${plant.name} (${plant.species}).`,
        `Light: ${plant.light}. Water every ${plant.waterEveryDays} days.`,
        careContext?.lastWateredDaysAgo != null ? `Last watered ${careContext.lastWateredDaysAgo} day(s) ago.` : "Not yet watered.",
        careContext?.lastFertilizedDaysAgo != null ? `Last fertilized ${careContext.lastFertilizedDaysAgo} day(s) ago.` : "Never fertilized.",
        latestAnalysis ? `Latest AI analysis: "${latestAnalysis.headline}" — ${latestAnalysis.recommendation}` : "",
        plant.warning ? `Known issue: ${plant.warning}` : "",
        "Give concise, practical answers. 2-4 sentences max.",
      ].filter(Boolean).join(" ");

      const history = messages.map(m => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));
      const contentParts = [];
      if (latestPhotoBase64 && messages.length === 0) {
        contentParts.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: latestPhotoBase64 } });
      }
      contentParts.push({ type: "text", text });

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY || "",
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6", max_tokens: 300, system: systemContext,
          messages: [...history, { role: "user", content: contentParts }],
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      const reply = data.content?.find(b => b.type === "text")?.text || "Sorry, I couldn't answer that.";
      setMessages(prev => [...prev, { role: "assistant", text: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", text: "Error: " + (err?.message || "unknown") }]);
    }
    setLoading(false);
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", flexDirection: "column", justifyContent: "flex-end", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#0f1a0f", borderTop: "1px solid rgba(255,255,255,0.15)", borderRadius: "24px 24px 0 0", maxHeight: "75vh", display: "flex", flexDirection: "column", maxWidth: 430, width: "100%", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "16px 20px 12px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "var(--green)", marginBottom: 2 }}>AI Assistant</div>
            <div style={{ fontSize: 16, fontWeight: 500, color: "var(--text)" }}>Consult Gardener</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50%", width: 32, height: 32, color: "var(--text-2)", fontSize: 16, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
          {messages.length === 0 && (
            <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.6, textAlign: "center", padding: "24px 16px", opacity: 0.7 }}>
              Ask anything about your {plant.name}.<br />
              {latestPhotoBase64 ? "Your latest photo will be included." : "Add a photo first for visual analysis."}
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "82%",
              background: m.role === "user" ? "rgba(74,222,128,0.18)" : "rgba(255,255,255,0.09)",
              border: `1px solid ${m.role === "user" ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.15)"}`,
              borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              padding: "10px 14px", fontSize: 13, color: "var(--text)", lineHeight: 1.55,
            }}>{m.text}</div>
          ))}
          {loading && <div style={{ alignSelf: "flex-start", background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "18px 18px 18px 4px", padding: "10px 14px", fontSize: 13, color: "var(--text-2)" }}>Thinking…</div>}
          <div ref={bottomRef} />
        </div>
        <div style={{ padding: "8px 12px 20px", display: "flex", gap: 8, alignItems: "center" }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask about your plant…"
            style={{ flex: 1, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 20, padding: "10px 16px", fontSize: 13, color: "var(--text)", fontFamily: "'DM Sans', sans-serif", outline: "none" }} />
          <button onClick={send} disabled={!input.trim() || loading} style={{ background: "var(--green)", border: "none", borderRadius: "50%", width: 38, height: 38, fontSize: 16, cursor: "pointer", color: "#0a1a0a", flexShrink: 0, opacity: (!input.trim() || loading) ? 0.4 : 1, transition: "opacity 0.15s" }}>↑</button>
        </div>
      </div>
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("overview");
  const [idx, setIdx] = useState(0);
  const [editingNick, setEditingNick] = useState(null);
  const [nickInput, setNickInput] = useState("");
  const [gardenerOpen, setGardenerOpen] = useState(false);
  const [fertilizeModalOpen, setFertilizeModalOpen] = useState(false);
  const [editDateModal, setEditDateModal] = useState(null); // { type: "water"|"fertilize", plantId, currentDate }
  const [dbLoading, setDbLoading] = useState(true);
  const touchX = useRef(null);



  const [waterLog, setWaterLog] = useState({});
  const [fertilizeLog, setFertilizeLog] = useState({});
  const [dismissedWarnings, setDismissedWarnings] = useState({});
  const [nicknames, setNicknames] = useState({});
  const [gardenLog, setGardenLog] = useState([]);
  const [plantPhotos, setPlantPhotos] = useState({});

  // ── Load from Supabase ───────────────────────────────────────────────────
  useEffect(() => {
    async function loadAll() {
      try {
        const [wRes, fRes, dRes, nRes, gRes, pRes] = await Promise.all([
          supabase.from("water_log").select("*").order("watered_at", { ascending: false }),
          supabase.from("fertilize_log").select("*").order("fertilized_at", { ascending: false }),
          supabase.from("dismissed_warnings").select("*"),
          supabase.from("nicknames").select("*"),
          supabase.from("garden_log").select("*").order("scanned_at", { ascending: false }),
          supabase.from("plant_photos").select("*").order("created_at", { ascending: true }),
        ]);
        const wl = {};
        (wRes.data || []).forEach(r => { if (!wl[r.plant_id]) wl[r.plant_id] = r.watered_at; });
        setWaterLog(wl);
        const fl = {};
        (fRes.data || []).forEach(r => { if (!fl[r.plant_id]) fl[r.plant_id] = { date: r.fertilized_at, dose: r.dose }; });
        setFertilizeLog(fl);
        const dw = {};
        (dRes.data || []).forEach(r => { dw[r.plant_id] = true; });
        setDismissedWarnings(dw);
        const nn = {};
        (nRes.data || []).forEach(r => { nn[r.plant_id] = r.nickname; });
        setNicknames(nn);
        setGardenLog((gRes.data || []).map(r => ({
          id: r.id, commonName: r.common_name, scientificName: r.scientific_name,
          family: r.family, confidence: r.confidence, origin: r.origin,
          funFact: r.fun_fact, careLevel: r.care_level, edible: r.edible,
          toxic: r.toxic, toxicTo: r.toxic_to, dataUrl: r.data_url, date: r.scanned_at,
        })));
        const pp = {};
        for (const r of (pRes.data || [])) {
          if (!pp[r.plant_id]) pp[r.plant_id] = [];
          const { data: urlData } = supabase.storage.from("plant-photos").getPublicUrl(r.storage_path);
          pp[r.plant_id].push({ id: r.id, dataUrl: urlData?.publicUrl || r.data_url, base64: null, analysis: r.analysis, date: r.created_at });
        }
        setPlantPhotos(pp);
      } catch (err) { console.error("Supabase load error:", err); }
      setDbLoading(false);
    }
    loadAll();
  }, []);

  // ── Derived values ───────────────────────────────────────────────────────
  const plant = PLANTS[idx];
  const lastWatered = waterLog[plant?.id] || null;
  const lastFertilized = fertilizeLog[plant?.id] || null;
  const lastFertilizedDate = lastFertilized ? (typeof lastFertilized === "string" ? lastFertilized : lastFertilized.date) : null;
  const lastFertilizedDose = lastFertilized ? (typeof lastFertilized === "string" ? 1 : lastFertilized.dose) : null;
  const status = plant ? getStatus(plant, lastWatered) : "unknown";
  const days = daysSince(lastWatered);
  const fertDays = daysSince(lastFertilizedDate);
  const pct = days !== null ? Math.min((days / plant.waterEveryDays) * 100, 100) : 0;
  const fillColor = pct >= 100 ? "#c46860" : pct >= 70 ? "#d4935a" : "#4ade80";

  const FERTILIZE_EVERY = 30;
  const fertDaysLeft = fertDays !== null ? FERTILIZE_EVERY - fertDays : null;
  const fertDoseLabel = lastFertilizedDose === 0.5 ? " · ½ dose" : lastFertilizedDose === 0 ? " · no dose" : "";

  const careContext = { lastWateredDaysAgo: days, lastFertilizedDaysAgo: fertDays };

  const currentPhotos = plantPhotos[plant?.id] || [];
  const latestPhoto = currentPhotos.length > 0 ? currentPhotos[currentPhotos.length - 1] : null;
  const latestPhotoBase64 = latestPhoto?.base64 || null;
  const latestAnalysis = latestPhoto?.analysis || null;

  // ── Actions ──────────────────────────────────────────────────────────────
  async function waterPlant(id) {
    const now = new Date().toISOString();
    setWaterLog(p => ({ ...p, [id]: now }));
    await supabase.from("water_log").insert({ plant_id: id, watered_at: now });
  }

  async function fertilizePlant(id, dose = 1) {
    const now = new Date().toISOString();
    setFertilizeLog(p => ({ ...p, [id]: { date: now, dose } }));
    await supabase.from("fertilize_log").insert({ plant_id: id, fertilized_at: now, dose });
  }

  async function resetWaterLog(id) {
    setWaterLog(p => { const n = { ...p }; delete n[id]; return n; });
    await supabase.from("water_log").delete().eq("plant_id", id);
  }

  async function dismissWarning(id) {
    setDismissedWarnings(p => ({ ...p, [id]: true }));
    await supabase.from("dismissed_warnings").upsert({ plant_id: id });
  }

  async function saveNick(id) {
    const nick = nickInput.trim();
    if (nick) {
      setNicknames(p => ({ ...p, [id]: nick }));
      await supabase.from("nicknames").upsert({ plant_id: id, nickname: nick });
    } else {
      setNicknames(p => { const n = { ...p }; delete n[id]; return n; });
      await supabase.from("nicknames").delete().eq("plant_id", id);
    }
    setEditingNick(null); setNickInput("");
  }

  async function editDate(type, plantId, dateStr) {
    const newIso = new Date(dateStr + "T12:00:00").toISOString();
    if (type === "water") {
      setWaterLog(p => ({ ...p, [plantId]: newIso }));
      await supabase.from("water_log").insert({ plant_id: plantId, watered_at: newIso });
    } else {
      const d = lastFertilizedDose ?? 1;
      setFertilizeLog(p => ({ ...p, [plantId]: { date: newIso, dose: d } }));
      await supabase.from("fertilize_log").insert({ plant_id: plantId, fertilized_at: newIso, dose: d });
    }
    // Log the edit for audit trail
    try {
      await supabase.from("care_edits").insert({
        plant_id: plantId, type,
        original_date: type === "water" ? lastWatered : lastFertilizedDate,
        new_date: newIso,
        dose: type === "fertilize" ? (lastFertilizedDose ?? 1) : null,
      });
    } catch (_) { /* care_edits table may not exist yet */ }
    setEditDateModal(null);
  }

  function openDetail(i) { setIdx(i); setScreen("detail"); }

  function onTouchStart(e) { touchX.current = e.touches[0].clientX; }
  function onTouchEnd(e) {
    if (touchX.current === null) return;
    const diff = touchX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && idx < PLANTS.length - 1) setIdx(i => i + 1);
      if (diff < 0 && idx > 0) setIdx(i => i - 1);
    }
    touchX.current = null;
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <style>{css}</style>
      <svg style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="liquid-refraction" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
            <feTurbulence id="lg-turbulence" type="fractalNoise" baseFrequency="0.012 0.048" numOctaves="3" seed="2" result="noise" />
            <feGaussianBlur in="noise" stdDeviation="1.8" result="soft-noise" />
            <feDisplacementMap in="SourceGraphic" in2="soft-noise" scale="22" xChannelSelector="R" yChannelSelector="G" result="displaced" />
            <feComposite in="displaced" in2="SourceGraphic" operator="atop" />
          </filter>
          <filter id="liquid-refraction-sm" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.015 0.06" numOctaves="2" seed="5" result="noise" />
            <feGaussianBlur in="noise" stdDeviation="1.2" result="soft-noise" />
            <feDisplacementMap in="SourceGraphic" in2="soft-noise" scale="14" xChannelSelector="R" yChannelSelector="G" result="displaced" />
            <feComposite in="displaced" in2="SourceGraphic" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div
        className="app"
        style={{}}
      >
        <div style={{ position: "fixed", inset: 0, zIndex: -1, backgroundImage: `url(${bgPhoto})`, backgroundSize: "cover", backgroundPosition: "center top" }} />


        {dbLoading && (
          <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 32 }}>🌿</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", letterSpacing: 1 }}>Loading your garden…</div>
          </div>
        )}

        {/* ── OVERVIEW ── */}
        {screen === "overview" && (
          <div className="fade-up">
            <GlassContainer gap={10} style={{ padding: "16px 16px 0", gridAutoRows: "130px" }}>
              <GlassCard borderRadius={20} style={{ height: 130 }}>
                <div className="stat"><div className="stat-n">{PLANTS.length}</div><div className="stat-l">Total plants</div></div>
              </GlassCard>
              {(() => {
                const warnPlants = PLANTS.filter(p => p.warning);
                return (
                  <GlassCard borderRadius={20} variant={warnPlants.length > 0 ? "interactive" : "regular"}
                    onClick={warnPlants.length > 0 ? () => { if (warnPlants.length === 1) { setIdx(PLANTS.indexOf(warnPlants[0])); setScreen("detail"); } else setScreen("attention"); } : undefined}
                    style={{ height: 130 }}>
                    <div className="stat warn" style={{ cursor: warnPlants.length > 0 ? "pointer" : "default" }}>
                      <div className="stat-n">{warnPlants.length}</div>
                      <div className="stat-l">Need attention</div>
                      {warnPlants.length > 0 && <div style={{ fontSize: 10, color: "rgba(248,113,113,0.7)", marginTop: 6, letterSpacing: 1 }}>tap to view →</div>}
                    </div>
                  </GlassCard>
                );
              })()}
              <GlassCard borderRadius={20} style={{ height: 130 }}>
                <ScanButton
                  onResult={async (entry) => {
                    setGardenLog(prev => [entry, ...prev]);
                    setScreen("garden");
                    await supabase.from("garden_log").insert({
                      common_name: entry.commonName, scientific_name: entry.scientificName,
                      family: entry.family, confidence: entry.confidence, origin: entry.origin,
                      fun_fact: entry.funFact, care_level: entry.careLevel, edible: entry.edible,
                      toxic: entry.toxic, toxic_to: entry.toxicTo, data_url: entry.dataUrl, scanned_at: entry.date,
                    });
                  }}
                />
              </GlassCard>
              <GlassCard borderRadius={20} variant="interactive" onClick={() => setScreen("garden")} style={{ height: 130 }}>
                <div className="stat action-tile" style={{ cursor: "pointer" }}>
                  <div className="stat-n">{gardenLog.length}</div>
                  <div className="stat-l">Botanical garden</div>
                </div>
              </GlassCard>
            </GlassContainer>

            <div style={{ padding: "20px 24px 0" }}><div className="ov-heading">My little <em>garden</em></div></div>
            <div className="list-head">Your plants</div>
            <GlassContainer gap={8} style={{ display: "flex", flexDirection: "column", gridTemplateColumns: "1fr", padding: "0 14px 32px" }}>
              {PLANTS.map((p, i) => {
                const s = getStatus(p, waterLog[p.id] || null);
                const nick = nicknames[p.id];
                return (
                  <GlassCard key={p.id} borderRadius={18} variant="interactive">
                    <div className="prow" onClick={() => openDetail(i)}>
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <div style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)", zIndex: 10 }}>
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: PIN_COLORS[i], boxShadow: "0 1px 3px rgba(0,0,0,0.3)", margin: "0 auto" }} />
                          <div style={{ width: 1.5, height: 5, background: "#bbb", margin: "0 auto" }} />
                        </div>
                        <div style={{ background: "#fff", padding: "3px 3px 10px", boxShadow: "0 2px 8px rgba(60,30,10,0.15)", transform: `rotate(${TILTS[i]}deg)` }}>
                          <img src={p.image} alt={p.name} style={{ display: "block", width: 44, height: 40, objectFit: "cover" }} />
                        </div>
                      </div>
                      <div className="prow-info">
                        <div className="prow-name">{nick || p.name}</div>
                        <div className="prow-sub">{nick ? p.name : p.species}</div>
                      </div>
                      <div className="prow-right">
                        <div className="sdot" style={{ background: STATUS_COLOR[s] }} />
                        <span className="slabel" style={{ color: STATUS_COLOR[s] }}>{STATUS_LABEL[s]}</span>
                      </div>
                      <div className="parrow">›</div>
                    </div>
                  </GlassCard>
                );
              })}
            </GlassContainer>
            <AirQualitySlider plants={PLANTS} />
          </div>
        )}

        {/* ── DETAIL ── */}
        {screen === "detail" && (
          <div className="fade-up" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <div className="detail-nav">
              <button className="dnav-back" onClick={() => setScreen("overview")}>← Overview</button>
              <div className="dnav-counter">{idx + 1} / {PLANTS.length}</div>
              <div className="dnav-arrows">
                <button className="darrow" disabled={idx === 0} onClick={() => setIdx(i => i - 1)}>‹</button>
                <button className="darrow" disabled={idx === PLANTS.length - 1} onClick={() => setIdx(i => i + 1)}>›</button>
              </div>
            </div>
            <div className="dots">
              {PLANTS.map((_, i) => <div key={i} className={`dot${i === idx ? " on" : ""}`} onClick={() => setIdx(i)} />)}
            </div>

            <PlantPhotoStack
              plant={plant}
              tilt={TILTS[idx]}
              pinColor={PIN_COLORS[idx]}
              userPhotos={plantPhotos[plant.id] || []}
              setUserPhotos={(photos) => setPlantPhotos(prev => ({ ...prev, [plant.id]: typeof photos === "function" ? photos(prev[plant.id] || []) : photos }))}
              careContext={careContext}
              db={supabase}
            />

            {plant.warning && !dismissedWarnings[plant.id] && (
              <div style={{ margin: "0 22px 4px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 10, padding: "8px 14px", fontSize: 12, color: "var(--warn)", display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span style={{ flex: 1 }}>⚠ {plant.warning}</span>
                <button onClick={() => dismissWarning(plant.id)} style={{ background: "none", border: "none", color: "rgba(248,113,113,0.6)", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0, flexShrink: 0 }}>✕</button>
              </div>
            )}

            <div className="detail-body">
              <div className="d-species">{plant.species}</div>
              <div className="d-name">{nicknames[plant.id] || plant.name}</div>

              <div className="nick-row">
                {editingNick === plant.id ? (
                  <>
                    <input className="nick-input" value={nickInput} onChange={e => setNickInput(e.target.value)} placeholder="Give it a name…" autoFocus onKeyDown={e => e.key === "Enter" && saveNick(plant.id)} />
                    <button className="nick-save" onClick={() => saveNick(plant.id)}>save</button>
                  </>
                ) : (
                  <>
                    {nicknames[plant.id] && <span className="nick-show">"{nicknames[plant.id]}"</span>}
                    <button className="nick-btn" onClick={() => { setEditingNick(plant.id); setNickInput(nicknames[plant.id] || ""); }}>
                      {nicknames[plant.id] ? "edit nickname" : "+ nickname"}
                    </button>
                  </>
                )}
              </div>

              <div className="rule" />

              <div className="d-row">
                <span className="d-key">Light</span>
                <span className="d-val">{plant.light}</span>
              </div>
              <div className="d-row">
                <span className="d-key">Water every</span>
                <span className="d-val">{plant.waterEveryDays} days</span>
              </div>
              <div className="d-row">
                <span className="d-key">Status</span>
                <span className="d-val" style={{ color: STATUS_COLOR[status] }}>{STATUS_LABEL[status]}</span>
              </div>

              {/* Tappable watered row */}
              <div
                className="d-row-tap"
                onClick={() => setEditDateModal({ type: "water", plantId: plant.id, currentDate: lastWatered })}
                title="Tap to edit watering date"
              >
                <span className="d-key">Last watered</span>
                <span className="d-val-tap">
                  <span className="d-val-tap-hint">✎</span>
                  {lastWatered
                    ? (days === 0 ? "Today" : `${days}d ago · ${new Date(lastWatered).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}`)
                    : "Not logged"}
                </span>
              </div>

              {/* Tappable fertilized row */}
              <div
                className="d-row-tap"
                onClick={() => setEditDateModal({ type: "fertilize", plantId: plant.id, currentDate: lastFertilizedDate })}
                title="Tap to edit fertilize date"
              >
                <span className="d-key">Last fertilized</span>
                <span className="d-val-tap">
                  <span className="d-val-tap-hint">✎</span>
                  {lastFertilizedDate
                    ? `${fertDays}d ago${fertDoseLabel} · ${new Date(lastFertilizedDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}`
                    : "Not logged"}
                </span>
              </div>

              <div className="progress-wrap">
                <div className="progress-labels">
                  <span>{lastWatered ? (days === 0 ? "Watered today" : `${days}d ago`) : "Never logged"}</span>
                  <span>{lastWatered ? `next in ${Math.max(0, plant.waterEveryDays - (days || 0))}d` : "—"}</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: fillColor }} />
                </div>
              </div>

              <div className="care-box">{plant.care}</div>
              {plant.warning && <div className="warn-box">⚠ {plant.warning}</div>}

              {/* Water button */}
              <button className="btn-water" onClick={() => waterPlant(plant.id)}>
                💧 {days === 0 ? "Watered today" : days !== null && days < plant.waterEveryDays ? `Water in ${plant.waterEveryDays - days}d` : "Water now"}
              </button>

              {/* Fertilize button */}
              <button className="btn-fertilize" onClick={() => setFertilizeModalOpen(true)}>
                🌿 {fertDays === null ? "Fertilize now" : fertDaysLeft !== null && fertDaysLeft > 0 ? `Fertilize in ${fertDaysLeft}d${fertDoseLabel}` : "Overdue — fertilize"}
              </button>

              {/* Consult gardener */}
              <button className="btn-consult" onClick={() => setGardenerOpen(true)}>
                🌱 Ask the gardener
              </button>



              <div className="swipe-hint">swipe left or right to browse</div>
            </div>
          </div>
        )}

        {/* ── MODALS ── */}
        {editDateModal && screen === "detail" && (
          <EditDateModal
            type={editDateModal.type}
            currentDate={editDateModal.currentDate}
            onConfirm={(dateStr) => editDate(editDateModal.type, editDateModal.plantId, dateStr)}
            onClose={() => setEditDateModal(null)}
          />
        )}

        {fertilizeModalOpen && screen === "detail" && (
          <FertilizeModal
            onConfirm={(dose) => { fertilizePlant(plant.id, dose); setFertilizeModalOpen(false); }}
            onClose={() => setFertilizeModalOpen(false)}
          />
        )}

        {gardenerOpen && screen === "detail" && (
          <ConsultGardener
            plant={plant}
            latestAnalysis={latestAnalysis}
            latestPhotoBase64={latestPhotoBase64}
            careContext={careContext}
            onClose={() => setGardenerOpen(false)}
          />
        )}

        {/* ── GARDEN ── */}
        {screen === "garden" && (
          <div className="fade-up">
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <button onClick={() => setScreen("overview")} style={{ background: "none", border: "none", fontSize: 13, color: "rgba(255,255,255,0.5)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", padding: "6px 0" }}>← Overview</button>
              <div style={{ flex: 1 }} />
              <ScanButton
                onResult={async (entry) => {
                  setGardenLog(prev => [entry, ...prev]);
                  await supabase.from("garden_log").insert({
                    common_name: entry.commonName, scientific_name: entry.scientificName,
                    family: entry.family, confidence: entry.confidence, origin: entry.origin,
                    fun_fact: entry.funFact, care_level: entry.careLevel, edible: entry.edible,
                    toxic: entry.toxic, toxic_to: entry.toxicTo, data_url: entry.dataUrl, scanned_at: entry.date,
                  });
                }}
                renderTrigger={(onClick, scanning) => (
                  <button onClick={onClick} style={{ background: "var(--green)", border: "none", borderRadius: 20, padding: "7px 16px", fontSize: 12, color: "#0a1a0a", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                    {scanning ? "…" : "+ Scan"}
                  </button>
                )}
              />
            </div>

            <div style={{ padding: "24px 24px 8px" }}>
              <div style={{ fontSize: 10, letterSpacing: "3px", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>Your discoveries</div>
              <div style={{ fontSize: 34, fontWeight: 600, color: "var(--text)", lineHeight: 1.1 }}>Botanical<br /><em style={{ fontStyle: "italic", color: "var(--peach-dark)" }}>Garden</em></div>
            </div>

            {gardenLog.length === 0 ? (
              <div style={{ padding: "60px 32px", textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>🌿</div>
                <div style={{ fontSize: 20, fontWeight: 500, color: "var(--text)", marginBottom: 8 }}>No plants scanned yet</div>
                <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, fontWeight: 300 }}>Tap Scan on the overview or use the button above to identify a plant.</div>
              </div>
            ) : (
              <div style={{ padding: "16px 16px 40px", display: "flex", flexDirection: "column", gap: 14 }}>
                {gardenLog.map((entry) => (
                  <div key={entry.id} style={{
                    background: "rgba(255,255,255,0.09)",
                    backdropFilter: "blur(20px) saturate(180%) brightness(1.1)",
                    WebkitBackdropFilter: "blur(20px) saturate(180%) brightness(1.1)",
                    borderRadius: 20, overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.22)",
                    borderTop: "1px solid rgba(255,255,255,0.45)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.2), 0 1.5px 0 rgba(255,255,255,0.30) inset"
                  }}>
                    <div style={{ position: "relative", height: 160 }}>
                      <img src={entry.dataUrl} alt={entry.commonName} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      <div style={{ position: "absolute", top: 12, right: 12, background: entry.confidence === "high" ? "rgba(148,184,138,0.9)" : entry.confidence === "medium" ? "rgba(212,147,90,0.9)" : "rgba(196,104,96,0.9)", color: "#fff", fontSize: 10, letterSpacing: 1, padding: "4px 10px", borderRadius: 20, backdropFilter: "blur(4px)" }}>
                        {entry.confidence} confidence
                      </div>
                      {entry.toxic && (
                        <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(196,104,96,0.9)", color: "#fff", fontSize: 10, padding: "4px 10px", borderRadius: 20, backdropFilter: "blur(4px)" }}>
                          ⚠ Toxic{entry.toxicTo ? ` to ${entry.toxicTo}` : ""}
                        </div>
                      )}
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: "linear-gradient(to top, rgba(15,26,15,0.95), transparent)" }} />
                    </div>
                    <div style={{ padding: "14px 18px 18px" }}>
                      <div style={{ fontSize: 11, color: "var(--green)", fontStyle: "italic", marginBottom: 3 }}>{entry.scientificName}</div>
                      <div style={{ fontSize: 22, fontWeight: 500, color: "var(--text)", marginBottom: 12 }}>{entry.commonName}</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                        {[
                          { label: entry.family, color: "rgba(255,255,255,0.08)", text: "rgba(255,255,255,0.65)" },
                          { label: entry.origin, color: "rgba(74,222,128,0.12)", text: "var(--green-dim)" },
                          { label: `Care: ${entry.careLevel}`, color: entry.careLevel === "easy" ? "rgba(74,222,128,0.12)" : entry.careLevel === "moderate" ? "rgba(212,147,90,0.12)" : "rgba(196,104,96,0.12)", text: "rgba(255,255,255,0.6)" },
                          entry.edible && { label: "Edible", color: "rgba(74,222,128,0.15)", text: "var(--green-dim)" },
                        ].filter(Boolean).map((tag, i) => (
                          <div key={i} style={{ background: tag.color, color: tag.text, fontSize: 10, letterSpacing: "0.8px", padding: "4px 10px", borderRadius: 20 }}>{tag.label}</div>
                        ))}
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: "11px 14px", fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.65, fontWeight: 300, fontStyle: "italic" }}>
                        "{entry.funFact}"
                      </div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 10, letterSpacing: "0.5px" }}>
                        Scanned {new Date(entry.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ATTENTION ── */}
        {screen === "attention" && (
          <div className="fade-up">
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <button onClick={() => setScreen("overview")} style={{ background: "none", border: "none", fontSize: 13, color: "rgba(255,255,255,0.5)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", padding: "6px 0" }}>← Overview</button>
            </div>
            <div style={{ padding: "24px 24px 8px" }}>
              <div style={{ fontSize: 10, letterSpacing: "3px", textTransform: "uppercase", color: "var(--warn)", marginBottom: 6 }}>Needs attention</div>
              <div style={{ fontSize: 32, fontWeight: 600, color: "var(--text)", lineHeight: 1.1 }}>
                {PLANTS.filter(p => p.warning).length} plant{PLANTS.filter(p => p.warning).length !== 1 ? "s" : ""}<br />
                <span style={{ color: "var(--warn)" }}>need care</span>
              </div>
            </div>
            <GlassContainer gap={8} style={{ display: "flex", flexDirection: "column", gridTemplateColumns: "1fr", padding: "16px 14px 40px" }}>
              {PLANTS.filter(p => p.warning).map((p) => {
                const pIdx = PLANTS.indexOf(p);
                return (
                  <GlassCard key={p.id} borderRadius={18} variant="interactive" onClick={() => { setIdx(pIdx); setScreen("detail"); }}>
                    <div className="prow" style={{ borderLeft: "3px solid var(--warn)", paddingLeft: 11 }}>
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <div style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)", zIndex: 10 }}>
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: PIN_COLORS[pIdx], boxShadow: "0 1px 3px rgba(0,0,0,0.3)", margin: "0 auto" }} />
                          <div style={{ width: 1.5, height: 5, background: "#bbb", margin: "0 auto" }} />
                        </div>
                        <div style={{ background: "#fff", padding: "3px 3px 10px", boxShadow: "0 2px 8px rgba(60,30,10,0.15)", transform: `rotate(${TILTS[pIdx]}deg)` }}>
                          <img src={p.image} alt={p.name} style={{ display: "block", width: 44, height: 40, objectFit: "cover" }} />
                        </div>
                      </div>
                      <div className="prow-info">
                        <div className="prow-name">{nicknames[p.id] || p.name}</div>
                        <div className="prow-sub">{p.species}</div>
                        <div style={{ fontSize: 11, color: "var(--warn)", marginTop: 4, lineHeight: 1.4 }}>⚠ {p.warning}</div>
                      </div>
                      <div className="parrow" style={{ color: "var(--warn)" }}>›</div>
                    </div>
                  </GlassCard>
                );
              })}
            </GlassContainer>
          </div>
        )}
      </div>
    </>
  );
}
