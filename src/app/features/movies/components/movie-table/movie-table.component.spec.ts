import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { Movie } from '../../../../models';
import { MovieTableComponent } from './movie-table.component';

function buildMovie(overrides: Partial<Movie>): Movie {
  return {
    adult: false,
    backdrop_path: null,
    genre_ids: [],
    id: 1,
    original_language: 'en',
    original_title: 'Movie',
    overview: '',
    popularity: 1,
    poster_path: '/poster.jpg',
    release_date: '2024-01-01',
    title: 'Movie',
    video: false,
    vote_average: 7.5,
    vote_count: 100,
    ...overrides,
  };
}

describe('MovieTableComponent', () => {
  let fixture: ComponentFixture<MovieTableComponent>;
  let element: HTMLElement;

  const movies: Movie[] = [
    buildMovie({ id: 1, title: 'Dune', original_title: 'Dune', vote_average: 8.1 }),
    buildMovie({ id: 2, title: 'Sin póster', original_title: 'No poster', poster_path: null, release_date: '' }),
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieTableComponent);
    fixture.componentRef.setInput('movies', movies);
    fixture.componentRef.setInput('totalResults', 40);
    fixture.componentRef.setInput('pageIndex', 0);
    fixture.componentRef.setInput('pageSize', 20);
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  });

  it('renderiza una fila por película con título y rating', () => {
    const rows = element.querySelectorAll('tr.mat-mdc-row');
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('Dune');
    expect(rows[0].textContent).toContain('8.1');
  });

  it('muestra el póster de TMDB o un placeholder cuando no hay imagen', () => {
    const images = element.querySelectorAll<HTMLImageElement>('img.poster');
    expect(images.length).toBe(1);
    expect(images[0].src).toContain('/w92/poster.jpg');
    expect(element.querySelector('.poster--placeholder')).not.toBeNull();
    expect(element.textContent).toContain('Sin fecha');
  });

  it('muestra el mensaje de "sin datos" cuando la lista está vacía', () => {
    fixture.componentRef.setInput('movies', []);
    fixture.detectChanges();
    expect(element.querySelector('.empty-row')?.textContent).toContain('No se encontraron películas');
  });

  it('emite pageChange con el índice seleccionado en el paginador', () => {
    const emitted: number[] = [];
    fixture.componentInstance.pageChange.subscribe((pageIndex) => emitted.push(pageIndex));

    const nextButton = fixture.debugElement.query(By.css('.mat-mdc-paginator-navigation-next'));
    (nextButton.nativeElement as HTMLButtonElement).click();

    expect(emitted).toEqual([1]);
  });
});
