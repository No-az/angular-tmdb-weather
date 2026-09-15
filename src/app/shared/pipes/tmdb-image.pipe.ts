import { Pipe, PipeTransform } from '@angular/core';

import { environment } from '../../../environments/environment';
import { TmdbPosterSize } from '../../models';

/**
 * Construye la URL absoluta de una imagen de TMDB a partir de su `poster_path`.
 * Devuelve `null` si la película no tiene imagen, para que la vista muestre un placeholder.
 *
 * Uso: `movie.poster_path | tmdbImage: 'w92'`
 */
@Pipe({ name: 'tmdbImage' })
export class TmdbImagePipe implements PipeTransform {
  transform(path: string | null, size: TmdbPosterSize = 'w185'): string | null {
    return path ? `${environment.tmdb.imageBaseUrl}/${size}${path}` : null;
  }
}
