import { Routes } from '@angular/router';

/** Rutas de la feature Clima (se cargan de forma diferida desde app.routes.ts). */
export const WEATHER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/weather-page/weather-page.component').then((m) => m.WeatherPageComponent),
  },
];
