/**
 * movie/MoviePage.jsx
 * Página individual — mobile first.
 * Usa clases CSS en lugar de style inline para el layout,
 * así las media queries pueden sobreescribirlo.
 */

import { useRef, useState, useEffect, useCallback } from "react";
import { Icon } from "../../icons/Icons";

/* ── Utilidades ────────────────────────────────────────────── */
function pad(n) { return String(Math.floor(n)).padStart(2, "0"); }
function formatTime(s) {
  if (!s || isNaN(s)) return "0:00";
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = Math.floor(s % 60);
  return h > 0 ? `${h}:${pad(m)}:${pad(ss)}` : `${m}:${pad(ss)}`;
}
const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

/* ── Control button ────────────────────────────────────────── */
function CtrlBtn({ onClick, title, children, large, active }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} title={title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: large ? 44 : 36, height: large ? 44 : 36,
        borderRadius: large ? "50%" : "8px", border: "none",
        background: hov ? (large ? "var(--gold)" : "rgba(255,255,255,0.16)")
                        : (active ? "rgba(201,168,76,0.18)" : "rgba(255,255,255,0.07)"),
        color: hov && large ? "#050507" : "rgba(255,255,255,0.92)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", transition: "all 0.12s ease", flexShrink: 0,
        transform: hov ? "scale(1.08)" : "scale(1)",
        minWidth: large ? 44 : 36,
      }}
    >{children}</button>
  );
}

