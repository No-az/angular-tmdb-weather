import { Component, DestroyRef, OnInit, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';

export const SEARCH_MAX_LENGTH = 100;

/**
 * Campo de búsqueda reutilizable (presentacional).
 * Emite el texto normalizado con debounce para no disparar una petición por tecla.
 */
@Component({
  selector: 'app-search-field',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule],
  templateUrl: './search-field.component.html',
  styleUrl: './search-field.component.scss',
})
export class SearchFieldComponent implements OnInit {
  readonly label = input('Buscar');
  readonly placeholder = input('');
  readonly debounceMs = input(400);

  readonly searchChange = output<string>();

  protected readonly maxLength = SEARCH_MAX_LENGTH;
  protected readonly searchControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.maxLength(SEARCH_MAX_LENGTH)],
  });

  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(this.debounceMs()),
        map((value) => value.trim()),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((term) => {
        if (this.searchControl.valid) {
          this.searchChange.emit(term);
        }
      });
  }

  protected clear(): void {
    this.searchControl.setValue('');
  }
}
