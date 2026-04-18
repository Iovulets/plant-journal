// ── Weather Card ──────────────────────────────────────────────────────────
// Renders an animated SVG icon + current temperature/humidity for the user's
// location. Uses Open-Meteo (free, no API key).

import { useState, useEffect } from "react";
import { WMO_CONDITIONS, COUNTRY_COORDS } from "../constants.js";


export function WeatherIcon({ code, isDay, size = 32 }) {
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

// Inline version for the hero grid — no outer padding or GlassCard wrapper
export function WeatherCardInline({ userProfile, onWeatherLoad }) {
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
          lat = geoData.results[0].latitude; lng = geoData.results[0].longitude; cityName = geoData.results[0].name;
        } else {
          const fallback = COUNTRY_COORDS[userProfile.country];
          if (fallback) { lat = fallback.lat; lng = fallback.lng; cityName = fallback.name; }
          else { setError("Location not found"); setLoading(false); return; }
        }
        const unit = userProfile.temp_unit === "F" ? "fahrenheit" : "celsius";
        const wxRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,is_day&temperature_unit=${unit}&timezone=auto`);
        const wxData = await wxRes.json();
        const current = wxData.current;
        const wxObj = { temp: Math.round(current.temperature_2m), unit: userProfile.temp_unit === "F" ? "°F" : "°C", humidity: current.relative_humidity_2m, condition: WMO_CONDITIONS[current.weather_code] || "Unknown", weatherCode: current.weather_code, isDay: current.is_day === 1, city: cityName };
        setWeather(wxObj);
        onWeatherLoad?.(wxObj);
      } catch (err) { console.error("Weather fetch error:", err); setError("Could not load weather"); }
      setLoading(false);
    }
    fetchWeather();
  }, [userProfile?.postal_code, userProfile?.country, userProfile?.temp_unit]);

  if (!userProfile?.postal_code || error || (!loading && !weather)) return (
    <div style={{ padding: "16px 14px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", opacity: 0.4 }}>
      <div style={{ fontSize: 11, color: "var(--text-2)" }}>No weather</div>
    </div>
  );
  if (loading) return (
    <div style={{ padding: "16px 14px", display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
      <div style={{ fontSize: 11, color: "var(--text-2)" }}>Loading…</div>
    </div>
  );

  return (
    <div style={{ padding: "12px 10px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, height: "100%" }}>
      <WeatherIcon code={weather.weatherCode} isDay={weather.isDay} size={104} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6 }}>
        <div style={{ fontFamily: "'Literata', serif", fontSize: 20, fontWeight: 500, color: "var(--text)", lineHeight: 1 }}>{weather.temp}{weather.unit}</div>
        <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.15)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="rgba(255,255,255,0.45)" stroke="none">
            <path d="M12 2c0 0-7 8.5-7 13a7 7 0 0 0 14 0c0-4.5-7-13-7-13z" />
          </svg>
          <div style={{ fontFamily: "'Literata', serif", fontSize: 20, fontWeight: 500, color: "var(--text)", lineHeight: 1 }}>{weather.humidity}%</div>
        </div>
      </div>
      <div style={{ fontSize: 10, color: "oklch(0.82 0.03 145)", letterSpacing: "0.5px", marginTop: 2 }}>{weather.city}</div>
    </div>
  );
}
