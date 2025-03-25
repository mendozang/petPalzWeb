import { Component, EventEmitter, Output, ChangeDetectionStrategy, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
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
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IndexedDBService } from '../services/indexeddb.service';

@Component({
  selector: 'app-editar-mascota',
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
  templateUrl: './editar-mascota.component.html',
  styleUrls: ['./editar-mascota.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditarMascotaComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  selectedFileName: string | null = null;
  selectedFile: File | null = null;
  imageUrl: string | ArrayBuffer | null = '/assets/default-pet.png';
  form!: FormGroup;
  breeds: { [key: string]: string[] } = {};
  breedOptions: string[] = [];
  filteredBreedOptions: Observable<string[]> = new Observable<string[]>();
  currentUser: any;
  pet: any;
  petData: any;
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
    private indexedDBService: IndexedDBService,
    private dialogRef: MatDialogRef<EditarMascotaComponent>,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef, // Inject ChangeDetectorRef
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.pet = data.pet;
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

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

    // Fetch breeds data
    this.http.get<{ [key: string]: string[] }>('/assets/breeds.json').subscribe((data: { [key: string]: string[] }) => {
      this.breeds = data;

      // Fetch full pet details using the pet ID
      this.http.get(`https://petpalzapi.onrender.com/api/Mascota/${this.pet}`).subscribe(
        (petData: any) => {
          this.petData = petData; // Store full pet details
          console.log('Full pet data:', this.petData);
    
          // Initialize breed and size options after fetching pet details
          this.breedOptions = this.breeds[this.petData.especie] || [];
          this.currentSizeOptions = this.sizeOptions[this.petData.especie] || [];
          this.filteredBreedOptions = this.form.get('breed')!.valueChanges.pipe(
            startWith(''),
            map(value => this._filterBreeds(value || ''))
          );
    
          // Now initialize the form with the full data
          this.form.patchValue({
            petname: this.petData.nombre,
            species: this.petData.especie,
            breed: this.petData.raza,
            birthyear: this.petData.anoNacimiento,
            gender: this.petData.genero,
            color: this.petData.color,
            weight: this.petData.peso,
            size: this.petData.tamano
          });
    
          // Set the image URL
          this.imageUrl = this.petData.imagenUrl || '/assets/default-pet.png';
    
          this.cdr.detectChanges(); // Ensure Angular updates the form
        },
        error => {
          console.error('Error fetching pet details:', error);
        }
      );
    });
  
    // Generate a list of years from 2000 to the current year
    const currentYear = new Date().getFullYear();
    for (let year = 2000; year <= currentYear; year++) {
      this.years.push(year);
    }
  
    // Listen for species changes
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
  }
  

  private _filterBreeds(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.breedOptions.filter(option => option.toLowerCase().includes(filterValue));
  }

  closeModal(): void {
    this.dialogRef.close();
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
    if (this.form.invalid) {
      return;
    }

    const formData = this.form.value;
    const updateData: any = {
      nombre: formData.petname,
      especie: formData.species,
      raza: formData.breed,
      anoNacimiento: formData.birthyear,
      genero: this.genderOptions[formData.gender], // Map gender value to string
      color: formData.color,
      tamano: this.currentSizeOptions.find(option => option.value === formData.size)?.viewValue, // Map size value to string
      peso: formData.weight,
      imagenUrl: this.imageUrl as string
    };

    if (this.selectedFile) {
      updateData.imagenUrl = this.imageUrl;
    }

    try {
      await this.http.put(`https://petpalzapi.onrender.com/api/Mascota/${this.pet}`, updateData).toPromise();
      if (this.selectedFile) {
        await this.indexedDBService.setImage(this.pet.id, this.imageUrl as string);
      }
      alert('Mascota actualizada con éxito.');
      this.dialogRef.close(true);
    } catch (error) {
      console.error('Error updating pet:', error);
      alert('Error actualizando la mascota.');
    }
  }
}