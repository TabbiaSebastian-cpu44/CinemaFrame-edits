/**
 * hooks/useMovies.js
 * Hook para películas. Funciona con o sin Supabase configurado.
 * Sin Supabase → muestra solo la película demo.
 * Con Supabase → carga todas las películas de la base de datos.
 */

import { useState, useEffect, useCallback } from "react";
import { supabase, supabaseConfigured, uploadToStorage } from "../lib/supabase";

export const CATEGORIES = [
  "Todas",
  "Animación",
  "Acción",
  "Drama",
  "Comedia",
  "Terror",
  "Ciencia ficción",
  "Documental",
  "Infantil",
];

export const DEFAULT_MOVIE = {
  id:          "default-princess-frog",
  title:       "La Princesa y el Sapo",
  category:    "Animación",
  year:        2009,
  description: "Tiana, una joven trabajadora de Nueva Orleans con el sueño de abrir su propio restaurante, besa a un príncipe convertido en rana y queda atrapada en el bayou en una aventura mágica.",
  director:    "Ron Clements, John Musker",
  language:    "Español",
  duration:    "97 min",
  poster_url:  "./Frog-and-princess.jpg",
  video_url:   "./videoplayback.mp4",
  isDefault:   true,
};

export function useMovies() {
  const [movies, setMovies]                 = useState([DEFAULT_MOVIE]);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState(null);
  const [searchQuery, setSearchQuery]       = useState("");
  const [activeCategory, setActiveCategory] = useState("Todas");

  /* ── Fetch desde Supabase ─────────────────────────────────────────────── */
  const fetchMovies = useCallback(async () => {
    if (!supabaseConfigured || !supabase) {
      setMovies([DEFAULT_MOVIE]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error: sbError } = await supabase
        .from("movies")
        .select("*")
        .order("created_at", { ascending: false });

      if (sbError) throw sbError;
      setMovies([DEFAULT_MOVIE, ...(data || [])]);
    } catch (err) {
      console.error("Error cargando películas:", err);
      setError("No se pudieron cargar las películas. Verificá la conexión a Supabase.");
      setMovies([DEFAULT_MOVIE]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  /* ── Filtrado local ───────────────────────────────────────────────────── */
  const filteredMovies = movies.filter((movie) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      q === "" ||
      movie.title.toLowerCase().includes(q) ||
      (movie.director    || "").toLowerCase().includes(q) ||
      (movie.description || "").toLowerCase().includes(q);

    const matchesCategory =
      activeCategory === "Todas" || movie.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  /* ── Subir nueva película ─────────────────────────────────────────────── */
  const uploadMovie = useCallback(async (formData, videoFile, posterFile, onProgress) => {
    if (!supabaseConfigured || !supabase) {
      throw new Error("Supabase no está configurado. Agregá las credenciales en .env.local");
    }

    onProgress?.(1, 4);
    const videoUrl = await uploadToStorage(videoFile, "movies");

    onProgress?.(2, 4);
    let posterUrl = null;
    if (posterFile) {
      posterUrl = await uploadToStorage(posterFile, "posters");
    }

    onProgress?.(3, 4);
    const { data, error: sbError } = await supabase
      .from("movies")
      .insert([{
        title:       formData.title,
        category:    formData.category,
        year:        formData.year ? parseInt(formData.year) : null,
        description: formData.description || null,
        director:    formData.director    || null,
        language:    formData.language    || null,
        duration:    formData.duration    || null,
        poster_url:  posterUrl,
        video_url:   videoUrl,
      }])
      .select()
      .single();

    if (sbError) throw new Error(sbError.message);

    onProgress?.(4, 4);
    setMovies((prev) => [prev[0], data, ...prev.slice(1)]);
    return data;
  }, []);

  return {
    movies:          filteredMovies,
    allMovies:       movies,
    loading,
    error,
    searchQuery,
    activeCategory,
    supabaseConfigured,
    setSearchQuery,
    setActiveCategory,
    uploadMovie,
    refetch:         fetchMovies,
  };
}