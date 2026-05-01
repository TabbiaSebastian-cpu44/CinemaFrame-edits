/**
 * studio/FrameEditor.jsx
 * Editor de fotogramas con Canvas API.
 * Herramientas: dibujo, borrador, texto, filtros, deshacer.
 * Iconos SVG, diseño luxury noir integrado con global.css.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { Icon } from "../../icons/Icons";
import { applyFilter, downloadDataURL, formatTimestamp } from "../../utils/frameUtils";

const TOOLS = { DRAW:"draw", ERASE:"erase", TEXT:"text" };

const FILTERS = [
  { id:"none",       label:"Original"        },
  { id:"grayscale",  label:"Escala de grises" },
  { id:"sepia",      label:"Sépia"            },
  { id:"invert",     label:"Invertir"         },
  { id:"brightness", label:"Brillo"           },
];

export default function FrameEditor({ frame, onSave, onClose }) {
  const canvasRef    = useRef(null);
  const isDrawing    = useRef(false);
  const lastPos      = useRef({ x:0, y:0 });
  const historyRef   = useRef([]);

  const [activeTool,   setActiveTool]   = useState(TOOLS.DRAW);
  const [drawColor,    setDrawColor]    = useState("#e03868");
  const [brushSize,    setBrushSize]    = useState(4);
  const [textInput,    setTextInput]    = useState("");
  const [fontSize,     setFontSize]     = useState(28);
  const [textColor,    setTextColor]    = useState("#f2efe8");
  const [activeFilter, setActiveFilter] = useState("none");
  const [brightness,   setBrightness]   = useState(1);
  const [canUndo,      setCanUndo]      = useState(false);

  /* ── Cargar imagen en canvas ─────────────────────────────────────────── */
  useEffect(() => {
    if (!frame) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width  = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      historyRef.current = [canvas.toDataURL("image/jpeg", 0.9)];
      setCanUndo(false);
      setActiveFilter("none");
      setBrightness(1);
    };
    img.src = frame.dataURL;
  }, [frame]);

  /* ── Posición relativa al canvas ─────────────────────────────────────── */
  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top)  * scaleY,
    };
  };

  /* ── Snapshot ────────────────────────────────────────────────────────── */
  const saveSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    historyRef.current.push(canvas.toDataURL("image/jpeg", 0.9));
    if (historyRef.current.length > 30) historyRef.current.shift();
    setCanUndo(historyRef.current.length > 1);
  }, []);

  /* ── Dibujo ──────────────────────────────────────────────────────────── */
  const startDraw = (e) => {
    if (activeTool === TOOLS.TEXT) return;
    e.preventDefault();
    isDrawing.current = true;
    saveSnapshot();
    lastPos.current = getPos(e);
  };

  const draw = (e) => {
    if (!isDrawing.current || activeTool === TOOLS.TEXT) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    const pos    = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.lineWidth   = activeTool === TOOLS.ERASE ? brushSize * 5 : brushSize;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";
    ctx.globalCompositeOperation = activeTool === TOOLS.ERASE ? "destination-out" : "source-over";
    ctx.strokeStyle = activeTool === TOOLS.ERASE ? "rgba(0,0,0,1)" : drawColor;
    ctx.stroke();
    lastPos.current = pos;
  };

  const endDraw = () => {
    if (isDrawing.current) {
      isDrawing.current = false;
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) ctx.globalCompositeOperation = "source-over";
    }
  };

  /* ── Texto ───────────────────────────────────────────────────────────── */
  const handleCanvasClick = (e) => {
    if (activeTool !== TOOLS.TEXT || !textInput.trim()) return;
    saveSnapshot();
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    const pos    = getPos(e);
    ctx.font        = `bold ${fontSize}px 'DM Sans', sans-serif`;
    ctx.fillStyle   = textColor;
    ctx.shadowColor = "rgba(0,0,0,0.7)";
    ctx.shadowBlur  = 6;
    ctx.fillText(textInput, pos.x, pos.y);
    ctx.shadowBlur  = 0;
  };

  /* ── Filtros ─────────────────────────────────────────────────────────── */
  const handleApplyFilter = (filterId) => {
    if (filterId === "none") {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx    = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        saveSnapshot();
      };
      img.src = frame.dataURL;
    } else {
      saveSnapshot();
      const canvas = canvasRef.current;
      const ctx    = canvas.getContext("2d");
      const value  = filterId === "brightness" ? brightness : 1;
      applyFilter(ctx, filterId, value);
    }
    setActiveFilter(filterId);
  };

  /* ── Deshacer ────────────────────────────────────────────────────────── */
  const handleUndo = () => {
    if (historyRef.current.length <= 1) return;
    historyRef.current.pop();
    const prev = historyRef.current[historyRef.current.length - 1];
    const img  = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx    = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = prev;
    setCanUndo(historyRef.current.length > 1);
  };

  /* ── Guardar / Descargar ─────────────────────────────────────────────── */
  const handleSave = () => {
    const newDataURL = canvasRef.current.toDataURL("image/jpeg", 0.9);
    onSave(frame.id, newDataURL);
  };

  const handleDownload = () => {
    const dataURL = canvasRef.current.toDataURL("image/jpeg", 0.92);
    downloadDataURL(
      dataURL,
      `frame_${String(frame.timestamp).replace(".","s")}ms_editado.jpg`
    );
  };

  if (!frame) return null;

  return (
    <div className="editor-overlay">
      <div className="frame-editor-panel">

        {/* Header */}
        <div className="frame-editor-header">
          <div className="frame-editor-title-group">
            <div className="frame-editor-icon">
              <Icon.Pen size={15} color="currentColor" />
            </div>
            <h3 className="frame-editor-title">Editor de fotograma</h3>
            <span className="frame-editor-timestamp">
              t = {formatTimestamp(frame.timestamp)}
            </span>
          </div>
          <button
            className="btn btn-ghost btn-icon"
            onClick={onClose}
            aria-label="Cerrar editor"
          >
            <Icon.Close size={16} color="currentColor" />
          </button>
        </div>

        {/* Body */}
        <div className="frame-editor-body">

          {/* ── Toolbar ────────────────────────────────────────────────── */}
          <aside className="frame-editor-toolbar">

            {/* Herramientas */}
            <div className="toolbar-section">
              <p className="toolbar-section-label">Herramienta</p>
              {[
                { id:TOOLS.DRAW,  label:"Dibujar",  Ico: Icon.Brush  },
                { id:TOOLS.ERASE, label:"Borrar",   Ico: Icon.Eraser },
                { id:TOOLS.TEXT,  label:"Texto",    Ico: Icon.Text   },
              ].map(({ id, label, Ico }) => (
                <button
                  key={id}
                  className={`tool-btn ${activeTool === id ? "tool-btn--active" : ""}`}
                  onClick={() => setActiveTool(id)}
                >
                  <Ico size={14} color="currentColor" />
                  {label}
                </button>
              ))}
            </div>

            {/* Pincel */}
            {(activeTool === TOOLS.DRAW || activeTool === TOOLS.ERASE) && (
              <div className="toolbar-section">
                <p className="toolbar-section-label">Pincel</p>
                {activeTool === TOOLS.DRAW && (
                  <div className="color-row">
                    <input
                      type="color"
                      className="color-picker"
                      value={drawColor}
                      onChange={(e) => setDrawColor(e.target.value)}
                      title="Color de dibujo"
                    />
                    <span style={{ fontSize:"10px", color:"var(--text-3)", fontFamily:"var(--font-mono)" }}>
                      {drawColor}
                    </span>
                  </div>
                )}
                <div className="slider-row">
                  <div className="slider-label-row">
                    <span>Grosor</span>
                    <span>{brushSize}px</span>
                  </div>
                  <input
                    type="range" min={1} max={50}
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="slider"
                  />
                </div>
              </div>
            )}

            {/* Texto */}
            {activeTool === TOOLS.TEXT && (
              <div className="toolbar-section">
                <p className="toolbar-section-label">Texto</p>
                <input
                  type="text"
                  className="text-field"
                  placeholder="Escribí aquí..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                />
                <div className="color-row">
                  <input
                    type="color"
                    className="color-picker"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    title="Color de texto"
                  />
                  <span style={{ fontSize:"10px", color:"var(--text-3)", fontFamily:"var(--font-mono)" }}>
                    Color
                  </span>
                </div>
                <div className="slider-row">
                  <div className="slider-label-row">
                    <span>Tamaño</span>
                    <span>{fontSize}px</span>
                  </div>
                  <input
                    type="range" min={10} max={100}
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="slider"
                  />
                </div>
                <p className="text-hint">
                  <Icon.Info size={10} color="currentColor" style={{ display:"inline" }} />
                  {" "}Hacé clic en el canvas para insertar
                </p>
              </div>
            )}

            {/* Filtros */}
            <div className="toolbar-section">
              <p className="toolbar-section-label">Filtros</p>
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  className={`filter-btn ${activeFilter === f.id ? "filter-btn--active" : ""}`}
                  onClick={() => handleApplyFilter(f.id)}
                >
                  {f.label}
                  {activeFilter === f.id && (
                    <Icon.Check size={12} color="currentColor" />
                  )}
                </button>
              ))}
              {activeFilter === "brightness" && (
                <div className="slider-row" style={{ marginTop:"var(--space-2)" }}>
                  <div className="slider-label-row">
                    <span>Brillo</span>
                    <span>{brightness.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range" min={0.1} max={2} step={0.1}
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    onMouseUp={() => handleApplyFilter("brightness")}
                    onTouchEnd={() => handleApplyFilter("brightness")}
                    className="slider"
                  />
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className="toolbar-actions">
              <button
                className="toolbar-action-btn"
                onClick={handleUndo}
                disabled={!canUndo}
                title="Deshacer"
              >
                <Icon.Undo size={14} color="currentColor" />
                Deshacer
              </button>
              <button
                className="toolbar-action-btn toolbar-action-btn--save"
                onClick={handleSave}
                title="Guardar cambios"
              >
                <Icon.Save size={14} color="currentColor" />
                Guardar
              </button>
              <button
                className="toolbar-action-btn"
                onClick={handleDownload}
                title="Descargar frame"
              >
                <Icon.Download size={14} color="currentColor" />
                Descargar
              </button>
            </div>
          </aside>

          {/* ── Canvas ─────────────────────────────────────────────────── */}
          <div className="frame-editor-canvas-wrapper">
            <canvas
              ref={canvasRef}
              className={`frame-editor-canvas ${
                activeTool === TOOLS.DRAW  ? "cursor-draw"  :
                activeTool === TOOLS.ERASE ? "cursor-erase" : "cursor-text"
              }`}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
              onClick={handleCanvasClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}