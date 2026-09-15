import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { BehaviorSubject, catchError, of, switchMap, tap } from 'rxjs';

import { Movie, TmdbPaginatedResponse } from '../../../../models';
import { MovieService, TMDB_MAX_PAGES, TMDB_PAGE_SIZE } from '../../../../services/movie.service';
import { LoadingOverlayComponent } from '../../../../shared/components/loading-overlay/loading-overlay.component';
import { SearchFieldComponent } from '../../../../shared/components/search-field/search-field.component';
import { MovieTableComponent } from '../../components/movie-table/movie-table.component';

interface MovieQuery {
  searchTerm: string;
  /** Índice 0-based del paginador. */
  pageIndex: number;
}

const EMPTY_PAGE: TmdbPaginatedResponse<Movie> = { page: 1, results: [], total_pages: 0, total_results: 0 };

/**
 * Contenedor (smart component) de la feature Películas.
 * Orquesta búsqueda + paginación contra MovieService y mantiene el estado de la vista con signals.
 */
@Component({
  selector: 'app-movies-page',
  imports: [MatCardModule, SearchFieldComponent, MovieTableComponent, LoadingOverlayComponent],
  templateUrl: './movies-page.component.html',
  styleUrl: './movies-page.component.scss',
})
export class MoviesPageComponent {
  private readonly movieService = inject(MovieService);

  protected readonly pageSize = TMDB_PAGE_SIZE;
  protected readonly movies = signal<Movie[]>([]);
  protected readonly totalResults = signal(0);
  protected readonly pageIndex = signal(0);
  protected readonly loading = signal(false);

  private readonly query$ = new BehaviorSubject<MovieQuery>({ searchTerm: '', pageIndex: 0 });

  constructor() {
    this.query$
      .pipe(
        tap(() => this.loading.set(true)),
        // switchMap cancela la petición anterior si el usuario busca/pagina rápido.
        switchMap(({ searchTerm, pageIndex }) =>
          this.movieService
            .getMovies(searchTerm, pageIndex + 1)
            // El interceptor ya mostró el snackbar; aquí solo dejamos la vista en estado vacío.
            .pipe(catchError(() => of(EMPTY_PAGE))),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((response) => {
        this.movies.set(response.results);
        // TMDB no permite pedir más de 500 páginas: se acota para que el paginador no ofrezca páginas inválidas.
        this.totalResults.set(Math.min(response.total_results, TMDB_MAX_PAGES * TMDB_PAGE_SIZE));
        this.loading.set(false);
      });
  }

  protected onSearch(searchTerm: string): void {
    this.pageIndex.set(0);
    this.query$.next({ searchTerm, pageIndex: 0 });
  }

  protected onPageChange(pageIndex: number): void {
    this.pageIndex.set(pageIndex);
    this.query$.next({ ...this.query$.value, pageIndex });
  }
}
