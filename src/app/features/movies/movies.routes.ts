import { Routes } from '@angular/router';

/** Rutas de la feature Películas (se cargan de forma diferida desde app.routes.ts). */
export const MOVIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/movies-page/movies-page.component').then((m) => m.MoviesPageComponent),
  },
];
