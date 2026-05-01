/**
 * movie/MoviePage.jsx
 * Página individual de película — estilo Cuevana/Netflix.
 * Incluye el reproductor profesional con todos los controles.
 * Sin sidebar de editor, sin drop zone, sin botón demo.
 */

import { useRef, useState, useEffect, useCallback } from "react";
import { Icon } from "../../icons/Icons";

/* ══════════════════════════════════════════════════════════════
   UTILIDADES
   ══════════════════════════════════════════════════════════════ */

function pad(n) { return String(Math.floor(n)).padStart(2, "0"); }

function formatTime(secs) {
  if (!secs || isNaN(secs)) return "0:00";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

/* ══════════════════════════════════════════════════════════════
   BOTÓN DE CONTROL
   ══════════════════════════════════════════════════════════════ */

function ControlBtn({ onClick, title, children, large, active }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width:          large ? 44 : 36,
        height:         large ? 44 : 36,
        borderRadius:   large ? "50%" : "8px",
        border:         "none",
        background:     hov
          ? (large ? "var(--gold)" : "rgba(255,255,255,0.16)")
          : (active ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.07)"),
        color:          hov && large ? "#050507" : "rgba(255,255,255,0.92)",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        cursor:         "pointer",
        transition:     "all 0.12s ease",
        flexShrink:     0,
        transform:      hov ? "scale(1.08)" : "scale(1)",
      }}
    >
      {children}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════
   REPRODUCTOR PROFESIONAL
   ══════════════════════════════════════════════════════════════ */

