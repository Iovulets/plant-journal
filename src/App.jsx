import { useState, useRef, useCallback, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import bgPhoto from "./assets/background.webp";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      flowType: "implicit",
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

function daysSince(iso) {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}
function getStatus(plant, lastWatered) {
  const d = daysSince(lastWatered);
  if (d === null) return "unknown";
  if (d < 0) return "happy";
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
        boxShadow: `inset -2px -2px 4px rgba(0,0,0,0.25), inset 1px 1px 3px oklch(0.95 0.015 145 / 0.35)`,
        margin: "0 auto", position: "relative"
      }}>
        <div style={{ position: "absolute", top: 3, left: 3, width: 5, height: 5, borderRadius: "50%", background: "oklch(0.95 0.015 145 / 0.50)" }} />
      </div>
      <div style={{ width: 2, height: 9, background: "linear-gradient(to bottom, #aaa, #ddd)", margin: "0 auto", borderRadius: "0 0 1px 1px" }} />
    </div>
  );
}

function Polaroid({ src, tilt, pinColor, size = "large" }) {
  const isLarge = size === "large";
  const photoW = isLarge ? 260 : 40;
  const photoH = isLarge ? 325 : 36;
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
  @import url('https://fonts.googleapis.com/css2?family=Literata:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Nunito+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
  button, input, select, textarea { font-family: inherit; }

  :root {
    --green: #4ade80;
    --green-dim: #86efac;
    --green-mid: rgba(74,222,128,0.18);
    --text: oklch(0.97 0.025 145);
    --text-2: oklch(0.85 0.025 145);
    --text-3: oklch(0.65 0.03 145);
    --warn: #f87171;
    --warn-bg: rgba(248,113,113,0.15);
    /* Surfaces — green-tinted whites */
    --surface: oklch(0.98 0.012 145 / 0.10);
    --surface-hover: oklch(0.98 0.012 145 / 0.15);
    --surface-border: oklch(0.90 0.015 145 / 0.18);
    /* Legacy compat */
    --card: oklch(0.98 0.012 145 / 0.10);
    --card-border: oklch(0.90 0.015 145 / 0.18);
    --peach-dark: #4ade80;
    --peach-light: rgba(74,222,128,0.12);
    --peach-mid: rgba(74,222,128,0.28);
    --warm: oklch(0.85 0.025 145);
    --muted: oklch(0.75 0.03 145);
    --text-muted: oklch(0.75 0.03 145);
    --white: oklch(0.98 0.012 145 / 0.10);
    --cream: #1a3a1a;
    --peach: rgba(74,222,128,0.18);
    --soft-brown: oklch(0.80 0.025 145);
  }

  body { margin: 0; background: #0f1a0f; }

  .app {
    max-width: 430px;
    margin: 0 auto;
    min-height: 100vh;
    background: transparent;
    font-family: 'Nunito Sans', sans-serif;
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
    background: oklch(0.95 0.015 145 / 0.12);
    border: 1px solid oklch(0.95 0.015 145 / 0.15);
    border-radius: inherit;
    position: relative;
    overflow: hidden;
  }
  .lg::before { display: none; }
  .lg::after { display: none; }

  @media (max-width: 430px) {
    .prow { background: oklch(0.95 0.015 145 / 0.04); }

  }
  .app > * { position: relative; z-index: 1; }

  .ov-hero { padding: 16px 24px 20px; background: transparent; }
  .ov-tag  { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--green); font-weight: 500; margin-bottom: 10px; }
  .ov-heading { font-family: 'Literata', serif; font-size: 38px; font-weight: 600; line-height: 1.1; color: var(--text); }
  .ov-heading em { font-style: normal; color: #c8f0a0; }
  .ov-since { margin-top: 8px; font-size: 12px; color: var(--text-2); font-weight: 300; }

  .stat { padding: 18px 16px 16px; position: relative; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-start; gap: 5px; }
  .stat > * { position: relative; z-index: 1; }
  .stat.span2 { grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; }
  .stat.warn  { background: rgba(248,113,113,0.12); border-color: rgba(248,113,113,0.3); border-top-color: rgba(255,180,180,0.45); }
  .stat-n { font-family: 'Literata', serif; font-size: 36px; font-weight: 600; line-height: 1; color: var(--text); }
  .stat.warn .stat-n { color: var(--warn); }
  .stat-l { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-2); margin-top: 4px; }
  .stat.span2 .stat-l  { margin-top: 0; }
  .stat.span2 .stat-val { font-size: 14px; color: var(--text); }
  .action-tile { position: relative; }

  .stat::before { display: none; }
  .stat::after { display: none; }

  .list-head { padding: 24px 22px 10px; font-size: 10px; letter-spacing: 2.5px; text-transform: uppercase; color: oklch(0.78 0.03 145); }

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
    background: oklch(0.95 0.015 145 / 0.08);
    z-index: 10;
    border-bottom: 1px solid oklch(0.95 0.015 145 / 0.12);
    position: relative;
  }
  .detail-nav::after { display: none; }
  .dnav-back { background: none; border: none; font-size: 13px; color: var(--text-2); cursor: pointer; padding: 6px 0; }
  .dnav-counter { font-size: 11px; color: var(--text-2); letter-spacing: 1px; }
  .dnav-arrows { display: flex; gap: 4px; }
  .darrow {
    background: oklch(0.95 0.015 145 / 0.12);
    border: 1px solid oklch(0.95 0.015 145 / 0.18);
    border-radius: 20px;
    width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; color: var(--text); cursor: pointer; transition: background 0.15s;
  }
  .darrow:disabled { opacity: 0.3; cursor: default; }
  .darrow:not(:disabled):hover { background: oklch(0.95 0.015 145 / 0.16); transform: scale(1.08); }
  .darrow:not(:disabled):active { background: oklch(0.95 0.015 145 / 0.20); transform: scale(0.95); }

  .dots { display: flex; justify-content: center; gap: 5px; padding: 10px 0 4px; }
  .dot  { height: 5px; border-radius: 3px; background: oklch(0.95 0.015 145 / 0.22); transition: all 0.25s; width: 5px; cursor: pointer; }
  .dot.on { background: var(--green); width: 18px; }

  .polaroid-stage { display: flex; justify-content: center; align-items: center; padding: 20px 0 8px; }

  .detail-body { padding: 20px 20px 48px; }
  .d-species { font-size: 11px; color: var(--green); font-style: italic; margin-bottom: 4px; }
  .d-name    { font-family: 'Literata', serif; font-size: 28px; font-weight: 600; color: var(--text); line-height: 1.1; }

  .nick-row { display: flex; align-items: center; gap: 8px; margin: 8px 0 20px; min-height: 30px; }
  .nick-show { font-size: 12px; color: var(--text-2); font-style: italic; }
  .nick-btn  {
    background: oklch(0.95 0.015 145 / 0.08);
    border: 1px dashed oklch(0.95 0.015 145 / 0.28);
    border-radius: 20px; padding: 4px 13px; font-size: 11px; color: var(--text-2);
    cursor: pointer; transition: all 0.15s;
  }
  .nick-btn:hover { background: oklch(0.95 0.015 145 / 0.13); border-style: solid; }
  .nick-input { border: 1px solid oklch(0.95 0.015 145 / 0.30); border-radius: 20px; padding: 5px 14px; font-size: 12px; color: var(--text); background: oklch(0.95 0.015 145 / 0.10); outline: none; width: 155px; }
  .nick-save  { background: var(--green); border: none; border-radius: 20px; padding: 5px 13px; font-size: 11px; color: #0a1a0a; cursor: pointer; font-weight: 600; }

  .rule { height: 1px; background: oklch(0.95 0.015 145 / 0.12); margin: 0 0 18px; }
  .d-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .d-key { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-2); }
  .d-val { font-size: 13px; color: var(--text); }

  /* Tappable date rows */
  .d-row-tap {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 12px; cursor: pointer; padding: 6px 10px; margin-left: -10px; margin-right: -10px;
    border-radius: 10px; transition: background 0.15s;
  }
  .d-row-tap:hover { background: oklch(0.95 0.015 145 / 0.07); }
  .d-row-tap:active { background: oklch(0.95 0.015 145 / 0.12); }
  .d-val-tap { font-size: 13px; color: var(--text); display: flex; align-items: center; gap: 5px; }
  .d-val-tap-hint { font-size: 10px; color: oklch(0.67 0.03 145); background: oklch(0.95 0.015 145 / 0.10); border-radius: 4px; padding: 1px 5px; letter-spacing: 0.5px; }

  .progress-wrap { margin-bottom: 20px; }
  .progress-labels { display: flex; justify-content: space-between; font-size: 11px; color: var(--text-2); margin-bottom: 6px; }
  .progress-track { height: 4px; background: oklch(0.95 0.015 145 / 0.12); border-radius: 2px; overflow: hidden; }
  .progress-fill  { height: 100%; border-radius: 2px; transition: width 0.5s ease; }

  .care-box {
    background: oklch(0.95 0.015 145 / 0.08);
    border: 1px solid oklch(0.95 0.015 145 / 0.12);
    border-radius: 16px;
    padding: 14px 16px; font-size: 13px; line-height: 1.7; color: var(--text-2); font-weight: 300; margin-bottom: 14px;
  }
  .care-box::before { display: none; }
  .warn-box {
    border: 1px solid rgba(248,113,113,0.35);
    background: rgba(248,113,113,0.12);
    border-radius: 16px; padding: 12px 16px; font-size: 12px; color: var(--warn); line-height: 1.65; margin-bottom: 16px;
  }

  .btn-water {
    width: 100%; padding: 12px 8px;
    background: rgba(100,220,80,0.18);
    border: 1px solid rgba(150,255,100,0.30);
    border-radius: 20px;
    color: #d4ffb0;
    font-size: 14px; font-weight: 500;
    letter-spacing: 0.5px;
    cursor: pointer; transition: all 0.22s ease;
    text-align: center;
  }
  .btn-water::before { display: none; }
  .btn-water:hover { transform: translateY(-1px); background: rgba(100,220,80,0.26); }
  .btn-water:active { transform: scale(0.98); }

  .btn-fertilize {
    width: 100%; padding: 12px 8px; margin-top: 8px;
    background: rgba(100,220,80,0.18);
    border: 1px solid rgba(150,255,100,0.30);
    border-radius: 20px;
    color: #d4ffb0;
    font-size: 14px; font-weight: 500;
    letter-spacing: 0.5px;
    cursor: pointer; transition: all 0.22s ease;
    text-align: center;
  }
  .btn-fertilize:hover { transform: translateY(-1px); background: rgba(100,220,80,0.26); }
  .btn-fertilize:active { transform: scale(0.98); }

  .btn-consult {
    width: 100%; padding: 10px 8px; margin-top: 8px;
    background: rgba(100,220,80,0.18);
    border: 1px solid rgba(150,255,100,0.30);
    border-radius: 20px;
    color: #d4ffb0;
    font-size: 13px; font-weight: 500;
    cursor: pointer; transition: all 0.22s ease;
    text-align: center;
  }
  .btn-consult:hover { transform: translateY(-1px); background: rgba(100,220,80,0.26); }
  .btn-consult:active { transform: scale(0.98); }

  .btn-reset {
    width: 100%; padding: 12px; background: oklch(0.95 0.015 145 / 0.06);
    color: var(--text-2); border: 1px solid oklch(0.95 0.015 145 / 0.15); border-radius: 16px;
    font-size: 12px; cursor: pointer; margin-top: 8px;
  }
  .btn-reset:active { background: oklch(0.95 0.015 145 / 0.10); }

  .swipe-hint { text-align: center; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-3); margin-top: 20px; }

  .shine { position: relative; overflow: hidden; }
  .shine::before { display: none; }
  .shine::after { display: none; }

  /* ─── ONBOARDING ────────────────────────────────────────────── */
  .ob-screen {
    min-height: 100vh; display: flex; flex-direction: column;
    padding: 0 24px; justify-content: center;
  }
  .ob-step-indicator { display: flex; gap: 6px; margin-bottom: 32px; }
  .ob-step-dot {
    height: 3px; flex: 1; border-radius: 2px;
    background: oklch(0.95 0.015 145 / 0.15); transition: background 0.3s;
  }
  .ob-step-dot.done { background: var(--green); }
  .ob-step-dot.active { background: rgba(74,222,128,0.5); }
  .ob-tag { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--green); margin-bottom: 10px; }
  .ob-title { font-family: 'Literata', serif; font-size: 28px; font-weight: 600; color: var(--text); line-height: 1.15; margin-bottom: 8px; }
  .ob-subtitle { font-size: 13px; color: oklch(0.67 0.03 145); line-height: 1.6; margin-bottom: 28px; font-weight: 300; }
  .ob-input {
    width: 100%; box-sizing: border-box;
    background: oklch(0.95 0.015 145 / 0.08); border: 1px solid oklch(0.95 0.015 145 / 0.20);
    border-radius: 14px; padding: 14px 16px; font-size: 15px;
    color: var(--text); outline: none;
    transition: border-color 0.2s;
  }
  .ob-input:focus { border-color: rgba(74,222,128,0.5); }
  .ob-input::placeholder { color: oklch(0.42 0.03 145); }
  .ob-error { font-size: 12px; color: var(--warn); margin-top: 8px; }
  .ob-btn {
    width: 100%; padding: 15px; margin-top: 24px;
    background: rgba(100,220,80,0.18);
    border: 1px solid rgba(150,255,100,0.30);
    border-radius: 20px;
    color: #d4ffb0; font-size: 14px;
    font-weight: 500; letter-spacing: 0.5px; cursor: pointer;
    transition: all 0.22s ease;
  }
  .ob-btn:disabled { opacity: 0.35; cursor: default; }
  .ob-btn:not(:disabled):hover { transform: translateY(-1px); background: rgba(100,220,80,0.26); }
  .ob-btn:not(:disabled):active { transform: scale(0.98); }
  .ob-loc-card {
    padding: 16px 18px; border-radius: 16px; cursor: pointer;
    background: oklch(0.95 0.015 145 / 0.08); border: 1.5px solid oklch(0.95 0.015 145 / 0.15);
    transition: all 0.18s; display: flex; align-items: center; gap: 12px;
  }
  .ob-loc-card.selected {
    background: rgba(74,222,128,0.12); border-color: rgba(74,222,128,0.45);
    box-shadow: 0 0 16px rgba(74,222,128,0.15);
  }
  .ob-loc-icon { font-size: 22px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 10px; background: oklch(0.95 0.015 145 / 0.06); }
  .ob-loc-label { font-size: 15px; font-weight: 500; color: var(--text); }
  .ob-loc-check { width: 20px; height: 20px; border-radius: 50%; border: 1.5px solid oklch(0.95 0.015 145 / 0.20); margin-left: auto; display: flex; align-items: center; justify-content: center; font-size: 12px; transition: all 0.15s; }
  .ob-loc-check.on { background: var(--green); border-color: var(--green); color: #0a1a0a; }
  .ob-size-card {
    flex: 1; padding: 14px 8px; border-radius: 14px; cursor: pointer; text-align: center;
    background: oklch(0.95 0.015 145 / 0.08); border: 1.5px solid oklch(0.95 0.015 145 / 0.15);
    transition: all 0.18s;
  }
  .ob-size-card.selected { background: rgba(74,222,128,0.12); border-color: rgba(74,222,128,0.45); }
  .ob-size-label { font-size: 13px; color: var(--text); font-weight: 500; }
  .ob-size-hint { font-size: 10px; color: oklch(0.55 0.03 145); margin-top: 4px; }
  .ob-toggle {
    display: flex; border-radius: 12px; overflow: hidden;
    border: 1px solid oklch(0.95 0.015 145 / 0.18); background: oklch(0.95 0.015 145 / 0.06);
  }
  .ob-toggle button {
    flex: 1; padding: 10px 0; border: none; background: transparent;
    color: oklch(0.63 0.03 145); font-size: 13px;
    cursor: pointer; transition: all 0.18s; font-weight: 500;
  }
  .ob-toggle button.active {
    background: rgba(74,222,128,0.18); color: var(--green);
  }
  .ob-compass-ring {
    width: 220px; height: 220px; border-radius: 50%; margin: 0 auto;
    border: 2px solid oklch(0.95 0.015 145 / 0.15); position: relative;
    display: flex; align-items: center; justify-content: center;
    background: oklch(0.95 0.015 145 / 0.04);
  }
  .ob-compass-dir {
    position: absolute; font-size: 11px; color: oklch(0.55 0.03 145);
    font-weight: 500; letter-spacing: 1px; cursor: pointer;
    padding: 6px 10px; border-radius: 20px; transition: all 0.15s;
    user-select: none;
  }
  .ob-compass-dir:hover { background: oklch(0.95 0.015 145 / 0.08); }
  .ob-compass-dir.selected { color: var(--green); background: rgba(74,222,128,0.15); }
  .ob-compass-center {
    font-size: 13px; color: oklch(0.63 0.03 145); text-align: center; line-height: 1.5;
  }
  .ob-select {
    width: 100%; box-sizing: border-box;
    background: oklch(0.95 0.015 145 / 0.08); border: 1px solid oklch(0.95 0.015 145 / 0.20);
    border-radius: 14px; padding: 14px 16px; font-size: 15px;
    color: var(--text); outline: none;
    appearance: none; -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='oklch(0.95 0.015 145 / 0.40)' fill='none' stroke-width='1.5'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 16px center;
  }
  .ob-select option { background: #0f1a0f; color: var(--text); }

  /* ─── WEATHER ICON ANIMATIONS ───────────────────────────────── */
  @keyframes wx-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes wx-pulse { 0%, 100% { opacity: 0.9; transform: scale(1); } 50% { opacity: 1; transform: scale(1.08); } }
  @keyframes wx-drift { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(3px); } }
  @keyframes wx-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
  @keyframes wx-fall1 { 0% { transform: translateY(0); opacity: 0.8; } 100% { transform: translateY(6px); opacity: 0; } }
  @keyframes wx-fall2 { 0% { transform: translateY(0); opacity: 0.7; } 100% { transform: translateY(6px); opacity: 0; } }
  @keyframes wx-twinkle { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.8; } }
  @keyframes wx-flash { 0%, 100% { opacity: 0; } 8% { opacity: 0.9; } 12% { opacity: 0; } 20% { opacity: 0.7; } 24% { opacity: 0; } }
  @keyframes wx-tumble { 0% { transform: translateY(0) rotate(0deg); opacity: 0.7; } 100% { transform: translateY(5px) rotate(60deg); opacity: 0; } }
  .wx-spin { animation: wx-spin 12s linear infinite; transform-origin: center; }
  .wx-pulse { animation: wx-pulse 3s ease-in-out infinite; }
  .wx-drift { animation: wx-drift 4s ease-in-out infinite; }
  .wx-bob { animation: wx-bob 3s ease-in-out infinite; }
