import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';

import { environment } from '../../environments/environment';
import { CityWeather, CurrentWeatherResponse } from '../models';

/**
 * Servicio de consumo de OpenWeather (Current weather data).
 * Expone la respuesta cruda y un método que la transforma al modelo de vista `CityWeather`.
 */
@Injectable({ providedIn: 'root' })
export class WeatherService {
  private readonly http = inject(HttpClient);
  private readonly config = environment.openWeather;

  /** Clima actual de una ciudad (respuesta tal cual la entrega la API). */
  getCurrentWeather(city: string): Observable<CurrentWeatherResponse> {
    const params = new HttpParams()
      .set('q', city.trim())
      .set('appid', this.config.apiKey)
      .set('units', 'metric')
      .set('lang', 'es');

    return this.http.get<CurrentWeatherResponse>(`${this.config.baseUrl}/weather`, { params });
  }

  /** Clima actual de una ciudad ya mapeado a fila de tabla. */
  getCityWeather(city: string): Observable<CityWeather> {
    return this.getCurrentWeather(city).pipe(map((response) => this.toCityWeather(response)));
  }

  /**
   * Consulta varias ciudades en paralelo. Si alguna falla (p. ej. nombre inválido)
   * se omite para no invalidar el resto del dataset; el interceptor ya notificó el error.
   */
  getWeatherForCities(cities: readonly string[]): Observable<CityWeather[]> {
    if (cities.length === 0) {
      return of([]);
    }

    const requests = cities.map((city) =>
      this.getCityWeather(city).pipe(catchError(() => of(null))),
    );

    return forkJoin(requests).pipe(
      map((results) => results.filter((row): row is CityWeather => row !== null)),
    );
  }

  private toCityWeather(response: CurrentWeatherResponse): CityWeather {
    // La API devuelve un arreglo; la primera condición es la principal.
    const [mainCondition] = response.weather;

    return {
      id: response.id,
      city: response.name,
      country: response.sys.country,
      temperature: response.main.temp,
      feelsLike: response.main.feels_like,
      humidity: response.main.humidity,
      condition: mainCondition?.description ?? 'Sin datos',
      iconUrl: mainCondition ? `${this.config.iconBaseUrl}/${mainCondition.icon}@2x.png` : '',
    };
  }
}
