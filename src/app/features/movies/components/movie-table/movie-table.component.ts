import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';

import { Movie } from '../../../../models';
import { TmdbImagePipe } from '../../../../shared/pipes/tmdb-image.pipe';

/**
 * Tabla de películas (componente de presentación puro).
 * No inyecta servicios: recibe datos por inputs y notifica la paginación por output.
 * La paginación es del lado del servidor (TMDB), por eso se usa `length` en lugar de un DataSource paginado.
 */
@Component({
  selector: 'app-movie-table',
  imports: [MatTableModule, MatPaginatorModule, MatIconModule, DatePipe, DecimalPipe, TmdbImagePipe],
  templateUrl: './movie-table.component.html',
  styleUrl: './movie-table.component.scss',
})
export class MovieTableComponent {
  readonly movies = input.required<Movie[]>();
  readonly totalResults = input.required<number>();
  readonly pageIndex = input.required<number>();
  readonly pageSize = input.required<number>();

  /** Emite el índice de página (0-based) seleccionado en el paginador. */
  readonly pageChange = output<number>();

  protected readonly displayedColumns: readonly string[] = ['poster', 'title', 'releaseDate', 'rating'];

  protected onPage(event: PageEvent): void {
    this.pageChange.emit(event.pageIndex);
  }

  /** Clase de color según la valoración (0–10). */
  protected ratingClass(rating: number): string {
    if (rating >= 7) {
      return 'rating--high';
    }
    return rating >= 5 ? 'rating--medium' : 'rating--low';
  }
}
