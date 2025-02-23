import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, ChangeDetectionStrategy } from '@angular/core';
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
import {MatTimepickerModule} from '@angular/material/timepicker'; 

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
  styleUrl: './agregar-recordatorio.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})


export class AgregarRecordatorioComponent {
  @Output() close = new EventEmitter<void>();
  form: FormGroup;
  selectedTime: string;


  closeModal(): void {
    this.close.emit();
  }

  variables: Variable[] = [
    {value: '0', viewValue: 'Cada 8 horas'},
    {value: '1', viewValue: 'Cada 12 horas'},
    {value: '2', viewValue: 'Diario'},
    {value: '3', viewValue: 'Semanal'},
    {value: '4', viewValue: 'Mensual'},
    {value: '5', viewValue: 'Anual'}
  ];

  reminders: Reminder[] = [
    {value: '1', viewValue: 'Toma de medicamentos', icon: 'medication'},
    {value: '2', viewValue: 'Cita veterinaria', icon: 'local_hospital'},
    {value: '3', viewValue: 'Vacunación', icon: 'vaccines'},
    {value: '4', viewValue: 'Desparasitación', icon: 'bug_report'},
    {value: '5', viewValue: 'Baño', icon: 'shower'},
    {value: '6', viewValue: 'Paseo', icon: 'directions_walk'}
  ]

  constructor(private fb: FormBuilder, private http: HttpClient, private dateAdapter: DateAdapter<any>) {
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
