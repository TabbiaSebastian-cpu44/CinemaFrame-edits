/**
 * studio/StudioPage.jsx
 * Selector de película para abrir en el editor de frames.
 * Grid 3D con animaciones de entrada escalonadas.
 */

import { useState } from "react";
import { Icon } from "../../icons/Icons";

const POSTER_PLACEHOLDER = (title) =>
  `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
      <rect width="300" height="450" fill="#111120"/>
      <rect x="0" y="0" width="300" height="2" fill="#c9a84c" opacity="0.4"/>
      <text x="150" y="240" text-anchor="middle" font-family="Georgia" font-size="13" font-style="italic" fill="#4a4760">${title.substring(0,20)}</text>
    </svg>
  `)}`;

export default function StudioPage({ movies, onSelectMovie }) {
  const [search, setSearch] = useState("");

  const filtered = movies.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="studio-page">
      {/* Header */}
      <div className="studio-header">
        <div className="studio-eyebrow">
          <Icon.Clapboard size={14} color="currentColor" />
          Estudio de edición
        </div>
        <h1 className="studio-title">
          Elegí una película
        </h1>
        <p className="studio-subtitle">
          Seleccioná una película para extraer sus fotogramas
          y editarlos con las herramientas del estudio.
        </p>
      </div>

      {/* Búsqueda rápida */}
      <div style={{ marginBottom:"var(--space-8)", maxWidth:"440px", position:"relative" }}>
        <div style={{
          position:"absolute", left:"var(--space-4)", top:"50%",
          transform:"translateY(-50%)", color:"var(--text-3)",
          display:"flex", alignItems:"center", pointerEvents:"none",
        }}>
          <Icon.Search size={16} color="currentColor" />
        </div>
        <input
          type="search"
          className="search-input"
          placeholder="Filtrar películas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Info panel */}
      <div style={{
        display:"flex", alignItems:"center", gap:"var(--space-3)",
        padding:"var(--space-4) var(--space-5)",
        background:"var(--indigo-dim)",
        border:"1px solid rgba(80,96,208,0.2)",
        borderRadius:"var(--r-lg)",
        marginBottom:"var(--space-8)",
        fontSize:"var(--text-xs)", color:"var(--indigo-bright)",
        lineHeight:1.6, maxWidth:"600px",
      }}>
        <Icon.Info size={16} color="currentColor" style={{ flexShrink:0 }} />
        <span>
          Hacé clic sobre cualquier película para abrirla en el editor.
          Podés extraer fotogramas a distintos FPS y editar cada uno individualmente.
        </span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="catalog-empty">
          <div className="catalog-empty-icon">
            <Icon.Film size={36} color="currentColor" />
          </div>
          <p className="catalog-empty-title">Sin resultados</p>
          <p className="catalog-empty-sub">No hay películas que coincidan con "{search}".</p>
        </div>
      ) : (
        <div className="studio-grid">
          {filtered.map((movie, i) => (
            <StudioMovieCard
              key={movie.id}
              movie={movie}
              index={i}
              onSelect={() => onSelectMovie(movie)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StudioMovieCard({ movie, index, onSelect }) {
  const poster = movie.poster_url || POSTER_PLACEHOLDER(movie.title);

  return (
    <article
      className="studio-movie-card"
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      style={{ animationDelay: `${index * 0.05}s` }}
      aria-label={`Editar frames de ${movie.title}`}
    >
      <div className="studio-movie-card-poster">
        <img
          src={poster}
          alt={`Poster de ${movie.title}`}
          loading="lazy"
          onError={(e) => { e.target.src = POSTER_PLACEHOLDER(movie.title); }}
        />
        <div className="studio-movie-card-overlay">
          <button className="studio-select-btn">
            <Icon.Scissors size={13} color="currentColor" />
            Editar frames
          </button>
        </div>

        {movie.isDefault && (
          <span style={{
            position:"absolute", top:"var(--space-2)", left:"var(--space-2)",
            background:"linear-gradient(135deg, var(--gold), #a87828)",
            color:"var(--void)", fontSize:"9px", fontWeight:700,
            padding:"2px var(--space-2)", borderRadius:"var(--r-xs)",
            fontFamily:"var(--font-mono)", letterSpacing:"1px",
          }}>
            Demo
          </span>
        )}
      </div>

      <div className="studio-movie-card-info">
        <h3 className="studio-movie-card-title">{movie.title}</h3>
        <div style={{ display:"flex", gap:"var(--space-2)", flexWrap:"wrap" }}>
          {movie.category && (
            <span style={{
              fontFamily:"var(--font-mono)", fontSize:"10px",
              color:"var(--text-3)", background:"var(--elevated)",
              padding:"2px var(--space-2)", borderRadius:"var(--r-xs)",
              border:"1px solid var(--border-1)",
            }}>
              {movie.category}
            </span>
          )}
          {movie.year && (
            <span style={{
              fontFamily:"var(--font-mono)", fontSize:"10px",
              color:"var(--text-3)",
            }}>
              {movie.year}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}