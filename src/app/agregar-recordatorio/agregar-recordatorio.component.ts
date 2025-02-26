import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, ChangeDetectionStrategy, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { HttpClient } from '@angular/common/http';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { CustomDateAdapter, CUSTOM_DATE_FORMATS } from '../custom-date-adapter';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-agregar-recordatorio',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatDatepickerModule,
    CommonModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatTimepickerModule
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' }
  ],
  templateUrl: './agregar-recordatorio.component.html',
  styleUrls: ['./agregar-recordatorio.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgregarRecordatorioComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  form: FormGroup;
  selectedTime: string;
  pets: any[] = [];

  variables: Variable[] = [
    { value: '0', viewValue: 'Una vez'},
    { value: '1', viewValue: 'Cada 8 horas' },
    { value: '2', viewValue: 'Cada 12 horas' },
    { value: '3', viewValue: 'Diario' },
    { value: '4', viewValue: 'Semanal' },
    { value: '5', viewValue: 'Mensual' },
    { value: '6', viewValue: 'Anual' }
  ];

  reminders: Reminder[] = [
    { value: '1', viewValue: 'Toma de medicamentos', icon: 'medication' },
    { value: '2', viewValue: 'Cita veterinaria', icon: 'local_hospital' },
    { value: '3', viewValue: 'Vacunación', icon: 'vaccines' },
    { value: '4', viewValue: 'Desparasitación', icon: 'bug_report' },
    { value: '5', viewValue: 'Baño', icon: 'shower' },
    { value: '6', viewValue: 'Paseo', icon: 'directions_walk' }
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private dateAdapter: DateAdapter<any>,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.selectedTime = this.dateAdapter.format(new Date(), 'timeInput');
    this.form = this.fb.group({
      pet: [''],
      type: [''],
      name: [''],
      description: [''],
      time: [''],
      frecuency: [''],
      startDate: [''],
      endDate: [''],
      uniqueDate: ['']
    });
  }

  ngOnInit(): void {
    this.loadPets();
  }

  loadPets(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.http.get(`https://petpalzapi.onrender.com/api/Usuario/${currentUser.id}`).subscribe(
        (userData: any) => {
          this.pets = Array.isArray(userData.mascotas) 
            ? userData.mascotas 
            : userData.mascotas?.$values || []; // Ensure it's an array
          this.cdr.detectChanges();
        },
        error => {
          console.error('Error fetching pets:', error);
        }
      );
    }
  }

  closeModal(): void {
    this.close.emit();
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formValue = this.form.value;
      const reminderData = {
        tipo: formValue.type,
        nombre: formValue.name,
        descripcion: formValue.description,
        hora: formValue.time ? `${formValue.time}:00` : null, // Ensure time is in hh:mm:ss format
        frecuencia: formValue.frecuency,
        fechaInicio: formValue.startDate ? new Date(formValue.startDate).toISOString() : null,
        fechaFin: formValue.endDate ? new Date(formValue.endDate).toISOString() : null,
        fechaUnica: formValue.uniqueDate ? new Date(formValue.uniqueDate).toISOString() : null,
        mascotaId: formValue.pet
      };

      this.http.post('https://petpalzapi.onrender.com/api/Recordatorio', reminderData).subscribe(
        response => {
          console.log('Recordatorio creado correctamente', response);
          this.closeModal();
        },
        error => {
          console.error('Error creando recordatorio', error);
        }
      );
    }
  }
}

export interface Variable {
  value: string;
  viewValue: string;
}

export interface Reminder {
  value: string;
  viewValue: string;
  icon: any;
}