/* ── Reproductor ───────────────────────────────────────────── */
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

  const resetHide = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    if (playing) hideTimer.current = setTimeout(() => setShowControls(false), 3200);
  }, [playing]);

  useEffect(() => { resetHide(); return () => clearTimeout(hideTimer.current); }, [playing, resetHide]);

  useEffect(() => {
    const h = () => {};
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const inPlayer = containerRef.current?.contains(document.activeElement) || document.fullscreenElement;
      if (!inPlayer) return;
      const v = videoRef.current; if (!v) return;
      if (e.code === "Space" || e.code === "KeyK") { e.preventDefault(); v.paused ? v.play() : v.pause(); }
      else if (e.code === "ArrowRight") { e.preventDefault(); v.currentTime = Math.min(v.duration, v.currentTime + 10); }
      else if (e.code === "ArrowLeft")  { e.preventDefault(); v.currentTime = Math.max(0, v.currentTime - 10); }
      else if (e.code === "ArrowUp")    { e.preventDefault(); v.volume = Math.min(1, v.volume + 0.1); setVolume(v.volume); }
      else if (e.code === "ArrowDown")  { e.preventDefault(); v.volume = Math.max(0, v.volume - 0.1); setVolume(v.volume); }
      else if (e.code === "KeyM") { v.muted = !v.muted; setMuted(v.muted); }
      else if (e.code === "KeyF") { if (!document.fullscreenElement) containerRef.current?.requestFullscreen(); else document.exitFullscreen(); }
      resetHide();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [resetHide]);

  const togglePlay = () => { const v = videoRef.current; if (!v) return; v.paused ? v.play() : v.pause(); resetHide(); };
  const skip = (s) => { const v = videoRef.current; if (!v) return; v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + s)); resetHide(); };

  const getRatio = (e) => {
    const bar = progressRef.current; if (!bar) return 0;
    const rect = bar.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    return Math.max(0, Math.min(1, (cx - rect.left) / rect.width));
  };
  const applySeek = (ratio) => {
    const v = videoRef.current; if (!v || !duration) return;
    v.currentTime = ratio * duration; setCurrentTime(ratio * duration);
  };
  const handleProgressDown = (e) => {
    e.stopPropagation(); setDragging(true); applySeek(getRatio(e));
    const move = (ev) => applySeek(getRatio(ev));
    const up = () => { setDragging(false); window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); window.removeEventListener("touchmove", move); window.removeEventListener("touchend", up); };
    window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false }); window.addEventListener("touchend", up);
  };

  const progPct = duration ? (currentTime / duration) * 100 : 0;
  const bufPct  = duration ? (buffered    / duration) * 100 : 0;

  return (
    <div ref={containerRef} tabIndex={0}
      onMouseMove={resetHide}
      onMouseLeave={() => playing && setShowControls(false)}
      onTouchStart={resetHide}
      onClick={(e) => { if (e.target === videoRef.current || e.target === containerRef.current) togglePlay(); }}
      style={{ position: "relative", background: "#000", borderRadius: "16px", overflow: "hidden", aspectRatio: "16/9", width: "100%", cursor: showControls ? "default" : "none", outline: "none", userSelect: "none", boxShadow: "0 16px 50px rgba(0,0,0,0.8)" }}
    >
      <video ref={videoRef} src={src} poster={poster} crossOrigin="anonymous"
        onTimeUpdate={() => { const v = videoRef.current; if (!v || dragging) return; setCurrentTime(v.currentTime); if (v.buffered.length > 0) setBuffered(v.buffered.end(v.buffered.length - 1)); }}
        onLoadedMetadata={(e) => { setDuration(e.target.duration); setVolume(e.target.volume); }}
        onPlay={() => { setPlaying(true); resetHide(); }}
        onPause={() => { setPlaying(false); setShowControls(true); }}
        onEnded={() => { setPlaying(false); setShowControls(true); }}
        onWaiting={() => setBuffering(true)}
        onCanPlay={() => setBuffering(false)}
        style={{ width: "100%", height: "100%", display: "block", objectFit: "contain", cursor: "pointer" }}
        playsInline
      />

      {/* Spinner */}
      {buffering && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ width: 48, height: 48, border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "var(--gold)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        </div>
      )}

      {/* Play overlay */}
      {!playing && !buffering && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(201,168,76,0.9)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 40px rgba(201,168,76,0.5)" }}>
            <Icon.Play size={30} color="#050507" />
          </div>
        </div>
      )}

      {/* Controles */}
      <div onClick={(e) => e.stopPropagation()} style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.5) 55%, transparent 100%)", padding: "48px 12px 12px", opacity: showControls ? 1 : 0, transition: "opacity 0.3s ease", pointerEvents: showControls ? "auto" : "none" }}>

        {/* Barra de progreso */}
        <div ref={progressRef} onMouseDown={handleProgressDown} onTouchStart={handleProgressDown}
          style={{ marginBottom: 10, padding: "6px 0", cursor: "pointer", position: "relative" }}>
          <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.18)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${bufPct}%`, background: "rgba(255,255,255,0.22)", borderRadius: 2 }} />
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${progPct}%`, background: "linear-gradient(90deg, #c9a84c, #e8c96a)", borderRadius: 2 }} />
          </div>
          <div style={{ position: "absolute", left: `${progPct}%`, top: "50%", transform: "translate(-50%,-50%)", width: 14, height: 14, borderRadius: "50%", background: "var(--gold)", opacity: dragging ? 1 : 0, transition: "opacity 0.15s", pointerEvents: "none" }} />
        </div>

        {/* Fila de controles */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "nowrap", overflowX: "auto" }}>
          <CtrlBtn onClick={() => skip(-10)} title="-10s"><Icon.SkipB size={17} color="currentColor" /></CtrlBtn>
          <CtrlBtn onClick={togglePlay} large title={playing ? "Pausar" : "Reproducir"}>
            {playing ? <Icon.Pause size={20} color="currentColor" /> : <Icon.Play size={20} color="currentColor" />}
          </CtrlBtn>
          <CtrlBtn onClick={() => skip(10)} title="+10s"><Icon.SkipF size={17} color="currentColor" /></CtrlBtn>

          {/* Volumen — en mobile solo el botón mute, sin slider */}
          <CtrlBtn onClick={() => { const v = videoRef.current; if (!v) return; v.muted = !v.muted; setMuted(v.muted); }} title="Mute">
            {muted || volume === 0 ? <Icon.Mute size={17} color="currentColor" /> : <Icon.Volume size={17} color="currentColor" />}
          </CtrlBtn>
          <div className="vol-slider-wrapper" style={{ display: "flex", alignItems: "center" }}
            onMouseEnter={() => setShowVol(true)} onMouseLeave={() => setShowVol(false)}>
            <div style={{ width: showVol ? 70 : 0, overflow: "hidden", transition: "width 0.2s ease", display: "flex", alignItems: "center" }}>
              <input type="range" min={0} max={1} step={0.02} value={muted ? 0 : volume}
                onChange={(e) => { const val = parseFloat(e.target.value); const v = videoRef.current; if (v) { v.volume = val; v.muted = val === 0; } setVolume(val); setMuted(val === 0); }}
                onClick={(e) => e.stopPropagation()}
                style={{ width: 66, accentColor: "var(--gold)", cursor: "pointer" }} />
            </div>
          </div>

          {/* Tiempo */}
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "rgba(255,255,255,0.8)", marginLeft: 4, whiteSpace: "nowrap", letterSpacing: "0.3px", flexShrink: 0 }}>
            {formatTime(currentTime)}<span style={{ color: "rgba(255,255,255,0.3)", margin: "0 4px" }}>/</span>{formatTime(duration)}
          </span>

          <div style={{ flex: 1, minWidth: 4 }} />

          {/* Velocidad */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <CtrlBtn onClick={(e) => { e.stopPropagation(); setShowSpeed(s => !s); }} title="Velocidad" active={speed !== 1}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, color: speed !== 1 ? "var(--gold)" : "inherit" }}>{speed}x</span>
            </CtrlBtn>
            {showSpeed && (
              <div onClick={(e) => e.stopPropagation()} style={{ position: "absolute", bottom: "calc(100% + 8px)", right: 0, background: "rgba(8,8,16,0.98)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "12px", padding: 6, minWidth: 90, boxShadow: "0 20px 60px rgba(0,0,0,0.8)", zIndex: 200 }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", padding: "4px 8px 8px", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 4 }}>Velocidad</p>
                {SPEEDS.map((s) => (
                  <button key={s} onClick={() => { const v = videoRef.current; if (v) v.playbackRate = s; setSpeed(s); setShowSpeed(false); }}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "7px 10px", borderRadius: "6px", border: "none", background: speed === s ? "rgba(201,168,76,0.15)" : "transparent", color: speed === s ? "var(--gold)" : "rgba(255,255,255,0.75)", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: speed === s ? 600 : 400, cursor: "pointer", gap: 8 }}>
                    {s}x {speed === s && <Icon.Check size={11} color="var(--gold)" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* PiP */}
          {"pictureInPictureEnabled" in document && (
            <CtrlBtn onClick={async (e) => { e.stopPropagation(); try { if (document.pictureInPictureElement) await document.exitPictureInPicture(); else await videoRef.current?.requestPictureInPicture(); } catch {} }} title="PiP">
              <Icon.Layers size={16} color="currentColor" />
            </CtrlBtn>
          )}

          {/* Fullscreen */}
          <CtrlBtn onClick={() => { if (!document.fullscreenElement) containerRef.current?.requestFullscreen(); else document.exitFullscreen(); }} title="Pantalla completa (F)">
            <Icon.Fullscreen size={17} color="currentColor" />
          </CtrlBtn>
        </div>
      </div>
    </div>
  );
}

/* ── Poster placeholder ─────────────────────────────────────── */
const makePoster = (t) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600"><rect width="400" height="600" fill="#111120"/><text x="200" y="310" text-anchor="middle" font-family="Georgia" font-size="14" fill="#4a4760" font-style="italic">${t.substring(0,24)}</text></svg>`)}`;

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
  ].filter(r => r.value);

  return (
    <div style={{ minHeight: "100vh", background: "var(--void)" }}>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="movie-page-hero">
        {/* Backdrop */}
        <div style={{ position: "absolute", inset: 0 }}>
          <img src={poster} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(3px) brightness(0.28)", transform: "scale(1.06)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(5,5,7,0.97) 0%, rgba(5,5,7,0.72) 55%, rgba(5,5,7,0.35) 100%), linear-gradient(to top, rgba(5,5,7,1) 0%, transparent 55%)" }} />
        </div>

        {/* Grid hero */}
        <div className="movie-page-hero-grid">
          {/* Poster */}
          <div style={{ borderRadius: "14px", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.7)", aspectRatio: "2/3", maxWidth: "100%" }}>
            <img src={poster} alt={movie.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={(e) => { e.target.src = makePoster(movie.title); }} />
          </div>

          {/* Info */}
          <div>
            <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.4)", fontSize: 12, background: "none", border: "none", cursor: "pointer", marginBottom: 16, padding: 0, fontFamily: "var(--font-mono)", letterSpacing: "0.5px", transition: "color 0.15s" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "var(--gold)"}
              onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
            >
              <Icon.Back size={14} color="currentColor" />
              Volver
            </button>

            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "3px", textTransform: "uppercase", color: "var(--gold)", marginBottom: 12 }}>
              <Icon.Tag size={11} color="currentColor" />{movie.category}
            </div>

            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px, 5vw, 68px)", fontWeight: 900, color: "#f2efe8", lineHeight: 1.05, marginBottom: 14 }}>
              {movie.title}
            </h1>

            {/* Meta */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 14, alignItems: "center" }}>
              {movie.year     && <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "rgba(255,255,255,0.6)" }}><Icon.Calendar size={13} color="currentColor" />{movie.year}</span>}
              {movie.duration && <><span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.25)", flexShrink: 0 }} /><span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "rgba(255,255,255,0.6)" }}><Icon.Clock size={13} color="currentColor" />{movie.duration}</span></>}
              {movie.language && <><span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.25)", flexShrink: 0 }} /><span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{movie.language}</span></>}
            </div>

            {movie.description && (
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.75, maxWidth: 560, marginBottom: 24 }}>
                {movie.description}
              </p>
            )}

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn btn-primary btn-lg"
                onClick={() => document.getElementById("player-anchor")?.scrollIntoView({ behavior: "smooth" })}>
                <Icon.Play size={17} color="currentColor" />
                Reproducir
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => onEditFrames(movie)}>
                <Icon.Scissors size={15} color="currentColor" />
                Editar frames
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Player + Ficha ───────────────────────────────────── */}
      <div id="player-anchor" className="movie-page-content-grid">

        {/* Player */}
        <div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "3px", textTransform: "uppercase", color: "var(--gold)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <Icon.Video size={12} color="currentColor" />
            Reproductor
          </p>

          <VideoPlayer src={movie.video_url} poster={movie.poster_url} />

          {/* Atajos — ocultos en mobile via CSS */}
          <div className="movie-keyboard-hints" style={{ marginTop: 14, padding: "14px 18px", background: "var(--surface)", border: "1px solid var(--border-1)", borderRadius: "12px" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-4)", marginBottom: 10 }}>
              Atajos de teclado — hacé clic en el video primero
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
              {[["Espacio / K","Play / Pause"],["← →","±10 segundos"],["↑ ↓","Volumen"],["M","Silenciar"],["F","Pantalla completa"]].map(([k, d]) => (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-3)" }}>
                  <kbd style={{ background: "var(--elevated)", border: "1px solid var(--border-2)", borderRadius: 4, padding: "2px 7px", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-2)", whiteSpace: "nowrap" }}>{k}</kbd>
                  {d}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ficha técnica */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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
            <p style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.7, marginBottom: 14 }}>
              Extraé fotogramas y editá cada uno con herramientas profesionales.
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