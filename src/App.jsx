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
const STATUS_DOT = {
  happy: "oklch(72% 0.14 145)",
  soon: "oklch(72% 0.14 70)",
  thirsty: "oklch(62% 0.18 25)",
  unknown: "oklch(60% 0.02 80)",
};

// ── Design tokens (Impeccable: 4pt spacing, OKLCH, semantic names) ──────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700&family=Source+Sans+3:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }

  :root {
    /* ── Spacing (4pt base) ─────────────────────────── */
    --space-xs: 4px;
    --space-sm: 8px;
    --space-md: 12px;
    --space-lg: 16px;
    --space-xl: 24px;
    --space-2xl: 32px;
    --space-3xl: 48px;
    --space-4xl: 64px;

    /* ── Type scale (1.3 ratio — perfect fourth) ────── */
    --text-xs: 0.694rem;   /* ~11px */
    --text-sm: 0.833rem;   /* ~13px */
    --text-base: 1rem;     /* 16px */
    --text-lg: 1.3rem;     /* ~21px */
    --text-xl: 1.69rem;    /* ~27px */
    --text-2xl: 2.197rem;  /* ~35px */

    /* ── Colors (OKLCH, tinted toward green hue 145) ── */
    --surface-0: oklch(12% 0.015 145);     /* deepest bg */
    --surface-1: oklch(16% 0.012 145);     /* card bg */
    --surface-2: oklch(20% 0.010 145);     /* elevated */
    --surface-3: oklch(25% 0.008 145);     /* hover / active */

    --text-primary: oklch(93% 0.008 145);
    --text-secondary: oklch(72% 0.015 145);
    --text-tertiary: oklch(52% 0.012 145);

    --border: oklch(28% 0.010 145);
    --border-subtle: oklch(22% 0.008 145);

    --accent: oklch(72% 0.16 145);          /* green accent */
    --accent-dim: oklch(60% 0.10 145);
    --accent-surface: oklch(20% 0.04 145);

    --warn: oklch(65% 0.18 25);
    --warn-surface: oklch(18% 0.04 25);
    --warn-border: oklch(30% 0.06 25);

    --fertilize: oklch(72% 0.12 70);
    --fertilize-surface: oklch(18% 0.03 70);

    /* ── Motion (Impeccable: expo ease-out, no bounce) ─ */
    --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
    --ease-in: cubic-bezier(0.7, 0, 0.84, 0);
    --dur-fast: 120ms;
    --dur-med: 250ms;
    --dur-slow: 400ms;

    /* ── Radius ─────────────────────────────────────── */
    --radius-sm: 6px;
    --radius-md: 10px;
    --radius-lg: 14px;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }

  body {
    background: var(--surface-0);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .app {
    max-width: 430px;
    margin: 0 auto;
    min-height: 100dvh;
    font-family: 'Source Sans 3', sans-serif;
    font-size: var(--text-base);
    line-height: 1.55;
    color: var(--text-primary);
    user-select: none;
    position: relative;
    overflow: hidden;
  }

  /* Background photo — subtle, desaturated, not the main show */
  .app-bg {
    position: fixed;
    top: 0; left: 50%;
    transform: translateX(-50%);
    width: 430px; height: 100dvh;
    z-index: 0;
    pointer-events: none;
  }
  .app-bg img {
    width: 100%; height: 100%;
    object-fit: cover;
    opacity: 0.12;
    filter: saturate(0.4) brightness(0.5);
  }
  .app > *:not(.app-bg) { position: relative; z-index: 1; }

  /* ── Heading font ────────────────────────────────── */
  .heading {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.15;
  }

  .subheading {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-weight: 600;
    letter-spacing: -0.01em;
    line-height: 1.2;
  }

  .label {
    font-size: var(--text-xs);
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-tertiary);
  }

  .species {
    font-size: var(--text-sm);
    font-style: italic;
    color: var(--accent-dim);
  }

  /* ── Entry animation ─────────────────────────────── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fade-up { animation: fadeUp var(--dur-slow) var(--ease-out) both; }

  /* ── Interactive surfaces ─────────────────────────── */
  .surface {
    background: var(--surface-1);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    transition: background var(--dur-fast) var(--ease-out),
                transform var(--dur-fast) var(--ease-out);
  }
  .surface-interactive {
    cursor: pointer;
  }
  .surface-interactive:hover {
    background: var(--surface-2);
  }
  .surface-interactive:active {
    transform: scale(0.985);
  }
  .surface-interactive:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  /* ── Button styles ───────────────────────────────── */
  .btn-primary {
    width: 100%;
    padding: var(--space-md) var(--space-lg);
    background: var(--accent);
    color: var(--surface-0);
    border: none;
    border-radius: var(--radius-md);
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: var(--text-sm);
    font-weight: 600;
    cursor: pointer;
    transition: transform var(--dur-fast) var(--ease-out),
                filter var(--dur-fast) var(--ease-out);
  }
  .btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); }
  .btn-primary:active { transform: scale(0.98); }
  .btn-primary:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  .btn-primary:disabled {
    opacity: 0.4;
    cursor: default;
    transform: none;
    filter: none;
  }

  .btn-secondary {
    width: 100%;
    padding: var(--space-md) var(--space-lg);
    background: var(--surface-2);
    color: var(--text-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    font-family: 'Source Sans 3', sans-serif;
    font-size: var(--text-sm);
    cursor: pointer;
    transition: background var(--dur-fast) var(--ease-out);
  }
  .btn-secondary:hover { background: var(--surface-3); }
  .btn-secondary:active { transform: scale(0.98); }

  .btn-ghost {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-family: 'Source Sans 3', sans-serif;
    font-size: var(--text-sm);
    cursor: pointer;
    padding: var(--space-sm) 0;
    transition: color var(--dur-fast);
  }
  .btn-ghost:hover { color: var(--text-primary); }

  /* ── Nav bar ─────────────────────────────────────── */
  .nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-md) var(--space-lg);
    border-bottom: 1px solid var(--border-subtle);
    background: var(--surface-0);
  }

  .nav-arrows {
    display: flex;
    gap: var(--space-xs);
  }
  .nav-arrow {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 50%;
    width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    font-size: var(--text-base);
    color: var(--text-primary);
    cursor: pointer;
    transition: background var(--dur-fast) var(--ease-out);
  }
  .nav-arrow:disabled { opacity: 0.25; cursor: default; }
  .nav-arrow:not(:disabled):hover { background: var(--surface-3); }
  .nav-arrow:not(:disabled):active { transform: scale(0.92); }

  /* ── Plant row (list item) ───────────────────────── */
  .plant-row {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-md) var(--space-lg);
    cursor: pointer;
    border-bottom: 1px solid var(--border-subtle);
    transition: background var(--dur-fast) var(--ease-out);
  }
  .plant-row:last-child { border-bottom: none; }
  .plant-row:hover { background: var(--surface-1); }
  .plant-row:active { background: var(--surface-2); }

  /* ── Polaroid (kept but refined) ─────────────────── */
  .polaroid-frame {
    background: oklch(95% 0.005 80);
    padding: 3px 3px 10px;
    box-shadow: 0 2px 6px oklch(10% 0.01 145 / 0.25);
  }
  .polaroid-frame img {
    display: block;
    width: 44px;
    height: 40px;
    object-fit: cover;
  }

  /* ── Progress bar ────────────────────────────────── */
  .progress-track {
    height: 3px;
    background: var(--surface-3);
    border-radius: 2px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.5s var(--ease-out);
  }

  /* ── Dot indicators ──────────────────────────────── */
  .dots {
    display: flex;
    justify-content: center;
    gap: var(--space-xs);
    padding: var(--space-sm) 0 var(--space-xs);
  }
  .dot {
    height: 4px;
    border-radius: 2px;
    background: var(--surface-3);
    transition: all var(--dur-med) var(--ease-out);
    width: 4px;
    cursor: pointer;
  }
  .dot.on {
    background: var(--accent);
    width: 16px;
  }

  /* ── Air quality tabs ────────────────────────────── */
  .aq-tabs {
    display: flex;
    gap: var(--space-sm);
    overflow-x: auto;
    padding-bottom: 2px;
    -webkit-overflow-scrolling: touch;
  }
  .aq-tabs::-webkit-scrollbar { display: none; }
  .aq-tab {
    flex-shrink: 0;
    background: var(--surface-2);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    padding: var(--space-xs) var(--space-md);
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--text-secondary);
    cursor: pointer;
    font-family: 'Source Sans 3', sans-serif;
    letter-spacing: 0.02em;
    transition: all var(--dur-fast) var(--ease-out);
  }
  .aq-tab:hover { background: var(--surface-3); }
  .aq-tab.active {
    background: var(--accent-surface);
    border-color: var(--accent-dim);
    color: var(--accent);
  }

  /* ── Care note box ───────────────────────────────── */
  .care-note {
    background: var(--surface-1);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: var(--space-lg);
    font-size: var(--text-sm);
    line-height: 1.7;
    color: var(--text-secondary);
    font-weight: 300;
    max-width: 65ch;
  }

  /* ── Warning box ─────────────────────────────────── */
  .warn-box {
    background: var(--warn-surface);
    border: 1px solid var(--warn-border);
    border-radius: var(--radius-md);
    padding: var(--space-md) var(--space-lg);
    font-size: var(--text-sm);
    color: var(--warn);
    line-height: 1.6;
    display: flex;
    align-items: flex-start;
    gap: var(--space-sm);
  }

  /* ── Swipe hint ──────────────────────────────────── */
  .swipe-hint {
    text-align: center;
    font-size: var(--text-xs);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-tertiary);
    margin-top: var(--space-xl);
  }

  /* ── Nick editing ────────────────────────────────── */
  .nick-input {
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: var(--space-xs) var(--space-md);
    font-size: var(--text-sm);
    font-family: 'Source Sans 3', sans-serif;
    color: var(--text-primary);
    background: var(--surface-2);
    outline: none;
    width: 155px;
  }
  .nick-input:focus {
    border-color: var(--accent);
  }

  /* Scrollbar styling */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--surface-3); border-radius: 2px; }
