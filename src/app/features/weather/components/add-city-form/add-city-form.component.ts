import { Component, input, output, viewChild } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/** Letras (con tildes/ñ), espacios, guiones, puntos y comas (p. ej. "Santa Marta" o "Paris,FR"). */
const CITY_NAME_PATTERN = /^[\p{L}\s.,'-]+$/u;

/** Formulario reactivo (presentacional) para consultar y agregar una ciudad al dataset de clima. */
@Component({
  selector: 'app-add-city-form',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './add-city-form.component.html',
  styleUrl: './add-city-form.component.scss',
})
export class AddCityFormComponent {
  /** Deshabilita el envío mientras el contenedor consulta la API. */
  readonly submitting = input(false);
  readonly citySubmit = output<string>();

  private readonly formDirective = viewChild.required(FormGroupDirective);

  protected readonly form = new FormGroup({
    cityName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2), Validators.maxLength(60), Validators.pattern(CITY_NAME_PATTERN)],
    }),
  });

  protected submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }
    this.citySubmit.emit(this.form.controls.cityName.value.trim());
    // resetForm() (y no form.reset()) limpia también el estado "submitted" para no mostrar mat-error tras enviar.
    this.formDirective().resetForm();
  }
}
