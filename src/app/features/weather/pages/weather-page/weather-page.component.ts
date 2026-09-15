import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EMPTY, catchError } from 'rxjs';

import { NotificationService } from '../../../../core/services/notification.service';
import { CityWeather } from '../../../../models';
import { WeatherService } from '../../../../services/weather.service';
import { LoadingOverlayComponent } from '../../../../shared/components/loading-overlay/loading-overlay.component';
import { SearchFieldComponent } from '../../../../shared/components/search-field/search-field.component';
import { AddCityFormComponent } from '../../components/add-city-form/add-city-form.component';
import { WeatherTableComponent } from '../../components/weather-table/weather-table.component';
import { DEFAULT_CITIES } from '../../weather.constants';

/**
 * Contenedor (smart component) de la feature Clima.
 * Carga el dataset inicial desde OpenWeather, permite agregar/quitar ciudades y filtrar la tabla.
 */
@Component({
  selector: 'app-weather-page',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    SearchFieldComponent,
    AddCityFormComponent,
    WeatherTableComponent,
    LoadingOverlayComponent,
  ],
  templateUrl: './weather-page.component.html',
  styleUrl: './weather-page.component.scss',
})
export class WeatherPageComponent implements OnInit {
  private readonly weatherService = inject(WeatherService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly cities = signal<CityWeather[]>([]);
  protected readonly filterTerm = signal('');
  protected readonly loading = signal(false);
  protected readonly addingCity = signal(false);

  ngOnInit(): void {
    this.loadDefaultCities();
  }

  protected loadDefaultCities(): void {
    this.loading.set(true);
    this.weatherService
      .getWeatherForCities(DEFAULT_CITIES)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((rows) => {
        this.cities.set(rows);
        this.loading.set(false);
      });
  }

  protected addCity(cityName: string): void {
    this.addingCity.set(true);
    this.weatherService
      .getCityWeather(cityName)
      .pipe(
        // El interceptor ya informó el error (p. ej. 404 ciudad no encontrada).
        catchError(() => {
          this.addingCity.set(false);
          return EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((row) => {
        this.addingCity.set(false);
        if (this.cities().some((city) => city.id === row.id)) {
          this.notificationService.showError(`${row.city} ya está en la tabla.`);
          return;
        }
        this.cities.update((current) => [row, ...current]);
        this.notificationService.showSuccess(`${row.city} agregada.`);
      });
  }

  protected removeCity(row: CityWeather): void {
    this.cities.update((current) => current.filter((city) => city.id !== row.id));
  }
}
