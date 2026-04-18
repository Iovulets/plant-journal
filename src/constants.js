// ── Constants extracted from App.jsx ──────────────────────────────────────

// Status labels & colors
export const STATUS_LABEL = {
  happy: "Hydrated",
  soon: "Water soon",
  thirsty: "Needs water",
  unknown: "Not logged",
};
export const STATUS_COLOR = {
  happy: "#94b88a",
  soon: "#d4935a",
  thirsty: "#c46860",
  unknown: "#b0998e",
};

// Polaroid visuals
export const TILTS = [1.5, -2, 2.5, -1.2, 1.8, -2.3];
export const PIN_COLORS = ["#e05c5c", "#5c7de0", "#e0b45c", "#5cba7d", "#c45ce0", "#e07a5c"];

// Analysis
export const URGENCY_COLOR = { low: "#94b88a", medium: "#d4935a", high: "#c46860" };
export const STATUS_ICON = { action: "✦", wait: "◷", healthy: "✓" };

// Fertilize cadence
export const FERTILIZE_EVERY = 30;

// Plant settings
export const POT_TYPES = ["Terracotta", "Ceramic", "Plastic", "Fabric", "Self-watering", "Other"];
export const LIGHT_DISTANCES = ["Near window", "1m", "2m", "3m", "4m", "5m", "No light"];

// Onboarding
export const DIRECTIONS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
export const DIR_POSITIONS = {
  N:  { top: 4, left: "50%", transform: "translateX(-50%)" },
  NE: { top: 28, right: 16 },
  E:  { top: "50%", right: 0, transform: "translateY(-50%)" },
  SE: { bottom: 28, right: 16 },
  S:  { bottom: 4, left: "50%", transform: "translateX(-50%)" },
  SW: { bottom: 28, left: 16 },
  W:  { top: "50%", left: 0, transform: "translateY(-50%)" },
  NW: { top: 28, left: 16 },
};

// Weather
export const WMO_CONDITIONS = {
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
export const COUNTRY_COORDS = { MD: { lat: 47.01, lng: 28.86, name: "Chisinau" } };

// Air quality
export const AIR_CARDS = [
  { id: "voc", label: "VOC Removal", subtitle: "toxin filtration", unit: "μg/hr", description: "WHO guideline: <300μg/m³ total VOC. Your plants remove toxins at roughly the rate of a mid-range air purifier running continuously. Tap a toxin to see which plants target it.", color: "#94b88a", colorLight: "rgba(148,184,138,0.15)" },
  { id: "co2", label: "CO₂ Offset", subtitle: "carbon absorption", unit: "g/day", description: "Your 35m² apartment holds ~87.5m³ of air. Plants offset a small % of your CO₂, but ventilation matters more here. Where plants truly shine is VOC and particulate filtration.", color: "#b8c894", colorLight: "rgba(184,200,148,0.15)" },
  { id: "humidity", label: "Humidity", subtitle: "transpiration boost", unit: "ml/day", description: "With no heating running, your indoor RH tracks outdoor levels (~68% in late March). You're already above the 40-60% optimal range — no humidity problem right now. This card becomes important when heating starts in autumn.", color: "#8ab4c8", colorLight: "rgba(138,180,200,0.15)" },
  { id: "pm25", label: "PM2.5 Filter", subtitle: "fine dust trapping", unit: "% reduction", description: "Leaf surfaces trap fine airborne particles (PM2.5). NASA studies show 20-30% reduction in a closed room. Larger, textured leaves (Ficus, Dracaena) are most effective.", color: "#c8a894", colorLight: "rgba(200,168,148,0.15)" },
  { id: "wellbeing", label: "Wellbeing", subtitle: "stress & cortisol", unit: "score", description: "Journal of Physiological Anthropology (2015): interacting with houseplants measurably reduces cortisol and systolic blood pressure. This is the most underrated benefit.", color: "#b894c8", colorLight: "rgba(184,148,200,0.15)" },
];
export const VOC_COLORS = {
  "Benzene": "#e8a87a",
  "Formaldehyde": "#94b88a",
  "Ammonia": "#a89ed4",
  "Toluene": "#d4b88a",
  "Xylene": "#b8d4c8",
  "General VOCs": "#c4b4a4",
};

// Postal validation
export const POSTAL_RULES = {
  US: { pattern: /^\d{5}$/, hint: "5 digits (e.g. 90210)" },
  GB: { pattern: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i, hint: "e.g. SW1A 1AA" },
  DE: { pattern: /^\d{5}$/, hint: "5 digits" },
  FR: { pattern: /^\d{5}$/, hint: "5 digits" },
  MD: { pattern: /^(MD-?)?\d{4}$/, hint: "4 digits (e.g. 2001)" },
  CA: { pattern: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i, hint: "e.g. K1A 0B1" },
};

// Countries (ISO 3166-1)
export const COUNTRIES = [
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

export function validatePostal(code, countryCode) {
  if (!code || code.trim().length < 2) return false;
  const rule = POSTAL_RULES[countryCode];
  if (rule) return rule.pattern.test(code.trim());
  return code.trim().length >= 2 && code.trim().length <= 10;
}
export function getPostalHint(countryCode) {
  return POSTAL_RULES[countryCode]?.hint || "2-10 characters";
}