function VideoPlayer({ src, poster }) {
  const videoRef     = useRef(null);
  const containerRef = useRef(null);
  const progressRef  = useRef(null);
  const hideTimer    = useRef(null);

  const [playing,      setPlaying]      = useState(false);
  const [currentTime,  setCurrentTime]  = useState(0);
  const [duration,     setDuration]     = useState(0);
  const [buffered,     setBuffered]     = useState(0);
  const [volume,       setVolume]       = useState(1);
  const [muted,        setMuted]        = useState(false);
  const [speed,        setSpeed]        = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showSpeed,    setShowSpeed]    = useState(false);
  const [showVol,      setShowVol]      = useState(false);
  const [dragging,     setDragging]     = useState(false);
  const [buffering,    setBuffering]    = useState(false);
  const [fullscreen,   setFullscreen]   = useState(false);

  /* Ocultar controles automáticamente */
  const resetHide = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    if (playing) {
      hideTimer.current = setTimeout(() => setShowControls(false), 3200);
    }
  }, [playing]);

  useEffect(() => { resetHide(); return () => clearTimeout(hideTimer.current); }, [playing, resetHide]);

  /* Fullscreen */
  useEffect(() => {
    const h = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  /* Atajos de teclado */
  useEffect(() => {
    const handler = (e) => {
      const inPlayer = containerRef.current?.contains(document.activeElement) || document.fullscreenElement;
      if (!inPlayer) return;
      const v = videoRef.current;
      if (!v) return;
      switch (e.code) {
        case "Space": case "KeyK":
          e.preventDefault();
          v.paused ? v.play() : v.pause();
          break;
        case "ArrowRight": e.preventDefault(); v.currentTime = Math.min(v.duration, v.currentTime + 10); break;
        case "ArrowLeft":  e.preventDefault(); v.currentTime = Math.max(0, v.currentTime - 10); break;
        case "ArrowUp":    e.preventDefault(); v.volume = Math.min(1, v.volume + 0.1); setVolume(v.volume); break;
        case "ArrowDown":  e.preventDefault(); v.volume = Math.max(0, v.volume - 0.1); setVolume(v.volume); break;
        case "KeyM": v.muted = !v.muted; setMuted(v.muted); break;
        case "KeyF":
          if (!document.fullscreenElement) containerRef.current?.requestFullscreen();
          else document.exitFullscreen();
          break;
        default: break;
      }
      resetHide();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [resetHide]);

  /* Acciones */
  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    v.paused ? v.play() : v.pause();
    resetHide();
  };

  const skip = (s) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + s));
    resetHide();
  };

  /* Seek drag */
  const getRatio = (e) => {
    const bar  = progressRef.current;
    if (!bar) return 0;
    const rect = bar.getBoundingClientRect();
    const cx   = e.touches ? e.touches[0].clientX : e.clientX;
    return Math.max(0, Math.min(1, (cx - rect.left) / rect.width));
  };

  const applySeek = (ratio) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    v.currentTime = ratio * duration;
    setCurrentTime(ratio * duration);
  };

  const handleProgressDown = (e) => {
    e.stopPropagation();
    setDragging(true);
    applySeek(getRatio(e));
    const move = (ev) => applySeek(getRatio(ev));
    const up   = () => {
      setDragging(false);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup",   up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend",  up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup",   up);
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend",  up);
  };

  /* Eventos video */
  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || dragging) return;
    setCurrentTime(v.currentTime);
    if (v.buffered.length > 0) setBuffered(v.buffered.end(v.buffered.length - 1));
  };

  const progPct = duration ? (currentTime / duration) * 100 : 0;
  const bufPct  = duration ? (buffered    / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onMouseMove={resetHide}
      onMouseLeave={() => playing && setShowControls(false)}
      onClick={(e) => { if (e.target === videoRef.current || e.target === containerRef.current) togglePlay(); }}
      style={{
        position:     "relative",
        background:   "#000",
        borderRadius: "16px",
        overflow:     "hidden",
        aspectRatio:  "16/9",
        width:        "100%",
        cursor:       showControls ? "default" : "none",
        outline:      "none",
        userSelect:   "none",
        boxShadow:    "0 20px 60px rgba(0,0,0,0.8)",
      }}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        crossOrigin="anonymous"
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={(e) => { setDuration(e.target.duration); setVolume(e.target.volume); }}
        onPlay={() => { setPlaying(true); resetHide(); }}
        onPause={() => { setPlaying(false); setShowControls(true); }}
        onEnded={() => { setPlaying(false); setShowControls(true); }}
        onWaiting={() => setBuffering(true)}
        onCanPlay={() => setBuffering(false)}
        style={{ width: "100%", height: "100%", display: "block", objectFit: "contain", cursor: "pointer" }}
      />

      {/* Buffering spinner */}
      {buffering && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ width: 52, height: 52, border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "var(--gold)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        </div>
      )}

      {/* Overlay play cuando está pausado */}
      {!playing && !buffering && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(201,168,76,0.88)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 50px rgba(201,168,76,0.5)" }}>
            <Icon.Play size={34} color="#050507" />
          </div>
        </div>
      )}

      {/* Panel de controles */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position:   "absolute", bottom: 0, left: 0, right: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.55) 55%, transparent 100%)",
          padding:    "56px 20px 16px",
          opacity:    showControls ? 1 : 0,
          transition: "opacity 0.3s ease",
          pointerEvents: showControls ? "auto" : "none",
        }}
      >

        {/* ── Barra de progreso ──────────────────────────────────── */}
        <div
          ref={progressRef}
          onMouseDown={handleProgressDown}
          onTouchStart={handleProgressDown}
          style={{ marginBottom: 12, padding: "8px 0", cursor: "pointer", position: "relative" }}
        >
          {/* Preview de tiempo al hover — track */}
          <div
            style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.18)", position: "relative", overflow: "hidden", transition: "height 0.15s" }}
            onMouseEnter={(e) => e.currentTarget.style.height = "6px"}
            onMouseLeave={(e) => e.currentTarget.style.height = "4px"}
          >
            {/* Buffered */}
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${bufPct}%`, background: "rgba(255,255,255,0.22)", borderRadius: 2 }} />
            {/* Progreso */}
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${progPct}%`, background: "linear-gradient(90deg, #c9a84c, #e8c96a)", borderRadius: 2 }} />
          </div>
          {/* Thumb */}
          <div style={{ position: "absolute", left: `${progPct}%`, top: "50%", transform: "translate(-50%, -50%)", width: 16, height: 16, borderRadius: "50%", background: "var(--gold)", boxShadow: "0 0 8px rgba(201,168,76,0.8)", opacity: dragging ? 1 : 0, transition: "opacity 0.15s", pointerEvents: "none" }} />
        </div>

        {/* ── Fila de controles ─────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>

          {/* Skip −10 */}
          <ControlBtn onClick={() => skip(-10)} title="−10 segundos (←)">
            <Icon.SkipB size={18} color="currentColor" />
          </ControlBtn>

          {/* Play/Pause */}
          <ControlBtn onClick={togglePlay} title={playing ? "Pausar (K)" : "Reproducir (K)"} large>
            {playing ? <Icon.Pause size={22} color="currentColor" /> : <Icon.Play size={22} color="currentColor" />}
          </ControlBtn>

          {/* Skip +10 */}
          <ControlBtn onClick={() => skip(10)} title="+10 segundos (→)">
            <Icon.SkipF size={18} color="currentColor" />
          </ControlBtn>

          {/* Volumen */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, position: "relative" }}
            onMouseEnter={() => setShowVol(true)}
            onMouseLeave={() => setShowVol(false)}
          >
            <ControlBtn onClick={() => { const v = videoRef.current; if (!v) return; v.muted = !v.muted; setMuted(v.muted); }} title="Silenciar (M)">
              {muted || volume === 0 ? <Icon.Mute size={18} color="currentColor" /> : <Icon.Volume size={18} color="currentColor" />}
            </ControlBtn>
            <div style={{ width: showVol ? 80 : 0, overflow: "hidden", transition: "width 0.2s ease", display: "flex", alignItems: "center" }}>
              <input
                type="range" min={0} max={1} step={0.02}
                value={muted ? 0 : volume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  const v = videoRef.current;
                  if (v) { v.volume = val; v.muted = val === 0; }
                  setVolume(val); setMuted(val === 0);
                }}
                onClick={(e) => e.stopPropagation()}
                style={{ width: 74, accentColor: "var(--gold)", cursor: "pointer" }}
              />
            </div>
          </div>

          {/* Tiempo */}
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "rgba(255,255,255,0.85)", marginLeft: 6, whiteSpace: "nowrap", letterSpacing: "0.5px" }}>
            {formatTime(currentTime)}
            <span style={{ color: "rgba(255,255,255,0.3)", margin: "0 5px" }}>/</span>
            {formatTime(duration)}
          </span>

          <div style={{ flex: 1 }} />

          {/* Velocidad */}
          <div style={{ position: "relative" }}>
            <ControlBtn
              onClick={(e) => { e.stopPropagation(); setShowSpeed((s) => !s); }}
              title="Velocidad de reproducción"
              active={speed !== 1}
            >
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, color: speed !== 1 ? "var(--gold)" : "inherit", letterSpacing: "0.5px" }}>
                {speed}x
              </span>
            </ControlBtn>
            {showSpeed && (
              <div onClick={(e) => e.stopPropagation()} style={{ position: "absolute", bottom: "calc(100% + 10px)", right: 0, background: "rgba(8,8,16,0.98)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "12px", padding: "6px", minWidth: 100, boxShadow: "0 20px 60px rgba(0,0,0,0.8)", zIndex: 200 }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", padding: "4px 8px 8px", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 4 }}>Velocidad</p>
                {SPEEDS.map((s) => (
                  <button key={s}
                    onClick={() => { const v = videoRef.current; if (v) v.playbackRate = s; setSpeed(s); setShowSpeed(false); }}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "7px 10px", borderRadius: "6px", border: "none", background: speed === s ? "rgba(201,168,76,0.15)" : "transparent", color: speed === s ? "var(--gold)" : "rgba(255,255,255,0.75)", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: speed === s ? 600 : 400, cursor: "pointer", gap: 8 }}
                    onMouseEnter={(e) => { if (speed !== s) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                    onMouseLeave={(e) => { if (speed !== s) e.currentTarget.style.background = "transparent"; }}
                  >
                    {s}x {speed === s && <Icon.Check size={11} color="var(--gold)" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Picture in Picture */}
          {"pictureInPictureEnabled" in document && (
            <ControlBtn
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  if (document.pictureInPictureElement) await document.exitPictureInPicture();
                  else await videoRef.current?.requestPictureInPicture();
                } catch {}
              }}
              title="Picture in Picture"
            >
              <Icon.Layers size={17} color="currentColor" />
            </ControlBtn>
          )}

          {/* Fullscreen */}
          <ControlBtn
            onClick={() => {
              if (!document.fullscreenElement) containerRef.current?.requestFullscreen();
              else document.exitFullscreen();
            }}
            title="Pantalla completa (F)"
          >
            <Icon.Fullscreen size={18} color="currentColor" />
          </ControlBtn>

        </div>

        {/* Atajos de teclado hint */}
        <div style={{ display: "flex", gap: 14, marginTop: 10, opacity: 0.28, pointerEvents: "none", flexWrap: "wrap" }}>
          {[["K","Play/Pause"],["← →","±10s"],["↑ ↓","Vol"],["M","Mute"],["F","Full"]].map(([k, h]) => (
            <span key={k} style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#fff", display: "flex", gap: 5, alignItems: "center" }}>
              <kbd style={{ background: "rgba(255,255,255,0.1)", padding: "1px 6px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.15)", fontSize: 10 }}>{k}</kbd>
              {h}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   POSTER PLACEHOLDER
   ══════════════════════════════════════════════════════════════ */

const makePoster = (title) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600"><rect width="400" height="600" fill="#111120"/><text x="200" y="310" text-anchor="middle" font-family="Georgia" font-size="14" fill="#4a4760" font-style="italic">${title.substring(0, 24)}</text></svg>`)}`;

/* ══════════════════════════════════════════════════════════════
   MOVIE PAGE
   ══════════════════════════════════════════════════════════════ */

export default function MoviePage({ movie, onBack, onEditFrames }) {
  const poster = movie.poster_url || makePoster(movie.title);

  const INFO_ROWS = [
    { label: "Director",  value: movie.director  },
    { label: "Año",       value: movie.year       },
    { label: "Duración",  value: movie.duration   },
    { label: "Idioma",    value: movie.language   },
    { label: "Categoría", value: movie.category   },
  ].filter((r) => r.value);

  return (
    <div style={{ minHeight: "100vh", background: "var(--void)" }}>

      {/* ── Hero con backdrop ─────────────────────────────────────── */}
      <div style={{ position: "relative", minHeight: "70vh", display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
        {/* Backdrop */}
        <div style={{ position: "absolute", inset: 0 }}>
          <img src={poster} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(3px) brightness(0.28)", transform: "scale(1.06)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(5,5,7,0.97) 0%, rgba(5,5,7,0.72) 55%, rgba(5,5,7,0.35) 100%), linear-gradient(to top, rgba(5,5,7,1) 0%, transparent 55%)" }} />
        </div>

        {/* Contenido del hero */}
        <div style={{ position: "relative", zIndex: 2, display: "grid", gridTemplateColumns: "220px 1fr", gap: "40px", padding: "80px 64px 48px", width: "100%", maxWidth: 1400, alignItems: "end" }}>

          {/* Poster */}
          <div style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)", aspectRatio: "2/3", flexShrink: 0 }}>
            <img src={poster} alt={movie.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={(e) => { e.target.src = makePoster(movie.title); }} />
          </div>

          {/* Info */}
          <div>
            {/* Volver */}
            <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.4)", fontSize: 12, background: "none", border: "none", cursor: "pointer", marginBottom: 20, padding: 0, fontFamily: "var(--font-mono)", letterSpacing: "0.5px", transition: "color 0.15s" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "var(--gold)"}
              onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
            >
              <Icon.Back size={14} color="currentColor" />
              Volver al catálogo
            </button>

            {/* Categoría */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "3px", textTransform: "uppercase", color: "var(--gold)", marginBottom: 16 }}>
              <Icon.Tag size={11} color="currentColor" />
              {movie.category}
            </div>

            {/* Título */}
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px, 5vw, 68px)", fontWeight: 900, color: "#f2efe8", lineHeight: 1.05, marginBottom: 18 }}>
              {movie.title}
            </h1>

            {/* Meta */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 20, alignItems: "center" }}>
              {movie.year && <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "rgba(255,255,255,0.65)" }}><Icon.Calendar size={14} color="currentColor" />{movie.year}</span>}
              {movie.duration && <><span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.25)" }} /><span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "rgba(255,255,255,0.65)" }}><Icon.Clock size={14} color="currentColor" />{movie.duration}</span></>}
              {movie.language && <><span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.25)" }} /><span style={{ fontSize: 14, color: "rgba(255,255,255,0.65)" }}>{movie.language}</span></>}
            </div>

            {/* Descripción */}
            {movie.description && (
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, maxWidth: 580, marginBottom: 28 }}>
                {movie.description}
              </p>
            )}

            {/* Acciones */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => document.getElementById("player-anchor")?.scrollIntoView({ behavior: "smooth" })}
              >
                <Icon.Play size={18} color="currentColor" />
                Reproducir
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => onEditFrames(movie)}>
                <Icon.Scissors size={16} color="currentColor" />
                Editar frames
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Player + Ficha ───────────────────────────────────────── */}
      <div id="player-anchor" style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 32, padding: "48px 64px", maxWidth: 1400 }}>

        {/* Player */}
        <div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "3px", textTransform: "uppercase", color: "var(--gold)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <Icon.Video size={12} color="currentColor" />
            Reproductor
          </p>

          <VideoPlayer src={movie.video_url} poster={movie.poster_url} />

          {/* Atajos */}
          <div style={{ marginTop: 16, padding: "16px 20px", background: "var(--surface)", border: "1px solid var(--border-1)", borderRadius: "12px" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-4)", marginBottom: 12 }}>
              Atajos de teclado — hacé clic en el video primero
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
              {[
                ["Espacio / K", "Play / Pause"],
                ["← →",         "±10 segundos"],
                ["↑ ↓",         "Volumen"],
                ["M",           "Silenciar"],
                ["F",           "Pantalla completa"],
              ].map(([key, desc]) => (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-3)" }}>
                  <kbd style={{ background: "var(--elevated)", border: "1px solid var(--border-2)", borderRadius: 4, padding: "2px 7px", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-2)", whiteSpace: "nowrap" }}>
                    {key}
                  </kbd>
                  {desc}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ficha técnica */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="movie-info-card">
            <div className="movie-info-card-title">
              <Icon.Info size={12} color="currentColor" />
              Ficha técnica
            </div>
            {INFO_ROWS.map(({ label, value }) => (
              <div key={label} className="movie-info-row">
                <span className="movie-info-label">{label}</span>
                <span className="movie-info-value">{String(value)}</span>
              </div>
            ))}
          </div>

          <div className="movie-info-card" style={{ background: "var(--gold-dim)", borderColor: "rgba(201,168,76,0.2)" }}>
            <div className="movie-info-card-title" style={{ color: "var(--gold)" }}>
              <Icon.Scissors size={12} color="currentColor" />
              Estudio de edición
            </div>
            <p style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.7, marginBottom: 16 }}>
              Extraé fotogramas y editá cada uno con herramientas profesionales de dibujo, texto y filtros.
            </p>
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => onEditFrames(movie)}>
              <Icon.Clapboard size={15} color="currentColor" />
              Abrir en el Estudio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}