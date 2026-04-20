// ── Image helpers ─────────────────────────────────────────────────────────
// Resize an uploaded image to a max width, export as JPEG base64.
// Used for plant photo analysis and plant scanning (both hit the Claude API,
// so smaller = faster + cheaper tokens).

export async function resizeImageForAPI(file, maxWidth = 800) {
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

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
