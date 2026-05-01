/**
 * studio/FrameGrid.jsx
 * Grid de fotogramas extraídos con scroll vertical,
 * animaciones de entrada escalonadas e iconos SVG.
 */

/**
 * studio/FrameGrid.jsx
 * Grid de fotogramas con dimensiones fijas por card (160×90px).
 * Scroll vertical que funciona mientras se generan los frames.
 */

import { useRef, useEffect } from "react";
import { Icon } from "../../icons/Icons";
import { formatTimestamp } from "../../utils/frameUtils";

// Dimensiones fijas — no cambian nunca
const CARD_W = 160;
const CARD_H = 90;

export default function FrameGrid({
  frames,
  selectedFrameId,
  onSelectFrame,
  onDeleteFrame,
}) {
  const gridRef       = useRef(null);
  const prevCountRef  = useRef(0);

  // Auto-scroll al último frame mientras se está extrayendo
  useEffect(() => {
    if (frames.length > prevCountRef.current && gridRef.current) {
      // Solo hacer scroll si el usuario está cerca del final
      const el = gridRef.current;
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 200;
      if (nearBottom) {
        el.scrollTop = el.scrollHeight;
      }
    }
    prevCountRef.current = frames.length;
  }, [frames.length]);

  if (frames.length === 0) {
    return (
      <div className="frame-grid-section">
        <div className="frame-grid-header">
          <h2 className="frame-grid-title">Fotogramas</h2>
          <span className="frame-count-badge">0 frames</span>
        </div>
        <div className="frames-empty">
          <div className="frames-empty-icon">
            <Icon.Image size={32} color="currentColor" />
          </div>
          <p className="frames-empty-title">Sin fotogramas</p>
          <p className="frames-empty-sub">
            Cargá un video y presioná "Extraer fotogramas" para comenzar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="frame-grid-section">
      {/* Header */}
      <div className="frame-grid-header">
        <h2 className="frame-grid-title">Fotogramas</h2>
        <span className="frame-count-badge">{frames.length} frames</span>
        <span style={{
          marginLeft: "auto",
          fontFamily: "var(--font-mono)",
          fontSize: "9px",
          color: "var(--text-4)",
          letterSpacing: "1px",
        }}>
          {CARD_W}×{CARD_H}px · clic para editar
        </span>
      </div>

      {/* Grid con scroll vertical propio */}
      <div
        ref={gridRef}
        className="frames-grid"
        //style={{ overflowY: "auto", overflowX: "hidden" }}
      >
        {frames.map((frame, index) => (
          <FrameCard
            key={frame.id}
            frame={frame}
            index={index}
            isSelected={frame.id === selectedFrameId}
            onSelect={() => onSelectFrame(frame.id)}
            onDelete={(e) => { e.stopPropagation(); onDeleteFrame(frame.id); }}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Tarjeta individual de frame ─────────────────────────────────────── */
function FrameCard({ frame, index, isSelected, onSelect, onDelete }) {
  return (
    <article
      className={[
        "frame-card",
        isSelected ? "frame-card--selected" : "",
        frame.edited ? "frame-card--edited" : "",
      ].join(" ")}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      aria-label={`Frame ${index + 1} en ${formatTimestamp(frame.timestamp)}`}
      style={{
        width:          CARD_W,
        animationDelay: `${Math.min(index * 0.02, 0.4)}s`,
      }}
    >
      {/* Thumbnail — tamaño FIJO siempre */}
      <div style={{
        position:   "relative",
        width:      CARD_W,
        height:     CARD_H,
        overflow:   "hidden",
        background: "var(--deep)",
        flexShrink: 0,
      }}>
        <img
          src={frame.dataURL}
          alt={`Frame ${index + 1}`}
          loading="lazy"
          style={{
            width:      CARD_W,
            height:     CARD_H,
            objectFit:  "cover",
            display:    "block",
            transition: "transform 0.2s ease",
          }}
        />

        {/* Overlay seleccionado */}
        {isSelected && (
          <div style={{
            position:        "absolute",
            inset:           0,
            background:      "rgba(201,168,76,0.22)",
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "center",
          }}>
            <Icon.Edit size={20} color="var(--gold)" />
          </div>
        )}

        {/* Dot de editado */}
        {frame.edited && (
          <div style={{
            position:     "absolute",
            top:          6,
            right:        6,
            width:        8,
            height:       8,
            borderRadius: "50%",
            background:   "var(--indigo-bright)",
            boxShadow:    "0 0 6px var(--indigo)",
          }} title="Frame editado" />
        )}

        {/* Botón eliminar */}
        <button
          className="frame-delete-btn"
          onClick={onDelete}
          title="Eliminar frame"
          aria-label="Eliminar frame"
        >
          <Icon.Close size={9} color="currentColor" />
        </button>
      </div>

      {/* Meta */}
      <div style={{
        padding:        "5px 8px",
        display:        "flex",
        justifyContent: "space-between",
        alignItems:     "center",
      }}>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize:   "10px",
          color:      "var(--text-3)",
          fontWeight: 500,
        }}>
          #{String(index + 1).padStart(3, "0")}
        </span>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize:   "9px",
          color:      "var(--text-4)",
        }}>
          {formatTimestamp(frame.timestamp)}
        </span>
      </div>
    </article>
  );
}