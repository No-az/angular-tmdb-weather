/**
 * Modelos que reflejan la respuesta de OpenWeather "Current weather data" (API 2.5).
 * Endpoint: GET /weather?q={city}&units=metric&lang=es
 * Docs: https://openweathermap.org/current#fields_json
 */

export interface WeatherCoordinates {
  lon: number;
  lat: number;
}

/** Condición climática; `icon` es el código usado para construir la URL del ícono. */
export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface WeatherMainData {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
  sea_level?: number;
  grnd_level?: number;
}

export interface WeatherWind {
  speed: number;
  deg: number;
  gust?: number;
}

export interface WeatherClouds {
  all: number;
}

/** Volumen de lluvia/nieve en mm; solo presente cuando aplica. */
export interface WeatherPrecipitation {
  '1h'?: number;
  '3h'?: number;
}

export interface WeatherSystemInfo {
  type?: number;
  id?: number;
  country: string;
  sunrise: number;
  sunset: number;
}

/** Respuesta completa del endpoint /weather. */
export interface CurrentWeatherResponse {
  coord: WeatherCoordinates;
  weather: WeatherCondition[];
  base: string;
  main: WeatherMainData;
  visibility: number;
  wind: WeatherWind;
  clouds: WeatherClouds;
  rain?: WeatherPrecipitation;
  snow?: WeatherPrecipitation;
  dt: number;
  sys: WeatherSystemInfo;
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

/** Cuerpo de error de OpenWeather (p. ej. `{ "cod": "404", "message": "city not found" }`). */
export interface OpenWeatherErrorResponse {
  cod: number | string;
  message: string;
}

/**
 * Modelo de vista (fila de la tabla) derivado de `CurrentWeatherResponse`.
 * Evita que los componentes de presentación dependan de la forma cruda de la API.
 */
export interface CityWeather {
  id: number;
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  condition: string;
  iconUrl: string;
}
