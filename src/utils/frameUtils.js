/**
 * utils/frameUtils.js
 * Funciones puras para captura, conversión y exportación de fotogramas.
 * Sin dependencias externas — solo Web APIs nativas.
 */

/**
 * Captura un frame del elemento <video> en un instante dado.
 * @param {HTMLVideoElement} videoEl
 * @param {number} time - segundos
 * @param {number} quality - calidad JPEG 0–1
 * @returns {Promise<FrameObject>}
 */
export function captureFrameAtTime(videoEl, time, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const onSeeked = () => {
      videoEl.removeEventListener("seeked", onSeeked);
      try {
        const canvas = document.createElement("canvas");
        canvas.width  = videoEl.videoWidth;
        canvas.height = videoEl.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
        const dataURL = canvas.toDataURL("image/jpeg", quality);
        resolve({
          id:        `frame_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          dataURL,
          timestamp: time,
          width:     canvas.width,
          height:    canvas.height,
          edited:    false,
        });
      } catch (err) {
        reject(err);
      }
    };
    videoEl.addEventListener("seeked", onSeeked);
    videoEl.currentTime = time;
  });
}

/**
 * Genera timestamps uniformes a lo largo de la duración del video.
 * @param {number} duration - duración total en segundos
 * @param {number} fps      - frames por segundo a extraer
 * @returns {number[]}
 */
export function generateTimestamps(duration, fps) {
  if (!duration || duration <= 0 || fps <= 0) return [];
  const interval = 1 / fps;
  const timestamps = [];
  for (let t = 0; t < duration; t += interval) {
    timestamps.push(parseFloat(t.toFixed(4)));
  }
  return timestamps;
}

/**
 * Formatea segundos a MM:SS.ms
 * @param {number} seconds
 * @returns {string}
 */
export function formatTimestamp(seconds) {
  const m  = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s  = Math.floor(seconds % 60).toString().padStart(2, "0");
  const ms = Math.floor((seconds % 1) * 100).toString().padStart(2, "0");
  return `${m}:${s}.${ms}`;
}

/**
 * Aplica un filtro de pixel sobre el canvas completo.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} filterName - "grayscale" | "invert" | "brightness" | "sepia"
 * @param {number} value      - intensidad (depende del filtro)
 */
export function applyFilter(ctx, filterName, value = 1) {
  const { width, height } = ctx.canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data      = imageData.data;

  switch (filterName) {
    case "grayscale": {
      for (let i = 0; i < data.length; i += 4) {
        const avg = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
        const blended = avg * value + data[i] * (1 - value);
        data[i] = data[i+1] = data[i+2] = blended;
      }
      break;
    }
    case "invert": {
      for (let i = 0; i < data.length; i += 4) {
        data[i]   = 255 - data[i];
        data[i+1] = 255 - data[i+1];
        data[i+2] = 255 - data[i+2];
      }
      break;
    }
    case "brightness": {
      for (let i = 0; i < data.length; i += 4) {
        data[i]   = Math.min(255, data[i]   * value);
        data[i+1] = Math.min(255, data[i+1] * value);
        data[i+2] = Math.min(255, data[i+2] * value);
      }
      break;
    }
    case "sepia": {
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i+1], b = data[i+2];
        data[i]   = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
        data[i+1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
        data[i+2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
      }
      break;
    }
    default: break;
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Descarga un dataURL como archivo en el navegador.
 * @param {string} dataURL
 * @param {string} filename
 */
export function downloadDataURL(dataURL, filename) {
  const link = document.createElement("a");
  link.href     = dataURL;
  link.download = filename;
  link.click();
}

/**
 * Descarga todos los frames con un pequeño delay entre cada uno.
 * @param {FrameObject[]} frames
 */
export async function downloadAllFrames(frames) {
  for (let i = 0; i < frames.length; i++) {
    const frame    = frames[i];
    const filename = `frame_${String(i+1).padStart(4,"0")}_${formatTimestamp(frame.timestamp).replace(/[:.]/g, "-")}.jpg`;
    downloadDataURL(frame.dataURL, filename);
    await new Promise((r) => setTimeout(r, 120));
  }
}

/**
 * Guarda frames en localStorage (máximo recomendado: 20 frames).
 * @param {FrameObject[]} frames
 * @param {string} key
 */
export function persistFrames(frames, key = "cinemaframe_frames") {
  try {
    localStorage.setItem(key, JSON.stringify(frames));
  } catch (e) {
    console.warn("localStorage lleno, no se pudieron persistir los frames:", e);
  }
}

/**
 * Recupera frames desde localStorage.
 * @param {string} key
 * @returns {FrameObject[] | null}
 */
export function loadPersistedFrames(key = "cinemaframe_frames") {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}