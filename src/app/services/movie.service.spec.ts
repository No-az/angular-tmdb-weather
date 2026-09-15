import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { Movie, TmdbPaginatedResponse } from '../models';
import { MovieService } from './movie.service';

describe('MovieService', () => {
  let service: MovieService;
  let httpTesting: HttpTestingController;

  const mockResponse: TmdbPaginatedResponse<Movie> = {
    page: 1,
    total_pages: 1,
    total_results: 1,
    results: [
      {
        adult: false,
        backdrop_path: null,
        genre_ids: [28],
        id: 27205,
        original_language: 'en',
        original_title: 'Inception',
        overview: 'Un ladrón que roba secretos a través de los sueños.',
        popularity: 80.5,
        poster_path: '/poster.jpg',
        release_date: '2010-07-15',
        title: 'Origen',
        video: false,
        vote_average: 8.4,
        vote_count: 35000,
      },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(MovieService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('usa /movie/popular cuando no hay término de búsqueda', () => {
    let result: TmdbPaginatedResponse<Movie> | undefined;
    service.getMovies('', 2).subscribe((response) => (result = response));

    const request = httpTesting.expectOne((req) => req.url === `${environment.tmdb.baseUrl}/movie/popular`);
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('api_key')).toBe(environment.tmdb.apiKey);
    expect(request.request.params.has('query')).toBeFalse();

    request.flush(mockResponse);
    expect(result).toEqual(mockResponse);
  });

  it('usa /search/movie con el término recortado cuando se filtra por título', () => {
    service.getMovies('  inception ', 1).subscribe();

    const request = httpTesting.expectOne((req) => req.url === `${environment.tmdb.baseUrl}/search/movie`);
    expect(request.request.params.get('query')).toBe('inception');
    expect(request.request.params.get('include_adult')).toBe('false');
    request.flush(mockResponse);
  });

  it('acota la página al máximo permitido por TMDB (500)', () => {
    service.getMovies('', 9999).subscribe();

    const request = httpTesting.expectOne((req) => req.url.endsWith('/movie/popular'));
    expect(request.request.params.get('page')).toBe('500');
    request.flush(mockResponse);
  });
});
