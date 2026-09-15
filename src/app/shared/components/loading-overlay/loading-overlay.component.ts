import { Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/**
 * Capa semitransparente con spinner que cubre a su contenedor mientras `loading` es true.
 * El contenedor padre debe tener `position: relative`.
 */
@Component({
  selector: 'app-loading-overlay',
  imports: [MatProgressSpinnerModule],
  template: `
    @if (loading()) {
      <div class="overlay" role="status" aria-live="polite">
        <mat-spinner [diameter]="48" />
        <span class="message">{{ message() }}</span>
      </div>
    }
  `,
  styles: `
    .overlay {
      position: absolute;
      inset: 0;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      min-height: 160px;
      background: color-mix(in srgb, var(--mat-sys-surface) 75%, transparent);
    }

    .message {
      font: var(--mat-sys-body-medium);
      color: var(--mat-sys-on-surface-variant);
    }
  `,
})
export class LoadingOverlayComponent {
  readonly loading = input.required<boolean>();
  readonly message = input('Cargando...');
}
