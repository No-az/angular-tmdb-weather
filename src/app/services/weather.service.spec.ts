import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { CityWeather, CurrentWeatherResponse } from '../models';
import { WeatherService } from './weather.service';

function buildWeatherResponse(id: number, name: string): CurrentWeatherResponse {
  return {
    coord: { lon: -74.08, lat: 4.61 },
    weather: [{ id: 803, main: 'Clouds', description: 'nubes rotas', icon: '04d' }],
    base: 'stations',
    main: { temp: 14.6, feels_like: 14.1, temp_min: 14.6, temp_max: 14.6, pressure: 1027, humidity: 77 },
    visibility: 10000,
    wind: { speed: 3.6, deg: 320 },
    clouds: { all: 75 },
    dt: 1726420000,
    sys: { country: 'CO', sunrise: 1726397000, sunset: 1726440000 },
    timezone: -18000,
    id,
    name,
    cod: 200,
  };
}

describe('WeatherService', () => {
  let service: WeatherService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(WeatherService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('consulta /weather en unidades métricas y mapea la respuesta a CityWeather', () => {
    let result: CityWeather | undefined;
    service.getCityWeather('Bogota,CO').subscribe((row) => (result = row));

    const request = httpTesting.expectOne((req) => req.url === `${environment.openWeather.baseUrl}/weather`);
    expect(request.request.params.get('q')).toBe('Bogota,CO');
    expect(request.request.params.get('units')).toBe('metric');
    request.flush(buildWeatherResponse(3688689, 'Bogotá'));

    expect(result).toEqual({
      id: 3688689,
      city: 'Bogotá',
      country: 'CO',
      temperature: 14.6,
      feelsLike: 14.1,
      humidity: 77,
      condition: 'nubes rotas',
      iconUrl: `${environment.openWeather.iconBaseUrl}/04d@2x.png`,
    });
  });

  it('omite las ciudades que fallan sin invalidar el resto del dataset', () => {
    let result: CityWeather[] = [];
    service.getWeatherForCities(['Bogota,CO', 'CiudadInexistente']).subscribe((rows) => (result = rows));

    httpTesting
      .expectOne((req) => req.params.get('q') === 'Bogota,CO')
      .flush(buildWeatherResponse(3688689, 'Bogotá'));
    httpTesting
      .expectOne((req) => req.params.get('q') === 'CiudadInexistente')
      .flush({ cod: '404', message: 'city not found' }, { status: 404, statusText: 'Not Found' });

    expect(result.length).toBe(1);
    expect(result[0].city).toBe('Bogotá');
  });
});
