import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('crea el componente raíz', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renderiza los tabs para alternar entre Películas y Clima', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const links = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLAnchorElement>('a[mat-tab-link]'));
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['/movies', '/weather']);
    expect(links[0].textContent).toContain('Películas');
    expect(links[1].textContent).toContain('Clima');
  });
});
