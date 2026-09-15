import { Routes } from '@angular/router';

/** Cada feature se descarga en su propio chunk solo cuando el usuario navega a ella (lazy loading). */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'movies' },
  {
    path: 'movies',
    title: 'Películas · Movies & Weather',
    loadChildren: () => import('./features/movies/movies.routes').then((m) => m.MOVIES_ROUTES),
  },
  {
    path: 'weather',
    title: 'Clima · Movies & Weather',
    loadChildren: () => import('./features/weather/weather.routes').then((m) => m.WEATHER_ROUTES),
  },
  { path: '**', redirectTo: 'movies' },
];
