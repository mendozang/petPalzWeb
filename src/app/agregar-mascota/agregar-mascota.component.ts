import { Component, EventEmitter, Output, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { CustomDateAdapter, CUSTOM_DATE_FORMATS } from '../custom-date-adapter';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, startWith, map } from 'rxjs';
import {MatSelectModule} from '@angular/material/select';

@Component({
  selector: 'app-agregar-mascota',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatDatepickerModule,
    CommonModule,
    MatInputModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatSelectModule
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' }
  ],
  templateUrl: './agregar-mascota.component.html',
  styleUrls: ['./agregar-mascota.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgregarMascotaComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  selectedFileName: string | null = null;
  form: FormGroup;
  breeds: { [key: string]: string[] } = {};
  breedOptions: string[] = [];
  filteredBreedOptions: Observable<string[]> = new Observable<string[]>();

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      petname: [''],
      species: [''],
      breed: [''],
      birthdate: [''],
      gender: [''],
      color: [''],
      weight: ['']
    });
  }

  ngOnInit(): void {
    this.http.get<{ [key: string]: string[] }>('/assets/breeds.json').subscribe((data: { [key: string]: string[] }) => {
      this.breeds = data;
    });

    this.form.get('species')?.valueChanges.subscribe((species: string) => {
      this.breedOptions = this.breeds[species] || [];
      this.form.get('breed')?.setValue('');
      this.filteredBreedOptions = this.form.get('breed')!.valueChanges.pipe(
        startWith(''),
        map(value => this._filterBreeds(value || ''))
      );
    });
  }

  private _filterBreeds(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.breedOptions.filter(option => option.toLowerCase().includes(filterValue));
  }

  closeModal(): void {
    this.close.emit();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFileName = input.files[0].name;
    }
  }
}