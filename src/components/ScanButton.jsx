// ── ScanButton ─────────────────────────────────────────────────────────────
// Self-contained plant scanner: reads an image from camera/file, resizes,
// sends to Claude for identification, and returns the parsed result via
// onResult. Exposes either a default "stat tile" look or accepts a custom
// trigger via renderTrigger.

import { useState, useRef } from "react";
import { resizeImageForAPI } from "../lib/image.js";

export function ScanButton({ onResult, onStart, renderTrigger }) {
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
