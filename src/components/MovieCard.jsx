/**
 * MovieCard.jsx
 * Tarjeta de película con efecto 3D, overlay animado e iconos SVG.
 */

import { Icon } from "../icons/Icons";

const CATEGORY_COLORS = {
  "Animación":       { color: "#e8a020", bg: "rgba(232,160,32,0.12)"  },
  "Acción":          { color: "#e03868", bg: "rgba(224,56,104,0.12)"  },
  "Drama":           { color: "#8060d8", bg: "rgba(128,96,216,0.12)"  },
  "Comedia":         { color: "#20c870", bg: "rgba(32,200,112,0.12)"  },
  "Terror":          { color: "#c030e8", bg: "rgba(192,48,232,0.12)"  },
  "Ciencia ficción": { color: "#20a8e8", bg: "rgba(32,168,232,0.12)"  },
  "Documental":      { color: "#e87020", bg: "rgba(232,112,32,0.12)"  },
  "Infantil":        { color: "#e820a0", bg: "rgba(232,32,160,0.12)"  },
};

const POSTER_PLACEHOLDER = (title) =>
  `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#111120"/>
          <stop offset="100%" stop-color="#0d0d18"/>
        </linearGradient>
      </defs>
      <rect width="300" height="450" fill="url(#g)"/>
      <rect x="0" y="0" width="300" height="3" fill="#c9a84c" opacity="0.5"/>
      <rect x="0" y="447" width="300" height="3" fill="#c9a84c" opacity="0.5"/>
      <text x="150" y="210" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="#4a4760" letter-spacing="2">SIN POSTER</text>
      <text x="150" y="245" text-anchor="middle" font-family="Georgia,serif" font-size="15" font-style="italic" fill="#7a7690">${title.substring(0,22)}</text>
    </svg>
  `)}`;

export default function MovieCard({ movie, onEdit, onWatch }) {
  const cat = CATEGORY_COLORS[movie.category] || { color: "#9b97a0", bg: "rgba(155,151,160,0.1)" };
  const poster = movie.poster_url || POSTER_PLACEHOLDER(movie.title);

  return (
    <article className="movie-card" role="article">
      {/* Poster */}
      <div className="movie-card-poster-wrapper">
        <img
          src={poster}
          alt={`Poster de ${movie.title}`}
          className="movie-card-poster"
          loading="lazy"
          onError={(e) => { e.target.src = POSTER_PLACEHOLDER(movie.title); }}
        />

        <div className="movie-card-poster-overlay" />

        {/* Acciones */}
        <div className="movie-card-actions">
          {onWatch && (
            <button className="movie-card-action-btn movie-card-action-btn--primary" onClick={() => onWatch(movie)}>
              <Icon.Play size={12} color="currentColor" />
              Ver
            </button>
          )}
          <button className="movie-card-action-btn" onClick={() => onEdit(movie)}>
            <Icon.Scissors size={12} color="currentColor" />
            Editar frames
          </button>
        </div>

        {/* Badge default */}
        {movie.isDefault && (
          <span className="movie-card-badge movie-card-badge--default">Demo</span>
        )}

        {/* Badge categoría */}
        <span
          className="movie-card-category-badge"
          style={{ color: cat.color, background: cat.bg, borderColor: `${cat.color}44` }}
        >
          {movie.category}
        </span>
      </div>

      {/* Info */}
      <div className="movie-card-info">
        <h3 className="movie-card-title">{movie.title}</h3>
        <div className="movie-card-meta">
          {movie.year     && <span className="movie-meta-chip">{movie.year}</span>}
          {movie.duration && <span className="movie-meta-chip">{movie.duration}</span>}
          {movie.language && <span className="movie-meta-chip">{movie.language}</span>}
        </div>
        {movie.description && (
          <p className="movie-card-description">{movie.description}</p>
        )}
      </div>
    </article>
  );
}