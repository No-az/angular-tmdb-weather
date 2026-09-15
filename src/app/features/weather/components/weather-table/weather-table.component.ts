import { DecimalPipe } from '@angular/common';
import { AfterViewInit, Component, effect, input, output, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CityWeather } from '../../../../models';

/**
 * Tabla de clima por ciudad (componente de presentación).
 * El dataset es pequeño y ya está en memoria, así que filtro, orden y paginación son del lado del cliente.
 */
@Component({
  selector: 'app-weather-table',
  imports: [MatTableModule, MatPaginatorModule, MatSortModule, MatIconModule, MatButtonModule, MatTooltipModule, DecimalPipe],
  templateUrl: './weather-table.component.html',
  styleUrl: './weather-table.component.scss',
})
export class WeatherTableComponent implements AfterViewInit {
  readonly rows = input.required<CityWeather[]>();
  /** Texto de filtro aplicado sobre ciudad, país y estado del tiempo. */
  readonly filter = input('');

  readonly removeCity = output<CityWeather>();

  protected readonly displayedColumns: readonly string[] = ['icon', 'city', 'temperature', 'condition', 'humidity', 'actions'];
  protected readonly pageSizeOptions: readonly number[] = [5, 10, 20];
  protected readonly dataSource = new MatTableDataSource<CityWeather>([]);

  private readonly paginator = viewChild.required(MatPaginator);
  private readonly sort = viewChild.required(MatSort);

  constructor() {
    this.dataSource.filterPredicate = (row, filterText) =>
      [row.city, row.country, row.condition].some((value) => normalize(value).includes(filterText));

    // Sincroniza inputs (signals) con el MatTableDataSource.
    effect(() => {
      this.dataSource.data = this.rows();
    });
    effect(() => {
      this.dataSource.filter = normalize(this.filter());
      this.dataSource.paginator?.firstPage();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator();
    this.dataSource.sort = this.sort();
  }
}

/** Minúsculas y sin tildes para que "bogota" encuentre "Bogotá". */
function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}