`;


// ── Air Quality ─────────────────────────────────────────────────────────────

const AIR_CARDS = [
  { id: "voc", label: "VOC Removal", subtitle: "toxin filtration", unit: "μg/hr",
    description: "WHO guideline: <300μg/m\u00B3 total VOC. Your plants remove toxins at roughly the rate of a mid-range air purifier running continuously. Tap a toxin to see which plants target it.",
    color: "oklch(72% 0.12 145)", },
  { id: "co2", label: "CO\u2082 Offset", subtitle: "carbon absorption", unit: "g/day",
    description: "Your 35m\u00B2 apartment holds ~87.5m\u00B3 of air. Plants offset a small % of your CO\u2082, but ventilation matters more here. Where plants truly shine is VOC and particulate filtration.",
    color: "oklch(75% 0.10 120)", },
  { id: "humidity", label: "Humidity", subtitle: "transpiration boost", unit: "ml/day",
    description: "With no heating running, your indoor RH tracks outdoor levels (~68% in late March). You're already above the 40-60% optimal range. This card becomes important when heating starts in autumn.",
    color: "oklch(70% 0.10 230)", },
  { id: "pm25", label: "PM2.5 Filter", subtitle: "fine dust trapping", unit: "% reduction",
    description: "Leaf surfaces trap fine airborne particles (PM2.5). NASA studies show 20-30% reduction in a closed room. Larger, textured leaves (Ficus, Dracaena) are most effective.",
    color: "oklch(70% 0.10 50)", },
  { id: "wellbeing", label: "Wellbeing", subtitle: "stress & cortisol", unit: "score",
    description: "Journal of Physiological Anthropology (2015): interacting with houseplants measurably reduces cortisol and systolic blood pressure. This is the most underrated benefit.",
    color: "oklch(70% 0.12 310)", },
];

const VOC_COLORS = {
  "Benzene":      "oklch(72% 0.12 60)",
  "Formaldehyde": "oklch(72% 0.14 145)",
  "Ammonia":      "oklch(68% 0.12 280)",
  "Toluene":      "oklch(72% 0.10 70)",
  "Xylene":       "oklch(75% 0.08 180)",
  "General VOCs": "oklch(65% 0.04 80)",
};

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

// ── Air Quality Detail Components ───────────────────────────────────────────

function VocDetail({ plants, metrics }) {
  const [activeVoc, setActiveVoc] = useState(null);
  const { vocMap, totalVoc } = metrics;
  const vocEntries = Object.entries(vocMap).sort((a, b) => b[1] - a[1]);
  const maxVoc = vocEntries[0]?.[1] || 1;
  const sortedPlants = [...plants].sort((a, b) => (b.vocPerHour||0) - (a.vocPerHour||0));
  const maxPlantVoc = sortedPlants[0]?.vocPerHour || 1;
  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: "var(--space-lg)" }}>
        <div className="label" style={{ marginBottom: 2 }}>By toxin type</div>
        {vocEntries.map(([voc, val]) => (
          <div key={voc} style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", cursor: "pointer", opacity: activeVoc && activeVoc !== voc ? 0.3 : 1, transition: "opacity 0.2s" }}
            onClick={() => setActiveVoc(activeVoc === voc ? null : voc)}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: VOC_COLORS[voc] || "var(--text-tertiary)", flexShrink: 0 }} />
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", width: 88, flexShrink: 0 }}>{voc}</div>
            <div style={{ flex: 1, height: 2, background: "var(--surface-3)", borderRadius: 1, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 1, width: `${(val/maxVoc)*100}%`, background: VOC_COLORS[voc] || "var(--text-tertiary)" }} />
            </div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", width: 40, textAlign: "right", flexShrink: 0 }}>{Math.round(val)}μg</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: "var(--space-lg)" }}>
        <div className="label" style={{ marginBottom: 2 }}>By plant</div>
        {sortedPlants.map(p => {
          const highlighted = activeVoc ? (p.vocStrengths||[]).includes(activeVoc) : true;
          return (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", opacity: highlighted ? 1 : 0.2, transition: "opacity 0.2s" }}>
              <div style={{ fontSize: "var(--text-xs)", width: 72, color: "var(--text-tertiary)", fontStyle: "italic", flexShrink: 0, lineHeight: 1.2 }}>{p.species}</div>
              <div style={{ flex: 1, height: 2, background: "var(--surface-3)", borderRadius: 1, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 1, width: `${((p.vocPerHour||0)/maxPlantVoc)*100}%`, background: "var(--accent)" }} />
              </div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", width: 52, textAlign: "right", flexShrink: 0 }}>{(p.vocPerHour/1000).toFixed(1)}k μg/h</div>
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
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: "var(--space-lg)" }}>
      <div className="label" style={{ marginBottom: 2 }}>By plant</div>
      {sortedPlants.map(p => (
        <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
          <div style={{ fontSize: "var(--text-xs)", width: 72, color: "var(--text-tertiary)", fontStyle: "italic", flexShrink: 0, lineHeight: 1.2 }}>{p.species}</div>
          <div style={{ flex: 1, height: 2, background: "var(--surface-3)", borderRadius: 1, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 1, width: `${((p.co2PerYear||0)/maxCo2)*100}%`, background: "oklch(75% 0.10 120)" }} />
          </div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", width: 44, textAlign: "right", flexShrink: 0 }}>{p.co2PerYear}g/yr</div>
        </div>
      ))}
    </div>
  );
}

function HumidityDetail({ metrics }) {
  const { rhBoost, currentRH } = metrics;
  const bars = [
    { label: "Current RH (no heating)", value: currentRH, max: 100, color: "var(--accent)" },
    { label: "After plants", value: Math.min(parseFloat(currentRH) + parseFloat(rhBoost), 100), max: 100, color: "var(--accent-dim)" },
    { label: "Optimal target", value: 50, max: 100, color: "var(--text-tertiary)" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)", marginBottom: "var(--space-lg)" }}>
      {bars.map(b => (
        <div key={b.label}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginBottom: 4 }}>
            <span>{b.label}</span><span>{b.value.toFixed(0)}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${b.value}%`, background: b.color }} />
          </div>
        </div>
      ))}
      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", fontStyle: "italic" }}>
        Humidity is fine right now. This becomes important when heating drops RH below 35% in October.
      </div>
    </div>
  );
}

