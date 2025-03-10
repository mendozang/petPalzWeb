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
  selector: 'app-agregar-tratamiento',
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
  templateUrl: './agregar-tratamiento.component.html',
  styleUrl: './agregar-tratamiento.component.scss'
})
export class AgregarTratamientoComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
    form: FormGroup;
  
    constructor(
      private fb: FormBuilder,
      private http: HttpClient,
      private dialogRef: MatDialogRef<AgregarTratamientoComponent>,
      @Inject(MAT_DIALOG_DATA) public data: { historialMedicoId: number }
    ) {
      this.form = this.fb.group({
        name: ['', [Validators.required]],
        startDate: ['', [Validators.required]],
        endDate: ['', [Validators.required]],
        description: ['', [Validators.required]]
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
        historialMedicoId: this.data.historialMedicoId,
        nombre: formData.name,
        fechaInicio: formData.startDate,
        fechaFin: formData.endDate,
        descripcion: formData.description
      };
  
      this.http.post(`https://petpalzapi.onrender.com/api/historial-medico/${this.data.historialMedicoId}/tratamientos`, requestBody)
        .subscribe(
          response => {
            console.log('Tratamiento añadida correctamente', response);
            this.dialogRef.close(true);
          },
          error => {
            console.error('Error añadiendo tratamiento', error);
          }
        );
    }
}
