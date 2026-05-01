/**
 * hooks/useVideoFrames.js
 * Hook central para manejo de fotogramas.
 * Acepta película pre-seleccionada desde el catálogo.
 */

import { useState, useRef, useCallback, useEffect } from "react";
import {
  captureFrameAtTime,
  generateTimestamps,
  downloadAllFrames,
  persistFrames,
  loadPersistedFrames,
} from "../utils/frameUtils";

export function useVideoFrames(selectedMovie = null) {
  const [frames, setFrames]                       = useState([]);
  const [selectedFrameId, setSelectedFrameId]     = useState(null);
  const [isExtracting, setIsExtracting]           = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [extractionError, setExtractionError]     = useState(null);
  const cancelRef = useRef(false);
  const videoRef  = useRef(null);

  const [videoSrc, setVideoSrc]           = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoName, setVideoName]         = useState("");
  const [fps, setFps]                     = useState(1);

  /* ── Precarga película seleccionada desde el catálogo ─────────────────── */
  useEffect(() => {
    if (selectedMovie?.video_url) {
      setVideoSrc(selectedMovie.video_url);
      setVideoName(selectedMovie.title);
      setFrames([]);
      setSelectedFrameId(null);
      setExtractionProgress(0);
      setExtractionError(null);
      setVideoDuration(0);
    }
  }, [selectedMovie]);

  /* ── Cargar archivo local ─────────────────────────────────────────────── */
  const loadVideoFile = useCallback((file) => {
    if (!file) return;
    if (videoSrc?.startsWith("blob:")) URL.revokeObjectURL(videoSrc);
    const url = URL.createObjectURL(file);
    setVideoSrc(url);
    setVideoName(file.name);
    setFrames([]);
    setSelectedFrameId(null);
    setExtractionProgress(0);
    setExtractionError(null);
    setVideoDuration(0);
  }, [videoSrc]);

  /* ── Película demo ────────────────────────────────────────────────────── */
  const loadDefaultMovie = useCallback(() => {
    setVideoSrc("/la-princesa-y-el-sapo.mp4");
    setVideoName("La Princesa y el Sapo");
    setFrames([]);
    setSelectedFrameId(null);
    setExtractionProgress(0);
    setExtractionError(null);
    setVideoDuration(0);
  }, []);

  /* ── Cargar desde URL externa ─────────────────────────────────────────── */
  const loadMovieFromUrl = useCallback((url, name) => {
    setVideoSrc(url);
    setVideoName(name || "Película");
    setFrames([]);
    setSelectedFrameId(null);
    setExtractionProgress(0);
    setExtractionError(null);
    setVideoDuration(0);
  }, []);

  const handleVideoLoaded = useCallback((duration) => {
    setVideoDuration(duration);
  }, []);

  /* ── Extracción de frames ─────────────────────────────────────────────── */
  const extractFrames = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !video.duration) {
      setExtractionError("No hay video cargado o aún no está listo.");
      return;
    }

    setIsExtracting(true);
    setExtractionError(null);
    setFrames([]);
    setSelectedFrameId(null);
    cancelRef.current = false;
    video.pause();

    const timestamps = generateTimestamps(video.duration, fps);
    const total      = timestamps.length;
    const captured   = [];

    for (let i = 0; i < total; i++) {
      if (cancelRef.current) break;
      try {
        const frame = await captureFrameAtTime(video, timestamps[i]);
        captured.push(frame);
        setFrames([...captured]);
        setExtractionProgress(Math.round(((i + 1) / total) * 100));
      } catch (err) {
        console.error(`Error capturando frame t=${timestamps[i]}:`, err);
      }
      // Liberar el hilo principal cada 5 frames
      if (i % 5 === 0) await new Promise((r) => setTimeout(r, 0));
    }

    setIsExtracting(false);
    setExtractionProgress(100);
    // Persistir solo si hay pocos frames (límite localStorage)
    if (captured.length <= 20) persistFrames(captured);
  }, [fps]);

  const cancelExtraction = useCallback(() => {
    cancelRef.current = true;
  }, []);

  /* ── Actualizar / eliminar frames ─────────────────────────────────────── */
  const updateFrame = useCallback((frameId, newDataURL) => {
    setFrames((prev) =>
      prev.map((f) =>
        f.id === frameId ? { ...f, dataURL: newDataURL, edited: true } : f
      )
    );
  }, []);

  const deleteFrame = useCallback((frameId) => {
    setFrames((prev) => prev.filter((f) => f.id !== frameId));
    setSelectedFrameId((prev) => (prev === frameId ? null : prev));
  }, []);

  /* ── Exportar / cargar guardados ──────────────────────────────────────── */
  const exportAllFrames = useCallback(() => {
    downloadAllFrames(frames);
  }, [frames]);

  const loadSavedFrames = useCallback(() => {
    const saved = loadPersistedFrames();
    if (saved?.length > 0) setFrames(saved);
  }, []);

  const selectedFrame = frames.find((f) => f.id === selectedFrameId) ?? null;

  return {
    // Estado
    frames,
    selectedFrame,
    selectedFrameId,
    isExtracting,
    extractionProgress,
    extractionError,
    videoSrc,
    videoName,
    videoDuration,
    fps,

    // Refs
    videoRef,

    // Acciones
    loadVideoFile,
    loadDefaultMovie,
    loadMovieFromUrl,
    handleVideoLoaded,
    extractFrames,
    cancelExtraction,
    updateFrame,
    deleteFrame,
    setSelectedFrameId,
    setFps,
    exportAllFrames,
    loadSavedFrames,
  };
}