import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface NavigationTab {
  path: string;
  label: string;
  icon: string;
}

/**
 * Shell de la aplicación. Los tabs (mat-tab-nav-bar) alternan entre los dos datasets
 * navegando a rutas cargadas con lazy loading, en lugar de renderizar ambas features a la vez.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatTabsModule, MatIconModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  protected readonly title = 'Movies & Weather';

  protected readonly tabs: readonly NavigationTab[] = [
    { path: '/movies', label: 'Películas', icon: 'movie' },
    { path: '/weather', label: 'Clima', icon: 'partly_cloudy_day' },
  ];
}
