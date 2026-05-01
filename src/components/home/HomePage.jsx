/**
 * home/HomePage.jsx
 * Vista principal estilo Cuevana: hero, búsqueda, filtros, grid de películas.
 */

import { Icon } from "../../icons/Icons";
import MovieCard from "../MovieCard";
import { CATEGORIES } from "../../hooks/useMovies";

export default function HomePage({
  movies, loading, error,
  searchQuery, activeCategory,
  onSearch, onCategoryChange,
  onEditMovie, onWatchMovie,
  onNavigateUpload,
}) {
  return (
    <div className="home-page" style={{ display:"flex", flexDirection:"column", minHeight:"100%" }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg" aria-hidden="true" />

        {/* Tira de película decorativa */}
        <div className="hero-filmstrip" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="hero-filmstrip-hole" />
          ))}
        </div>

        {/* Línea scanline */}
        <div className="hero-scanline" aria-hidden="true" />

        <div className="hero-content">
          <div className="hero-eyebrow">
            <Icon.Film size={12} color="currentColor" />
            Editor de fotogramas
          </div>

          <h1 className="hero-title">
            Tu biblioteca<br />
            <em>de películas</em>
          </h1>

          <p className="hero-description">
            Explorá el catálogo, reproducí tus películas favoritas
            y editá cada fotograma directamente en el navegador.
            Sin instalaciones, sin límites.
          </p>

          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={onNavigateUpload}>
              <Icon.Plus size={18} color="currentColor" strokeWidth={2} />
              Subir película
            </button>
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => document.querySelector(".catalog-section")?.scrollIntoView({ behavior:"smooth" })}
            >
              <Icon.Grid size={16} color="currentColor" />
              Ver catálogo
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-value">{movies.length}</span>
            <span className="hero-stat-label">Películas</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-value">HD</span>
            <span className="hero-stat-label">Calidad</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-value">∞</span>
            <span className="hero-stat-label">Frames</span>
          </div>
        </div>
      </section>

      {/* ── Controles del catálogo ───────────────────────────────────────── */}
      <div className="catalog-controls">
        {/* Búsqueda */}
        <div className="search-wrapper">
          <div className="search-icon-wrapper">
            <Icon.Search size={16} color="currentColor" />
          </div>
          <input
            type="search"
            className="search-input"
            placeholder="Buscar por título, director o descripción..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            aria-label="Buscar películas"
          />
          {searchQuery && (
            <button
              className="search-clear"
              onClick={() => onSearch("")}
              aria-label="Limpiar búsqueda"
            >
              <Icon.Close size={14} color="currentColor" />
            </button>
          )}
        </div>

        {/* Categorías */}
        <div className="category-chips" role="group" aria-label="Categorías">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`category-chip ${activeCategory === cat ? "category-chip--active" : ""}`}
              onClick={() => onCategoryChange(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Catálogo ─────────────────────────────────────────────────────── */}
      <section className="catalog-section">
        <div className="catalog-header">
          <h2 className="catalog-title">
            {activeCategory === "Todas" ? "Todo el catálogo" : activeCategory}
          </h2>
          {!loading && (
            <span className="catalog-count">
              {movies.length} resultado{movies.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="skeleton-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-poster" />
                <div className="skeleton-info">
                  <div className="skeleton-line skeleton-line--medium" />
                  <div className="skeleton-line skeleton-line--short" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="catalog-error">
            <Icon.Alert size={18} color="currentColor" />
            <p>{error}</p>
          </div>
        )}

        {/* Vacío */}
        {!loading && !error && movies.length === 0 && (
          <div className="catalog-empty">
            <div className="catalog-empty-icon">
              <Icon.Film size={36} color="currentColor" />
            </div>
            <p className="catalog-empty-title">Sin resultados</p>
            <p className="catalog-empty-sub">
              No hay películas que coincidan con "{searchQuery}"
              {activeCategory !== "Todas" ? ` en ${activeCategory}` : ""}.
            </p>
          </div>
        )}

        {/* Grid */}
        {!loading && movies.length > 0 && (
          <div className="movies-grid">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onEdit={onEditMovie}
                onWatch={onWatchMovie}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}