`;

// ── Weather Card ──────────────────────────────────────────────────────────

const WMO_CONDITIONS = {
  0: "Clear sky", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Foggy", 48: "Rime fog",
  51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle",
  61: "Light rain", 63: "Rain", 65: "Heavy rain",
  66: "Freezing rain", 67: "Heavy freezing rain",
  71: "Light snow", 73: "Snow", 75: "Heavy snow", 77: "Snow grains",
  80: "Light showers", 81: "Showers", 82: "Heavy showers",
  85: "Light snow showers", 86: "Snow showers",
  95: "Thunderstorm", 96: "Thunderstorm + hail", 99: "Thunderstorm + heavy hail",
};

function WeatherIcon({ code, isDay, size = 32 }) {
  let type = "sunny";
  if ([0, 1].includes(code)) type = isDay ? "sunny" : "night";
  else if ([2].includes(code)) type = isDay ? "partly-cloudy" : "partly-cloudy-night";
  else if ([3, 45, 48].includes(code)) type = "cloudy";
  else if ([51, 53, 55, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) type = "rainy";
  else if ([71, 73, 75, 77, 85, 86].includes(code)) type = "snowy";
  else if ([95, 96, 99].includes(code)) type = "stormy";

  const s = size;
  const icons = {
    sunny: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        {/* Rays — slow spin */}
        <g className="wx-spin" style={{ transformOrigin: "18px 18px" }}>
          <g stroke="#FFD93D" strokeWidth="2" strokeLinecap="round" opacity="0.6">
            <line x1="18" y1="2" x2="18" y2="7" /><line x1="18" y1="29" x2="18" y2="34" />
            <line x1="2" y1="18" x2="7" y2="18" /><line x1="29" y1="18" x2="34" y2="18" />
            <line x1="6.3" y1="6.3" x2="9.8" y2="9.8" /><line x1="26.2" y1="26.2" x2="29.7" y2="29.7" />
            <line x1="6.3" y1="29.7" x2="9.8" y2="26.2" /><line x1="26.2" y1="9.8" x2="29.7" y2="6.3" />
          </g>
        </g>
        {/* Core — gentle pulse */}
        <circle className="wx-pulse" cx="18" cy="18" r="7" fill="#FFD93D" style={{ transformOrigin: "18px 18px" }} />
      </svg>
    ),
    night: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <path className="wx-pulse" d="M24 18a11 11 0 01-11-11c0-2 2-3.5 3.5-4a13 13 0 100 30c1.5-.5 4.5-2.5 4.5-4a11 11 0 01-8-11z" fill="#C8D8F0" opacity="0.85" style={{ transformOrigin: "18px 18px" }} />
        <circle cx="26" cy="8" r="1.2" fill="#E8E8FF" style={{ animation: "wx-twinkle 2.5s ease-in-out infinite" }} />
        <circle cx="30" cy="14" r="0.8" fill="#E8E8FF" style={{ animation: "wx-twinkle 3.5s ease-in-out infinite 0.8s" }} />
        <circle cx="28" cy="4" r="0.6" fill="#E8E8FF" style={{ animation: "wx-twinkle 4s ease-in-out infinite 1.5s" }} />
      </svg>
    ),
    "partly-cloudy": (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        {/* Sun peeking */}
        <g className="wx-pulse" style={{ transformOrigin: "12px 12px" }}>
          <circle cx="12" cy="12" r="5.5" fill="#FFD93D" />
          <g stroke="#FFD93D" strokeWidth="1.5" strokeLinecap="round" opacity="0.5">
            <line x1="12" y1="2" x2="12" y2="5" /><line x1="3" y1="12" x2="6" y2="12" />
            <line x1="5.5" y1="5.5" x2="7.5" y2="7.5" />
          </g>
        </g>
        {/* Cloud drifting */}
        <g className="wx-drift">
          <ellipse cx="20" cy="22" rx="12" ry="6" fill="oklch(0.95 0.015 145 / 0.50)" />
          <ellipse cx="16" cy="18" rx="8" ry="5.5" fill="oklch(0.95 0.015 145 / 0.60)" />
          <ellipse cx="24" cy="19" rx="6.5" ry="5" fill="oklch(0.95 0.015 145 / 0.55)" />
        </g>
      </svg>
    ),
    "partly-cloudy-night": (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <path className="wx-pulse" d="M14 11a7 7 0 01-5-7c0-1 1.2-2 2.5-2.5a9 9 0 100 19c1-.4 3-1.5 3-3a7 7 0 01-5-6.5z" fill="#C8D8F0" opacity="0.65" style={{ transformOrigin: "10px 10px" }} />
        <g className="wx-drift">
          <ellipse cx="20" cy="24" rx="12" ry="6" fill="oklch(0.95 0.015 145 / 0.50)" />
          <ellipse cx="17" cy="20" rx="7" ry="5" fill="oklch(0.95 0.015 145 / 0.55)" />
        </g>
      </svg>
    ),
    cloudy: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <g className="wx-drift">
          <ellipse cx="18" cy="20" rx="13" ry="7" fill="oklch(0.95 0.015 145 / 0.42)" />
          <ellipse cx="14" cy="16" rx="8" ry="5.5" fill="oklch(0.95 0.015 145 / 0.52)" />
          <ellipse cx="23" cy="17" rx="7" ry="5" fill="oklch(0.95 0.015 145 / 0.48)" />
        </g>
        {/* Second layer with offset drift */}
        <g className="wx-bob">
          <ellipse cx="19" cy="22" rx="9" ry="4.5" fill="oklch(0.95 0.015 145 / 0.30)" />
        </g>
      </svg>
    ),
    rainy: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        {/* Cloud */}
        <g className="wx-bob">
          <ellipse cx="18" cy="14" rx="12" ry="6" fill="oklch(0.95 0.015 145 / 0.42)" />
          <ellipse cx="14" cy="11" rx="7" ry="4.5" fill="oklch(0.95 0.015 145 / 0.48)" />
          <ellipse cx="23" cy="12" rx="6" ry="4" fill="oklch(0.95 0.015 145 / 0.45)" />
        </g>
        {/* Rain drops — staggered falling */}
        <line x1="11" y1="22" x2="10" y2="27" stroke="#8ab4c8" strokeWidth="1.5" strokeLinecap="round" style={{ animation: "wx-fall1 1.2s ease-in infinite" }} />
        <line x1="18" y1="22" x2="17" y2="28" stroke="#8ab4c8" strokeWidth="1.5" strokeLinecap="round" style={{ animation: "wx-fall1 1.2s ease-in infinite 0.3s" }} />
        <line x1="25" y1="22" x2="24" y2="27" stroke="#8ab4c8" strokeWidth="1.5" strokeLinecap="round" style={{ animation: "wx-fall1 1.2s ease-in infinite 0.7s" }} />
      </svg>
    ),
    snowy: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <g className="wx-bob">
          <ellipse cx="18" cy="14" rx="12" ry="6" fill="oklch(0.95 0.015 145 / 0.42)" />
          <ellipse cx="14" cy="11" rx="7" ry="4.5" fill="oklch(0.95 0.015 145 / 0.48)" />
        </g>
        {/* Snowflakes — tumbling fall */}
        <circle cx="11" cy="23" r="1.8" fill="oklch(0.95 0.015 145 / 0.60)" style={{ animation: "wx-tumble 2s ease-in infinite" }} />
        <circle cx="18" cy="25" r="1.8" fill="oklch(0.95 0.015 145 / 0.55)" style={{ animation: "wx-tumble 2.2s ease-in infinite 0.5s" }} />
        <circle cx="25" cy="23" r="1.8" fill="oklch(0.95 0.015 145 / 0.60)" style={{ animation: "wx-tumble 1.8s ease-in infinite 1s" }} />
      </svg>
    ),
    stormy: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <g className="wx-bob">
          <ellipse cx="18" cy="12" rx="12" ry="6" fill="oklch(0.95 0.015 145 / 0.38)" />
          <ellipse cx="14" cy="9" rx="7" ry="4.5" fill="oklch(0.95 0.015 145 / 0.42)" />
        </g>
        {/* Lightning — intermittent flash */}
        <polygon points="17,18 20,18 15,30 19,23 15,23 19,16" fill="#FFD93D" style={{ animation: "wx-flash 3s ease-in-out infinite" }} />
      </svg>
    ),
  };

  return icons[type] || icons.cloudy;
}

function WeatherCard({ userProfile, onWeatherLoad }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userProfile?.postal_code || !userProfile?.country) { setLoading(false); return; }

    async function fetchWeather() {
      try {
        const searchQuery = `${userProfile.postal_code} ${userProfile.country}`;
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=1&language=en`);
        const geoData = await geoRes.json();

        let lat, lng, cityName;
        if (geoData.results && geoData.results.length > 0) {
          lat = geoData.results[0].latitude;
          lng = geoData.results[0].longitude;
          cityName = geoData.results[0].name;
        } else {
          const COUNTRY_COORDS = { MD: { lat: 47.01, lng: 28.86, name: "Chisinau" } };
          const fallback = COUNTRY_COORDS[userProfile.country];
          if (fallback) { lat = fallback.lat; lng = fallback.lng; cityName = fallback.name; }
          else { setError("Location not found"); setLoading(false); return; }
        }

        const unit = userProfile.temp_unit === "F" ? "fahrenheit" : "celsius";
        const wxRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,is_day&temperature_unit=${unit}&timezone=auto`
        );
        const wxData = await wxRes.json();
        const current = wxData.current;

        const wxObj = {
          temp: Math.round(current.temperature_2m),
          unit: userProfile.temp_unit === "F" ? "°F" : "°C",
          humidity: current.relative_humidity_2m,
          condition: WMO_CONDITIONS[current.weather_code] || "Unknown",
          weatherCode: current.weather_code,
          isDay: current.is_day === 1,
          city: cityName,
        };
        setWeather(wxObj);
        onWeatherLoad?.(wxObj);
      } catch (err) {
        console.error("Weather fetch error:", err);
        setError("Could not load weather");
      }
      setLoading(false);
    }

    fetchWeather();
  }, [userProfile?.postal_code, userProfile?.country, userProfile?.temp_unit]);

  if (!userProfile?.postal_code || error || (!loading && !weather)) return null;
  if (loading) return (
    <div style={{ padding: "16px 16px 0" }}>
      <div style={{ padding: "14px 18px", borderRadius: 20, background: "oklch(0.95 0.015 145 / 0.06)", border: "1px solid oklch(0.95 0.015 145 / 0.10)" }}>
        <div style={{ fontSize: 11, color: "oklch(0.45 0.03 145)" }}>Loading weather...</div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "16px 16px 0" }}>
      <GlassCard borderRadius={20} style={{ padding: "14px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Icon */}
          <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40 }}>
            <WeatherIcon code={weather.weatherCode} isDay={weather.isDay} size={36} />
          </div>
          {/* Temp */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Literata', serif", fontSize: 26, fontWeight: 500, color: "var(--text)", lineHeight: 1 }}>{weather.temp}{weather.unit}</div>
            <div style={{ fontSize: 10, color: "oklch(0.82 0.03 145)", marginTop: 3, letterSpacing: "0.5px" }}>{weather.city}</div>
          </div>
          {/* Humidity */}
          <div style={{ flexShrink: 0, textAlign: "right" }}>
            <div style={{ fontSize: 20, fontWeight: 400, color: "var(--text)", lineHeight: 1 }}>{weather.humidity}%</div>
            <div style={{ fontSize: 9, color: "oklch(0.82 0.03 145)", marginTop: 3, letterSpacing: "1px", textTransform: "uppercase" }}>Humidity</div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}


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
            <div style={{ flex: 1, height: 3, background: "oklch(0.95 0.015 145 / 0.14)", borderRadius: 2, overflow: "hidden" }}>
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
              <div style={{ flex: 1, height: 3, background: "oklch(0.95 0.015 145 / 0.14)", borderRadius: 2, overflow: "hidden" }}>
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
          <div style={{ flex: 1, height: 3, background: "oklch(0.95 0.015 145 / 0.14)", borderRadius: 2, overflow: "hidden" }}>
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
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "oklch(0.55 0.03 145)", marginBottom: 4 }}>
            <span>{b.label}</span><span>{b.value.toFixed(0)}%</span>
          </div>
          <div style={{ height: 4, background: "oklch(0.95 0.015 145 / 0.14)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 2, width: `${b.value}%`, background: b.color }} />
          </div>
        </div>
      ))}
      <div style={{ fontSize: 11, color: "oklch(0.55 0.03 145)", marginTop: 2, fontStyle: "italic" }}>
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
          <div style={{ flex: 1, height: 3, background: "oklch(0.95 0.015 145 / 0.14)", borderRadius: 2, overflow: "hidden" }}>
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
          <div style={{ height: 4, background: "oklch(0.95 0.015 145 / 0.14)", borderRadius: 2, overflow: "hidden" }}>
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
            background: activeCard === c.id ? c.color : "oklch(0.95 0.015 145 / 0.09)",
            border: `1px solid ${activeCard === c.id ? c.color : "oklch(0.95 0.015 145 / 0.22)"}`,
            borderRadius: 20, padding: "5px 13px", fontSize: 11,
            color: activeCard === c.id ? "#0a1a0a" : "oklch(0.85 0.015 145 / 0.72)",
            cursor: "pointer", fontWeight: 400,
            letterSpacing: "0.3px", transition: "all 0.2s",
          }}>
            {c.label}
          </button>
        ))}
      </div>

      <GlassCard borderRadius={20} style={{ padding: "20px 18px 18px", borderTop: `2px solid ${card.color}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--muted)", marginBottom: 4 }}>Air quality</div>
            <div style={{ fontFamily: "'Literata', serif", fontSize: 22, fontWeight: 300, color: "var(--text)", lineHeight: 1.1 }}>
              {card.label}<br /><em style={{ fontStyle: "normal", fontWeight: 500, color: card.color }}>{card.subtitle}</em>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Literata', serif", fontSize: 32, fontWeight: 300, color: card.color, lineHeight: 1 }}>{m.value}</div>
            <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.5px" }}>{card.unit}</div>
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ height: 6, background: "oklch(0.95 0.015 145 / 0.08)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 3, width: `${Math.min(m.pct, 100)}%`, background: `linear-gradient(90deg, ${card.color}, ${card.color}99)`, transition: "width 0.8s ease" }} />
          </div>
          <div style={{ textAlign: "right", fontSize: 10, color: card.color, marginTop: 4, letterSpacing: "0.5px", fontWeight: 500 }}>
            {m.pct.toFixed(0)}% of target
          </div>
        </div>

        {detailMap[activeCard]}

        <div style={{ background: "oklch(0.95 0.015 145 / 0.06)", borderRadius: 10, padding: "10px 12px", fontSize: 11, color: "var(--text-2)", lineHeight: 1.6, fontWeight: 300 }}>
          {card.description}
        </div>
      </GlassCard>
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

async function callClaude(base64Image, prompt, maxTokens = 256, systemPrompt = null) {
  const body = {
    model: "claude-sonnet-4-6",
    max_tokens: maxTokens,
    messages: [{
      role: "user",
      content: [
        { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64Image } },
        { type: "text", text: prompt }
      ]
    }]
  };
  if (systemPrompt) body.system = systemPrompt;
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY || "",
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  const text = data.content?.find(b => b.type === "text")?.text || "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON in response: " + text.slice(0, 100));
  return JSON.parse(jsonMatch[0]);
}

function buildAnalysisContext(plant, careContext) {
  const { lastWateredDaysAgo, lastFertilizedDaysAgo, settings, waterHistory, fertilizeHistory, weather, userProfile, room, previousAnalyses } = careContext;
  const now = new Date();
  const month = now.toLocaleString("en", { month: "long" });
  const season = [11,0,1].includes(now.getMonth()) ? "winter" : [2,3,4].includes(now.getMonth()) ? "spring" : [5,6,7].includes(now.getMonth()) ? "summer" : "autumn";

  const lines = [];

  // Location & environment
  if (userProfile?.city || userProfile?.country) {
    lines.push(`Location: ${[userProfile.city, userProfile.country].filter(Boolean).join(", ")}.`);
  }
  lines.push(`Date: ${now.toLocaleDateString("en-GB")}. Season: ${season} (${month}).`);
  if (weather) {
    lines.push(`Current weather: ${weather.condition}, ${weather.temp}${weather.unit}, humidity ${weather.humidity}%.`);
  }
  if (room) {
    lines.push(`Room: ${room.name}${room.hasWindows ? `, windows facing ${room.windowDirection || "unknown"}` : ", no windows"}.`);
  }

  // Plant basics
  lines.push(`Plant: ${plant.name}${plant.species ? ` (${plant.species})` : ""}. Light preference: ${plant.light}.`);

  // Settings
  if (settings) {
    const parts = [
      settings.potType ? `Pot: ${settings.potType}${settings.potSize ? ` ${settings.potSize}L` : ""}` : "",
      settings.soilType ? `Soil: ${settings.soilType}` : "",
      settings.lightDistance ? `Distance from window: ${settings.lightDistance}` : "",
      settings.plantedDate ? `Owned since: ${settings.plantedDate}` : "",
    ].filter(Boolean);
    if (parts.length) lines.push(parts.join(". ") + ".");
  }

  // Care schedule & history
  const waterCtx = lastWateredDaysAgo != null
    ? `Last watered ${lastWateredDaysAgo} day(s) ago (schedule: every ${plant.waterEveryDays} days).`
    : `Never watered (schedule: every ${plant.waterEveryDays} days).`;
  lines.push(waterCtx);

  if (waterHistory?.length > 1) {
    const last30 = waterHistory.filter(d => daysSince(d) <= 30).length;
    lines.push(`Watering pattern (last 30 days): ${last30} times.`);
  }

  const fertCtx = lastFertilizedDaysAgo != null
    ? `Last fertilized ${lastFertilizedDaysAgo} day(s) ago (schedule: every 30 days).`
    : `Never fertilized.`;
  lines.push(fertCtx);

  // Previous analyses
  if (previousAnalyses?.length > 0) {
    const prev = previousAnalyses.slice(-2).map(a =>
      `${new Date(a.date).toLocaleDateString("en-GB")}: "${a.headline}" (${a.urgency})`
    ).join("; ");
    lines.push(`Previous analyses: ${prev}.`);
  }

  if (plant.warning) lines.push(`Known issue: ${plant.warning}`);

  return lines.join("\n");
}

const ANALYSIS_SYSTEM_PROMPT = `You are a plant care expert analysing a photo of a houseplant. You have detailed context about the plant, its environment, care history, and current conditions.

Your job:
- Look at the photo carefully for signs of health issues (yellowing, browning, wilting, pests, leggy growth, root problems, dry/wet soil).
- Cross-reference what you see with the care data provided (watering pattern, season, light, etc).
- If the plant looks healthy and care is on track, say so briefly. DO NOT give generic advice like "continue keeping it in bright light" or "maintain your watering schedule" — the user already knows their routine.
- Only flag things that are actually wrong, changing, or need action.
- If you notice something specific in the photo (new growth, a damaged leaf, dry soil surface), mention that concrete observation.
- Be concise. One short headline + 1-2 sentences max.

Status values: "healthy" (looks good), "action" (do something now), "wait" (monitor, check again in X days).
Urgency: "low" (healthy/minor), "medium" (address soon), "high" (act now).

Reply ONLY with JSON, no markdown:
{"status":"healthy","headline":"","recommendation":"","waitDays":null,"urgency":"low"}`;

async function analyseWithClaude(base64Image, plant, careContext = {}) {
  const context = buildAnalysisContext(plant, careContext);
  return callClaude(base64Image,
    `Here is the context for this plant:\n${context}\n\nAnalyse the photo.`,
    300,
    ANALYSIS_SYSTEM_PROMPT
  );
}

const URGENCY_COLOR = { low: "#94b88a", medium: "#d4935a", high: "#c46860" };
const STATUS_ICON = { action: "✦", wait: "◷", healthy: "✓" };

