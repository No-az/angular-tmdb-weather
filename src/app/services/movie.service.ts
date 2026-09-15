import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Movie, TmdbPaginatedResponse } from '../models';

/** TMDB limita la paginación a 500 páginas aunque `total_pages` reporte más. */
export const TMDB_MAX_PAGES = 500;
/** Tamaño de página fijo definido por TMDB. */
export const TMDB_PAGE_SIZE = 20;

/**
 * Servicio de consumo de TMDB. Solo conoce HTTP y modelos:
 * no maneja estado de UI ni muestra mensajes (eso lo hacen el interceptor y los contenedores).
 */
@Injectable({ providedIn: 'root' })
export class MovieService {
  private readonly http = inject(HttpClient);
  private readonly config = environment.tmdb;

  /**
   * Obtiene una página de películas. Sin término devuelve las populares;
   * con término usa el endpoint de búsqueda por título (filtrado en servidor).
   *
   * @param searchTerm texto a buscar en el título (opcional)
   * @param page página 1-based, como la espera TMDB
   */
  getMovies(searchTerm: string, page: number): Observable<TmdbPaginatedResponse<Movie>> {
    const query = searchTerm.trim();
    const safePage = Math.min(Math.max(page, 1), TMDB_MAX_PAGES);

    let params = new HttpParams()
      .set('api_key', this.config.apiKey)
      .set('language', 'es-ES')
      .set('page', safePage);

    if (query) {
      params = params.set('query', query).set('include_adult', false);
    }

    const endpoint = query ? '/search/movie' : '/movie/popular';
    return this.http.get<TmdbPaginatedResponse<Movie>>(`${this.config.baseUrl}${endpoint}`, { params });
  }
}