function Pm25Detail({ plants }) {
  const pm25Scores = { 1: 15, 2: 20, 3: 22, 4: 25, 5: 18, 6: 10 };
  const sortedPlants = [...plants].sort((a, b) => (pm25Scores[b.id]||10) - (pm25Scores[a.id]||10));
  const maxScore = 25;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: "var(--space-lg)" }}>
      <div className="label" style={{ marginBottom: 2 }}>Filtration by plant</div>
      {sortedPlants.map(p => (
        <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
          <div style={{ fontSize: "var(--text-xs)", width: 72, color: "var(--text-tertiary)", fontStyle: "italic", flexShrink: 0, lineHeight: 1.2 }}>{p.species}</div>
          <div style={{ flex: 1, height: 2, background: "var(--surface-3)", borderRadius: 1, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 1, width: `${((pm25Scores[p.id]||10)/maxScore)*100}%`, background: "oklch(70% 0.10 50)" }} />
          </div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", width: 44, textAlign: "right", flexShrink: 0 }}>{pm25Scores[p.id]||10}%</div>
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
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)", marginBottom: "var(--space-lg)" }}>
      {factors.map(f => (
        <div key={f.label}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginBottom: 4 }}>
            <span>{f.label}</span><span style={{ fontStyle: "italic" }}>{f.note}</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${(f.value/f.max)*100}%`, background: "oklch(70% 0.12 310)" }} />
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
    humidity: <HumidityDetail metrics={metrics.humidity} />,
    pm25: <Pm25Detail plants={plants} />,
    wellbeing: <WellbeingDetail plants={plants} />,
  };

  return (
    <div style={{ padding: `var(--space-xl) var(--space-lg) var(--space-3xl)` }}>
      <div className="label" style={{ marginBottom: "var(--space-md)" }}>Air quality</div>
      <div className="aq-tabs" style={{ marginBottom: "var(--space-lg)" }}>
        {AIR_CARDS.map(c => (
          <button key={c.id} onClick={() => setActiveCard(c.id)}
            className={`aq-tab${activeCard === c.id ? " active" : ""}`}>
            {c.label}
          </button>
        ))}
      </div>

      <div className="surface" style={{ padding: "var(--space-xl) var(--space-lg) var(--space-lg)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-lg)" }}>
          <div>
            <div className="subheading" style={{ fontSize: "var(--text-lg)", color: "var(--text-primary)" }}>
              {card.label}
            </div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: 2 }}>{card.subtitle}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="heading" style={{ fontSize: "var(--text-xl)", color: card.color }}>{m.value}</div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>{card.unit}</div>
          </div>
        </div>

        <div style={{ marginBottom: "var(--space-lg)" }}>
          <div className="progress-track" style={{ height: 4 }}>
            <div className="progress-fill" style={{ width: `${Math.min(m.pct, 100)}%`, background: card.color }} />
          </div>
          <div style={{ textAlign: "right", fontSize: "var(--text-xs)", color: card.color, marginTop: "var(--space-xs)", fontWeight: 500 }}>
            {m.pct.toFixed(0)}% of target
          </div>
        </div>

        {detailMap[activeCard]}

        <div style={{ background: "var(--surface-2)", borderRadius: "var(--radius-sm)", padding: "var(--space-md)", fontSize: "var(--text-xs)", color: "var(--text-tertiary)", lineHeight: 1.6, maxWidth: "65ch" }}>
          {card.description}
        </div>
      </div>
    </div>
  );
}


// ── Claude API helpers ──────────────────────────────────────────────────────

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
      messages: [{ role: "user", content: [
        { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64Image } },
        { type: "text", text: prompt }
      ]}]
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
  if (plant._identifyMode) {
    return callClaude(base64Image,
      `Identify this plant. Reply ONLY with JSON:
{"commonName":"","scientificName":"","family":"","confidence":"high","origin":"","funFact":"","careLevel":"easy","edible":false,"toxic":false,"toxicTo":null}`, 200);
  }
  const { lastWateredDaysAgo, lastFertilizedDaysAgo } = careContext;
  const waterCtx = lastWateredDaysAgo != null
    ? `Last watered ${lastWateredDaysAgo} day(s) ago (schedule: every ${plant.waterEveryDays} days).`
    : `Not yet watered (schedule: every ${plant.waterEveryDays} days).`;
  const fertCtx = lastFertilizedDaysAgo != null
    ? `Last fertilized ${lastFertilizedDaysAgo} day(s) ago (schedule: every 30 days).`
    : `Never fertilized.`;
  return callClaude(base64Image,
    `You are a botanist. Photo shows ${plant.name} (${plant.species}). Light: ${plant.light}. ${waterCtx} ${fertCtx}
Reply ONLY with JSON: {"status":"healthy","headline":"","recommendation":"","waitDays":null,"urgency":"low"}`, 256);
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

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


// ── Photo Components ────────────────────────────────────────────────────────

const URGENCY_COLOR = { low: "var(--accent)", medium: "oklch(72% 0.14 70)", high: "var(--warn)" };

function GalleryLightbox({ photos, onClose, startIndex = 0 }) {
  const [current, setCurrent] = useState(startIndex);
  return (
    <div style={{ position: "fixed", inset: 0, background: "oklch(8% 0.01 145 / 0.96)", zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", color: "var(--text-tertiary)", fontSize: 24, cursor: "pointer" }}>✕</button>
      <div style={{ position: "absolute", top: 24, left: 0, right: 0, textAlign: "center", fontSize: "var(--text-xs)", color: "var(--text-tertiary)", letterSpacing: "0.08em" }}>
        {current + 1} / {photos.length}
      </div>
      <div onClick={e => e.stopPropagation()}>
        <div className="polaroid-frame" style={{ padding: "12px 12px 44px" }}>
          <img src={photos[current].dataUrl} alt="" style={{ display: "block", width: 340, height: 200, objectFit: "cover" }} />
          <div style={{ textAlign: "center", marginTop: 10, fontSize: "var(--text-xs)", color: "var(--text-tertiary)", fontStyle: "italic" }}>
            {new Date(photos[current].date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: "var(--space-lg)", marginTop: "var(--space-xl)" }} onClick={e => e.stopPropagation()}>
        <button onClick={() => setCurrent(i => Math.max(0, i - 1))} disabled={current === 0}
          className="nav-arrow" style={{ width: 40, height: 40, fontSize: 18 }}>‹</button>
        <button onClick={() => setCurrent(i => Math.min(photos.length - 1, i + 1))} disabled={current === photos.length - 1}
          className="nav-arrow" style={{ width: 40, height: 40, fontSize: 18 }}>›</button>
      </div>
      <div style={{ display: "flex", gap: "var(--space-sm)", marginTop: "var(--space-lg)", overflowX: "auto", padding: "4px 20px", maxWidth: 380 }} onClick={e => e.stopPropagation()}>
        {photos.map((p, i) => (
          <img key={i} src={p.dataUrl} onClick={() => setCurrent(i)}
            style={{ width: 48, height: 48, objectFit: "cover", opacity: i === current ? 1 : 0.4, cursor: "pointer", border: i === current ? "2px solid var(--accent)" : "2px solid transparent", flexShrink: 0, borderRadius: 4 }} />
        ))}
      </div>
    </div>
  );
}

function PlantPhotoStack({ plant, userPhotos, setUserPhotos, careContext, db }) {
  const [analysing, setAnalysing] = useState(false);
  const [gallery, setGallery] = useState(false);
  const [galleryStart, setGalleryStart] = useState(0);
  const fileRef = useRef();
  const allPhotos = [...userPhotos].reverse();
  const topPhoto = allPhotos[0] || null;
  const latestAnalysis = topPhoto?.analysis || null;

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
    <div style={{ padding: `var(--space-lg) var(--space-lg) 0` }}>
      {/* Main photo */}
      <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", marginBottom: "var(--space-md)", background: "var(--surface-2)" }}>
        <img src={topPhoto ? topPhoto.dataUrl : plant.image} alt={plant.name}
          style={{ display: "block", width: "100%", height: 220, objectFit: "cover" }} />
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: "var(--space-sm)", marginBottom: "var(--space-lg)" }}>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
        <button onClick={() => fileRef.current?.click()} disabled={analysing}
          className="btn-primary" style={{ width: "auto", flex: 1 }}>
          {analysing ? "Analysing..." : "+ Add photo"}
        </button>
        {userPhotos.length > 0 && (
          <button onClick={() => { setGalleryStart(0); setGallery(true); }}
            className="btn-secondary" style={{ width: "auto", flex: 0 }}>
            Gallery ({userPhotos.length})
          </button>
        )}
      </div>

      {/* Analysis result — NO border-left accent (banned), using background tint instead */}
      {analysing && (
        <div className="care-note" style={{ textAlign: "center", fontStyle: "italic", marginBottom: "var(--space-lg)" }}>
          Examining your plant...
        </div>
      )}
      {latestAnalysis && !analysing && (
        <div style={{
          background: "var(--surface-1)", border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)", padding: "var(--space-lg)",
          marginBottom: "var(--space-lg)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", marginBottom: "var(--space-sm)" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: URGENCY_COLOR[latestAnalysis.urgency], flexShrink: 0 }} />
            <div className="subheading" style={{ fontSize: "var(--text-base)", flex: 1 }}>{latestAnalysis.headline}</div>
            {latestAnalysis.waitDays && (
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", background: "var(--surface-2)", borderRadius: "var(--radius-sm)", padding: "2px 8px" }}>
                ~{latestAnalysis.waitDays}d
              </div>
            )}
          </div>
          <div style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.65, fontWeight: 300, maxWidth: "65ch" }}>{latestAnalysis.recommendation}</div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: "var(--space-sm)" }}>
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


// ── ScanButton (self-contained for API proxy) ───────────────────────────────

function ScanButton({ onResult, onStart, renderTrigger }) {
  const fileRef = useRef();
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanning(true); setProgress(0);
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
          model: "claude-sonnet-4-6", max_tokens: 200,
          messages: [{ role: "user", content: [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64 } },
            { type: "text", text: 'Identify this plant. Reply ONLY with JSON, no markdown:\n{"commonName":"","scientificName":"","family":"","confidence":"high","origin":"","funFact":"","careLevel":"easy","edible":false,"toxic":false,"toxicTo":null}' }
          ]}]
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.content?.find(b => b.type === "text")?.text || "";
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON: " + text.slice(0, 80));
      const result = JSON.parse(match[0]);
      clearInterval(interval); setProgress(100);
      await new Promise(r => setTimeout(r, 350));
      onResult({ ...result, dataUrl, date: new Date().toISOString(), id: Date.now() });
    } catch(err) {
      clearInterval(interval); setProgress(100);
      await new Promise(r => setTimeout(r, 300));
      onResult({
        commonName: "Scan failed", scientificName: err?.message || "Unknown error",
        family: "\u2014", confidence: "low", origin: "\u2014",
        funFact: "Error: " + (err?.message || "unknown"),
        careLevel: "\u2014", edible: false, toxic: false, toxicTo: null,
        dataUrl: dataUrl || "", date: new Date().toISOString(), id: Date.now()
      });
    }
    setScanning(false); setProgress(0);
    e.target.value = "";
  }

  return (
    <>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleFile} />
      {renderTrigger ? renderTrigger(() => fileRef.current?.click(), scanning) : (
        <div onClick={() => fileRef.current?.click()} style={{ cursor: "pointer", padding: "var(--space-lg)", display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-end", height: "100%" }}>
          {scanning ? (
            <>
              <div className="heading" style={{ fontSize: "var(--text-xl)", color: "var(--accent)" }}>{progress}%</div>
              <div className="progress-track" style={{ width: "100%", marginTop: "var(--space-sm)" }}>
                <div className="progress-fill" style={{ width: `${progress}%`, background: "var(--accent)" }} />
              </div>
              <div className="label" style={{ marginTop: "var(--space-xs)" }}>Scanning</div>
            </>
          ) : (
            <>
              <div className="heading" style={{ fontSize: "var(--text-xl)" }}>Scan</div>
              <div className="label">Identify a plant</div>
            </>
          )}
        </div>
      )}
    </>
  );
}


// ── Modals ───────────────────────────────────────────────────────────────────

function EditDateModal({ type, currentDate, onConfirm, onClose }) {
  const toInputVal = (iso) => {
    if (!iso) return new Date().toISOString().slice(0, 10);
    return new Date(iso).toISOString().slice(0, 10);
  };
  const [dateVal, setDateVal] = useState(toInputVal(currentDate));
  const isWater = type === 'water';
  const accent = isWater ? "var(--accent)" : "var(--fertilize)";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 201, display: "flex", flexDirection: "column", justifyContent: "flex-end", background: "oklch(8% 0.01 145 / 0.6)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "var(--surface-0)", borderTop: "1px solid var(--border)", borderRadius: "var(--radius-lg) var(--radius-lg) 0 0", padding: "var(--space-xl) var(--space-xl) var(--space-3xl)", maxWidth: 430, width: "100%", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "var(--space-xl)" }}>
          <div style={{ flex: 1 }}>
            <div className="label" style={{ color: accent, marginBottom: 2 }}>Edit date</div>
            <div className="subheading" style={{ fontSize: "var(--text-lg)" }}>When did you {isWater ? "water" : "fertilize"}?</div>
          </div>
          <button onClick={onClose} className="nav-arrow">✕</button>
        </div>
        <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "var(--space-xs) var(--space-lg)", marginBottom: "var(--space-md)" }}>
          <input type="date" value={dateVal} max={new Date().toISOString().slice(0, 10)} onChange={e => setDateVal(e.target.value)}
            style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontSize: "var(--text-lg)", fontFamily: "'Source Sans 3', sans-serif", color: "var(--text-primary)", padding: "var(--space-md) 0", cursor: "pointer" }} />
        </div>
        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginBottom: "var(--space-xl)", textAlign: "center" }}>
          This edit will be logged in your care history.
        </div>
        <button onClick={() => onConfirm(dateVal)} className="btn-primary">Save date</button>
      </div>
    </div>
  );
}

function FertilizeModal({ onConfirm, onClose }) {
  const DOSES = [0, 0.5, 1];
  const DOSE_LABELS = { 0: "No dose", 0.5: "\u00BD dose", 1: "Full dose" };
  const DOSE_DESC = { 0: "Log the event, no fertilizer applied", 0.5: "Half the recommended amount", 1: "Full recommended amount" };
  const [selected, setSelected] = useState(1);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", flexDirection: "column", justifyContent: "flex-end", background: "oklch(8% 0.01 145 / 0.55)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "var(--surface-0)", borderTop: "1px solid var(--border)", borderRadius: "var(--radius-lg) var(--radius-lg) 0 0", padding: "var(--space-xl) var(--space-xl) var(--space-3xl)", maxWidth: 430, width: "100%", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "var(--space-xl)" }}>
          <div style={{ flex: 1 }}>
            <div className="label" style={{ color: "var(--fertilize)", marginBottom: 2 }}>Fertilize</div>
            <div className="subheading" style={{ fontSize: "var(--text-lg)" }}>How much did you use?</div>
          </div>
          <button onClick={onClose} className="nav-arrow">✕</button>
        </div>
        <div style={{ marginBottom: "var(--space-xl)" }}>
          <div style={{ position: "relative", height: 48, display: "flex", alignItems: "center" }}>
            <div style={{ position: "absolute", left: 0, right: 0, height: 3, background: "var(--surface-3)", borderRadius: 2 }} />
            <div style={{ position: "absolute", left: 0, height: 3, borderRadius: 2, background: "var(--fertilize)", width: selected === 0 ? "0%" : selected === 0.5 ? "50%" : "100%", transition: `width var(--dur-med) var(--ease-out)` }} />
            {DOSES.map((dose, i) => (
              <button key={dose} onClick={() => setSelected(dose)} style={{
                position: "absolute", left: i === 0 ? "0%" : i === 1 ? "50%" : "100%",
                transform: "translateX(-50%)", width: 24, height: 24, borderRadius: "50%",
                background: selected === dose ? "var(--fertilize)" : "var(--surface-3)",
                border: selected === dose ? "2px solid var(--fertilize)" : "2px solid var(--border)",
                cursor: "pointer", transition: `all var(--dur-fast) var(--ease-out)`, zIndex: 1,
              }} />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "var(--space-sm)" }}>
            {DOSES.map(dose => (
              <div key={dose} onClick={() => setSelected(dose)} style={{
                fontSize: "var(--text-xs)", cursor: "pointer",
                color: selected === dose ? "var(--fertilize)" : "var(--text-tertiary)",
                fontWeight: selected === dose ? 500 : 400,
                width: "33%", textAlign: dose === 0 ? "left" : dose === 0.5 ? "center" : "right",
              }}>{DOSE_LABELS[dose]}</div>
            ))}
          </div>
        </div>
        <div style={{ background: "var(--fertilize-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "var(--space-md) var(--space-lg)", fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginBottom: "var(--space-xl)" }}>
          {DOSE_DESC[selected]}
        </div>
        <button onClick={() => onConfirm(selected)} className="btn-primary" style={{ background: "var(--fertilize)" }}>
          Log {DOSE_LABELS[selected]}
        </button>
      </div>
    </div>
  );
}


// ── Consult Gardener ────────────────────────────────────────────────────────

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
        headers: { "Content-Type": "application/json", "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY || "", "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 300, system: systemContext, messages: [...history, { role: "user", content: contentParts }] })
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
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", flexDirection: "column", justifyContent: "flex-end", background: "oklch(8% 0.01 145 / 0.55)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "var(--surface-0)", borderTop: "1px solid var(--border)", borderRadius: "var(--radius-lg) var(--radius-lg) 0 0", maxHeight: "75vh", display: "flex", flexDirection: "column", maxWidth: 430, width: "100%", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "var(--space-lg) var(--space-xl) var(--space-md)", borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ flex: 1 }}>
            <div className="label" style={{ color: "var(--accent)", marginBottom: 2 }}>AI Assistant</div>
            <div className="subheading" style={{ fontSize: "var(--text-base)" }}>Consult Gardener</div>
          </div>
          <button onClick={onClose} className="nav-arrow">✕</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "var(--space-lg)", display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          {messages.length === 0 && (
            <div style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", lineHeight: 1.6, textAlign: "center", padding: "var(--space-xl) var(--space-lg)" }}>
              Ask anything about your {plant.name}.
              {latestPhotoBase64 ? " Your latest photo will be included." : " Add a photo first for visual analysis."}
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "82%",
              background: m.role === "user" ? "var(--accent-surface)" : "var(--surface-1)",
              border: `1px solid ${m.role === "user" ? "oklch(72% 0.16 145 / 0.3)" : "var(--border-subtle)"}`,
              borderRadius: m.role === "user" ? "var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-lg)" : "var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm)",
              padding: "var(--space-md) var(--space-lg)", fontSize: "var(--text-sm)", color: "var(--text-primary)", lineHeight: 1.55,
            }}>{m.text}</div>
          ))}
          {loading && <div style={{ alignSelf: "flex-start", background: "var(--surface-1)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm)", padding: "var(--space-md) var(--space-lg)", fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>Thinking...</div>}
          <div ref={bottomRef} />
        </div>
        <div style={{ padding: "var(--space-sm) var(--space-md) var(--space-xl)", display: "flex", gap: "var(--space-sm)", alignItems: "center" }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask about your plant..."
            style={{ flex: 1, background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "var(--space-md) var(--space-lg)", fontSize: "var(--text-sm)", color: "var(--text-primary)", fontFamily: "'Source Sans 3', sans-serif", outline: "none" }} />
          <button onClick={send} disabled={!input.trim() || loading}
            className="btn-primary" style={{ width: 38, height: 38, padding: 0, borderRadius: "50%", fontSize: "var(--text-base)", opacity: (!input.trim() || loading) ? 0.3 : 1 }}>↑</button>
        </div>
      </div>
    </div>
  );
}


// ── Botanical Garden Screen ─────────────────────────────────────────────────

const CARE_COLOR = { easy: "var(--accent)", moderate: "oklch(72% 0.12 70)", demanding: "var(--warn)" };
const CONFIDENCE_LABEL = { high: "Confident ID", medium: "Likely match", low: "Best guess" };

function BotanicalGardenScreen({ gardenLog, onBack, onScan, scanning }) {
  const [selected, setSelected] = useState(null);
  const scanRef = useRef();

  if (selected) {
    const e = selected;
    return (
      <div className="fade-up">
        <div className="nav">
          <button className="btn-ghost" onClick={() => setSelected(null)}>\u2190 Garden</button>
          <div className="species">{e.scientificName}</div>
          <div style={{ width: 68 }} />
        </div>
        <div style={{ margin: `0 var(--space-lg) var(--space-lg)`, borderRadius: "var(--radius-lg)", overflow: "hidden", height: 260, background: "var(--surface-2)" }}>
          <img src={e.dataUrl} alt={e.commonName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div style={{ padding: `0 var(--space-xl) var(--space-3xl)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", marginBottom: "var(--space-sm)" }}>
            <span className="label" style={{ background: "var(--surface-2)", padding: "3px 10px", borderRadius: "var(--radius-sm)" }}>{CONFIDENCE_LABEL[e.confidence]}</span>
            <span className="label" style={{ color: CARE_COLOR[e.careLevel] }}>{e.careLevel} care</span>
          </div>
          <div className="heading" style={{ fontSize: "var(--text-xl)", marginBottom: "var(--space-xs)" }}>{e.commonName}</div>
          <div className="species" style={{ marginBottom: "var(--space-xl)" }}>{e.scientificName} · {e.family}</div>
          <div style={{ height: 1, background: "var(--border-subtle)", marginBottom: "var(--space-lg)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-md)" }}>
            <span className="label">Origin</span><span style={{ fontSize: "var(--text-sm)" }}>{e.origin}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-xl)" }}>
            <span className="label">Scanned</span><span style={{ fontSize: "var(--text-sm)" }}>{new Date(e.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
          </div>
          <div className="care-note" style={{ marginBottom: "var(--space-lg)" }}>{e.description}</div>
          <div className="surface" style={{ padding: "var(--space-lg)" }}>
            <div className="label" style={{ marginBottom: "var(--space-sm)" }}>Fun fact</div>
            <div style={{ fontSize: "var(--text-sm)", color: "var(--text-primary)", lineHeight: 1.65, fontWeight: 300, maxWidth: "65ch" }}>{e.funFact}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-up">
      <div className="nav">
        <button className="btn-ghost" onClick={onBack}>\u2190 Overview</button>
        <div className="subheading" style={{ fontSize: "var(--text-base)" }}>Botanical Garden</div>
        <div style={{ width: 68 }} />
      </div>
      <div style={{ padding: `var(--space-sm) var(--space-xl) var(--space-lg)`, borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="label" style={{ marginBottom: "var(--space-sm)" }}>Plant scanner</div>
        <div className="heading" style={{ fontSize: "var(--text-xl)" }}>
          {gardenLog.length === 0 ? "Your garden awaits" : `${gardenLog.length} species identified`}
        </div>
      </div>
      <div style={{ padding: `var(--space-lg) var(--space-lg) var(--space-sm)` }}>
        <input ref={scanRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={onScan} />
        <button onClick={() => scanRef.current?.click()} disabled={scanning} className="btn-primary" style={{ fontSize: "var(--text-sm)" }}>
          {scanning ? "Identifying..." : "Scan a plant"}
        </button>
      </div>
      {gardenLog.length === 0 ? (
        <div style={{ padding: "var(--space-4xl) var(--space-2xl)", textAlign: "center" }}>
          <div style={{ fontSize: "var(--text-lg)", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "var(--space-sm)" }}>No plants scanned yet</div>
          <div style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", lineHeight: 1.6, maxWidth: "45ch", margin: "0 auto" }}>Tap Scan on the overview or use the button above to identify a plant.</div>
        </div>
      ) : (
        <div style={{ padding: `var(--space-lg) var(--space-lg) var(--space-3xl)`, display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          {gardenLog.map((entry) => (
            <div key={entry.id} onClick={() => setSelected(entry)} className="surface surface-interactive" style={{ overflow: "hidden" }}>
              <div style={{ position: "relative", height: 150 }}>
                <img src={entry.dataUrl} alt={entry.commonName} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <div style={{ position: "absolute", top: "var(--space-md)", right: "var(--space-md)", background: "oklch(12% 0.01 145 / 0.8)", color: "var(--text-primary)", fontSize: "var(--text-xs)", padding: "3px 10px", borderRadius: "var(--radius-sm)" }}>
                  {entry.confidence} confidence
                </div>
                {entry.toxic && (
                  <div style={{ position: "absolute", top: "var(--space-md)", left: "var(--space-md)", background: "oklch(30% 0.08 25 / 0.9)", color: "var(--warn)", fontSize: "var(--text-xs)", padding: "3px 10px", borderRadius: "var(--radius-sm)" }}>
                    Toxic{entry.toxicTo ? ` to ${entry.toxicTo}` : ""}
                  </div>
                )}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 50, background: "linear-gradient(to top, var(--surface-1), transparent)" }} />
              </div>
              <div style={{ padding: "var(--space-lg)" }}>
                <div className="species" style={{ marginBottom: 2 }}>{entry.scientificName}</div>
                <div className="subheading" style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-md)" }}>{entry.commonName}</div>
                <div style={{ display: "flex", gap: "var(--space-sm)", flexWrap: "wrap", marginBottom: "var(--space-md)" }}>
                  {[
                    { label: entry.family, bg: "var(--surface-2)" },
                    { label: entry.origin, bg: "var(--accent-surface)" },
                    { label: `Care: ${entry.careLevel}`, bg: "var(--surface-2)" },
                    entry.edible && { label: "Edible", bg: "var(--accent-surface)" },
                  ].filter(Boolean).map((tag, i) => (
                    <span key={i} style={{ background: tag.bg, fontSize: "var(--text-xs)", padding: "3px 10px", borderRadius: "var(--radius-sm)", color: "var(--text-secondary)" }}>{tag.label}</span>
                  ))}
                </div>
                <div style={{ background: "var(--surface-2)", borderRadius: "var(--radius-sm)", padding: "var(--space-md)", fontSize: "var(--text-xs)", color: "var(--text-tertiary)", lineHeight: 1.65, fontStyle: "italic", maxWidth: "65ch" }}>
                  {entry.funFact}
                </div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: "var(--space-md)" }}>
                  Scanned {new Date(entry.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


// ── Main App ────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState("overview");
  const [idx, setIdx] = useState(0);
  const [editingNick, setEditingNick] = useState(null);
  const [nickInput, setNickInput] = useState("");
  const [gardenerOpen, setGardenerOpen] = useState(false);
  const [fertilizeModalOpen, setFertilizeModalOpen] = useState(false);
  const [editDateModal, setEditDateModal] = useState(null);
  const [dbLoading, setDbLoading] = useState(true);
  const touchX = useRef(null);

  const [waterLog, setWaterLog] = useState({});
  const [fertilizeLog, setFertilizeLog] = useState({});
  const [dismissedWarnings, setDismissedWarnings] = useState({});
  const [nicknames, setNicknames] = useState({});
  const [gardenLog, setGardenLog] = useState([]);
  const [plantPhotos, setPlantPhotos] = useState({});

  // ── Load from Supabase ────────────────────────────────────────────────────
  const loadedRef = useRef(false);
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
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

  // ── Derived ───────────────────────────────────────────────────────────────
  const plant = PLANTS[idx];
  const lastWatered = waterLog[plant?.id] || null;
  const lastFertilized = fertilizeLog[plant?.id] || null;
  const lastFertilizedDate = lastFertilized ? (typeof lastFertilized === 'string' ? lastFertilized : lastFertilized.date) : null;
  const lastFertilizedDose = lastFertilized ? (typeof lastFertilized === 'string' ? 1 : lastFertilized.dose) : null;
  const status = plant ? getStatus(plant, lastWatered) : "unknown";
  const days = daysSince(lastWatered);
  const fertDays = daysSince(lastFertilizedDate);
  const pct = days !== null ? Math.min((days / plant.waterEveryDays) * 100, 100) : 0;

  const FERTILIZE_EVERY = 30;
  const fertDaysLeft = fertDays !== null ? FERTILIZE_EVERY - fertDays : null;
  const fertDoseLabel = lastFertilizedDose === 0.5 ? " · \u00BD dose" : lastFertilizedDose === 0 ? " · no dose" : "";

  const careContext = { lastWateredDaysAgo: days, lastFertilizedDaysAgo: fertDays };
  const currentPhotos = plantPhotos[plant?.id] || [];
  const latestPhoto = currentPhotos.length > 0 ? currentPhotos[currentPhotos.length - 1] : null;
  const latestPhotoBase64 = latestPhoto?.base64 || null;
  const latestAnalysis = latestPhoto?.analysis || null;

  // ── Actions ───────────────────────────────────────────────────────────────
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
  async function editDate(type, plantId, dateStr, dose) {
    const newIso = new Date(dateStr + 'T12:00:00').toISOString();
    const originalDate = type === 'water' ? lastWatered : lastFertilizedDate;
    if (type === 'water') {
      setWaterLog(p => ({ ...p, [plantId]: newIso }));
      await supabase.from("water_log").insert({ plant_id: plantId, watered_at: newIso });
    } else {
      const d = dose ?? lastFertilizedDose ?? 1;
      setFertilizeLog(p => ({ ...p, [plantId]: { date: newIso, dose: d } }));
      await supabase.from("fertilize_log").insert({ plant_id: plantId, fertilized_at: newIso, dose: d });
    }
    await supabase.from("care_edits").insert({
      plant_id: plantId, type, original_date: originalDate, new_date: newIso,
      dose: type === 'fertilize' ? (dose ?? lastFertilizedDose ?? 1) : null,
    });
    setEditDateModal(null);
  }

  function openDetail(i) { setIdx(i); setScreen("detail"); }

  async function handleGardenScan(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    // handled by ScanButton component
  }

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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="app-bg"><img src={bgPhoto} alt="" /></div>

        {dbLoading && (
          <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "var(--space-md)", background: "var(--surface-0)" }}>
            <div className="heading" style={{ fontSize: "var(--text-lg)", color: "var(--accent)" }}>Plant Journal</div>
            <div style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>Loading your garden...</div>
          </div>
        )}

        {/* ── OVERVIEW ──────────────────────────────────────────── */}
        {screen === "overview" && (
          <div className="fade-up">
            {/* Header — left-aligned, asymmetric (Impeccable: don't center everything) */}
            <div style={{ padding: `var(--space-2xl) var(--space-xl) var(--space-lg)` }}>
              <div className="heading" style={{ fontSize: "var(--text-2xl)", marginBottom: "var(--space-xs)" }}>
                My garden
              </div>
              <div style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>
                {PLANTS.length} plants · tracking since {TRACKING_SINCE}
              </div>
            </div>

            {/* Summary strip — NOT identical cards grid (Impeccable: avoid hero metric template) */}
            <div style={{ display: "flex", gap: "var(--space-md)", padding: `0 var(--space-lg) var(--space-lg)`, overflowX: "auto" }}>
              {/* Scan action */}
              <div className="surface surface-interactive" style={{ minWidth: 130, flexShrink: 0 }}>
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
              </div>
              {/* Garden link */}
              <div className="surface surface-interactive" onClick={() => setScreen("garden")}
                style={{ minWidth: 130, flexShrink: 0, padding: "var(--space-lg)", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                <div className="heading" style={{ fontSize: "var(--text-xl)" }}>{gardenLog.length}</div>
                <div className="label">Discovered</div>
              </div>
              {/* Attention */}
              {(() => {
                const warnPlants = PLANTS.filter(p => p.warning);
                if (warnPlants.length === 0) return null;
                return (
                  <div className="surface surface-interactive" onClick={() => {
                    if (warnPlants.length === 1) { setIdx(PLANTS.indexOf(warnPlants[0])); setScreen("detail"); }
                    else setScreen("attention");
                  }} style={{ minWidth: 130, flexShrink: 0, padding: "var(--space-lg)", display: "flex", flexDirection: "column", justifyContent: "flex-end", background: "var(--warn-surface)", borderColor: "var(--warn-border)" }}>
                    <div className="heading" style={{ fontSize: "var(--text-xl)", color: "var(--warn)" }}>{warnPlants.length}</div>
                    <div className="label" style={{ color: "var(--warn)" }}>Need attention</div>
                  </div>
                );
              })()}
            </div>

            {/* Plant list — simple rows, no cards-in-cards */}
            <div className="label" style={{ padding: `var(--space-xl) var(--space-xl) var(--space-sm)` }}>Your plants</div>
            <div style={{ borderTop: "1px solid var(--border-subtle)" }}>
              {PLANTS.map((p, i) => {
                const s = getStatus(p, waterLog[p.id] || null);
                const nick = nicknames[p.id];
                return (
                  <div key={p.id} className="plant-row" onClick={() => openDetail(i)}>
                    <div className="polaroid-frame" style={{ transform: `rotate(${[1.5, -2, 2.5, -1.2, 1.8, -2.3][i]}deg)` }}>
                      <img src={p.image} alt={p.name} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "var(--text-base)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{nick || p.name}</div>
                      <div className="species" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{nick ? p.name : p.species}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", flexShrink: 0 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: STATUS_DOT[s] }} />
                      <span style={{ fontSize: "var(--text-xs)", color: STATUS_DOT[s] }}>{STATUS_LABEL[s]}</span>
                    </div>
                    <span style={{ fontSize: "var(--text-lg)", color: "var(--text-tertiary)", marginLeft: 2 }}>\u203A</span>
                  </div>
                );
              })}
            </div>

            <AirQualitySlider plants={PLANTS} />
          </div>
        )}

        {/* ── DETAIL ────────────────────────────────────────────── */}
        {screen === "detail" && (
          <div className="fade-up" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <div className="nav">
              <button className="btn-ghost" onClick={() => setScreen("overview")}>\u2190 Overview</button>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>{idx + 1} / {PLANTS.length}</div>
              <div className="nav-arrows">
                <button className="nav-arrow" disabled={idx === 0} onClick={() => setIdx(i => i - 1)}>\u2039</button>
                <button className="nav-arrow" disabled={idx === PLANTS.length - 1} onClick={() => setIdx(i => i + 1)}>\u203A</button>
              </div>
            </div>
            <div className="dots">
              {PLANTS.map((_, i) => <div key={i} className={`dot${i === idx ? " on" : ""}`} onClick={() => setIdx(i)} />)}
            </div>

            <PlantPhotoStack plant={plant} userPhotos={plantPhotos[plant.id] || []}
              setUserPhotos={(photos) => setPlantPhotos(prev => ({ ...prev, [plant.id]: typeof photos === 'function' ? photos(prev[plant.id] || []) : photos }))}
              careContext={careContext} db={supabase} />

            {plant.warning && !dismissedWarnings[plant.id] && (
              <div className="warn-box" style={{ margin: `0 var(--space-lg) var(--space-sm)` }}>
                <span style={{ flex: 1 }}>{plant.warning}</span>
                <button onClick={() => dismissWarning(plant.id)} style={{ background: "none", border: "none", color: "var(--warn)", cursor: "pointer", fontSize: 14, padding: 0, flexShrink: 0, opacity: 0.6 }}>✕</button>
              </div>
            )}

            <div style={{ padding: `var(--space-lg) var(--space-xl) var(--space-3xl)` }}>
              <div className="species" style={{ marginBottom: "var(--space-xs)" }}>{plant.species}</div>
              <div className="heading" style={{ fontSize: "var(--text-xl)", marginBottom: "var(--space-xs)" }}>{nicknames[plant.id] || plant.name}</div>

              {/* Nickname */}
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", marginBottom: "var(--space-xl)", minHeight: 30 }}>
                {editingNick === plant.id ? (
                  <>
                    <input className="nick-input" value={nickInput} onChange={e => setNickInput(e.target.value)} placeholder="Give it a name..." autoFocus onKeyDown={e => e.key === "Enter" && saveNick(plant.id)} />
                    <button className="btn-primary" style={{ width: "auto", padding: "var(--space-xs) var(--space-md)" }} onClick={() => saveNick(plant.id)}>save</button>
                  </>
                ) : (
                  <>
                    {nicknames[plant.id] && <span style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", fontStyle: "italic" }}>"{nicknames[plant.id]}"</span>}
                    <button className="btn-ghost" style={{ fontSize: "var(--text-xs)", borderRadius: "var(--radius-sm)", border: "1px dashed var(--border)", padding: "var(--space-xs) var(--space-md)" }}
                      onClick={() => { setEditingNick(plant.id); setNickInput(nicknames[plant.id] || ""); }}>
                      {nicknames[plant.id] ? "edit nickname" : "+ nickname"}
                    </button>
                  </>
                )}
              </div>

              <div style={{ height: 1, background: "var(--border-subtle)", marginBottom: "var(--space-lg)" }} />

              {/* Info rows */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-md)" }}>
                <span className="label">Light</span><span style={{ fontSize: "var(--text-sm)" }}>{plant.light}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-md)" }}>
                <span className="label">Water every</span><span style={{ fontSize: "var(--text-sm)" }}>{plant.waterEveryDays} days</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-md)" }}>
                <span className="label">Status</span><span style={{ fontSize: "var(--text-sm)", color: STATUS_DOT[status] }}>{STATUS_LABEL[status]}</span>
              </div>

              {/* Water progress */}
              <div style={{ marginBottom: "var(--space-xl)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginBottom: "var(--space-sm)" }}>
                  <span>{lastWatered ? (days === 0 ? "Watered today" : `${days}d ago`) : "Never logged"}</span>
                  <span>{lastWatered ? `next in ${Math.max(0, plant.waterEveryDays - (days || 0))}d` : "\u2014"}</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: pct >= 100 ? "var(--warn)" : pct >= 70 ? "oklch(72% 0.14 70)" : "var(--accent)" }} />
                </div>
              </div>

              <div className="care-note" style={{ marginBottom: "var(--space-lg)" }}>{plant.care}</div>
              {plant.warning && <div className="warn-box" style={{ marginBottom: "var(--space-lg)" }}>{plant.warning}</div>}

              {/* Action buttons — varied hierarchy (Impeccable: don't make every button primary) */}
              <button className="btn-primary" onClick={() => waterPlant(plant.id)}
                style={lastWatered && days < plant.waterEveryDays ? { background: "var(--surface-2)", color: "var(--text-secondary)", border: "1px solid var(--border)" } : {}}>
                {lastWatered && days < plant.waterEveryDays ? "Hydrated" : days !== null && days >= plant.waterEveryDays ? "Overdue \u2014 water now" : "Water now"}
              </button>

              <div style={{ display: "flex", gap: "var(--space-sm)", marginTop: "var(--space-sm)" }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setFertilizeModalOpen(true)}>
                  {fertDays === null ? "Fertilize" : fertDaysLeft <= 0 ? "Fertilize (overdue)" : `${fertDaysLeft}d to fertilize${fertDoseLabel}`}
                </button>
                <button className="btn-secondary" style={{ flex: 0, width: "auto", padding: "var(--space-md)" }} onClick={() => setGardenerOpen(true)}>
                  Ask AI
                </button>
              </div>

              {/* Edit date links */}
              <div style={{ display: "flex", gap: "var(--space-lg)", marginTop: "var(--space-md)", justifyContent: "center" }}>
                <button className="btn-ghost" style={{ fontSize: "var(--text-xs)" }}
                  onClick={() => setEditDateModal({ type: "water", currentDate: lastWatered, plantId: plant.id })}>
                  Edit water date
                </button>
                <button className="btn-ghost" style={{ fontSize: "var(--text-xs)" }}
                  onClick={() => setEditDateModal({ type: "fertilize", currentDate: lastFertilizedDate, plantId: plant.id, dose: lastFertilizedDose })}>
                  Edit fertilize date
                </button>
              </div>

              <div className="swipe-hint">swipe left or right to browse</div>
            </div>
          </div>
        )}

        {/* ── MODALS ────────────────────────────────────────────── */}
        {editDateModal && screen === "detail" && (
          <EditDateModal type={editDateModal.type} currentDate={editDateModal.currentDate}
            onConfirm={(dateStr) => editDate(editDateModal.type, editDateModal.plantId, dateStr, editDateModal.dose)}
            onClose={() => setEditDateModal(null)} />
        )}
        {fertilizeModalOpen && screen === "detail" && (
          <FertilizeModal onConfirm={(dose) => { fertilizePlant(plant.id, dose); setFertilizeModalOpen(false); }} onClose={() => setFertilizeModalOpen(false)} />
        )}
        {gardenerOpen && screen === "detail" && (
          <ConsultGardener plant={plant} latestAnalysis={latestAnalysis} latestPhotoBase64={latestPhotoBase64} careContext={careContext} onClose={() => setGardenerOpen(false)} />
        )}

        {/* ── GARDEN ────────────────────────────────────────────── */}
        {screen === "garden" && (
          <div className="fade-up">
            <div className="nav">
              <button className="btn-ghost" onClick={() => setScreen("overview")}>\u2190 Overview</button>
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
                  <button onClick={onClick} className="btn-primary" style={{ width: "auto", padding: "var(--space-sm) var(--space-lg)" }}>
                    {scanning ? "..." : "+ Scan"}
                  </button>
                )}
              />
            </div>

            <div style={{ padding: `var(--space-xl) var(--space-xl) var(--space-sm)` }}>
              <div className="label" style={{ marginBottom: "var(--space-sm)" }}>Your discoveries</div>
              <div className="heading" style={{ fontSize: "var(--text-2xl)" }}>Botanical Garden</div>
            </div>

            {gardenLog.length === 0 ? (
              <div style={{ padding: "var(--space-4xl) var(--space-2xl)", textAlign: "center" }}>
                <div style={{ fontSize: "var(--text-lg)", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "var(--space-sm)" }}>No plants scanned yet</div>
                <div style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", lineHeight: 1.6, maxWidth: "45ch", margin: "0 auto" }}>
                  Tap Scan on the overview or use the button above to identify a plant.
                </div>
              </div>
            ) : (
              <div style={{ padding: `var(--space-lg) var(--space-lg) var(--space-3xl)`, display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
                {gardenLog.map((entry) => (
                  <div key={entry.id} className="surface" style={{ overflow: "hidden" }}>
                    <div style={{ position: "relative", height: 150 }}>
                      <img src={entry.dataUrl} alt={entry.commonName} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      <div style={{ position: "absolute", top: "var(--space-md)", right: "var(--space-md)", background: "oklch(12% 0.01 145 / 0.8)", color: "var(--text-primary)", fontSize: "var(--text-xs)", padding: "3px 10px", borderRadius: "var(--radius-sm)" }}>
                        {entry.confidence} confidence
                      </div>
                      {entry.toxic && (
                        <div style={{ position: "absolute", top: "var(--space-md)", left: "var(--space-md)", background: "oklch(30% 0.08 25 / 0.9)", color: "var(--warn)", fontSize: "var(--text-xs)", padding: "3px 10px", borderRadius: "var(--radius-sm)" }}>
                          Toxic{entry.toxicTo ? ` to ${entry.toxicTo}` : ""}
                        </div>
                      )}
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 50, background: "linear-gradient(to top, var(--surface-1), transparent)" }} />
                    </div>
                    <div style={{ padding: "var(--space-lg)" }}>
                      <div className="species" style={{ marginBottom: 2 }}>{entry.scientificName}</div>
                      <div className="subheading" style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-md)" }}>{entry.commonName}</div>
                      <div style={{ display: "flex", gap: "var(--space-sm)", flexWrap: "wrap", marginBottom: "var(--space-md)" }}>
                        {[
                          { label: entry.family },
                          { label: entry.origin },
                          { label: `Care: ${entry.careLevel}` },
                          entry.edible && { label: "Edible" },
                        ].filter(Boolean).map((tag, i) => (
                          <span key={i} style={{ background: "var(--surface-2)", fontSize: "var(--text-xs)", padding: "3px 10px", borderRadius: "var(--radius-sm)", color: "var(--text-secondary)" }}>{tag.label}</span>
                        ))}
                      </div>
                      <div style={{ background: "var(--surface-2)", borderRadius: "var(--radius-sm)", padding: "var(--space-md)", fontSize: "var(--text-xs)", color: "var(--text-tertiary)", lineHeight: 1.65, fontStyle: "italic", maxWidth: "65ch" }}>
                        {entry.funFact}
                      </div>
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: "var(--space-md)" }}>
                        Scanned {new Date(entry.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ATTENTION ─────────────────────────────────────────── */}
        {screen === "attention" && (
          <div className="fade-up">
            <div className="nav">
              <button className="btn-ghost" onClick={() => setScreen("overview")}>\u2190 Overview</button>
            </div>
            <div style={{ padding: `var(--space-xl) var(--space-xl) var(--space-sm)` }}>
              <div className="label" style={{ color: "var(--warn)", marginBottom: "var(--space-sm)" }}>Needs attention</div>
              <div className="heading" style={{ fontSize: "var(--text-xl)" }}>
                {PLANTS.filter(p => p.warning).length} plant{PLANTS.filter(p => p.warning).length !== 1 ? "s" : ""} need care
              </div>
            </div>
            <div style={{ borderTop: "1px solid var(--border-subtle)", marginTop: "var(--space-lg)" }}>
              {PLANTS.filter(p => p.warning).map((plant) => {
                const pIdx = PLANTS.indexOf(plant);
                return (
                  <div key={plant.id} className="plant-row" onClick={() => { setIdx(pIdx); setScreen("detail"); }}>
                    <div className="polaroid-frame" style={{ transform: `rotate(${[1.5, -2, 2.5, -1.2, 1.8, -2.3][pIdx]}deg)` }}>
                      <img src={plant.image} alt={plant.name} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "var(--text-base)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{nicknames[plant.id] || plant.name}</div>
                      <div className="species">{plant.species}</div>
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--warn)", marginTop: "var(--space-xs)", lineHeight: 1.4 }}>{plant.warning}</div>
                    </div>
                    <span style={{ fontSize: "var(--text-lg)", color: "var(--warn)" }}>\u203A</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
