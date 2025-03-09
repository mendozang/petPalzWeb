import { Component, EventEmitter, Output, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { CustomDateAdapter, CUSTOM_DATE_FORMATS } from '../custom-date-adapter';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, startWith, map } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../services/auth.service';
import { IndexedDBService } from '../services/indexeddb.service';

@Component({
  selector: 'app-agregar-mascota',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
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
  selectedFile: File | null = null;
  imageUrl: string | ArrayBuffer | null = '/assets/default-pet.png';
  form: FormGroup;
  breeds: { [key: string]: string[] } = {};
  breedOptions: string[] = [];
  filteredBreedOptions: Observable<string[]> = new Observable<string[]>();
  currentUser: any;

  sizeOptions: { [key: string]: { value: string, viewValue: string }[] } = {
    'Perro': [
      { value: '1', viewValue: 'Mini (1 a 5 kilos)' },
      { value: '2', viewValue: 'Pequeño (5 a 10 kilos)' },
      { value: '3', viewValue: 'Mediano (10 a 25 kilos)' },
      { value: '4', viewValue: 'Grande (25 a 45 kilos)' },
      { value: '5', viewValue: 'Gigante (45+ kilos)' }
    ],
    'Gato': [
      { value: '1', viewValue: 'Pequeño (1 a 3 kilos)' },
      { value: '2', viewValue: 'Mediano (3 a 6 kilos)' },
      { value: '3', viewValue: 'Grande (6+ kilos)' }
    ]
  };
  currentSizeOptions: { value: string, viewValue: string }[] = [];
  years: number[] = [];

  genderOptions: { [key: string]: string } = {
    '1': 'Macho',
    '2': 'Hembra'
  };

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient, 
    private authService: AuthService,
    private indexedDBService: IndexedDBService
  ) {
    this.form = this.fb.group({
      petname: ['', [Validators.required, Validators.minLength(3)]],
      species: ['', Validators.required],
      breed: [''],
      birthyear: ['', Validators.required],
      gender: [''],
      color: [''],
      weight: [''],
      size: ['']
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

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

      // Update size options based on selected species
      this.currentSizeOptions = this.sizeOptions[species] || [];
      this.form.get('size')?.setValue('');
    });

    // Generate a list of years from 2000 to the current year
    const currentYear = new Date().getFullYear();
    for (let year = 2000; year <= currentYear; year++) {
      this.years.push(year);
    }
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
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.imageUrl = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.valid && this.currentUser) {
      const petData = {
        nombre: this.form.get('petname')?.value,
        anoNacimiento: this.form.get('birthyear')?.value.toString(),
        especie: this.form.get('species')?.value,
        raza: this.form.get('breed')?.value,
        genero: this.genderOptions[this.form.get('gender')?.value], // Map gender value to string
        color: this.form.get('color')?.value,
        tamano: this.currentSizeOptions.find(option => option.value === this.form.get('size')?.value)?.viewValue, // Map size value to string
        peso: this.form.get('weight')?.value,
        usuarioId: this.currentUser.id,
        imagenUrl: this.imageUrl as string
      };

      console.log('Submitting pet data:', petData); 

      try {
        const response = await this.http.post<{ id: string }>('https://petpalzapi.onrender.com/api/Mascota', petData).toPromise();
        if (this.selectedFile) {
          if (response && response.id) {
            await this.indexedDBService.setImage(Number(response.id), this.imageUrl as string);
          }
        }
        console.log('Mascota añadida correctamente', response);

        // Create health record for the new pet
        if (response && response.id) {
          const healthRecordData = { mascotaId: response.id };
          await this.http.post('https://petpalzapi.onrender.com/api/historial-medico', healthRecordData).toPromise();
          console.log('Historial médico creado correctamente');
        }

        this.closeModal();
      } catch (error) {
        console.error('Error añadiendo mascota', error);
      }
    }
  }
}