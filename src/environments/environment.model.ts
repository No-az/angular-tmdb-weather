/** Contrato tipado de la configuración de entorno (el archivo real se genera con `npm run config`). */
export interface Environment {
  tmdb: {
    apiKey: string;
    baseUrl: string;
    imageBaseUrl: string;
  };
  openWeather: {
    apiKey: string;
    baseUrl: string;
    iconBaseUrl: string;
  };
}
