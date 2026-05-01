/**
 * studio/FrameExtractor.jsx
 * Panel de configuración y control de extracción de frames.
 * Iconos SVG, barra de progreso animada, estimación en tiempo real.
 */

import { useMemo } from "react";
import { Icon } from "../../icons/Icons";

const FPS_OPTIONS = [0.25, 0.5, 1, 2, 4, 8, 15, 24];

export default function FrameExtractor({
  fps, videoDuration, isExtracting,
  extractionProgress, extractionError,
  framesCount,
  onFpsChange, onExtract, onCancel,
  onExportAll, onLoadSaved,
}) {
  const estimatedFrames = useMemo(() => {
    if (!videoDuration || fps <= 0) return 0;
    return Math.floor(videoDuration * fps);
  }, [videoDuration, fps]);

  return (
    <div className="section-panel">
      <div className="section-panel-header" style={{ cursor:"default" }}>
        <div className="section-panel-icon">
          <Icon.Sliders size={14} color="currentColor" />
        </div>
        <span className="section-panel-title">Extracción</span>
        {framesCount > 0 && (
          <span style={{
            fontFamily:"var(--font-mono)", fontSize:"9px",
            color:"var(--gold)", background:"var(--gold-dim)",
            padding:"2px 7px", borderRadius:"var(--r-xs)",
            border:"1px solid rgba(201,168,76,0.2)",
          }}>
            {framesCount} frames
          </span>
        )}
      </div>

      <div className="section-panel-body" style={{ display:"flex", flexDirection:"column", gap:"var(--space-4)" }}>

        {/* Selector FPS */}
        <div>
          <p style={{
            fontFamily:"var(--font-mono)", fontSize:"9px",
            letterSpacing:"2px", textTransform:"uppercase",
            color:"var(--text-4)", marginBottom:"var(--space-2)",
          }}>
            Frames por segundo
          </p>
          <div className="fps-grid">
            {FPS_OPTIONS.map((opt) => (
              <button
                key={opt}
                className={`fps-btn ${fps === opt ? "fps-btn--active" : ""}`}
                onClick={() => onFpsChange(opt)}
                disabled={isExtracting}
                title={`${opt} FPS`}
              >
                {opt < 1 ? `1/${Math.round(1/opt)}` : opt}
                <span className="fps-unit">fps</span>
              </button>
            ))}
          </div>
        </div>

        {/* Estimación */}
        {videoDuration > 0 && (
          <div className="estimation-panel">
            <div className="estimation-row">
              <span className="estimation-label">Frames estimados</span>
              <span className="estimation-value">{estimatedFrames.toLocaleString()}</span>
            </div>
            <div className="estimation-row">
              <span className="estimation-label">Duración del video</span>
              <span className="estimation-value">{videoDuration.toFixed(1)}s</span>
            </div>
            {estimatedFrames > 100 && (
              <div className="estimation-warning">
                <Icon.Alert size={13} color="currentColor" style={{ flexShrink:0, marginTop:1 }} />
                Más de 100 frames puede ser lento. Usá 1fps o menos.
              </div>
            )}
          </div>
        )}

        {/* Acciones */}
        <div className="extract-actions">
          {!isExtracting ? (
            <button
              className="btn btn-primary"
              style={{ width:"100%", justifyContent:"center" }}
              onClick={onExtract}
              disabled={!videoDuration}
            >
              <Icon.Zap size={15} color="currentColor" />
              Extraer fotogramas
            </button>
          ) : (
            <button
              className="btn btn-danger"
              style={{ width:"100%", justifyContent:"center" }}
              onClick={onCancel}
            >
              <Icon.Stop size={14} color="currentColor" />
              Cancelar
            </button>
          )}

          {framesCount > 0 && !isExtracting && (
            <button
              className="btn btn-secondary"
              style={{ width:"100%", justifyContent:"center" }}
              onClick={onExportAll}
            >
              <Icon.Download size={14} color="currentColor" />
              Descargar todos ({framesCount})
            </button>
          )}

          <button
            className="btn btn-ghost"
            style={{ width:"100%", justifyContent:"center" }}
            onClick={onLoadSaved}
          >
            <Icon.Layers size={14} color="currentColor" />
            Cargar guardados
          </button>
        </div>

        {/* Progreso */}
        {(isExtracting || extractionProgress > 0) && (
          <div className="progress-panel">
            <div className="progress-header">
              <span className="progress-label">
                {isExtracting ? "Extrayendo..." : "Completado"}
              </span>
              <span className="progress-pct">{extractionProgress}%</span>
            </div>
            <div className="progress-track">
              <div
                className={`progress-fill ${isExtracting ? "progress-fill--animating" : ""}`}
                style={{ width:`${extractionProgress}%` }}
              />
            </div>
            {isExtracting && (
              <p className="progress-sub">
                {framesCount} frames capturados...
              </p>
            )}
          </div>
        )}

        {/* Error */}
        {extractionError && (
          <div className="error-panel">
            <Icon.Alert size={14} color="currentColor" style={{ flexShrink:0 }} />
            {extractionError}
          </div>
        )}
      </div>
    </div>
  );
}