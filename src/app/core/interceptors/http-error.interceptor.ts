import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { OpenWeatherErrorResponse, TmdbErrorResponse } from '../../models';
import { NotificationService } from '../services/notification.service';

type ApiName = 'TMDB' | 'OpenWeather' | 'el servidor';

/**
 * Interceptor funcional global: traduce cualquier error HTTP a un mensaje legible,
 * lo muestra en un snackbar y re-lanza el error para que cada contenedor
 * pueda reaccionar (limpiar datos, detener el spinner, etc.).
 */
export const httpErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const notificationService = inject(NotificationService);

  return next(request).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        notificationService.showError(buildErrorMessage(error, resolveApiName(request.url)));
      }
      return throwError(() => error);
    }),
  );
};

function resolveApiName(url: string): ApiName {
  if (url.startsWith(environment.tmdb.baseUrl)) {
    return 'TMDB';
  }
  if (url.startsWith(environment.openWeather.baseUrl)) {
    return 'OpenWeather';
  }
  return 'el servidor';
}

export function buildErrorMessage(error: HttpErrorResponse, apiName: ApiName): string {
  if (error.status === 0) {
    return `No se pudo conectar con ${apiName}. Revisa tu conexión a internet.`;
  }

  const apiMessage = extractApiMessage(error.error);

  switch (error.status) {
    case 401:
      return `API key de ${apiName} inválida o ausente. Revisa tu archivo .env y ejecuta "npm run config".`;
    case 404:
      return apiName === 'OpenWeather'
        ? 'No se encontró la ciudad solicitada.'
        : `Recurso no encontrado en ${apiName}.`;
    case 429:
      return `Se superó el límite de peticiones de ${apiName}. Intenta de nuevo en unos segundos.`;
    default:
      if (error.status >= 500) {
        return `${apiName} no está disponible en este momento (error ${error.status}).`;
      }
      return apiMessage ?? `Ocurrió un error inesperado con ${apiName} (error ${error.status}).`;
  }
}

/** Extrae el mensaje del cuerpo de error conociendo el formato de cada API. */
function extractApiMessage(body: unknown): string | null {
  if (isTmdbError(body)) {
    return body.status_message;
  }
  if (isOpenWeatherError(body)) {
    return body.message;
  }
  return null;
}

function isTmdbError(body: unknown): body is TmdbErrorResponse {
  return typeof body === 'object' && body !== null && 'status_message' in body && typeof body.status_message === 'string';
}

function isOpenWeatherError(body: unknown): body is OpenWeatherErrorResponse {
  return typeof body === 'object' && body !== null && 'message' in body && typeof body.message === 'string';
}
