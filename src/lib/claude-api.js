// ── Claude API helpers ────────────────────────────────────────────────────
// Wraps the Anthropic /v1/messages endpoint for plant analysis and
// identification calls. Uses browser-side API key (dev only).

import { daysSince } from "./helpers.js";

export async function callClaude(base64Image, prompt, maxTokens = 256, systemPrompt = null) {
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

// Builds the context block that gets fed to Claude for photo analysis.
// Pulls together everything we know about the plant and its environment
// so Claude can give grounded advice instead of generic tips.
export function buildAnalysisContext(plant, careContext) {
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

export const ANALYSIS_SYSTEM_PROMPT = `You are a plant care expert analysing a photo of a houseplant. You have detailed context about the plant, its environment, care history, and current conditions.

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

export async function analyseWithClaude(base64Image, plant, careContext = {}) {
  const context = buildAnalysisContext(plant, careContext);
  return callClaude(base64Image,
    `Here is the context for this plant:\n${context}\n\nAnalyse the photo.`,
    300,
    ANALYSIS_SYSTEM_PROMPT
  );
}
