import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { NotificationService } from '../services/notification.service';
import { httpErrorInterceptor } from './http-error.interceptor';

describe('httpErrorInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let notificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    notificationService = jasmine.createSpyObj<NotificationService>('NotificationService', ['showError', 'showSuccess']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([httpErrorInterceptor])),
        provideHttpClientTesting(),
        { provide: NotificationService, useValue: notificationService },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('muestra un snackbar con mensaje de API key inválida ante un 401 de TMDB y re-lanza el error', () => {
    const url = `${environment.tmdb.baseUrl}/movie/popular`;
    let receivedStatus = 0;

    http.get(url).subscribe({ error: (error: { status: number }) => (receivedStatus = error.status) });
    httpTesting
      .expectOne(url)
      .flush({ status_code: 7, status_message: 'Invalid API key', success: false }, { status: 401, statusText: 'Unauthorized' });

    expect(notificationService.showError).toHaveBeenCalledOnceWith(jasmine.stringContaining('API key de TMDB'));
    expect(receivedStatus).toBe(401);
  });

  it('informa "ciudad no encontrada" ante un 404 de OpenWeather', () => {
    const url = `${environment.openWeather.baseUrl}/weather`;

    http.get(url).subscribe({ error: () => undefined });
    httpTesting.expectOne(url).flush({ cod: '404', message: 'city not found' }, { status: 404, statusText: 'Not Found' });

    expect(notificationService.showError).toHaveBeenCalledOnceWith('No se encontró la ciudad solicitada.');
  });

  it('no muestra nada cuando la petición es exitosa', () => {
    const url = `${environment.tmdb.baseUrl}/movie/popular`;
    http.get(url).subscribe();
    httpTesting.expectOne(url).flush({});

    expect(notificationService.showError).not.toHaveBeenCalled();
  });
});
