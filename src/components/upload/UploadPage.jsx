/**
 * upload/UploadPage.jsx
 * Formulario multi-step rediseñado con iconos SVG y nuevo CSS luxury.
 * Pasos: Video → Información → Portada → Subiendo
 */

import { useState, useRef, useCallback } from "react";
import { Icon } from "../../icons/Icons";
import { CATEGORIES } from "../../hooks/useMovies";

const STEPS    = ["Video", "Información", "Portada", "Subiendo"];
const LANGS    = ["Español", "Inglés", "Portugués", "Francés", "Japonés", "Otro"];
const STEP_ICONS = [Icon.Film, Icon.Info, Icon.Image, Icon.Zap];

export default function UploadPage({ onUpload, onSuccess, supabaseConfigured = false }) {
  const [step, setStep]             = useState(0);
  const [videoFile, setVideoFile]   = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError]       = useState(null);
  const [uploadDone, setUploadDone]         = useState(false);
  const [form, setForm] = useState({
    title:"", category:"Animación", year:"",
    description:"", director:"", language:"Español", duration:"",
  });

  const videoInputRef  = useRef(null);
  const posterInputRef = useRef(null);

  const updateForm = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const canNext = () => {
    if (step === 0) return !!videoFile;
    if (step === 1) return form.title.trim() !== "";
    return true;
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith("video/")) setVideoFile(file);
  }, []);

  const handlePosterChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPosterFile(file);
    setPosterPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    setStep(3);
    setUploadError(null);
    setUploadProgress(0);
    setUploadDone(false);
    try {
      await onUpload(form, videoFile, posterFile, (cur, total) => {
        setUploadProgress(Math.round((cur / total) * 100));
      });
      setUploadDone(true);
    } catch (err) {
      setUploadError(err.message || "Error desconocido al subir.");
    }
  };

  const resetForm = () => {
    setStep(0); setVideoFile(null); setPosterFile(null);
    setPosterPreview(null); setUploadDone(false);
    setUploadProgress(0); setUploadError(null);
    setForm({ title:"", category:"Animación", year:"", description:"", director:"", language:"Español", duration:"" });
  };

  return (
    <div className="upload-page">
      <div className="upload-container">

        {/* Header */}
        <div className="upload-header">
          <div className="upload-eyebrow">
            <Icon.Upload size={13} color="currentColor" />
            Nueva película
          </div>
          <h1 className="upload-title">Subir al catálogo</h1>
          <p className="upload-subtitle">
            Completá la información para agregar la película al catálogo público.
          </p>
        </div>

        {/* Warning Supabase */}
        {!supabaseConfigured && (
          <div className="warning-banner">
            <Icon.Alert size={16} color="currentColor" style={{ flexShrink:0, marginTop:1 }} />
            <span>
              <strong>Supabase no configurado.</strong> Creá un archivo{" "}
              <code>.env.local</code> con tus credenciales para habilitar la subida pública.
            </span>
          </div>
        )}

        {/* Stepper */}
        <div className="stepper">
          {STEPS.map((label, i) => {
            const StepIcon = STEP_ICONS[i];
            return (
              <div key={i} className="step">
                <div className={`step-node ${i === step ? "step--active" : ""} ${i < step ? "step--done" : ""}`}
                  style={i === step ? {} : i < step ? {} : {}}>
                  {i < step
                    ? <Icon.Check size={14} color="currentColor" />
                    : <StepIcon  size={14} color="currentColor" />
                  }
                  <span className={`step-label ${i === step ? "step--active" : i < step ? "step--done" : ""}`}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`step-line ${i < step ? "step-line--done" : ""}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Paso 0: Video ──────────────────────────────────────────────── */}
        {step === 0 && (
          <div className="upload-step">
            <h3 className="step-title">Seleccioná el archivo de video</h3>

            {!videoFile ? (
              <div
                className="upload-drop-zone"
                onClick={() => videoInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("drag-over"); }}
                onDragLeave={(e) => e.currentTarget.classList.remove("drag-over")}
                role="button" tabIndex={0}
              >
                <div className="upload-drop-icon">
                  <Icon.Film size={28} color="currentColor" />
                </div>
                <p className="upload-drop-title">Arrastrá tu video aquí</p>
                <p className="upload-drop-sub">o hacé clic para seleccionar desde tu computadora</p>
                <p className="upload-drop-formats">MP4 · WebM · OGG · MKV · MOV</p>
                <input ref={videoInputRef} type="file" accept="video/*" style={{ display:"none" }}
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
              </div>
            ) : (
              <div className="upload-file-selected">
                <div className="upload-file-icon">
                  <Icon.Video size={22} color="currentColor" />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p className="upload-file-name">{videoFile.name}</p>
                  <p className="upload-file-size">{(videoFile.size/1024/1024).toFixed(1)} MB</p>
                </div>
                <button
                  className="upload-file-remove"
                  onClick={() => setVideoFile(null)}
                  aria-label="Quitar archivo"
                >
                  <Icon.Close size={14} color="currentColor" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Paso 1: Información ────────────────────────────────────────── */}
        {step === 1 && (
          <div className="upload-step">
            <h3 className="step-title">Información de la película</h3>
            <div className="form-grid">

              <div className="form-field form-field--full">
                <label className="form-label">Título <span className="required">*</span></label>
                <input className="form-input" type="text" placeholder="Nombre de la película"
                  value={form.title} onChange={(e) => updateForm("title", e.target.value)} />
              </div>

              <div className="form-field">
                <label className="form-label">Categoría <span className="required">*</span></label>
                <select className="form-select" value={form.category}
                  onChange={(e) => updateForm("category", e.target.value)}>
                  {CATEGORIES.filter((c) => c !== "Todas").map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">Año de estreno</label>
                <input className="form-input" type="number" placeholder="2024"
                  min="1888" max={new Date().getFullYear()}
                  value={form.year} onChange={(e) => updateForm("year", e.target.value)} />
              </div>

              <div className="form-field">
                <label className="form-label">Director/a</label>
                <input className="form-input" type="text" placeholder="Nombre del director"
                  value={form.director} onChange={(e) => updateForm("director", e.target.value)} />
              </div>

              <div className="form-field">
                <label className="form-label">Idioma</label>
                <select className="form-select" value={form.language}
                  onChange={(e) => updateForm("language", e.target.value)}>
                  {LANGS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">Duración</label>
                <input className="form-input" type="text" placeholder="Ej: 97 min"
                  value={form.duration} onChange={(e) => updateForm("duration", e.target.value)} />
              </div>

              <div className="form-field form-field--full">
                <label className="form-label">Descripción / Sinopsis</label>
                <textarea className="form-textarea" rows={4}
                  placeholder="Breve descripción de la película..."
                  value={form.description} onChange={(e) => updateForm("description", e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* ── Paso 2: Portada ────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="upload-step">
            <h3 className="step-title">
              Imagen de portada{" "}
              <span className="optional">(opcional)</span>
            </h3>

            <div className="poster-upload-area">
              <div
                className={`poster-drop-zone ${posterPreview ? "poster-drop-zone--filled" : ""}`}
                onClick={() => posterInputRef.current?.click()}
                role="button" tabIndex={0}
              >
                {posterPreview
                  ? <img src={posterPreview} alt="Preview del poster" className="poster-preview" />
                  : <>
                      <Icon.Image size={28} color="currentColor" />
                      <p style={{ fontSize:"var(--text-xs)", textAlign:"center" }}>
                        Subir imagen<br />
                        <span style={{ color:"var(--text-4)" }}>JPG · PNG · WebP</span>
                      </p>
                    </>
                }
                <input ref={posterInputRef} type="file" accept="image/*"
                  style={{ display:"none" }} onChange={handlePosterChange} />
              </div>

              <div className="poster-info">
                <p style={{ fontFamily:"var(--font-mono)", fontSize:"10px",
                  letterSpacing:"2px", textTransform:"uppercase", color:"var(--text-3)" }}>
                  Vista previa
                </p>
                <div className="movie-preview-card">
                  <div className="preview-title">{form.title || "Sin título"}</div>
                  <div className="preview-chips">
                    <span className="preview-chip">{form.category}</span>
                    {form.year && <span className="preview-chip">{form.year}</span>}
                    {form.language && <span className="preview-chip">{form.language}</span>}
                    {form.duration && <span className="preview-chip">{form.duration}</span>}
                  </div>
                  {form.description && (
                    <p className="preview-desc">
                      {form.description.substring(0, 150)}
                      {form.description.length > 150 ? "..." : ""}
                    </p>
                  )}
                </div>

                {posterPreview && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => { setPosterFile(null); setPosterPreview(null); }}
                  >
                    <Icon.Trash size={13} color="currentColor" />
                    Quitar imagen
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Paso 3: Progreso ───────────────────────────────────────────── */}
        {step === 3 && (
          <div className="upload-step">
            {!uploadDone && !uploadError && (
              <div className="upload-progress-step">
                <div className="upload-progress-icon">
                  <Icon.Upload size={30} color="currentColor" />
                </div>
                <h3 className="upload-progress-title">Subiendo película...</h3>
                <p className="upload-progress-sub">
                  Esto puede tardar según el tamaño del video. No cerrés la página.
                </p>
                <div className="upload-progress-bar-track">
                  <div className="upload-progress-bar-fill"
                    style={{ width:`${uploadProgress}%` }} />
                </div>
                <p className="upload-progress-pct">{uploadProgress}%</p>
                <div className="upload-steps-list">
                  {["Subiendo video", "Subiendo poster", "Guardando datos", "Completado"].map((s, i) => {
                    const done   = Math.round(uploadProgress / 25) > i;
                    const active = Math.round(uploadProgress / 25) === i;
                    return (
                      <div key={i} className={`upload-step-item ${done ? "upload-step-item--done" : active ? "upload-step-item--active" : ""}`}>
                        <span className="upload-step-dot" />
                        {s}
                        {done && <Icon.Check size={11} color="currentColor" style={{ marginLeft:"auto" }} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {uploadDone && (
              <div className="upload-success">
                <div className="upload-success-icon">
                  <Icon.Check size={36} color="currentColor" />
                </div>
                <h3>¡Película subida con éxito!</h3>
                <p>"{form.title}" ya está disponible en el catálogo público.</p>
                <div className="upload-success-actions">
                  <button className="btn btn-primary btn-lg" onClick={onSuccess}>
                    <Icon.Home size={16} color="currentColor" />
                    Ver en catálogo
                  </button>
                  <button className="btn btn-secondary btn-lg" onClick={resetForm}>
                    <Icon.Plus size={16} color="currentColor" />
                    Subir otra
                  </button>
                </div>
              </div>
            )}

            {uploadError && (
              <div className="upload-error-box">
                <div className="upload-error-icon">
                  <Icon.Alert size={28} color="currentColor" />
                </div>
                <h3 style={{ color:"var(--crimson-bright)", fontFamily:"var(--font-display)", fontSize:"var(--text-xl)" }}>
                  Error al subir
                </h3>
                <p style={{ color:"var(--text-3)", fontSize:"var(--text-sm)" }}>{uploadError}</p>
                <button className="btn btn-secondary" onClick={() => { setStep(2); setUploadError(null); }}>
                  <Icon.Back size={14} color="currentColor" />
                  Volver e intentar
                </button>
              </div>
            )}
          </div>
        )}

        {/* Navegación entre pasos */}
        {step < 3 && (
          <div className="upload-nav">
            {step > 0 && (
              <button className="btn btn-ghost" onClick={() => setStep((s) => s - 1)}>
                <Icon.Back size={14} color="currentColor" />
                Anterior
              </button>
            )}
            <div style={{ flex:1 }} />
            {step < 2 ? (
              <button className="btn btn-primary" onClick={() => setStep((s) => s + 1)} disabled={!canNext()}>
                Siguiente
                <Icon.Arrow size={14} color="currentColor" />
              </button>
            ) : (
              <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={!videoFile || !form.title}>
                <Icon.Zap size={16} color="currentColor" />
                Subir película
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}