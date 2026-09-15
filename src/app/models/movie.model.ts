/**
 * Modelos que reflejan la respuesta de TMDB API v3.
 * Endpoints: GET /movie/popular y GET /search/movie
 * Docs: https://developer.themoviedb.org/reference/movie-popular-list
 */

/** Película tal como la devuelve TMDB dentro de `results`. */
export interface Movie {
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  /** Formato ISO `YYYY-MM-DD`. Puede venir vacío en resultados de búsqueda. */
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

/** Envoltorio paginado común a los listados de TMDB. */
export interface TmdbPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

/** Cuerpo de error devuelto por TMDB (p. ej. 401 con API key inválida). */
export interface TmdbErrorResponse {
  status_code: number;
  status_message: string;
  success: boolean;
}

/** Tamaños de imagen soportados por el CDN de TMDB para pósters. */
export type TmdbPosterSize = 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original';
