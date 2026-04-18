// ── Date & status helpers ─────────────────────────────────────────────────

export function daysSince(iso) {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

export function getStatus(plant, lastWatered) {
  const d = daysSince(lastWatered);
  if (d === null) return "unknown";
  if (d < 0) return "happy";
  if (d >= plant.waterEveryDays) return "thirsty";
  if (d >= plant.waterEveryDays * 0.7) return "soon";
  return "happy";
}
