import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { CustomDateAdapter, CUSTOM_DATE_FORMATS } from '../custom-date-adapter';

@Component({
  selector: 'app-editar-enfermedad',
  imports: [
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    CommonModule,
    MatDatepickerModule,
    ReactiveFormsModule
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' }
  ],
  templateUrl: './editar-enfermedad.component.html',
  styleUrls: ['./editar-enfermedad.component.scss']
})
export class EditarEnfermedadComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private dialogRef: MatDialogRef<EditarEnfermedadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { enfermedad: any }
  ) {
    this.form = this.fb.group({
      name: [this.data.enfermedad.nombre, [Validators.required]],
      date: [this.data.enfermedad.fechaDiagnostico, [Validators.required]],
      description: [this.data.enfermedad.descripcion, [Validators.required]]
    });
  }

  ngOnInit(): void {}

  closeModal(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    const formData = this.form.value;
    const requestBody = {
      historialMedicoId: this.data.enfermedad.historialMedicoId,
      nombre: formData.name,
      fechaDiagnostico: formData.date,
      descripcion: formData.description
    };

    this.http.put(`https://petpalzapi.onrender.com/api/historial-medico/enfermedades/${this.data.enfermedad.id}`, requestBody)
      .subscribe(
        response => {
          console.log('Enfermedad actualizada correctamente', response);
          this.dialogRef.close(true);
        },
        error => {
          console.error('Error actualizando enfermedad', error);
        }
      );
  }
}