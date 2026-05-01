/**
 * studio/VideoPlayer.jsx
 * Reproductor del sidebar del editor.
 * El videoRef viene del hook useVideoFrames — es el mismo ref
 * que usa captureFrameAtTime para extraer frames.
 */

import { useRef, useCallback } from "react";
import { Icon } from "../../icons/Icons";
import { formatTimestamp } from "../../utils/frameUtils";

export default function VideoPlayer({
  videoRef,
  videoSrc,
  videoName,
  videoDuration,
  onFileLoad,
  onDefaultLoad,
  onVideoLoaded,
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) onFileLoad(file);
    // Resetear el input para permitir cargar el mismo archivo dos veces
    e.target.value = "";
  }, [onFileLoad]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith("video/")) onFileLoad(file);
  }, [onFileLoad]);

  return (
    <div className="video-source-section">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="section-panel-header" style={{ cursor: "default" }}>
        <div className="section-panel-icon">
          <Icon.Video size={14} color="currentColor" />
        </div>
        <span className="section-panel-title">Fuente de video</span>
        {videoName && (
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "9px",
            color: "var(--gold)",
            background: "var(--gold-dim)",
            padding: "2px 6px",
            borderRadius: "var(--r-xs)",
            border: "1px solid rgba(201,168,76,0.2)",
            maxWidth: "90px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }} title={videoName}>
            {videoName}
          </span>
        )}
      </div>

      {/* ── Cuerpo ─────────────────────────────────────────────────── */}
      <div style={{
        padding: "var(--space-4) var(--space-5)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
      }}>

        {/* Drop zone para subir archivo */}
        <div
          className="drop-zone"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("drag-over"); }}
          onDragLeave={(e) => e.currentTarget.classList.remove("drag-over")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
          aria-label="Subir video"
        >
          <div className="drop-zone-icon">
            <Icon.Upload size={20} color="currentColor" />
          </div>
          <div>
            <p className="drop-zone-text">
              Arrastrá tu video aquí
              <span className="drop-zone-sub">o hacé clic para seleccionar</span>
            </p>
            <p className="drop-zone-formats">MP4 · WebM · OGG · MOV</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>

        {/* Separador */}
        <div style={{
          display: "flex", alignItems: "center", gap: "var(--space-3)",
          color: "var(--text-4)", fontSize: "10px",
          fontFamily: "var(--font-mono)", letterSpacing: "1px",
        }}>
          <div style={{ flex: 1, height: "1px", background: "var(--border-0)" }} />
          ó
          <div style={{ flex: 1, height: "1px", background: "var(--border-0)" }} />
        </div>

        {/* Botón película demo */}
        <button className="btn-demo-movie" onClick={onDefaultLoad}>
          <div className="btn-demo-icon">
            <Icon.Film size={16} color="currentColor" />
          </div>
          <div className="btn-demo-info">
            <div className="btn-demo-title">Cargar demo</div>
            <div className="btn-demo-sub">La Princesa y el Sapo</div>
          </div>
          <Icon.ChevronR size={14} color="currentColor" />
        </button>

        {/* ── Preview del video ─────────────────────────────────────── */}
        {videoSrc ? (
          <div>
            {/* El elemento video con el ref del hook — CRÍTICO para extracción */}
            <div style={{
              borderRadius: "var(--r-lg)",
              overflow: "hidden",
              background: "#000",
              boxShadow: "var(--shadow-md)",
              border: "1px solid var(--border-1)",
            }}>
              <video
                ref={videoRef}
                src={videoSrc}
                controls
                crossOrigin="anonymous"
                onLoadedMetadata={(e) => {
                  onVideoLoaded(e.target.duration);
                }}
                style={{
                  width: "100%",
                  display: "block",
                  maxHeight: "190px",
                  objectFit: "contain",
                  background: "#000",
                }}
              >
                Tu navegador no soporta la reproducción de video.
              </video>
            </div>

            {/* Metadatos */}
            {videoDuration > 0 && (
              <div className="video-meta-strip">
                <div className="video-meta-chip">
                  <Icon.Clock size={10} color="currentColor" />
                  {formatTimestamp(videoDuration)}
                </div>
                {videoRef.current?.videoWidth > 0 && (
                  <div className="video-meta-chip">
                    <Icon.Camera size={10} color="currentColor" />
                    {videoRef.current.videoWidth}×{videoRef.current.videoHeight}
                  </div>
                )}
              </div>
            )}

            {/* Aviso de cómo funciona */}
            <div style={{
              marginTop: "var(--space-3)",
              padding: "var(--space-3)",
              background: "var(--indigo-dim)",
              border: "1px solid rgba(80,96,208,0.2)",
              borderRadius: "var(--r-md)",
              fontSize: "10px",
              color: "var(--indigo-bright)",
              lineHeight: 1.6,
              display: "flex",
              gap: "var(--space-2)",
              alignItems: "flex-start",
            }}>
              <Icon.Info size={12} color="currentColor" style={{ flexShrink: 0, marginTop: 1 }} />
              <span>
                Usá los controles del video para navegar.
                Luego configurá los FPS y extraé los frames.
              </span>
            </div>
          </div>
        ) : (
          /* Estado vacío cuando no hay video */
          <div style={{
            padding: "var(--space-5)",
            background: "var(--elevated)",
            borderRadius: "var(--r-lg)",
            border: "1px solid var(--border-0)",
            textAlign: "center",
            color: "var(--text-4)",
            fontSize: "var(--text-xs)",
            fontFamily: "var(--font-mono)",
          }}>
            Sin video cargado
          </div>
        )}
      </div>
    </div>
  );
}