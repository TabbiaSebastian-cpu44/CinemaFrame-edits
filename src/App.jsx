/**
 * App.jsx — Router principal de CinemaFrame v3
 * Vistas: home | movie | studio | editor | upload
 */

import { useState } from "react";
import Navbar       from "./components/Navbar";
import HomePage     from "./components/home/HomePage";
import MoviePage    from "./components/movie/MoviePage";
import StudioPage   from "./components/studio/StudioPage";
import EditorPage   from "./components/studio/EditorPage";
import UploadPage   from "./components/upload/UploadPage";
import { useMovies } from "./hooks/useMovies";
import "./styles/global.css";

export default function App() {
  const [view, setView]                   = useState("home");
  const [selectedMovie, setSelectedMovie] = useState(null);

  const {
    movies, loading, error,
    searchQuery, activeCategory,
    supabaseConfigured,
    setSearchQuery, setActiveCategory,
    uploadMovie,
  } = useMovies();

  /* ── Navegación ───────────────────────────────────────────────────────── */
  const navigate = (targetView, movie = null) => {
    setSelectedMovie(movie);
    setView(targetView);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleWatchMovie  = (movie) => navigate("movie",  movie);
  const handleEditMovie   = (movie) => navigate("editor", movie);
  const handleStudioSelect= (movie) => navigate("editor", movie);

  return (
    <div className="app-root">
      <Navbar currentView={view === "movie" || view === "editor" ? view : view} onNavigate={(v) => navigate(v)} />

      <main className="app-main-view">

        {view === "home" && (
          <HomePage
            movies={movies}
            loading={loading}
            error={error}
            searchQuery={searchQuery}
            activeCategory={activeCategory}
            onSearch={setSearchQuery}
            onCategoryChange={setActiveCategory}
            onEditMovie={handleEditMovie}
            onWatchMovie={handleWatchMovie}
            onNavigateUpload={() => navigate("upload")}
          />
        )}

        {view === "movie" && selectedMovie && (
          <MoviePage
            movie={selectedMovie}
            onBack={() => navigate("home")}
            onEditFrames={handleEditMovie}
          />
        )}

        {view === "studio" && (
          <StudioPage
            movies={movies}
            onSelectMovie={handleStudioSelect}
          />
        )}

        {view === "editor" && (
          <EditorPage
            selectedMovie={selectedMovie}
            onBack={() => navigate(selectedMovie ? "movie" : "studio", selectedMovie)}
          />
        )}

        {view === "upload" && (
          <UploadPage
            onUpload={uploadMovie}
            onSuccess={() => navigate("home")}
            supabaseConfigured={supabaseConfigured}
          />
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-brand">
          <em>CinemaFrame®</em> — Editor de Fotogramas
        </div>
        <div className="footer-copy">
          © 2026 CinemaFrame® · Todos los derechos reservados
        </div>
      </footer>
    </div>
  );
}