function GalleryLightbox({ photos, onClose, startIndex = 0 }) {
  const [current, setCurrent] = useState(startIndex);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(30,15,5,0.96)", zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", color: "oklch(0.70 0.03 145)", fontSize: 24, cursor: "pointer", lineHeight: 1 }}>✕</button>
      <div style={{ position: "absolute", top: 24, left: 0, right: 0, textAlign: "center", fontSize: 11, color: "oklch(0.55 0.03 145)", letterSpacing: 2 }}>
        {current + 1} / {photos.length}
      </div>
      <div onClick={e => e.stopPropagation()} style={{ position: "relative" }}>
        <div style={{ background: "#fff", padding: "12px 12px 44px", boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}>
          <img src={photos[current].dataUrl} alt="" style={{ display: "block", width: 300, height: 375, objectFit: "cover" }} />
          <div style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: "#aaa", fontStyle: "italic" }}>
            {new Date(photos[current].date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 24 }} onClick={e => e.stopPropagation()}>
        <button onClick={() => setCurrent(i => Math.max(0, i - 1))} disabled={current === 0} style={{ background: "oklch(0.95 0.015 145 / 0.10)", border: "none", color: "var(--text)", borderRadius: "50%", width: 40, height: 40, fontSize: 18, cursor: "pointer", opacity: current === 0 ? 0.3 : 1 }}>‹</button>
        <button onClick={() => setCurrent(i => Math.min(photos.length - 1, i + 1))} disabled={current === photos.length - 1} style={{ background: "oklch(0.95 0.015 145 / 0.10)", border: "none", color: "var(--text)", borderRadius: "50%", width: 40, height: 40, fontSize: 18, cursor: "pointer", opacity: current === photos.length - 1 ? 0.3 : 1 }}>›</button>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 16, overflowX: "auto", padding: "4px 20px", maxWidth: 380 }} onClick={e => e.stopPropagation()}>
        {photos.map((p, i) => (
          <img key={i} src={p.dataUrl} onClick={() => setCurrent(i)} style={{ width: 48, height: 48, objectFit: "cover", opacity: i === current ? 1 : 0.5, cursor: "pointer", border: i === current ? "2px solid #f2c4a0" : "2px solid transparent", flexShrink: 0 }} />
        ))}
      </div>
    </div>
  );
}

function PlantPhotoStack({ plant, tilt, pinColor, userPhotos, setUserPhotos, careContext, db, userId }) {
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
        plant_id: plant.id, storage_path: path, data_url: publicUrl, analysis: result, user_id: userId,
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
      <div style={{ position: "relative", width: 360, height: 445, marginBottom: 8 }}>
        {stackPhotos.slice(1).reverse().map((photo, i) => {
          const stackIdx = stackPhotos.length - 1 - i;
          const offset = stackIdx * 4;
          const rot = tilt + (stackIdx % 2 === 0 ? -stackIdx * 1.5 : stackIdx * 1.5);
          return (
            <div key={i} style={{ position: "absolute", top: offset, left: "50%", transform: `translateX(-50%) rotate(${rot}deg)`, zIndex: stackIdx }}>
              <div style={{ background: "#fff", padding: "12px 12px 44px", boxShadow: "0 4px 16px rgba(60,30,10,0.14)" }}>
                <img src={photo.dataUrl} alt="" style={{ display: "block", width: 300, height: 375, objectFit: "cover" }} />
              </div>
            </div>
          );
        })}
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", zIndex: 10 }}>
          <div style={{ position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)", zIndex: 11, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: `radial-gradient(circle at 35% 35%, ${pinColor}dd, ${pinColor})`, boxShadow: "inset -2px -2px 4px rgba(0,0,0,0.25), inset 1px 1px 3px oklch(0.95 0.015 145 / 0.35)", margin: "0 auto", position: "relative" }}>
              <div style={{ position: "absolute", top: 3, left: 3, width: 5, height: 5, borderRadius: "50%", background: "oklch(0.95 0.015 145 / 0.50)" }} />
            </div>
            <div style={{ width: 2, height: 9, background: "linear-gradient(to bottom, #aaa, #ddd)", margin: "0 auto", borderRadius: "0 0 1px 1px" }} />
          </div>
          <div style={{ transform: `rotate(${tilt}deg)` }}>
            <div style={{ background: "#fff", padding: "12px 12px 44px", boxShadow: "0 6px 24px rgba(60,30,10,0.18), 0 2px 6px rgba(60,30,10,0.10)" }}>
              <img src={topPhoto ? topPhoto.dataUrl : plant.image} alt={plant.name} style={{ display: "block", width: 300, height: 375, objectFit: "cover" }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: userPhotos.length > 0 ? 16 : 8 }}>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
        <button onClick={() => fileRef.current?.click()} disabled={analysing} style={{
          background: analysing ? "oklch(0.95 0.015 145 / 0.12)" : "var(--peach-dark)",
          border: "none", borderRadius: 20, padding: "7px 16px",
          fontSize: 12, color: "var(--text)", cursor: analysing ? "default" : "pointer",
          letterSpacing: "0.5px", transition: "all 0.2s",
        }}>
          {analysing ? "Analysing…" : "+ Add photo"}
        </button>
        {userPhotos.length > 0 && (
          <button onClick={() => { setGalleryStart(0); setGallery(true); }} style={{
            background: "var(--white)", border: "1px solid oklch(0.95 0.015 145 / 0.12)",
            borderRadius: 20, padding: "7px 14px", fontSize: 12, color: "var(--muted)",
            cursor: "pointer",
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
          <div style={{ fontSize: 12, color: "oklch(0.73 0.03 145)", lineHeight: 1.65, fontWeight: 300 }}>{latestAnalysis.recommendation}</div>
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

function GlassContainer({ children, gap = 10, style = {}, className = "" }) {
  return (
    <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr", gap, ...style }} className={className}>
      {children}
    </div>
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
      const resized = await resizeImageForAPI(file, 800);
      const base64 = resized.base64;
      dataUrl = resized.dataUrl;

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
              <div style={{ marginTop: 6, height: 2, background: "oklch(0.95 0.015 145 / 0.12)", borderRadius: 1, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progress}%`, background: "var(--green)", transition: "width 0.15s ease", borderRadius: 1 }} />
              </div>
              <div className="stat-l" style={{ marginTop: 4 }}>Scanning</div>
            </>
          ) : (
            <>
              <div className="stat-n" style={{ fontSize: 36, fontWeight: 300, lineHeight: 1 }}>⟡</div>
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
  const emoji = isWater ? "" : "";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 201, display: "flex", flexDirection: "column", justifyContent: "flex-end", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#0f1a0f", borderTop: "1px solid oklch(0.95 0.015 145 / 0.15)", borderRadius: "24px 24px 0 0", padding: "24px 24px 40px", maxWidth: 430, width: "100%", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: accent, marginBottom: 2 }}>Edit date</div>
            <div style={{ fontFamily: "'Literata', serif", fontSize: 18, fontWeight: 500, color: "var(--text)" }}>{emoji} When did you {isWater ? "water" : "fertilize"}?</div>
          </div>
          <button onClick={onClose} style={{ background: "oklch(0.95 0.015 145 / 0.08)", border: "1px solid oklch(0.95 0.015 145 / 0.15)", borderRadius: "50%", width: 32, height: 32, color: "var(--text-2)", fontSize: 16, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ background: accentBg, border: `1px solid ${accentBorder}`, borderRadius: 16, padding: "4px 16px", marginBottom: 12 }}>
          <input
            type="date"
            value={dateVal}
            max={new Date().toISOString().slice(0, 10)}
            onChange={e => setDateVal(e.target.value)}
            style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontSize: 18, color: "var(--text)", padding: "12px 0", cursor: "pointer" }}
          />
        </div>
        <div style={{ fontSize: 11, color: "oklch(0.55 0.03 145)", marginBottom: 20, textAlign: "center" }}>
          This edit will be logged in your care history.
        </div>
        <button onClick={() => onConfirm(dateVal)} style={{
          width: "100%", padding: "14px",
          background: isWater ? "rgba(100,220,80,0.22)" : "rgba(212,147,90,0.22)",
         
          border: `1px solid ${isWater ? "rgba(150,255,100,0.4)" : "rgba(212,147,90,0.4)"}`,
         
          borderRadius: 20, color: isWater ? "#d4ffb0" : "#ffe0b0",
          fontSize: 14, fontWeight: 500, cursor: "pointer", letterSpacing: "0.5px",
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
      <div onClick={e => e.stopPropagation()} style={{ background: "#0f1a0f", borderTop: "1px solid oklch(0.95 0.015 145 / 0.15)", borderRadius: "24px 24px 0 0", padding: "24px 24px 40px", maxWidth: 430, width: "100%", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(212,147,90,0.8)", marginBottom: 2 }}>Fertilize</div>
            <div style={{ fontFamily: "'Literata', serif", fontSize: 18, fontWeight: 500, color: "var(--text)" }}>How much did you use?</div>
          </div>
          <button onClick={onClose} style={{ background: "oklch(0.95 0.015 145 / 0.08)", border: "1px solid oklch(0.95 0.015 145 / 0.15)", borderRadius: "50%", width: 32, height: 32, color: "var(--text-2)", fontSize: 16, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ position: "relative", height: 48, display: "flex", alignItems: "center" }}>
            <div style={{ position: "absolute", left: 0, right: 0, height: 4, background: "oklch(0.95 0.015 145 / 0.12)", borderRadius: 2 }} />
            <div style={{ position: "absolute", left: 0, height: 4, borderRadius: 2, background: "linear-gradient(90deg, rgba(212,147,90,0.6), rgba(212,147,90,1))", width: selected === 0 ? "0%" : selected === 0.5 ? "50%" : "100%", transition: "width 0.2s ease" }} />
            {DOSES.map((dose, i) => (
              <button key={dose} onClick={() => setSelected(dose)} style={{
                position: "absolute", left: i === 0 ? "0%" : i === 1 ? "50%" : "100%",
                transform: "translateX(-50%)", width: 28, height: 28, borderRadius: "50%",
                background: selected === dose ? "rgba(212,147,90,1)" : "oklch(0.95 0.015 145 / 0.15)",
                border: selected === dose ? "2px solid rgba(240,190,140,0.8)" : "2px solid oklch(0.95 0.015 145 / 0.20)",
                cursor: "pointer", transition: "all 0.15s",
                boxShadow: selected === dose ? "0 0 12px rgba(212,147,90,0.5)" : "none", zIndex: 1,
              }} />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            {DOSES.map(dose => (
              <div key={dose} onClick={() => setSelected(dose)} style={{
                fontSize: 11, cursor: "pointer",
                color: selected === dose ? "rgba(212,147,90,1)" : "oklch(0.95 0.015 145 / 0.40)",
                fontWeight: selected === dose ? 500 : 400, transition: "color 0.15s",
                width: "33%", textAlign: dose === 0 ? "left" : dose === 0.5 ? "center" : "right",
              }}>{DOSE_LABELS[dose]}</div>
            ))}
          </div>
        </div>
        <div style={{ background: "rgba(212,147,90,0.08)", border: "1px solid rgba(212,147,90,0.2)", borderRadius: 12, padding: "10px 14px", fontSize: 12, color: "oklch(0.67 0.03 145)", marginBottom: 20, minHeight: 38 }}>
          {DOSE_DESC[selected]}
        </div>
        <button onClick={() => onConfirm(selected)} style={{
          width: "100%", padding: "14px",
          background: "rgba(212,147,90,0.22)",
          border: "1px solid rgba(212,147,90,0.4)",
          borderRadius: 20, color: "#ffe0b0", fontSize: 14,
          fontWeight: 500, cursor: "pointer", letterSpacing: "0.5px",
        }}>Log {DOSE_LABELS[selected]}</button>
      </div>
    </div>
  );
}

// ── PlantSettingsModal ─────────────────────────────────────────────────────
const POT_TYPES = ["Terracotta", "Ceramic", "Plastic", "Fabric", "Self-watering", "Other"];
const LIGHT_DISTANCES = ["Near window", "1m", "2m", "3m", "4m", "5m", "No light"];

function PlantSettingsModal({ plant, settings, nicknames, rooms, onSave, onDelete, onClose }) {
  const [nickname, setNickname] = useState(nicknames[plant.id] || "");
  const [plantedDate, setPlantedDate] = useState(settings.plantedDate || "");
  const [potType, setPotType] = useState(settings.potType || "");
  const [potSize, setPotSize] = useState(settings.potSize || "");
  const [soilType, setSoilType] = useState(settings.soilType || "");
  const [location, setLocation] = useState(settings.location || "");
  const [room, setRoom] = useState(settings.room || "");
  const [lightDistance, setLightDistance] = useState(settings.lightDistance || "");
  const [deleteMode, setDeleteMode] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  const inputStyle = {
    background: "oklch(0.95 0.015 145 / 0.08)", border: "1px solid oklch(0.95 0.015 145 / 0.18)",
    borderRadius: 12, padding: "11px 14px", fontSize: 13,
    color: "var(--text)", outline: "none",
    width: "100%", boxSizing: "border-box",
  };
  const labelStyle = { fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "oklch(0.60 0.03 145)", marginBottom: 8, display: "block" };
  const sectionStyle = { display: "flex", flexDirection: "column", gap: 4 };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 210, display: "flex", flexDirection: "column", justifyContent: "flex-end", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#0f1a0f", borderTop: "1px solid oklch(0.95 0.015 145 / 0.15)", borderRadius: "24px 24px 0 0", padding: "24px 24px 44px", maxWidth: 430, width: "100%", margin: "0 auto", maxHeight: "88vh", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "var(--green)", marginBottom: 2 }}>Plant settings</div>
            <div style={{ fontFamily: "'Literata', serif", fontSize: 18, fontWeight: 500, color: "var(--text)" }}>{plant.name}</div>
          </div>
          <button onClick={onClose} style={{ background: "oklch(0.95 0.015 145 / 0.08)", border: "1px solid oklch(0.95 0.015 145 / 0.15)", borderRadius: "50%", width: 32, height: 32, color: "var(--text-2)", fontSize: 16, cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Nickname */}
          <div style={sectionStyle}>
            <label style={labelStyle}>Nickname</label>
            <input style={inputStyle} placeholder="Give it a name…" value={nickname} onChange={e => setNickname(e.target.value)} />
          </div>

          {/* Planted date */}
          <div style={sectionStyle}>
            <label style={labelStyle}>Plant age — when did you get it?</label>
            <input type="date" style={inputStyle} value={plantedDate} max={new Date().toISOString().slice(0, 10)} onChange={e => setPlantedDate(e.target.value)} />
          </div>

          {/* Pot type */}
          <div style={sectionStyle}>
            <label style={labelStyle}>Pot type</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {POT_TYPES.map(t => (
                <button key={t} onClick={() => setPotType(t === potType ? "" : t)} style={{
                  padding: "7px 13px", borderRadius: 20, border: "1px solid",
                  borderColor: potType === t ? "rgba(74,222,128,0.5)" : "oklch(0.95 0.015 145 / 0.15)",
                  background: potType === t ? "rgba(74,222,128,0.15)" : "oklch(0.95 0.015 145 / 0.06)",
                  color: potType === t ? "var(--green)" : "oklch(0.95 0.015 145 / 0.60)",
                  fontSize: 12, cursor: "pointer",
                }}>{t}</button>
              ))}
            </div>
          </div>

          {/* Pot size */}
          <div style={sectionStyle}>
            <label style={labelStyle}>Pot size (liters)</label>
            <input style={inputStyle} type="text" inputMode="decimal" placeholder="e.g. 2.5" value={potSize} onChange={e => setPotSize(e.target.value.replace(/[^0-9.]/g, ""))} />
          </div>

          {/* Soil type */}
          <div style={sectionStyle}>
            <label style={labelStyle}>Soil type</label>
            <input style={inputStyle} placeholder="e.g. Peat-free, perlite mix…" value={soilType} onChange={e => setSoilType(e.target.value)} />
          </div>

          {/* Location */}
          <div style={sectionStyle}>
            <label style={labelStyle}>Location</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {[{ id: "in-door", label: "In-door" }, { id: "balcony", label: "Balcony" }, { id: "garden", label: "Garden" }].map(l => (
                <button key={l.id} onClick={() => { setLocation(l.id === location ? "" : l.id); if (l.id !== "in-door") setRoom(""); }} style={{
                  padding: "7px 13px", borderRadius: 20, border: "1px solid",
                  borderColor: location === l.id ? "rgba(74,222,128,0.5)" : "oklch(0.95 0.015 145 / 0.15)",
                  background: location === l.id ? "rgba(74,222,128,0.15)" : "oklch(0.95 0.015 145 / 0.06)",
                  color: location === l.id ? "var(--green)" : "oklch(0.95 0.015 145 / 0.60)",
                  fontSize: 12, cursor: "pointer",
                }}>{l.label}</button>
              ))}
            </div>
          </div>

          {/* Room — only visible when location is in-door */}
          {location === "in-door" && rooms.length > 0 && (
            <div style={sectionStyle}>
              <label style={labelStyle}>Room</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {rooms.map(r => (
                  <button key={r.id} onClick={() => setRoom(r.name)} style={{
                    padding: "7px 13px", borderRadius: 20, border: "1px solid",
                    borderColor: room === r.name ? "rgba(74,222,128,0.5)" : "oklch(0.95 0.015 145 / 0.15)",
                    background: room === r.name ? "rgba(74,222,128,0.15)" : "oklch(0.95 0.015 145 / 0.06)",
                    color: room === r.name ? "var(--green)" : "oklch(0.95 0.015 145 / 0.60)",
                    fontSize: 12, cursor: "pointer",
                  }}>{r.name}</button>
                ))}
              </div>
            </div>
          )}

          {/* Distance from light */}
          <div style={sectionStyle}>
            <label style={labelStyle}>Distance from light source</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {LIGHT_DISTANCES.map(d => (
                <button key={d} onClick={() => setLightDistance(d === lightDistance ? "" : d)} style={{
                  padding: "7px 13px", borderRadius: 20, border: "1px solid",
                  borderColor: lightDistance === d ? "rgba(74,222,128,0.5)" : "oklch(0.95 0.015 145 / 0.15)",
                  background: lightDistance === d ? "rgba(74,222,128,0.15)" : "oklch(0.95 0.015 145 / 0.06)",
                  color: lightDistance === d ? "var(--green)" : "oklch(0.95 0.015 145 / 0.60)",
                  fontSize: 12, cursor: "pointer",
                }}>{d}</button>
              ))}
            </div>
          </div>

        </div>

        <button onClick={() => onSave({ nickname, plantedDate, potType, potSize, soilType, location, room: location === "in-door" ? room : "", lightDistance })} style={{
          width: "100%", padding: "14px", marginTop: 24,
          background: "rgba(100,220,80,0.22)",
          border: "1px solid rgba(150,255,100,0.4)",
          borderRadius: 20, color: "#d4ffb0",
          fontSize: 14, fontWeight: 500,
          cursor: "pointer", letterSpacing: "0.3px",
        }}>Save settings</button>

        <button onClick={() => setDeleteMode(true)} style={{
          width: "100%", padding: "12px", marginTop: 10,
          background: "transparent", border: "1px solid rgba(248,113,113,0.25)",
          borderRadius: 20, color: "rgba(248,113,113,0.6)",
          fontSize: 13,
          cursor: "pointer", letterSpacing: "0.3px",
        }}>Delete plant</button>

        {/* Delete confirmation overlay */}
        {deleteMode && (
          <div style={{ position: "fixed", inset: 0, zIndex: 220, display: "flex", flexDirection: "column", justifyContent: "flex-end", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }} onClick={() => { setDeleteMode(false); setDeleteInput(""); }}>
            <div onClick={e => e.stopPropagation()} style={{ background: "#1a0a0a", borderTop: "1px solid rgba(248,113,113,0.25)", borderRadius: "24px 24px 0 0", padding: "28px 24px 44px", maxWidth: 430, width: "100%", margin: "0 auto" }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(248,113,113,0.8)", marginBottom: 6 }}>Permanent action</div>
                <div style={{ fontFamily: "'Literata', serif", fontSize: 18, fontWeight: 500, color: "var(--text)", marginBottom: 8 }}>Delete {plant.name}?</div>
                <div style={{ fontSize: 13, color: "oklch(0.60 0.03 145)", lineHeight: 1.6 }}>
                  This will remove all care logs, photos, and settings for this plant. Type <span style={{ color: "#f87171", fontWeight: 500 }}>delete plant</span> to confirm.
                </div>
              </div>
              <input
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
                placeholder="delete plant"
                autoFocus
                style={{
                  width: "100%", boxSizing: "border-box", background: "rgba(248,113,113,0.08)",
                  border: "1px solid rgba(248,113,113,0.30)", borderRadius: 12,
                  padding: "12px 14px", fontSize: 14, color: "var(--text)",
                  outline: "none", marginBottom: 12,
                }}
              />
              <button
                onClick={() => deleteInput === "delete plant" && onDelete()}
                disabled={deleteInput !== "delete plant"}
                style={{
                  width: "100%", padding: "14px",
                  background: deleteInput === "delete plant" ? "rgba(248,113,113,0.25)" : "oklch(0.95 0.015 145 / 0.05)",
                  border: `1px solid ${deleteInput === "delete plant" ? "rgba(248,113,113,0.5)" : "oklch(0.95 0.015 145 / 0.10)"}`,
                  borderRadius: 20, color: deleteInput === "delete plant" ? "#f87171" : "oklch(0.95 0.015 145 / 0.20)",
                  fontSize: 14, fontWeight: 500,
                  cursor: deleteInput === "delete plant" ? "pointer" : "default",
                  transition: "all 0.15s",
                }}
              >Delete plant</button>
              <button onClick={() => { setDeleteMode(false); setDeleteInput(""); }} style={{ width: "100%", padding: "10px", marginTop: 8, background: "none", border: "none", color: "oklch(0.50 0.03 145)", fontSize: 13, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── WaterCheckModal ────────────────────────────────────────────────────────
function WaterCheckModal({ plant, lastWatered, onWaterNow, onPostpone, onClose }) {
  const days = daysSince(lastWatered);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", flexDirection: "column", justifyContent: "flex-end", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#0f1a0f", borderTop: "1px solid oklch(0.95 0.015 145 / 0.15)", borderRadius: "24px 24px 0 0", padding: "28px 24px 44px", maxWidth: 430, width: "100%", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 24 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(100,220,80,0.8)", marginBottom: 6 }}>Watering check</div>
            <div style={{ fontFamily: "'Literata', serif", fontSize: 20, fontWeight: 500, color: "var(--text)", lineHeight: 1.3 }}>Is the soil ready<br />to be watered?</div>
            {days !== null && (
              <div style={{ fontSize: 12, color: "oklch(0.60 0.03 145)", marginTop: 8 }}>
                {days < 0 ? "Postponed" : days === 0 ? "Watered today" : `Last watered ${days}d ago`} · schedule every {plant.waterEveryDays}d
              </div>
            )}
          </div>
          <button onClick={onClose} style={{ background: "oklch(0.95 0.015 145 / 0.08)", border: "1px solid oklch(0.95 0.015 145 / 0.15)", borderRadius: "50%", width: 32, height: 32, color: "var(--text-2)", fontSize: 16, cursor: "pointer", flexShrink: 0 }}>✕</button>
        </div>
        <div style={{ background: "oklch(0.95 0.015 145 / 0.06)", borderRadius: 14, padding: "12px 16px", marginBottom: 20, fontSize: 12, color: "oklch(0.63 0.03 145)", lineHeight: 1.6 }}>
          Stick your finger 2–3 cm into the soil. Dry? Water now. Still damp? Postpone.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={onWaterNow} style={{
            width: "100%", padding: "15px",
            background: "rgba(100,220,80,0.22)",
            border: "1px solid rgba(150,255,100,0.40)",
            borderRadius: 20,
            color: "#d4ffb0", fontSize: 15, fontWeight: 500, cursor: "pointer",
          }}>Soil is dry — water now</button>
          <button onClick={onPostpone} style={{
            width: "100%", padding: "15px",
            background: "rgba(138,180,200,0.15)",
            border: "1px solid rgba(138,180,200,0.30)",
            borderRadius: 20, color: "#b8dff0", fontSize: 15, fontWeight: 500, cursor: "pointer",
          }}>Still wet — postpone</button>
        </div>
      </div>
    </div>
  );
}

// ── PostponeModal ──────────────────────────────────────────────────────────
function PostponeModal({ plant, onConfirm, onClose }) {
  const QUICK_OPTIONS = [1, 2, 3];
  const [selected, setSelected] = useState(1);
  const [customMode, setCustomMode] = useState(false);
  const [customVal, setCustomVal] = useState("");

  const effectiveDays = customMode ? (parseInt(customVal) > 0 ? parseInt(customVal) : null) : selected;
  const nextWaterDate = effectiveDays
    ? new Date(Date.now() + effectiveDays * 86400000).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
    : null;

  function handleQuickSelect(d) { setSelected(d); setCustomMode(false); setCustomVal(""); }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 201, display: "flex", flexDirection: "column", justifyContent: "flex-end", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#0f1a0f", borderTop: "1px solid oklch(0.95 0.015 145 / 0.15)", borderRadius: "24px 24px 0 0", padding: "28px 24px 44px", maxWidth: 430, width: "100%", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 24 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(138,180,200,0.9)", marginBottom: 6 }}>Postpone watering</div>
            <div style={{ fontFamily: "'Literata', serif", fontSize: 20, fontWeight: 500, color: "var(--text)", lineHeight: 1.3 }}>Skip how many days?</div>
          </div>
          <button onClick={onClose} style={{ background: "oklch(0.95 0.015 145 / 0.08)", border: "1px solid oklch(0.95 0.015 145 / 0.15)", borderRadius: "50%", width: 32, height: 32, color: "var(--text-2)", fontSize: 16, cursor: "pointer", flexShrink: 0 }}>✕</button>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {QUICK_OPTIONS.map(d => (
            <button key={d} onClick={() => handleQuickSelect(d)} style={{
              flex: 1, padding: "14px 0", borderRadius: 16, border: "1px solid",
              borderColor: !customMode && selected === d ? "rgba(138,180,200,0.55)" : "oklch(0.95 0.015 145 / 0.14)",
              borderTopColor: !customMode && selected === d ? "rgba(180,220,240,0.75)" : "oklch(0.95 0.015 145 / 0.22)",
              background: !customMode && selected === d ? "rgba(138,180,200,0.25)" : "oklch(0.95 0.015 145 / 0.07)",
              color: !customMode && selected === d ? "#b8dff0" : "oklch(0.95 0.015 145 / 0.55)",
              fontSize: 22, fontWeight: 600,
              cursor: "pointer", transition: "all 0.15s",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            }}>
              {d}
              <span style={{ fontSize: 10, letterSpacing: "1px", textTransform: "uppercase", fontWeight: 400, opacity: 0.7 }}>{d === 1 ? "day" : "days"}</span>
            </button>
          ))}
          <button onClick={() => { setCustomMode(true); setCustomVal(""); }} style={{
            flex: 1, padding: "14px 0", borderRadius: 16, border: "1px solid",
            borderColor: customMode ? "rgba(138,180,200,0.55)" : "oklch(0.95 0.015 145 / 0.14)",
            borderTopColor: customMode ? "rgba(180,220,240,0.75)" : "oklch(0.95 0.015 145 / 0.22)",
            background: customMode ? "rgba(138,180,200,0.25)" : "oklch(0.95 0.015 145 / 0.07)",
            color: customMode ? "#b8dff0" : "oklch(0.95 0.015 145 / 0.55)",
            fontSize: 13, fontWeight: 500,
            cursor: "pointer", transition: "all 0.15s",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          }}>
            <span style={{ fontSize: 18, fontWeight: 600 }}>···</span>
            <span style={{ fontSize: 10, letterSpacing: "1px", textTransform: "uppercase", fontWeight: 400, opacity: 0.7 }}>custom</span>
          </button>
        </div>

        {customMode && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ background: "rgba(138,180,200,0.10)", border: "1px solid rgba(138,180,200,0.30)", borderRadius: 14, padding: "4px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="text" inputMode="numeric" pattern="[0-9]*" placeholder="0"
                value={customVal} onChange={e => setCustomVal(e.target.value.replace(/\D/g, ""))}
                autoFocus
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 28, fontWeight: 600, color: "#b8dff0", padding: "10px 0", width: "100%", textAlign: "center" }}
              />
              <span style={{ fontSize: 13, color: "oklch(0.55 0.03 145)", flexShrink: 0 }}>days</span>
            </div>
          </div>
        )}

        {nextWaterDate
          ? <div style={{ background: "oklch(0.95 0.015 145 / 0.05)", borderRadius: 12, padding: "10px 16px", marginBottom: 20, fontSize: 12, color: "oklch(0.60 0.03 145)", textAlign: "center" }}>
              Next watering reminder: <span style={{ color: "#b8dff0", fontWeight: 500 }}>{nextWaterDate}</span>
            </div>
          : <div style={{ marginBottom: 20 }} />
        }

        <button
          onClick={() => effectiveDays && onConfirm(effectiveDays)}
          disabled={!effectiveDays}
          style={{
            width: "100%", padding: "15px",
            background: effectiveDays ? "rgba(138,180,200,0.22)" : "oklch(0.95 0.015 145 / 0.06)",
           
            border: `1px solid ${effectiveDays ? "rgba(138,180,200,0.40)" : "oklch(0.95 0.015 145 / 0.10)"}`,
            borderTopColor: effectiveDays ? "rgba(180,220,240,0.65)" : "oklch(0.95 0.015 145 / 0.15)",
            borderRadius: 20,
            color: effectiveDays ? "#b8dff0" : "oklch(0.95 0.015 145 / 0.25)",
            fontSize: 15, fontWeight: 500,
            cursor: effectiveDays ? "pointer" : "default", transition: "all 0.15s",
          }}
        >
          {effectiveDays ? `Postpone ${effectiveDays} ${effectiveDays === 1 ? "day" : "days"}` : "Enter days to postpone"}
        </button>
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
      const envContext = buildAnalysisContext(plant, careContext);
      const systemContext = `You are a knowledgeable plant care assistant. The user is asking about their plant. Here is everything you know:

${envContext}
${latestAnalysis ? `\nLatest photo analysis: "${latestAnalysis.headline}" — ${latestAnalysis.recommendation} (urgency: ${latestAnalysis.urgency})` : ""}

Rules:
- Give concise, practical answers. 2-4 sentences max.
- Reference specific details from the context (season, weather, their watering pattern, pot type, window direction) when relevant.
- Don't repeat information the user already knows from their care log.
- If they ask something you can answer from context, answer directly. Don't say "I'd need to see" when you have data.`;

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
      <div onClick={e => e.stopPropagation()} style={{ background: "#0f1a0f", borderTop: "1px solid oklch(0.95 0.015 145 / 0.15)", borderRadius: "24px 24px 0 0", maxHeight: "75vh", display: "flex", flexDirection: "column", maxWidth: 430, width: "100%", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "16px 20px 12px", borderBottom: "1px solid oklch(0.95 0.015 145 / 0.08)" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "var(--green)", marginBottom: 2 }}>AI Assistant</div>
            <div style={{ fontSize: 16, fontWeight: 500, color: "var(--text)" }}>Consult Gardener</div>
          </div>
          <button onClick={onClose} style={{ background: "oklch(0.95 0.015 145 / 0.08)", border: "1px solid oklch(0.95 0.015 145 / 0.15)", borderRadius: "50%", width: 32, height: 32, color: "var(--text-2)", fontSize: 16, cursor: "pointer" }}>✕</button>
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
              background: m.role === "user" ? "rgba(74,222,128,0.18)" : "oklch(0.95 0.015 145 / 0.09)",
              border: `1px solid ${m.role === "user" ? "rgba(74,222,128,0.3)" : "oklch(0.95 0.015 145 / 0.15)"}`,
              borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              padding: "10px 14px", fontSize: 13, color: "var(--text)", lineHeight: 1.55,
            }}>{m.text}</div>
          ))}
          {loading && <div style={{ alignSelf: "flex-start", background: "oklch(0.95 0.015 145 / 0.09)", border: "1px solid oklch(0.95 0.015 145 / 0.15)", borderRadius: "18px 18px 18px 4px", padding: "10px 14px", fontSize: 13, color: "var(--text-2)" }}>Thinking…</div>}
          <div ref={bottomRef} />
        </div>
        <div style={{ padding: "8px 12px 20px", display: "flex", gap: 8, alignItems: "center" }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask about your plant…"
            style={{ flex: 1, background: "oklch(0.95 0.015 145 / 0.08)", border: "1px solid oklch(0.95 0.015 145 / 0.18)", borderRadius: 20, padding: "10px 16px", fontSize: 13, color: "var(--text)", outline: "none" }} />
          <button onClick={send} disabled={!input.trim() || loading} style={{ background: "var(--green)", border: "none", borderRadius: "50%", width: 38, height: 38, fontSize: 16, cursor: "pointer", color: "#0a1a0a", flexShrink: 0, opacity: (!input.trim() || loading) ? 0.4 : 1, transition: "opacity 0.15s" }}>↑</button>
        </div>
      </div>
    </div>
  );
}

// ── Postal code validation ────────────────────────────────────────────────
const POSTAL_RULES = {
  US: { pattern: /^\d{5}$/, hint: "5 digits (e.g. 90210)" },
  GB: { pattern: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i, hint: "e.g. SW1A 1AA" },
  DE: { pattern: /^\d{5}$/, hint: "5 digits" },
  FR: { pattern: /^\d{5}$/, hint: "5 digits" },
  MD: { pattern: /^(MD-?)?\d{4}$/, hint: "4 digits (e.g. 2001)" },
  CA: { pattern: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i, hint: "e.g. K1A 0B1" },
};

function validatePostal(code, countryCode) {
  if (!code || code.trim().length < 2) return false;
  const rule = POSTAL_RULES[countryCode];
  if (rule) return rule.pattern.test(code.trim());
  return code.trim().length >= 2 && code.trim().length <= 10;
}

function getPostalHint(countryCode) {
  return POSTAL_RULES[countryCode]?.hint || "2-10 characters";
}

// ── Country list (ISO 3166-1) ─────────────────────────────────────────────
const COUNTRIES = [
  { code: "AF", name: "Afghanistan" }, { code: "AL", name: "Albania" }, { code: "DZ", name: "Algeria" },
  { code: "AR", name: "Argentina" }, { code: "AM", name: "Armenia" }, { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" }, { code: "AZ", name: "Azerbaijan" }, { code: "BD", name: "Bangladesh" },
  { code: "BY", name: "Belarus" }, { code: "BE", name: "Belgium" }, { code: "BA", name: "Bosnia and Herzegovina" },
  { code: "BR", name: "Brazil" }, { code: "BG", name: "Bulgaria" }, { code: "CA", name: "Canada" },
  { code: "CL", name: "Chile" }, { code: "CN", name: "China" }, { code: "CO", name: "Colombia" },
  { code: "HR", name: "Croatia" }, { code: "CZ", name: "Czech Republic" }, { code: "DK", name: "Denmark" },
  { code: "EC", name: "Ecuador" }, { code: "EG", name: "Egypt" }, { code: "EE", name: "Estonia" },
  { code: "FI", name: "Finland" }, { code: "FR", name: "France" }, { code: "GE", name: "Georgia" },
  { code: "DE", name: "Germany" }, { code: "GR", name: "Greece" }, { code: "HU", name: "Hungary" },
  { code: "IS", name: "Iceland" }, { code: "IN", name: "India" }, { code: "ID", name: "Indonesia" },
  { code: "IE", name: "Ireland" }, { code: "IL", name: "Israel" }, { code: "IT", name: "Italy" },
  { code: "JP", name: "Japan" }, { code: "KZ", name: "Kazakhstan" }, { code: "KE", name: "Kenya" },
  { code: "KR", name: "South Korea" }, { code: "LV", name: "Latvia" }, { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" }, { code: "MY", name: "Malaysia" }, { code: "MX", name: "Mexico" },
  { code: "MD", name: "Moldova" }, { code: "ME", name: "Montenegro" }, { code: "MA", name: "Morocco" },
  { code: "NL", name: "Netherlands" }, { code: "NZ", name: "New Zealand" }, { code: "NG", name: "Nigeria" },
  { code: "MK", name: "North Macedonia" }, { code: "NO", name: "Norway" }, { code: "PK", name: "Pakistan" },
  { code: "PE", name: "Peru" }, { code: "PH", name: "Philippines" }, { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" }, { code: "RO", name: "Romania" }, { code: "RU", name: "Russia" },
  { code: "RS", name: "Serbia" }, { code: "SG", name: "Singapore" }, { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" }, { code: "ZA", name: "South Africa" }, { code: "ES", name: "Spain" },
  { code: "SE", name: "Sweden" }, { code: "CH", name: "Switzerland" }, { code: "TW", name: "Taiwan" },
  { code: "TH", name: "Thailand" }, { code: "TR", name: "Turkey" }, { code: "UA", name: "Ukraine" },
  { code: "AE", name: "United Arab Emirates" }, { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" }, { code: "UY", name: "Uruguay" }, { code: "UZ", name: "Uzbekistan" },
  { code: "VN", name: "Vietnam" },
];

// ── Onboarding Flow ───────────────────────────────────────────────────────
const TOTAL_STEPS = 4; // name, location, postal, room (room only if in-house)

function OnboardingFlow({ user, onComplete }) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1: Name
  const [displayName, setDisplayName] = useState("");
  // Step 2: Location types
  const [locationTypes, setLocationTypes] = useState([]);
  // Step 3: Country + Postal
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [postalError, setPostalError] = useState("");
  // Step 4: Room creation (only if in-house)
  const [roomName, setRoomName] = useState("");
  const [roomSize, setRoomSize] = useState("");
  const [tempUnit, setTempUnit] = useState("C");
  const [roomTemp, setRoomTemp] = useState("");
  const [hasWindows, setHasWindows] = useState(true);
  const [windowDir, setWindowDir] = useState("");
  const [compassMode, setCompassMode] = useState("manual"); // "live" | "manual"
  const [compassHeading, setCompassHeading] = useState(null);
  const [compassAvailable, setCompassAvailable] = useState(false);

  const needsRoom = locationTypes.includes("in-house");
  const totalSteps = needsRoom ? 4 : 3;

  // Compass setup
  useEffect(() => {
    if (step !== 4 || !hasWindows) return;
    let handler = null;

    async function tryCompass() {
      // iOS requires permission
      if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
        try {
          const perm = await DeviceOrientationEvent.requestPermission();
          if (perm !== "granted") { setCompassMode("manual"); return; }
        } catch { setCompassMode("manual"); return; }
      }
      handler = (e) => {
        const heading = e.webkitCompassHeading ?? (e.alpha != null ? (360 - e.alpha) % 360 : null);
        if (heading != null) {
          setCompassHeading(heading);
          setCompassAvailable(true);
          setCompassMode("live");
        }
      };
      window.addEventListener("deviceorientation", handler, true);
      // Fallback if no data in 2s
      setTimeout(() => {
        if (!compassAvailable) setCompassMode("manual");
      }, 2000);
    }
    tryCompass();
    return () => { if (handler) window.removeEventListener("deviceorientation", handler, true); };
  }, [step, hasWindows]);

  function headingToDirection(deg) {
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const idx = Math.round(deg / 45) % 8;
    return dirs[idx];
  }

  function setCompassDirection() {
    if (compassHeading != null) {
      setWindowDir(headingToDirection(compassHeading));
    }
  }

  async function handleComplete() {
    setSaving(true);
    const profile = {
      user_id: user.id,
      display_name: displayName.trim(),
      location_types: locationTypes,
      country,
      postal_code: postalCode.trim(),
      temp_unit: tempUnit,
      room_name: needsRoom ? roomName.trim() : null,
      room_size: needsRoom ? roomSize : null,
      room_temperature: needsRoom && roomTemp ? parseFloat(roomTemp) : null,
      has_windows: needsRoom ? hasWindows : null,
      window_direction: needsRoom && hasWindows ? windowDir : null,
      onboarding_complete: true,
      onboarding_step: totalSteps,
    };
    await supabase.from("user_profiles").upsert(profile, { onConflict: "user_id" });
    // Also insert into rooms table if in-house
    if (needsRoom && roomName.trim()) {
      await supabase.from("rooms").insert({
        user_id: user.id,
        name: roomName.trim(),
        size: roomSize || null,
        temperature: roomTemp ? parseFloat(roomTemp) : null,
        has_windows: hasWindows,
        window_direction: hasWindows ? windowDir : null,
      });
    }
    setSaving(false);
    onComplete(profile);
  }

  async function saveProgress(nextStep) {
    // Fire and forget — save partial progress
    const partial = {
      user_id: user.id,
      onboarding_step: step,
      onboarding_complete: false,
    };
    if (step >= 1) partial.display_name = displayName.trim();
    if (step >= 2) partial.location_types = locationTypes;
    if (step >= 3) { partial.country = country; partial.postal_code = postalCode.trim(); }
    await supabase.from("user_profiles").upsert(partial, { onConflict: "user_id" });
    setStep(nextStep);
  }

  const DIRECTIONS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const DIR_POSITIONS = {
    N:  { top: 4, left: "50%", transform: "translateX(-50%)" },
    NE: { top: 28, right: 16 },
    E:  { top: "50%", right: 0, transform: "translateY(-50%)" },
    SE: { bottom: 28, right: 16 },
    S:  { bottom: 4, left: "50%", transform: "translateX(-50%)" },
    SW: { bottom: 28, left: 16 },
    W:  { top: "50%", left: 0, transform: "translateY(-50%)" },
    NW: { top: 28, left: 16 },
  };

  return (
    <div className="fade-up">
      {/* Step indicator */}
      <div style={{ padding: "20px 24px 0" }}>
        <div className="ob-step-indicator">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`ob-step-dot${i + 1 < step ? " done" : i + 1 === step ? " active" : ""}`} />
          ))}
        </div>
      </div>

      {/* ── Step 1: Name ── */}
      {step === 1 && (
        <div className="ob-screen">
          <div className="ob-tag">Welcome</div>
          <div className="ob-title">What should we call you?</div>
          <div className="ob-subtitle">This helps us personalize your experience.</div>
          <input
            className="ob-input"
            placeholder="Your name"
            value={displayName}
            onChange={e => setDisplayName(e.target.value.slice(0, 50))}
            autoFocus
            onKeyDown={e => e.key === "Enter" && displayName.trim().length >= 2 && saveProgress(2)}
          />
          {displayName.length > 0 && displayName.trim().length < 2 && (
            <div className="ob-error">At least 2 characters</div>
          )}
          <button className="ob-btn" disabled={displayName.trim().length < 2} onClick={() => saveProgress(2)}>
            Continue
          </button>
        </div>
      )}

      {/* ── Step 2: Location types ── */}
      {step === 2 && (
        <div className="ob-screen">
          <div className="ob-tag">Your plants</div>
          <div className="ob-title">Where do you keep your plants?</div>
          <div className="ob-subtitle">Select all that apply.</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { id: "in-house", label: "In-house", icon: "⌂" },
              { id: "balcony", label: "Balcony", icon: "☐" },
              { id: "garden", label: "Garden", icon: "✿" },
            ].map(loc => {
              const selected = locationTypes.includes(loc.id);
              return (
                <div key={loc.id} className={`ob-loc-card${selected ? " selected" : ""}`}
                  onClick={() => setLocationTypes(prev =>
                    selected ? prev.filter(t => t !== loc.id) : [...prev, loc.id]
                  )}>
                  <div className="ob-loc-icon">{loc.icon}</div>
                  <div className="ob-loc-label">{loc.label}</div>
                  <div className={`ob-loc-check${selected ? " on" : ""}`}>{selected ? "✓" : ""}</div>
                </div>
              );
            })}
          </div>
          <button className="ob-btn" disabled={locationTypes.length === 0} onClick={() => saveProgress(3)}>
            Continue
          </button>
        </div>
      )}

      {/* ── Step 3: Country + Postal Code ── */}
      {step === 3 && (
        <div className="ob-screen">
          <div className="ob-tag">Location</div>
          <div className="ob-title">Where are you located?</div>
          <div className="ob-subtitle">We use this to understand your local weather and light conditions. We never see your exact address.</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <select
              className="ob-select"
              value={country}
              onChange={e => { setCountry(e.target.value); setPostalCode(""); setPostalError(""); }}
            >
              <option value="">Select country</option>
              {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
            {country && (
              <>
                <input
                  className="ob-input"
                  placeholder={`Postal code (${getPostalHint(country)})`}
                  value={postalCode}
                  onChange={e => { setPostalCode(e.target.value.slice(0, 10)); setPostalError(""); }}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      if (!validatePostal(postalCode, country)) {
                        setPostalError(`Invalid format. Expected: ${getPostalHint(country)}`);
                      } else {
                        needsRoom ? saveProgress(4) : handleComplete();
                      }
                    }
                  }}
                />
                {postalError && <div className="ob-error">{postalError}</div>}
              </>
            )}
          </div>
          <button className="ob-btn" disabled={!country || !postalCode.trim()} onClick={() => {
            if (!validatePostal(postalCode, country)) {
              setPostalError(`Invalid format. Expected: ${getPostalHint(country)}`);
              return;
            }
            if (needsRoom) saveProgress(4);
            else handleComplete();
          }}>
            {saving ? "Saving..." : needsRoom ? "Continue" : "Complete setup"}
          </button>
        </div>
      )}

      {/* ── Step 4: Create Room ── */}
      {step === 4 && needsRoom && (
        <div className="ob-screen" style={{ justifyContent: "flex-start", paddingTop: 20, paddingBottom: 40, overflowY: "auto" }}>
          <div className="ob-tag">Your first room</div>
          <div className="ob-title">Set up where your plants live</div>
          <div className="ob-subtitle">This helps us give accurate light and care advice.</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Room name */}
            <div>
              <div style={{ fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "oklch(0.60 0.03 145)", marginBottom: 8 }}>Room name</div>
              <input className="ob-input" placeholder="e.g. Living Room, Bedroom" value={roomName} onChange={e => setRoomName(e.target.value.slice(0, 40))} />
            </div>

            {/* Room size */}
            <div>
              <div style={{ fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "oklch(0.60 0.03 145)", marginBottom: 8 }}>Room size</div>
              <div style={{ display: "flex", gap: 8 }}>
                {["Small", "Medium", "Large"].map(s => (
                  <div key={s} className={`ob-size-card${roomSize === s ? " selected" : ""}`} onClick={() => setRoomSize(s)}>
                    <div className="ob-size-label">{s}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Temperature + unit toggle */}
            <div>
              <div style={{ fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "oklch(0.60 0.03 145)", marginBottom: 8 }}>Average temperature</div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  className="ob-input"
                  style={{ flex: 1 }}
                  type="text" inputMode="decimal"
                  placeholder={tempUnit === "C" ? "e.g. 22" : "e.g. 72"}
                  value={roomTemp}
                  onChange={e => setRoomTemp(e.target.value.replace(/[^0-9.]/g, ""))}
                />
                <div className="ob-toggle" style={{ width: 100, flexShrink: 0 }}>
                  <button className={tempUnit === "C" ? "active" : ""} onClick={() => setTempUnit("C")}>°C</button>
                  <button className={tempUnit === "F" ? "active" : ""} onClick={() => setTempUnit("F")}>°F</button>
                </div>
              </div>
              {roomTemp && (() => {
                const v = parseFloat(roomTemp);
                const min = tempUnit === "C" ? 5 : 41;
                const max = tempUnit === "C" ? 40 : 104;
                if (v < min || v > max) return <div style={{ fontSize: 11, color: "rgba(212,147,90,0.8)", marginTop: 6 }}>That seems unusual — are you sure?</div>;
                return null;
              })()}
            </div>

            {/* Windows */}
            <div>
              <div style={{ fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "oklch(0.60 0.03 145)", marginBottom: 8 }}>Does the room have windows?</div>
              <div className="ob-toggle" style={{ width: 160 }}>
                <button className={hasWindows ? "active" : ""} onClick={() => setHasWindows(true)}>Yes</button>
                <button className={!hasWindows ? "active" : ""} onClick={() => { setHasWindows(false); setWindowDir(""); }}>No</button>
              </div>
            </div>

            {/* Window direction */}
            {hasWindows && (
              <div>
                <div style={{ fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "oklch(0.60 0.03 145)", marginBottom: 8 }}>Window direction</div>
                {compassMode === "live" && compassHeading != null ? (
                  <div style={{ textAlign: "center" }}>
                    <div className="ob-compass-ring">
                      {DIRECTIONS.map(d => (
                        <div key={d} className={`ob-compass-dir${windowDir === d ? " selected" : ""}`} style={{ ...DIR_POSITIONS[d], position: "absolute" }}>
                          {d}
                        </div>
                      ))}
                      <div className="ob-compass-center">
                        <div style={{ fontSize: 28, fontWeight: 300, color: "var(--green)" }}>{Math.round(compassHeading)}°</div>
                        <div style={{ fontSize: 11, color: "oklch(0.55 0.03 145)" }}>{headingToDirection(compassHeading)}</div>
                      </div>
                    </div>
                    {!windowDir ? (
                      <button className="ob-btn" style={{ marginTop: 14, maxWidth: 220, marginLeft: "auto", marginRight: "auto" }} onClick={setCompassDirection}>
                        Set direction
                      </button>
                    ) : (
                      <div style={{ marginTop: 14, fontSize: 14, color: "var(--green)", fontWeight: 500 }}>
                        {windowDir}-facing window
                        <span onClick={() => setWindowDir("")} style={{ marginLeft: 10, fontSize: 12, color: "oklch(0.55 0.03 145)", cursor: "pointer", textDecoration: "underline" }}>redo</span>
                      </div>
                    )}
                    <div onClick={() => setCompassMode("manual")} style={{ marginTop: 10, fontSize: 11, color: "oklch(0.50 0.03 145)", cursor: "pointer", textDecoration: "underline" }}>
                      Pick manually instead
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="ob-compass-ring">
                      {DIRECTIONS.map(d => (
                        <div key={d}
                          className={`ob-compass-dir${windowDir === d ? " selected" : ""}`}
                          style={{ ...DIR_POSITIONS[d], position: "absolute" }}
                          onClick={() => setWindowDir(d)}>
                          {d}
                        </div>
                      ))}
                      <div className="ob-compass-center">
                        {windowDir ? (
                          <div style={{ fontSize: 16, fontWeight: 500, color: "var(--green)" }}>{windowDir}</div>
                        ) : (
                          <div style={{ fontSize: 12, color: "oklch(0.50 0.03 145)" }}>Tap a direction</div>
                        )}
                      </div>
                    </div>
                    {windowDir && (
                      <div style={{ textAlign: "center", marginTop: 10, fontSize: 13, color: "var(--green)", fontWeight: 500 }}>
                        {windowDir}-facing window
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <button className="ob-btn" disabled={
            saving || roomName.trim().length < 2 || !roomSize || !roomTemp || (hasWindows && !windowDir)
          } onClick={handleComplete}>
            {saving ? "Creating room..." : "Create room"}
          </button>
        </div>
      )}
    </div>
  );
}


// ── AddRoomModal ──────────────────────────────────────────────────────────
function AddRoomModal({ onSave, onClose }) {
  const [roomName, setRoomName] = useState("");
  const [roomSize, setRoomSize] = useState("");
  const [tempUnit, setTempUnit] = useState("C");
  const [roomTemp, setRoomTemp] = useState("");
  const [hasWindows, setHasWindows] = useState(true);
  const [windowDir, setWindowDir] = useState("");
  const [saving, setSaving] = useState(false);

  const DIRECTIONS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const DIR_POSITIONS = {
    N:  { top: 4, left: "50%", transform: "translateX(-50%)" },
    NE: { top: 28, right: 16 },
    E:  { top: "50%", right: 0, transform: "translateY(-50%)" },
    SE: { bottom: 28, right: 16 },
    S:  { bottom: 4, left: "50%", transform: "translateX(-50%)" },
    SW: { bottom: 28, left: 16 },
    W:  { top: "50%", left: 0, transform: "translateY(-50%)" },
    NW: { top: 28, left: 16 },
  };

  const valid = roomName.trim().length >= 2 && roomSize && roomTemp && (!hasWindows || windowDir);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 210, display: "flex", flexDirection: "column", justifyContent: "flex-end", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#0f1a0f", borderTop: "1px solid oklch(0.95 0.015 145 / 0.15)", borderRadius: "24px 24px 0 0", padding: "24px 24px 44px", maxWidth: 430, width: "100%", margin: "0 auto", maxHeight: "88vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "var(--green)", marginBottom: 2 }}>New room</div>
            <div style={{ fontFamily: "'Literata', serif", fontSize: 18, fontWeight: 500, color: "var(--text)" }}>Add a room</div>
          </div>
          <button onClick={onClose} style={{ background: "oklch(0.95 0.015 145 / 0.08)", border: "1px solid oklch(0.95 0.015 145 / 0.15)", borderRadius: "50%", width: 32, height: 32, color: "var(--text-2)", fontSize: 16, cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Name */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "oklch(0.60 0.03 145)", marginBottom: 4 }}>Room name</div>
            <input className="ob-input" placeholder="e.g. Living Room, Bedroom" value={roomName} onChange={e => setRoomName(e.target.value.slice(0, 40))} autoFocus />
          </div>

          {/* Size */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "oklch(0.60 0.03 145)", marginBottom: 4 }}>Room size</div>
            <div style={{ display: "flex", gap: 8 }}>
              {["Small", "Medium", "Large"].map(s => (
                <div key={s} className={`ob-size-card${roomSize === s ? " selected" : ""}`} onClick={() => setRoomSize(s)}>
                  <div className="ob-size-label">{s}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Temperature */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "oklch(0.60 0.03 145)", marginBottom: 4 }}>Average temperature</div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input className="ob-input" style={{ flex: 1 }} type="text" inputMode="decimal" placeholder={tempUnit === "C" ? "e.g. 22" : "e.g. 72"} value={roomTemp} onChange={e => setRoomTemp(e.target.value.replace(/[^0-9.]/g, ""))} />
              <div className="ob-toggle" style={{ width: 100, flexShrink: 0 }}>
                <button className={tempUnit === "C" ? "active" : ""} onClick={() => setTempUnit("C")}>°C</button>
                <button className={tempUnit === "F" ? "active" : ""} onClick={() => setTempUnit("F")}>°F</button>
              </div>
            </div>
          </div>

          {/* Windows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "oklch(0.60 0.03 145)", marginBottom: 4 }}>Does the room have windows?</div>
            <div className="ob-toggle" style={{ width: 160 }}>
              <button className={hasWindows ? "active" : ""} onClick={() => setHasWindows(true)}>Yes</button>
              <button className={!hasWindows ? "active" : ""} onClick={() => { setHasWindows(false); setWindowDir(""); }}>No</button>
            </div>
          </div>

          {/* Direction */}
          {hasWindows && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "oklch(0.60 0.03 145)", marginBottom: 4 }}>Window direction</div>
              <div className="ob-compass-ring" style={{ width: 180, height: 180 }}>
                {DIRECTIONS.map(d => (
                  <div key={d} className={`ob-compass-dir${windowDir === d ? " selected" : ""}`} style={{ ...DIR_POSITIONS[d], position: "absolute" }} onClick={() => setWindowDir(d)}>{d}</div>
                ))}
                <div className="ob-compass-center">
                  {windowDir ? <div style={{ fontSize: 14, fontWeight: 500, color: "var(--green)" }}>{windowDir}</div> : <div style={{ fontSize: 11, color: "oklch(0.50 0.03 145)" }}>Tap</div>}
                </div>
              </div>
            </div>
          )}
        </div>

        <button disabled={!valid || saving} onClick={async () => {
          setSaving(true);
          await onSave({
            name: roomName.trim(),
            size: roomSize,
            temperature: roomTemp ? parseFloat(roomTemp) : null,
            has_windows: hasWindows,
            window_direction: hasWindows ? windowDir : null,
          });
          setSaving(false);
        }} style={{
          width: "100%", padding: "14px", marginTop: 24,
          background: valid ? "rgba(100,220,80,0.22)" : "oklch(0.95 0.015 145 / 0.06)",
         
          border: `1px solid ${valid ? "rgba(150,255,100,0.4)" : "oklch(0.95 0.015 145 / 0.10)"}`,
          borderTopColor: valid ? "rgba(200,255,160,0.7)" : "oklch(0.95 0.015 145 / 0.15)",
          borderRadius: 20, color: valid ? "#d4ffb0" : "oklch(0.95 0.015 145 / 0.25)",
          fontSize: 14, fontWeight: 500,
          cursor: valid && !saving ? "pointer" : "default", letterSpacing: "0.3px",
          opacity: saving ? 0.5 : 1,
        }}>{saving ? "Creating..." : "Create room"}</button>
      </div>
    </div>
  );
}


// ── EditRoomModal ─────────────────────────────────────────────────────────
function EditRoomModal({ room, onSave, onDelete, onClose }) {
  const [roomName, setRoomName] = useState(room.name || "");
  const [roomSize, setRoomSize] = useState(room.size || "");
  const [tempUnit, setTempUnit] = useState("C");
  const [roomTemp, setRoomTemp] = useState(room.temperature != null ? String(room.temperature) : "");
  const [hasWindows, setHasWindows] = useState(room.hasWindows !== false);
  const [windowDir, setWindowDir] = useState(room.windowDirection || "");
  const [saving, setSaving] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);

  const DIRECTIONS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const DIR_POSITIONS = {
    N:  { top: 4, left: "50%", transform: "translateX(-50%)" },
    NE: { top: 28, right: 16 },
    E:  { top: "50%", right: 0, transform: "translateY(-50%)" },
    SE: { bottom: 28, right: 16 },
    S:  { bottom: 4, left: "50%", transform: "translateX(-50%)" },
    SW: { bottom: 28, left: 16 },
    W:  { top: "50%", left: 0, transform: "translateY(-50%)" },
    NW: { top: 28, left: 16 },
  };

  const valid = roomName.trim().length >= 2 && roomSize && roomTemp && (!hasWindows || windowDir);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 210, display: "flex", flexDirection: "column", justifyContent: "flex-end", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#0f1a0f", borderTop: "1px solid oklch(0.95 0.015 145 / 0.15)", borderRadius: "24px 24px 0 0", padding: "24px 24px 44px", maxWidth: 430, width: "100%", margin: "0 auto", maxHeight: "88vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "var(--green)", marginBottom: 2 }}>Room settings</div>
            <div style={{ fontFamily: "'Literata', serif", fontSize: 18, fontWeight: 500, color: "var(--text)" }}>{room.name}</div>
          </div>
          <button onClick={onClose} style={{ background: "oklch(0.95 0.015 145 / 0.08)", border: "1px solid oklch(0.95 0.015 145 / 0.15)", borderRadius: "50%", width: 32, height: 32, color: "var(--text-2)", fontSize: 16, cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "oklch(0.60 0.03 145)", marginBottom: 4 }}>Room name</div>
            <input className="ob-input" value={roomName} onChange={e => setRoomName(e.target.value.slice(0, 40))} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "oklch(0.60 0.03 145)", marginBottom: 4 }}>Room size</div>
            <div style={{ display: "flex", gap: 8 }}>
              {["Small", "Medium", "Large"].map(s => (
                <div key={s} className={`ob-size-card${roomSize === s ? " selected" : ""}`} onClick={() => setRoomSize(s)}>
                  <div className="ob-size-label">{s}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "oklch(0.60 0.03 145)", marginBottom: 4 }}>Average temperature</div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input className="ob-input" style={{ flex: 1 }} type="text" inputMode="decimal" value={roomTemp} onChange={e => setRoomTemp(e.target.value.replace(/[^0-9.]/g, ""))} />
              <div className="ob-toggle" style={{ width: 100, flexShrink: 0 }}>
                <button className={tempUnit === "C" ? "active" : ""} onClick={() => setTempUnit("C")}>°C</button>
                <button className={tempUnit === "F" ? "active" : ""} onClick={() => setTempUnit("F")}>°F</button>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "oklch(0.60 0.03 145)", marginBottom: 4 }}>Does the room have windows?</div>
            <div className="ob-toggle" style={{ width: 160 }}>
              <button className={hasWindows ? "active" : ""} onClick={() => setHasWindows(true)}>Yes</button>
              <button className={!hasWindows ? "active" : ""} onClick={() => { setHasWindows(false); setWindowDir(""); }}>No</button>
            </div>
          </div>

          {hasWindows && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "oklch(0.60 0.03 145)", marginBottom: 4 }}>Window direction</div>
              <div className="ob-compass-ring" style={{ width: 180, height: 180 }}>
                {DIRECTIONS.map(d => (
                  <div key={d} className={`ob-compass-dir${windowDir === d ? " selected" : ""}`} style={{ ...DIR_POSITIONS[d], position: "absolute" }} onClick={() => setWindowDir(d)}>{d}</div>
                ))}
                <div className="ob-compass-center">
                  {windowDir ? <div style={{ fontSize: 14, fontWeight: 500, color: "var(--green)" }}>{windowDir}</div> : <div style={{ fontSize: 11, color: "oklch(0.50 0.03 145)" }}>Tap</div>}
                </div>
              </div>
            </div>
          )}
        </div>

        <button disabled={!valid || saving} onClick={async () => {
          setSaving(true);
          await onSave(room.id, {
            name: roomName.trim(),
            size: roomSize,
            temperature: roomTemp ? parseFloat(roomTemp) : null,
            has_windows: hasWindows,
            window_direction: hasWindows ? windowDir : null,
          });
          setSaving(false);
        }} style={{
          width: "100%", padding: "14px", marginTop: 24,
          background: valid ? "rgba(100,220,80,0.22)" : "oklch(0.95 0.015 145 / 0.06)",
         
          border: `1px solid ${valid ? "rgba(150,255,100,0.4)" : "oklch(0.95 0.015 145 / 0.10)"}`,
          borderTopColor: valid ? "rgba(200,255,160,0.7)" : "oklch(0.95 0.015 145 / 0.15)",
          borderRadius: 20, color: valid ? "#d4ffb0" : "oklch(0.95 0.015 145 / 0.25)",
          fontSize: 14, fontWeight: 500,
          cursor: valid && !saving ? "pointer" : "default", letterSpacing: "0.3px",
          opacity: saving ? 0.5 : 1,
        }}>{saving ? "Saving..." : "Save changes"}</button>

        <button onClick={() => setDeleteMode(true)} style={{
          width: "100%", padding: "12px", marginTop: 10,
          background: "transparent", border: "1px solid rgba(248,113,113,0.25)",
          borderRadius: 20, color: "rgba(248,113,113,0.6)",
          fontSize: 13,
          cursor: "pointer", letterSpacing: "0.3px",
        }}>Delete room</button>

        {deleteMode && (
          <div style={{ position: "fixed", inset: 0, zIndex: 220, display: "flex", flexDirection: "column", justifyContent: "flex-end", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }} onClick={() => setDeleteMode(false)}>
            <div onClick={e => e.stopPropagation()} style={{ background: "#1a0a0a", borderTop: "1px solid rgba(248,113,113,0.25)", borderRadius: "24px 24px 0 0", padding: "28px 24px 44px", maxWidth: 430, width: "100%", margin: "0 auto" }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(248,113,113,0.8)", marginBottom: 6 }}>Delete room</div>
                <div style={{ fontFamily: "'Literata', serif", fontSize: 18, fontWeight: 500, color: "var(--text)", marginBottom: 8 }}>Remove "{room.name}"?</div>
                <div style={{ fontSize: 13, color: "oklch(0.60 0.03 145)", lineHeight: 1.6 }}>
                  Plants in this room will become unassigned. This cannot be undone.
                </div>
              </div>
              <button onClick={() => onDelete(room.id)} style={{
                width: "100%", padding: "14px",
                background: "rgba(248,113,113,0.25)", border: "1px solid rgba(248,113,113,0.5)",
                borderRadius: 20, color: "#f87171",
                fontSize: 14, fontWeight: 500,
                cursor: "pointer",
              }}>Delete room</button>
              <button onClick={() => setDeleteMode(false)} style={{ width: "100%", padding: "10px", marginTop: 8, background: "none", border: "none", color: "oklch(0.50 0.03 145)", fontSize: 13, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


// ── App ────────────────────────────────────────────────────────────────────
// ── AddPlantModal — choice screen ─────────────────────────────────────────
function AddPlantModal({ onSave, onClose, scanButton }) {
  const [mode, setMode] = useState(null); // null | "manual"

  if (mode === "manual") {
    return <AddPlantManualModal onSave={onSave} onClose={onClose} onBack={() => setMode(null)} />;
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 201, display: "flex", flexDirection: "column", justifyContent: "flex-end", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#0f1a0f", borderTop: "1px solid oklch(0.95 0.015 145 / 0.15)", borderRadius: "24px 24px 0 0", padding: "28px 24px 44px", maxWidth: 430, width: "100%", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "var(--green)", marginBottom: 4 }}>New plant</div>
            <div style={{ fontFamily: "'Literata', serif", fontSize: 20, fontWeight: 500, color: "var(--text)" }}>How do you want to add it?</div>
          </div>
          <button onClick={onClose} style={{ background: "oklch(0.95 0.015 145 / 0.08)", border: "1px solid oklch(0.95 0.015 145 / 0.15)", borderRadius: "50%", width: 32, height: 32, color: "var(--text-2)", fontSize: 16, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {scanButton}
          <button onClick={() => setMode("manual")} style={{
            width: "100%", padding: "16px",
            background: "rgba(100,220,80,0.22)",
            border: "1px solid rgba(150,255,100,0.40)",
            borderRadius: 20,
            color: "#d4ffb0", fontSize: 15, fontWeight: 500,
            cursor: "pointer", letterSpacing: "0.3px",
          }}>Add manually</button>
        </div>
      </div>
    </div>
  );
}

// ── AddPlantManualModal — name → AI fills details ──────────────────────────
function AddPlantManualModal({ onSave, onClose, onBack }) {
  const [name, setName] = useState("");
  const [analysing, setAnalysing] = useState(false);
  const [details, setDetails] = useState(null); // filled by AI
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function lookupPlant() {
    const q = name.trim();
    if (!q) return;
    setAnalysing(true);
    setError("");
    setDetails(null);
    try {
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
          max_tokens: 300,
          messages: [{
            role: "user",
            content: `You are a botanist. Given the plant name "${q}", return care details. Reply ONLY with JSON, no markdown:
{"species":"","light":"Bright indirect","waterEveryDays":7,"care":"","co2PerYear":80,"vocPerHour":1500,"vocStrengths":["General VOCs"]}`
          }]
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.content?.find(b => b.type === "text")?.text || "";
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No data returned");
      setDetails(JSON.parse(match[0]));
    } catch (err) {
      setError(err.message || "Could not look up plant");
    }
    setAnalysing(false);
  }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    await onSave({
      name: name.trim(),
      species: details?.species || null,
      water_every_days: details?.waterEveryDays || 7,
      light: details?.light || "Bright indirect",
      care: details?.care || null,
      warning: null,
      co2_per_year: details?.co2PerYear || 80,
      voc_per_hour: details?.vocPerHour || 1500,
      voc_strengths: details?.vocStrengths || ["General VOCs"],
    });
    setSaving(false);
    onClose();
  }

  const inputStyle = {
    background: "oklch(0.95 0.015 145 / 0.10)", border: "1px solid oklch(0.95 0.015 145 / 0.20)",
    borderRadius: 12, padding: "11px 14px", fontSize: 15,
    color: "var(--text)", outline: "none",
    width: "100%", boxSizing: "border-box",
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 202, display: "flex", flexDirection: "column", justifyContent: "flex-end", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#0f1a0f", borderTop: "1px solid oklch(0.95 0.015 145 / 0.15)", borderRadius: "24px 24px 0 0", padding: "24px 24px 40px", maxWidth: 430, width: "100%", margin: "0 auto", maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "oklch(0.63 0.03 145)", fontSize: 13, cursor: "pointer", padding: "0 12px 0 0" }}>←</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "var(--green)", marginBottom: 2 }}>Manual add</div>
            <div style={{ fontFamily: "'Literata', serif", fontSize: 18, fontWeight: 500, color: "var(--text)" }}>What's the plant called?</div>
          </div>
          <button onClick={onClose} style={{ background: "oklch(0.95 0.015 145 / 0.08)", border: "1px solid oklch(0.95 0.015 145 / 0.15)", borderRadius: "50%", width: 32, height: 32, color: "var(--text-2)", fontSize: 16, cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            style={{ ...inputStyle, flex: 1 }}
            placeholder="e.g. Monstera, ZZ Plant…"
            value={name}
            onChange={e => { setName(e.target.value); setDetails(null); setError(""); }}
            onKeyDown={e => e.key === "Enter" && lookupPlant()}
            autoFocus
          />
          <button onClick={lookupPlant} disabled={!name.trim() || analysing} style={{
            padding: "11px 16px", borderRadius: 12, border: "1px solid rgba(150,255,100,0.40)",
           
            background: "rgba(100,220,80,0.22)", color: "#d4ffb0",
            fontSize: 13, fontWeight: 500,
            cursor: !name.trim() || analysing ? "default" : "pointer",
            opacity: !name.trim() || analysing ? 0.5 : 1,
            flexShrink: 0,
          }}>
            {analysing ? "…" : "Look up"}
          </button>
        </div>

        {error && (
          <div style={{ fontSize: 12, color: "var(--warn)", marginBottom: 14, padding: "8px 12px", background: "rgba(248,113,113,0.1)", borderRadius: 10 }}>{error}</div>
        )}

        {analysing && (
          <div style={{ fontSize: 12, color: "oklch(0.60 0.03 145)", textAlign: "center", padding: "20px 0", fontStyle: "italic" }}>
            Looking up care details…
          </div>
        )}

        {details && !analysing && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 14, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
              {details.species && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "oklch(0.60 0.03 145)", letterSpacing: "1px", textTransform: "uppercase", fontSize: 10 }}>Species</span>
                  <span style={{ color: "var(--text)", fontStyle: "italic" }}>{details.species}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "oklch(0.60 0.03 145)", letterSpacing: "1px", textTransform: "uppercase", fontSize: 10 }}>Water every</span>
                <span style={{ color: "var(--text)" }}>{details.waterEveryDays} days</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "oklch(0.60 0.03 145)", letterSpacing: "1px", textTransform: "uppercase", fontSize: 10 }}>Light</span>
                <span style={{ color: "var(--text)" }}>{details.light}</span>
              </div>
              {details.care && (
                <div style={{ marginTop: 4, fontSize: 12, color: "oklch(0.70 0.03 145)", lineHeight: 1.6, borderTop: "1px solid oklch(0.95 0.015 145 / 0.08)", paddingTop: 10 }}>
                  {details.care}
                </div>
              )}
            </div>
          </div>
        )}

        <button onClick={handleSave} disabled={!name.trim() || saving || analysing} style={{
          width: "100%", padding: "14px",
          background: name.trim() && !analysing ? "rgba(100,220,80,0.22)" : "oklch(0.95 0.015 145 / 0.06)",
         
          border: `1px solid ${name.trim() && !analysing ? "rgba(150,255,100,0.4)" : "oklch(0.95 0.015 145 / 0.10)"}`,
          borderTopColor: name.trim() && !analysing ? "rgba(200,255,160,0.7)" : "oklch(0.95 0.015 145 / 0.15)",
          borderRadius: 20,
          color: name.trim() && !analysing ? "#d4ffb0" : "oklch(0.95 0.015 145 / 0.25)",
          fontSize: 14, fontWeight: 500,
          cursor: !name.trim() || saving || analysing ? "default" : "pointer",
          letterSpacing: "0.3px",
        }}>
          {saving ? "Saving…" : details ? "Add plant" : name.trim() ? "Add without looking up" : "Enter a plant name"}
        </button>
      </div>
    </div>
  );
}


// ── Auth Screen ────────────────────────────────────────────────────────────
function AuthScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function signInWithGoogle() {
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/",
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // On success, browser redirects to Google — no need to setLoading(false)
  }

  return (
    <div style={{
      position: "fixed", inset: 0, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "32px 24px",
    }}>
      <div style={{ marginBottom: 48, textAlign: "center" }}>
        <div style={{ fontFamily: "'Literata', serif", fontSize: 22, fontWeight: 500, color: "var(--text)", letterSpacing: "4px", textTransform: "uppercase" }}>Plantj</div>
        <div style={{ fontSize: 11, color: "oklch(0.60 0.03 145)", marginTop: 8, letterSpacing: "2px", textTransform: "uppercase" }}>Your garden journal</div>
      </div>

      <div style={{
        width: "100%", maxWidth: 360,
        background: "oklch(0.95 0.015 145 / 0.12)",
        border: "1px solid oklch(0.95 0.015 145 / 0.15)",
        borderRadius: 24, padding: "32px 24px",
      }}>
        <button
          onClick={signInWithGoogle}
          disabled={loading}
          style={{
            width: "100%", padding: "14px 16px",
            background: loading ? "oklch(0.95 0.015 145 / 0.08)" : "oklch(0.97 0.012 145 / 0.92)",
            border: "1px solid oklch(0.95 0.015 145 / 0.30)",
            borderRadius: 16, cursor: loading ? "default" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
            fontSize: 14, fontWeight: 500,
            color: loading ? "oklch(0.95 0.015 145 / 0.40)" : "#1a1a1a",
            transition: "all 0.18s",
            boxShadow: loading ? "none" : "0 2px 8px rgba(0,0,0,0.12)",
          }}
        >
          {!loading && (
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
              <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.548 0 9s.348 2.825.957 4.039l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
          )}
          {loading ? "Redirecting…" : "Continue with Google"}
        </button>

        {error && (
          <div style={{ fontSize: 12, color: "#f87171", marginTop: 14, textAlign: "center", lineHeight: 1.5 }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}



export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [screen, setScreen] = useState("overview");
  const [idx, setIdx] = useState(0);
  const [editingNick, setEditingNick] = useState(null);
  const [nickInput, setNickInput] = useState("");
  const [gardenerOpen, setGardenerOpen] = useState(false);
  const [fertilizeModalOpen, setFertilizeModalOpen] = useState(false);
  const [waterCheckOpen, setWaterCheckOpen] = useState(false);
  const [postponeOpen, setPostponeOpen] = useState(false);
  const [plantSettingsOpen, setPlantSettingsOpen] = useState(false);
  const [plantSettings, setPlantSettings] = useState({}); // keyed by plant.id
  const [editDateModal, setEditDateModal] = useState(null); // { type: "water"|"fertilize", plantId, currentDate }
  const [dbLoading, setDbLoading] = useState(true);
  const [onboardingDone, setOnboardingDone] = useState(null); // null=unknown, true/false
  const [userProfile, setUserProfile] = useState(null);
  const touchX = useRef(null);

// ── Auth state ───────────────────────────────────────────────────────────
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    setUser(session?.user ?? null);
    setAuthLoading(false);
    if (event === "SIGNED_IN") {
      window.history.replaceState(null, "", window.location.pathname);
    }
  });

  const hash = window.location.hash;
  if (hash && hash.includes("access_token")) {
    const params = new URLSearchParams(hash.replace("#", ""));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    if (access_token && refresh_token) {
      supabase.auth.setSession({ access_token, refresh_token }).then(({ data, error }) => {
        if (error) console.error("setSession error:", error.message);
        else {
          setUser(data.session?.user ?? null);
          setAuthLoading(false);
          window.history.replaceState(null, "", window.location.pathname);
        }
      });
    }
  } else {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
  }

  return () => subscription.unsubscribe();
}, []);


  const [plants, setPlants] = useState([]);
  const [addPlantOpen, setAddPlantOpen] = useState(false);
  const [addRoomOpen, setAddRoomOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null); // null = show all
  const [editRoomData, setEditRoomData] = useState(null); // room object or null
  const [waterLog, setWaterLog] = useState({});
  const [fertilizeLog, setFertilizeLog] = useState({});
  const [waterHistory, setWaterHistory] = useState({}); // { plantId: [iso, iso, ...] } last 10
  const [fertilizeHistory, setFertilizeHistory] = useState({}); // { plantId: [{date, dose}, ...] } last 10
  const [weather, setWeather] = useState(null); // lifted from WeatherCard
  const [dismissedWarnings, setDismissedWarnings] = useState({});
  const [nicknames, setNicknames] = useState({});
  const [gardenLog, setGardenLog] = useState([]);
  const [plantPhotos, setPlantPhotos] = useState({});
  const [rooms, setRooms] = useState([]);

  const loadedRef = useRef(false);

  // ── Check onboarding status ─────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    supabase.from("user_profiles").select("*").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => {
        if (data?.onboarding_complete) {
          setOnboardingDone(true);
          setUserProfile(data);
        } else {
          setOnboardingDone(false);
          setDbLoading(false); // no data to load yet
        }
      });
  }, [user]);

  // ── Load from Supabase (only after onboarding is done) ──────────────────
  useEffect(() => {
    if (!user || !onboardingDone || loadedRef.current) return;
    loadedRef.current = true;
    async function loadAll() {
      try {
        const uid = user.id;
        const [plRes, wRes, fRes, dRes, nRes, gRes, pRes, rmRes] = await Promise.all([
          supabase.from("plants").select("*").eq("user_id", uid).order("created_at", { ascending: true }),
          supabase.from("water_log").select("*").eq("user_id", uid).order("watered_at", { ascending: false }),
          supabase.from("fertilize_log").select("*").eq("user_id", uid).order("fertilized_at", { ascending: false }),
          supabase.from("dismissed_warnings").select("*").eq("user_id", uid),
          supabase.from("nicknames").select("*").eq("user_id", uid),
          supabase.from("garden_log").select("*").eq("user_id", uid).order("scanned_at", { ascending: false }),
          supabase.from("plant_photos").select("*").eq("user_id", uid).order("created_at", { ascending: true }),
          supabase.from("rooms").select("*").eq("user_id", uid).order("created_at", { ascending: true }),
        ]);
        setRooms((rmRes.data || []).map(r => ({ id: r.id, name: r.name, size: r.size, temperature: r.temperature, hasWindows: r.has_windows, windowDirection: r.window_direction })));
        setPlants((plRes.data || []).map(r => ({
          id: r.id, name: r.name, species: r.species,
          waterEveryDays: r.water_every_days, light: r.light,
          care: r.care, warning: r.warning,
          co2PerYear: r.co2_per_year || 80,
          vocPerHour: r.voc_per_hour || 1500,
          vocStrengths: r.voc_strengths || ["General VOCs"],
          image: null,
        })));
        // Load settings fields into plantSettings state
        const ps = {};
        (plRes.data || []).forEach(r => {
          ps[r.id] = {
            plantedDate: r.planted_date || "",
            potType: r.pot_type || "",
            potSize: r.pot_size != null ? String(r.pot_size) : "",
            soilType: r.soil_type || "",
            location: r.location || "",
            room: r.room || "",
            lightDistance: r.light_distance || "",
          };
        });
        setPlantSettings(ps);
        const wl = {};
        const wh = {};
        (wRes.data || []).forEach(r => {
          if (!wl[r.plant_id]) wl[r.plant_id] = r.watered_at;
          if (!wh[r.plant_id]) wh[r.plant_id] = [];
          if (wh[r.plant_id].length < 10) wh[r.plant_id].push(r.watered_at);
        });
        setWaterLog(wl);
        setWaterHistory(wh);
        const fl = {};
        const fh = {};
        (fRes.data || []).forEach(r => {
          if (!fl[r.plant_id]) fl[r.plant_id] = { date: r.fertilized_at, dose: r.dose };
          if (!fh[r.plant_id]) fh[r.plant_id] = [];
          if (fh[r.plant_id].length < 10) fh[r.plant_id].push({ date: r.fertilized_at, dose: r.dose });
        });
        setFertilizeLog(fl);
        setFertilizeHistory(fh);
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
  }, [user, onboardingDone]);

  // ── Derived values ───────────────────────────────────────────────────────
  const plant = plants[idx] || null;
  const lastWatered = plant ? (waterLog[plant.id] || null) : null;
  const lastFertilized = fertilizeLog[plant?.id] || null;
  const lastFertilizedDate = lastFertilized ? (typeof lastFertilized === "string" ? lastFertilized : lastFertilized.date) : null;
  const lastFertilizedDose = lastFertilized ? (typeof lastFertilized === "string" ? 1 : lastFertilized.dose) : null;
  const status = plant ? getStatus(plant, lastWatered) : "unknown";
  const days = daysSince(lastWatered);
  const fertDays = daysSince(lastFertilizedDate);
  const pct = (days !== null && plant) ? Math.min((days / plant.waterEveryDays) * 100, 100) : 0;
  const fillColor = pct >= 100 ? "#c46860" : pct >= 70 ? "#d4935a" : "#4ade80";

  const FERTILIZE_EVERY = 30;
  const fertDaysLeft = fertDays !== null ? FERTILIZE_EVERY - fertDays : null;
  const fertDoseLabel = lastFertilizedDose === 0.5 ? " · ½ dose" : lastFertilizedDose === 0 ? " · no dose" : "";

  // Build room context for this plant
  const plantRoom = plant ? rooms.find(r => r.name === (plantSettings[plant.id]?.room || "")) : null;

  const careContext = {
    lastWateredDaysAgo: days,
    lastFertilizedDaysAgo: fertDays,
    settings: plantSettings[plant?.id] || {},
    waterHistory: plant ? (waterHistory[plant.id] || []) : [],
    fertilizeHistory: plant ? (fertilizeHistory[plant.id] || []) : [],
    weather,
    userProfile: userProfile ? { country: userProfile.country, postalCode: userProfile.postal_code, city: weather?.city } : null,
    room: plantRoom ? { name: plantRoom.name, hasWindows: plantRoom.hasWindows, windowDirection: plantRoom.windowDirection } : null,
    previousAnalyses: plant ? (plantPhotos[plant.id] || []).filter(p => p.analysis).map(p => ({ date: p.date, ...p.analysis })).slice(-3) : [],
  };

  const currentPhotos = plantPhotos[plant?.id] || [];
  const latestPhoto = currentPhotos.length > 0 ? currentPhotos[currentPhotos.length - 1] : null;
  const latestPhotoBase64 = latestPhoto?.base64 || null;
  const latestAnalysis = latestPhoto?.analysis || null;

  // ── Actions ──────────────────────────────────────────────────────────────
  async function waterPlant(id) {
    const now = new Date().toISOString();
    setWaterLog(p => ({ ...p, [id]: now }));
    await supabase.from("water_log").insert({ plant_id: id, watered_at: now, user_id: user.id });
  }

  async function postponeWatering(id, daysToSkip) {
    const futureDate = new Date(Date.now() + daysToSkip * 86400000).toISOString();
    setWaterLog(p => ({ ...p, [id]: futureDate }));
    await supabase.from("water_log").insert({ plant_id: id, watered_at: futureDate, user_id: user.id });
  }

  async function fertilizePlant(id, dose = 1) {
    const now = new Date().toISOString();
    setFertilizeLog(p => ({ ...p, [id]: { date: now, dose } }));
    await supabase.from("fertilize_log").insert({ plant_id: id, fertilized_at: now, dose, user_id: user.id });
  }

  async function resetWaterLog(id) {
    setWaterLog(p => { const n = { ...p }; delete n[id]; return n; });
    await supabase.from("water_log").delete().eq("plant_id", id).eq("user_id", user.id);
  }

  async function dismissWarning(id) {
    setDismissedWarnings(p => ({ ...p, [id]: true }));
    await supabase.from("dismissed_warnings").upsert({ plant_id: id, user_id: user.id });
  }

  async function saveNick(id) {
    const nick = nickInput.trim();
    if (nick) {
      setNicknames(p => ({ ...p, [id]: nick }));
      await supabase.from("nicknames").upsert({ plant_id: id, nickname: nick, user_id: user.id });
    } else {
      setNicknames(p => { const n = { ...p }; delete n[id]; return n; });
      await supabase.from("nicknames").delete().eq("plant_id", id).eq("user_id", user.id);
    }
    setEditingNick(null); setNickInput("");
  }

  async function saveSettings(id, s) {
    if (s.nickname.trim()) {
      setNicknames(p => ({ ...p, [id]: s.nickname.trim() }));
      await supabase.from("nicknames").upsert({ plant_id: id, nickname: s.nickname.trim(), user_id: user.id });
    } else {
      setNicknames(p => { const n = { ...p }; delete n[id]; return n; });
      await supabase.from("nicknames").delete().eq("plant_id", id).eq("user_id", user.id);
    }
    await supabase.from("plants").update({
      planted_date: s.plantedDate || null,
      pot_type: s.potType || null,
      pot_size: s.potSize ? parseFloat(s.potSize) : null,
      soil_type: s.soilType || null,
      location: s.location || null,
      room: s.room || null,
      light_distance: s.lightDistance || null,
    }).eq("id", id).eq("user_id", user.id);
    setPlantSettings(p => ({ ...p, [id]: { plantedDate: s.plantedDate, potType: s.potType, potSize: s.potSize, soilType: s.soilType, location: s.location, room: s.room, lightDistance: s.lightDistance } }));
    setPlantSettingsOpen(false);
  }

  async function deletePlant(id) {
    // Delete all related records then the plant itself
    await Promise.all([
      supabase.from("water_log").delete().eq("plant_id", id).eq("user_id", user.id),
      supabase.from("fertilize_log").delete().eq("plant_id", id).eq("user_id", user.id),
      supabase.from("dismissed_warnings").delete().eq("plant_id", id).eq("user_id", user.id),
      supabase.from("nicknames").delete().eq("plant_id", id).eq("user_id", user.id),
      supabase.from("plant_photos").delete().eq("plant_id", id).eq("user_id", user.id),
    ]);
    await supabase.from("plants").delete().eq("id", id).eq("user_id", user.id);
    // Update local state
    setPlants(p => p.filter(pl => pl.id !== id));
    setWaterLog(p => { const n = { ...p }; delete n[id]; return n; });
    setFertilizeLog(p => { const n = { ...p }; delete n[id]; return n; });
    setDismissedWarnings(p => { const n = { ...p }; delete n[id]; return n; });
    setNicknames(p => { const n = { ...p }; delete n[id]; return n; });
    setPlantPhotos(p => { const n = { ...p }; delete n[id]; return n; });
    setPlantSettings(p => { const n = { ...p }; delete n[id]; return n; });
    setPlantSettingsOpen(false);
    setIdx(i => Math.max(0, i - 1));
    setScreen("overview");
  }

  async function editDate(type, plantId, dateStr) {
    const newIso = new Date(dateStr + "T12:00:00").toISOString();
    if (type === "water") {
      setWaterLog(p => ({ ...p, [plantId]: newIso }));
      await supabase.from("water_log").insert({ plant_id: plantId, watered_at: newIso, user_id: user.id });
    } else {
      const d = lastFertilizedDose ?? 1;
      setFertilizeLog(p => ({ ...p, [plantId]: { date: newIso, dose: d } }));
      await supabase.from("fertilize_log").insert({ plant_id: plantId, fertilized_at: newIso, dose: d, user_id: user.id });
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

  async function addPlant(plantData) {
    const { data, error } = await supabase.from("plants").insert({
      ...plantData, user_id: user.id,
    }).select().single();
    if (!error && data) {
      setPlants(prev => [...prev, {
        id: data.id, name: data.name, species: data.species,
        waterEveryDays: data.water_every_days, light: data.light,
        care: data.care, warning: data.warning,
        co2PerYear: data.co2_per_year || 80,
        vocPerHour: data.voc_per_hour || 1500,
        vocStrengths: data.voc_strengths || ["General VOCs"],
        image: null,
      }]);
      return data.id;
    }
    return null;
  }

  async function addRoom(roomData) {
    const { data, error } = await supabase.from("rooms").insert({
      ...roomData, user_id: user.id,
    }).select().single();
    if (!error && data) {
      setRooms(prev => [...prev, { id: data.id, name: data.name, size: data.size, temperature: data.temperature, hasWindows: data.has_windows, windowDirection: data.window_direction }]);
    }
    setAddRoomOpen(false);
  }

  async function updateRoom(roomId, roomData) {
    const oldRoom = rooms.find(r => r.id === roomId);
    const oldName = oldRoom?.name;
    await supabase.from("rooms").update(roomData).eq("id", roomId).eq("user_id", user.id);
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, name: roomData.name, size: roomData.size, temperature: roomData.temperature, hasWindows: roomData.has_windows, windowDirection: roomData.window_direction } : r));
    // If name changed, update plants that reference the old name
    if (oldName && oldName !== roomData.name) {
      await supabase.from("plants").update({ room: roomData.name }).eq("room", oldName).eq("user_id", user.id);
      setPlantSettings(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(pid => {
          if (updated[pid].room === oldName) updated[pid] = { ...updated[pid], room: roomData.name };
        });
        return updated;
      });
    }
    setEditRoomData(null);
  }

  async function deleteRoom(roomId) {
    const oldRoom = rooms.find(r => r.id === roomId);
    const oldName = oldRoom?.name;
    await supabase.from("rooms").delete().eq("id", roomId).eq("user_id", user.id);
    setRooms(prev => prev.filter(r => r.id !== roomId));
    // Unassign plants in this room
    if (oldName) {
      await supabase.from("plants").update({ room: null }).eq("room", oldName).eq("user_id", user.id);
      setPlantSettings(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(pid => {
          if (updated[pid].room === oldName) updated[pid] = { ...updated[pid], room: "" };
        });
        return updated;
      });
    }
    setEditRoomData(null);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setWaterLog({}); setFertilizeLog({}); setDismissedWarnings({});
    setNicknames({}); setGardenLog([]); setPlantPhotos({}); setPlants([]); setRooms([]);
    setOnboardingDone(null); setUserProfile(null);
    loadedRef.current = false;
    setScreen("overview");
  }

  function onTouchStart(e) { touchX.current = e.touches[0].clientX; }
  function onTouchEnd(e) {
    if (touchX.current === null) return;
    const diff = touchX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && idx < plants.length - 1) setIdx(i => i + 1);
      if (diff < 0 && idx > 0) setIdx(i => i - 1);
    }
    touchX.current = null;
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <style>{css}</style>

      <div
        className="app"
        style={{}}
      >
        {/* Background always visible */}
        <div style={{ position: "fixed", inset: 0, zIndex: -1, backgroundImage: `url(${bgPhoto})`, backgroundSize: "cover", backgroundPosition: "center top" }} />
        <div style={{
          position: "fixed", inset: 0, zIndex: -1,
          backdropFilter: "blur(16px) saturate(120%) brightness(1.02)",
          WebkitBackdropFilter: "blur(16px) saturate(120%) brightness(1.02)",
          background: "rgba(0,0,0,0.35)",
        }} />

        {/* Auth loading splash */}
        {authLoading && (
          <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 13, letterSpacing: "3px", color: "oklch(0.63 0.03 145)", textTransform: "uppercase" }}>Loading</div>
          </div>
        )}

        {/* Auth gate — show login, hide everything else */}
        {!authLoading && !user && <AuthScreen />}
        {!authLoading && !user && null /* stop rendering app content below */}
        {!authLoading && user && (
          <>

        {/* ── ONBOARDING GATE ── */}
        {onboardingDone === null && (
          <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 32, marginBottom: 4 }}>🌿</div>
            <div style={{ fontSize: 13, color: "oklch(0.73 0.03 145)", letterSpacing: 0.5 }}>Loading...</div>
          </div>
        )}

        {onboardingDone === false && (
          <OnboardingFlow user={user} onComplete={(profile) => {
            setUserProfile(profile);
            setOnboardingDone(true);
          }} />
        )}

        {onboardingDone === true && (<>

        {dbLoading ? (
          <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 32, marginBottom: 4 }}>🌿</div>
            <div style={{ fontSize: 11, letterSpacing: "3px", color: "oklch(0.63 0.03 145)", textTransform: "uppercase" }}>Loading</div>
            <div style={{ fontSize: 13, color: "oklch(0.73 0.03 145)", letterSpacing: 0.5 }}>Loading your garden…</div>
          </div>
        ) : (<>

        {/* ── OVERVIEW ── */}
        {screen === "overview" && (
          <div className="fade-up">
            <WeatherCard userProfile={userProfile} onWeatherLoad={setWeather} />
            <GlassContainer gap={8} style={{ padding: "16px 16px 0", gridTemplateColumns: "1fr 1fr 1fr", gridAutoRows: "auto" }}>
              <GlassCard borderRadius={16} variant="interactive" style={{ border: "none" }}>
                <ScanButton
                  onResult={async (entry) => {
                    setGardenLog(prev => [entry, ...prev]);
                    setScreen("garden");
                    const { data: existing } = await supabase.from("garden_log")
                      .select("id").eq("scientific_name", entry.scientificName).eq("user_id", user.id).limit(1);
                    if (!existing || existing.length === 0) {
                      await supabase.from("garden_log").insert({
                        common_name: entry.commonName, scientific_name: entry.scientificName,
                        family: entry.family, confidence: entry.confidence, origin: entry.origin,
                        fun_fact: entry.funFact, care_level: entry.careLevel, edible: entry.edible,
                        toxic: entry.toxic, toxic_to: entry.toxicTo, data_url: entry.dataUrl, scanned_at: entry.date,
                        user_id: user.id,
                      });
                    }
                  }}
                  renderTrigger={(onClick, scanning) => (
                    <div className="stat" style={{ cursor: "pointer", padding: "16px 14px 14px" }} onClick={onClick}>
                      {scanning ? (
                        <>
                          <div style={{ fontSize: 24, fontWeight: 600, lineHeight: 1, color: "var(--green)" }}>…</div>
                          <div className="stat-l" style={{ marginTop: 4 }}>Scanning</div>
                        </>
                      ) : (
                        <>
                          <div style={{ fontSize: 22, lineHeight: 1, color: "var(--green)" }}>⟡</div>
                          <div className="stat-l" style={{ marginTop: 6 }}>Scan</div>
                        </>
                      )}
                    </div>
                  )}
                />
              </GlassCard>
              <GlassCard borderRadius={16} variant="interactive" onClick={() => setScreen("garden")} style={{ border: "none" }}>
                <div className="stat" style={{ cursor: "pointer", padding: "16px 14px 14px" }}>
                  <div className="stat-n" style={{ fontSize: 28 }}>{gardenLog.length}</div>
                  <div className="stat-l">Garden</div>
                </div>
              </GlassCard>
              {(() => {
                const warnPlants = plants.filter(p => {
                  const d = daysSince(waterLog[p.id] || null);
                  if (d !== null && d >= p.waterEveryDays) return true;
                  const fDate = fertilizeLog[p.id] ? (typeof fertilizeLog[p.id] === "string" ? fertilizeLog[p.id] : fertilizeLog[p.id].date) : null;
                  const fd = daysSince(fDate);
                  if (fd !== null && fd >= 30) return true;
                  return false;
                });
                return (
                  <GlassCard borderRadius={16} variant="interactive"
                    onClick={warnPlants.length > 0 ? () => { if (warnPlants.length === 1) { setIdx(plants.indexOf(warnPlants[0])); setScreen("detail"); } else setScreen("attention"); } : undefined}
                    style={{ border: "none", ...(warnPlants.length > 0 ? { background: "rgba(248,113,113,0.15)" } : {}) }}>
                    <div className="stat" style={{ cursor: warnPlants.length > 0 ? "pointer" : "default", padding: "16px 14px 14px", opacity: warnPlants.length === 0 ? 0.4 : 1 }}>
                      <div className="stat-n" style={{ fontSize: 28, color: warnPlants.length > 0 ? "var(--warn)" : "var(--text)" }}>{warnPlants.length}</div>
                      <div className="stat-l">Attention</div>
                    </div>
                  </GlassCard>
                );
              })()}
            </GlassContainer>

            <div style={{ padding: "20px 24px 0", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
              <div className="ov-heading">My little <em>garden</em></div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 22px 10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 10, letterSpacing: "2.5px", textTransform: "uppercase", color: "oklch(0.78 0.03 145)" }}>Your plants</div>
                <div style={{ fontSize: 11, color: "oklch(0.70 0.03 145)" }}>{plants.length}</div>
              </div>
              <button onClick={() => setAddPlantOpen(true)} style={{
                background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.3)",
                borderRadius: 20, padding: "5px 14px", fontSize: 11,
                color: "var(--green)", cursor: "pointer",
                letterSpacing: "0.5px",
              }}>+ Add plant</button>
            </div>

            {/* Room filter tabs */}
            {rooms.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", padding: "0 16px 10px", alignItems: "center" }}>
                {rooms.map(r => {
                  const isActive = selectedRoom === r.name;
                  return (
                    <div key={r.id} onClick={() => setSelectedRoom(isActive ? null : r.name)} style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "5px 14px", borderRadius: 20,
                      background: isActive ? "rgba(74,222,128,0.12)" : "oklch(0.95 0.015 145 / 0.06)",
                      border: `1px solid ${isActive ? "rgba(74,222,128,0.25)" : "oklch(0.95 0.015 145 / 0.12)"}`,
                      fontSize: 11, letterSpacing: "0.8px",
                      color: isActive ? "var(--green)" : "oklch(0.95 0.015 145 / 0.40)",
                      cursor: "pointer", transition: "all 0.15s",
                    }}>
                      {r.name}
                      <span onClick={(e) => { e.stopPropagation(); setEditRoomData(r); }} style={{ fontSize: 10, opacity: 0.5, cursor: "pointer" }}>✎</span>
                    </div>
                  );
                })}
                <div onClick={() => setAddRoomOpen(true)} style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 28, height: 28, borderRadius: "50%",
                  background: "oklch(0.95 0.015 145 / 0.06)", border: "1px solid oklch(0.95 0.015 145 / 0.15)",
                  fontSize: 14, color: "oklch(0.50 0.03 145)",
                  cursor: "pointer", transition: "background 0.15s",
                }}>+</div>
              </div>
            )}

            {plants.length === 0 ? (
              <div style={{ padding: "40px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 13, color: "oklch(0.55 0.03 145)", lineHeight: 1.7, fontWeight: 300 }}>
                  No plants yet.<br />Tap + Add plant to start your garden.
                </div>
              </div>
            ) : (() => {
              const filteredPlants = selectedRoom
                ? plants.filter((p, i) => {
                    const ps = plantSettings[p.id] || {};
                    return ps.room === selectedRoom;
                  })
                : plants;

              return (
                <div style={{ padding: "0 14px 32px" }}>
                  {filteredPlants.length === 0 ? (
                    <div style={{ padding: "24px 16px", textAlign: "center", fontSize: 13, color: "oklch(0.50 0.03 145)", fontStyle: "italic" }}>
                      No plants in this room
                    </div>
                  ) : (
                    <GlassContainer gap={8} style={{ display: "flex", flexDirection: "column", gridTemplateColumns: "1fr" }}>
                      {filteredPlants.map((p) => {
                        const i = plants.indexOf(p);
                        const s = getStatus(p, waterLog[p.id] || null);
                        const nick = nicknames[p.id];
                        const photos = plantPhotos[p.id] || [];
                        const topPhoto = photos.length > 0 ? photos[photos.length - 1] : null;
                        return (
                          <GlassCard key={p.id} borderRadius={18} variant="interactive">
                            <div className="prow" onClick={() => openDetail(i)}>
                              <div style={{ position: "relative", flexShrink: 0 }}>
                                <div style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)", zIndex: 10 }}>
                                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: PIN_COLORS[i % PIN_COLORS.length], boxShadow: "0 1px 3px rgba(0,0,0,0.3)", margin: "0 auto" }} />
                                  <div style={{ width: 1.5, height: 5, background: "#bbb", margin: "0 auto" }} />
                                </div>
                                <div style={{ background: "#fff", padding: "3px 3px 10px", boxShadow: "0 2px 8px rgba(60,30,10,0.15)", transform: `rotate(${TILTS[i % TILTS.length]}deg)` }}>
                                  {topPhoto
                                    ? <img src={topPhoto.dataUrl} alt={p.name} style={{ display: "block", width: 44, height: 40, objectFit: "cover" }} />
                                    : <div style={{ width: 44, height: 40, background: "rgba(74,222,128,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>+</div>
                                  }
                                </div>
                              </div>
                              <div className="prow-info">
                                <div className="prow-name">{nick || p.name}</div>
                                <div className="prow-sub">{nick ? p.name : p.species}</div>
                              </div>
                              <div className="prow-right">
                                <div className="sdot" style={{ background: STATUS_COLOR[s] }} />
                                <span className="slabel" style={{ color: "var(--text)" }}>{STATUS_LABEL[s]}</span>
                              </div>
                              <div className="parrow">›</div>
                            </div>
                          </GlassCard>
                        );
                      })}
                    </GlassContainer>
                  )}
                </div>
              );
            })()}



            {plants.length > 0 && <AirQualitySlider plants={plants} />}
            <div style={{ padding: "24px 24px 40px", textAlign: "center" }}>
              <button onClick={signOut} style={{ background: "none", border: "none", fontSize: 11, color: "oklch(0.63 0.03 145)", cursor: "pointer", letterSpacing: "1.5px", textTransform: "uppercase" }}>Sign out</button>
            </div>
          </div>
        )}

        {/* ── DETAIL ── */}
        {screen === "detail" && plant && (
          <div className="fade-up" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <div className="detail-nav">
              <button className="dnav-back" onClick={() => setScreen("overview")}>← Overview</button>
              <div className="dnav-counter">{idx + 1} / {plants.length}</div>
              <div className="dnav-arrows">
                <button className="darrow" disabled={idx === 0} onClick={() => setIdx(i => i - 1)}>‹</button>
                <button className="darrow" disabled={idx === plants.length - 1} onClick={() => setIdx(i => i + 1)}>›</button>
              </div>
            </div>
            <div className="dots">
              {plants.map((_, i) => <div key={i} className={`dot${i === idx ? " on" : ""}`} onClick={() => setIdx(i)} />)}
            </div>

            <PlantPhotoStack
              plant={plant}
              tilt={TILTS[idx]}
              pinColor={PIN_COLORS[idx]}
              userPhotos={plantPhotos[plant.id] || []}
              setUserPhotos={(photos) => setPlantPhotos(prev => ({ ...prev, [plant.id]: typeof photos === "function" ? photos(prev[plant.id] || []) : photos }))}
              careContext={careContext}
              db={supabase}
              userId={user.id}
            />

            {plant.warning && !dismissedWarnings[plant.id] && (
              <div style={{ margin: "0 22px 4px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 10, padding: "8px 14px", fontSize: 12, color: "var(--warn)", display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span style={{ flex: 1 }}>! {plant.warning}</span>
                <button onClick={() => dismissWarning(plant.id)} style={{ background: "none", border: "none", color: "rgba(248,113,113,0.6)", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0, flexShrink: 0 }}>✕</button>
              </div>
            )}

            <div className="detail-body">
              <div className="d-species">{plant.species}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <div className="d-name">{nicknames[plant.id] || plant.name}</div>
                <button onClick={() => setPlantSettingsOpen(true)} style={{
                  background: "oklch(0.95 0.015 145 / 0.08)", border: "1px solid oklch(0.95 0.015 145 / 0.15)",
                  borderRadius: "50%", width: 32, height: 32, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, color: "oklch(0.63 0.03 145)", cursor: "pointer",
                  transition: "all 0.15s",
                }}>⚙</button>
              </div>

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
                    ? (days === 0 ? "Today" : days < 0 ? `Postponed · due ${new Date(lastWatered).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}` : `${days}d ago · ${new Date(lastWatered).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}`)
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



              <div className="care-box">{plant.care}</div>

              {/* Action buttons row */}
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <button className="btn-water" style={{ flex: 1, padding: "12px 4px", fontSize: 12 }} onClick={() => setWaterCheckOpen(true)}>
                  {days === 0 ? "Watered" : days !== null && days < 0 ? `Water in ${Math.abs(days)}d` : days !== null && (plant.waterEveryDays - days) > 0 ? `Water in ${plant.waterEveryDays - days}d` : "Water"}
                </button>
                <button className="btn-fertilize" style={{ flex: 1, padding: "12px 4px", fontSize: 12, marginTop: 0 }} onClick={() => setFertilizeModalOpen(true)}>
                  {fertDays === null ? "Fertilize" : fertDaysLeft !== null && fertDaysLeft > 0 ? `Fert. ${fertDaysLeft}d` : "Fertilize"}
                </button>
                <button className="btn-consult" style={{ flex: 1, padding: "12px 4px", fontSize: 12, marginTop: 0 }} onClick={() => setGardenerOpen(true)}>
                  Gardener
                </button>
              </div>



              <div className="swipe-hint">swipe left or right to browse</div>
            </div>
          </div>
        )}

        {/* ── MODALS ── */}
        {addPlantOpen && (
          <AddPlantModal
            onSave={addPlant}
            onClose={() => setAddPlantOpen(false)}
            scanButton={
              <ScanButton
                onResult={async (entry) => {
                  setAddPlantOpen(false);
                  const newPlantId = await addPlant({
                    name: entry.commonName,
                    species: entry.scientificName || null,
                    water_every_days: 7,
                    light: "Bright indirect",
                    care: entry.funFact ? `${entry.funFact}` : null,
                    warning: entry.toxic ? `Toxic${entry.toxicTo ? ` to ${entry.toxicTo}` : ""}` : null,
                    co2_per_year: 80,
                    voc_per_hour: 1500,
                    voc_strengths: ["General VOCs"],
                  });
                  // Save the scan photo for this plant
                  if (newPlantId && entry.dataUrl) {
                    try {
                      const path = `plant-${newPlantId}/${Date.now()}.jpg`;
                      const blob = await fetch(entry.dataUrl).then(r => r.blob());
                      await supabase.storage.from("plant-photos").upload(path, blob, { contentType: "image/jpeg" });
                      const { data: urlData } = supabase.storage.from("plant-photos").getPublicUrl(path);
                      const publicUrl = urlData?.publicUrl || entry.dataUrl;
                      const { data: dbRow } = await supabase.from("plant_photos").insert({
                        plant_id: newPlantId, storage_path: path, data_url: publicUrl,
                        analysis: null, user_id: user.id,
                      }).select().single();
                      setPlantPhotos(prev => ({
                        ...prev,
                        [newPlantId]: [{ id: dbRow?.id, dataUrl: publicUrl, base64: null, analysis: null, date: new Date().toISOString() }],
                      }));
                    } catch (err) { console.error("Photo save error:", err); }
                  }
                }}
                renderTrigger={(onClick, scanning) => (
                  <button onClick={onClick} disabled={scanning} style={{
                    width: "100%", padding: "16px",
                    background: "rgba(100,220,80,0.22)",
                    border: "1px solid rgba(150,255,100,0.40)",
                    borderRadius: 20,
                    color: "#d4ffb0", fontSize: 15, fontWeight: 500,
                    cursor: scanning ? "default" : "pointer", letterSpacing: "0.3px",
                  }}>
                    {scanning ? "Scanning…" : "Scan plant"}
                  </button>
                )}
              />
            }
          />
        )}

        {addRoomOpen && (
          <AddRoomModal
            onSave={addRoom}
            onClose={() => setAddRoomOpen(false)}
          />
        )}

        {editRoomData && (
          <EditRoomModal
            room={editRoomData}
            onSave={updateRoom}
            onDelete={deleteRoom}
            onClose={() => setEditRoomData(null)}
          />
        )}

        {plantSettingsOpen && screen === "detail" && plant && (
          <PlantSettingsModal
            plant={plant}
            settings={plantSettings[plant.id] || {}}
            nicknames={nicknames}
            rooms={rooms}
            onSave={(s) => saveSettings(plant.id, s)}
            onDelete={() => deletePlant(plant.id)}
            onClose={() => setPlantSettingsOpen(false)}
          />
        )}

        {waterCheckOpen && screen === "detail" && plant && (
          <WaterCheckModal
            plant={plant}
            lastWatered={lastWatered}
            onWaterNow={() => { waterPlant(plant.id); setWaterCheckOpen(false); }}
            onPostpone={() => { setWaterCheckOpen(false); setPostponeOpen(true); }}
            onClose={() => setWaterCheckOpen(false)}
          />
        )}

        {postponeOpen && screen === "detail" && plant && (
          <PostponeModal
            plant={plant}
            onConfirm={(daysToSkip) => { postponeWatering(plant.id, daysToSkip); setPostponeOpen(false); }}
            onClose={() => setPostponeOpen(false)}
          />
        )}

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
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: "1px solid oklch(0.95 0.015 145 / 0.08)" }}>
              <button onClick={() => setScreen("overview")} style={{ background: "none", border: "none", fontSize: 13, color: "oklch(0.63 0.03 145)", cursor: "pointer", padding: "6px 0" }}>← Overview</button>
              <div style={{ flex: 1 }} />
              <ScanButton
                onResult={async (entry) => {
                  setGardenLog(prev => [entry, ...prev]);
                  const { data: existing } = await supabase.from("garden_log")
                    .select("id").eq("scientific_name", entry.scientificName).eq("user_id", user.id).limit(1);
                  if (!existing || existing.length === 0) {
                    await supabase.from("garden_log").insert({
                      common_name: entry.commonName, scientific_name: entry.scientificName,
                      family: entry.family, confidence: entry.confidence, origin: entry.origin,
                      fun_fact: entry.funFact, care_level: entry.careLevel, edible: entry.edible,
                      toxic: entry.toxic, toxic_to: entry.toxicTo, data_url: entry.dataUrl, scanned_at: entry.date,
                      user_id: user.id,
                    });
                  }
                }}
                renderTrigger={(onClick, scanning) => (
                  <button onClick={onClick} style={{ background: "var(--green)", border: "none", borderRadius: 20, padding: "7px 16px", fontSize: 12, color: "#0a1a0a", fontWeight: 600, cursor: "pointer" }}>
                    {scanning ? "…" : "+ Scan"}
                  </button>
                )}
              />
            </div>

            <div style={{ padding: "24px 24px 8px" }}>
              <div style={{ fontSize: 10, letterSpacing: "3px", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>Your discoveries</div>
              <div style={{ fontFamily: "'Literata', serif", fontSize: 34, fontWeight: 600, color: "var(--text)", lineHeight: 1.1 }}>Botanical<br /><em style={{ fontStyle: "italic", color: "var(--peach-dark)" }}>Garden</em></div>
            </div>

            {gardenLog.length === 0 ? (
              <div style={{ padding: "60px 32px", textAlign: "center" }}>
                
                <div style={{ fontFamily: "'Literata', serif", fontSize: 20, fontWeight: 500, color: "var(--text)", marginBottom: 8 }}>No plants scanned yet</div>
                <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, fontWeight: 300 }}>Tap Scan on the overview or use the button above to identify a plant.</div>
              </div>
            ) : (
              <div style={{ padding: "16px 16px 40px", display: "flex", flexDirection: "column", gap: 14 }}>
                {gardenLog.map((entry) => (
                  <div key={entry.id} style={{
                    background: "oklch(0.95 0.015 145 / 0.09)",
                    borderRadius: 20, overflow: "hidden",
                    border: "1px solid oklch(0.95 0.015 145 / 0.15)",
                  }}>
                    <div style={{ position: "relative", height: 160 }}>
                      <img src={entry.dataUrl} alt={entry.commonName} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      <div style={{ position: "absolute", top: 12, right: 12, background: entry.confidence === "high" ? "rgba(148,184,138,0.9)" : entry.confidence === "medium" ? "rgba(212,147,90,0.9)" : "rgba(196,104,96,0.9)", color: "var(--text)", fontSize: 10, letterSpacing: 1, padding: "4px 10px", borderRadius: 20, backdropFilter: "blur(4px)" }}>
                        {entry.confidence} confidence
                      </div>
                      {entry.toxic && (
                        <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(196,104,96,0.9)", color: "var(--text)", fontSize: 10, padding: "4px 10px", borderRadius: 20, backdropFilter: "blur(4px)" }}>
                          ! Toxic{entry.toxicTo ? ` to ${entry.toxicTo}` : ""}
                        </div>
                      )}
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: "linear-gradient(to top, rgba(15,26,15,0.95), transparent)" }} />
                    </div>
                    <div style={{ padding: "14px 18px 18px" }}>
                      <div style={{ fontSize: 11, color: "var(--green)", fontStyle: "italic", marginBottom: 3 }}>{entry.scientificName}</div>
                      <div style={{ fontFamily: "'Literata', serif", fontSize: 22, fontWeight: 500, color: "var(--text)", marginBottom: 12 }}>{entry.commonName}</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                        {[
                          { label: entry.family, color: "oklch(0.95 0.015 145 / 0.08)", text: "oklch(0.73 0.03 145)" },
                          { label: entry.origin, color: "rgba(74,222,128,0.12)", text: "var(--green-dim)" },
                          { label: `Care: ${entry.careLevel}`, color: entry.careLevel === "easy" ? "rgba(74,222,128,0.12)" : entry.careLevel === "moderate" ? "rgba(212,147,90,0.12)" : "rgba(196,104,96,0.12)", text: "oklch(0.70 0.03 145)" },
                          entry.edible && { label: "Edible", color: "rgba(74,222,128,0.15)", text: "var(--green-dim)" },
                        ].filter(Boolean).map((tag, i) => (
                          <div key={i} style={{ background: tag.color, color: tag.text, fontSize: 10, letterSpacing: "0.8px", padding: "4px 10px", borderRadius: 20 }}>{tag.label}</div>
                        ))}
                      </div>
                      <div style={{ background: "oklch(0.95 0.015 145 / 0.06)", borderRadius: 12, padding: "11px 14px", fontSize: 12, color: "oklch(0.67 0.03 145)", lineHeight: 1.65, fontWeight: 300, fontStyle: "italic" }}>
                        "{entry.funFact}"
                      </div>
                      <div style={{ fontSize: 10, color: "oklch(0.45 0.03 145)", marginTop: 10, letterSpacing: "0.5px" }}>
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
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: "1px solid oklch(0.95 0.015 145 / 0.08)" }}>
              <button onClick={() => setScreen("overview")} style={{ background: "none", border: "none", fontSize: 13, color: "oklch(0.63 0.03 145)", cursor: "pointer", padding: "6px 0" }}>← Overview</button>
            </div>
            <div style={{ padding: "24px 24px 8px" }}>
              <div style={{ fontSize: 10, letterSpacing: "3px", textTransform: "uppercase", color: "var(--warn)", marginBottom: 6 }}>Needs attention</div>
              <div style={{ fontFamily: "'Literata', serif", fontSize: 32, fontWeight: 600, color: "var(--text)", lineHeight: 1.1 }}>
                {plants.filter(p => p.warning).length} plant{plants.filter(p => p.warning).length !== 1 ? "s" : ""}<br />
                <span style={{ color: "var(--warn)" }}>need care</span>
              </div>
            </div>
            <GlassContainer gap={8} style={{ display: "flex", flexDirection: "column", gridTemplateColumns: "1fr", padding: "16px 14px 40px" }}>
              {plants.filter(p => p.warning).map((p) => {
                const pIdx = plants.indexOf(p);
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
                        <div style={{ fontSize: 11, color: "var(--warn)", marginTop: 4, lineHeight: 1.4 }}>! {p.warning}</div>
                      </div>
                      <div className="parrow" style={{ color: "var(--warn)" }}>›</div>
                    </div>
                  </GlassCard>
                );
              })}
            </GlassContainer>
          </div>
        )}
        </>
        )}
        </>)}
        </>
        )}
      </div>
    </>
  );
}
