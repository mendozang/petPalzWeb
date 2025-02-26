import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../services/auth.service';
import { MatDialogModule, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { UpdateProfileDialogComponent } from './success-dialog/update-profile-dialog.component';

@Component({
  selector: 'app-editar-perfil',
  imports: [
    MatIconModule,
    MatButtonModule,
    CommonModule,
    MatInputModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatDialogModule,
    ReactiveFormsModule
  ],
  templateUrl: './editar-perfil.component.html',
  styleUrls: ['./editar-perfil.component.scss']
})
export class EditarPerfilComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  selectedFileName: string | null = null;
  selectedFile: File | null = null;
  imageUrl: string | ArrayBuffer | null = '/assets/default-avatar.jpg';
  form: FormGroup;
  userId: number | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient, 
    private authService: AuthService,
    private dialogRef: MatDialogRef<EditarPerfilComponent>,
    private dialog: MatDialog,
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      antiguaContrasena: [''],
      nuevaContrasena: ['', [Validators.minLength(6)]],
      confirmarNuevaContrasena: [''],
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userId = user.id;
        this.form.patchValue({
          nombre: user.nombre,
          email: user.email
        });
        this.imageUrl = user.imagenUrl || '/assets/default-avatar.jpg';
      }
    });
  }

  closeModal(): void {
    this.dialogRef.close(); // Close the MatDialog modal
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
    const updateData: any = {};

    if (formData.nombre) {
      updateData.nombre = formData.nombre;
    }
    if (formData.email) {
      updateData.email = formData.email;
    }
    if (this.selectedFile) {
      updateData.imagenUrl = this.imageUrl;
    }
    if (formData.antiguaContrasena && formData.nuevaContrasena && formData.confirmarNuevaContrasena) {
      if (formData.nuevaContrasena !== formData.confirmarNuevaContrasena) {
        this.errorMessage = 'La nueva contraseña y la confirmación de la nueva contraseña no coinciden.';
        return;
      }
      updateData.nuevaContraseña = formData.nuevaContrasena;
    }

    try {
      await this.http.put(`https://petpalzapi.onrender.com/api/Usuario/${this.userId}`, updateData).toPromise();
      await this.authService.updateCurrentUser({ ...this.authService.currentUserValue, ...updateData });
      this.closeModal();
      this.openSuccessDialog();
    } catch (error) {
      console.error('Error updating profile:', error);
      this.errorMessage = 'Error actualizando el perfil.'; // Update this line
    }
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('nuevaContrasena')?.value;
    const confirmPassword = control.get('confirmarNuevaContrasena')?.value;

    if (confirmPassword && password !== confirmPassword) {
      return { passwordsMismatch: true };
    }

    return null;
  }

  openSuccessDialog() {
    const dialogRef = this.dialog.open(UpdateProfileDialogComponent, {
      width: '250px',
      data: { message: 'Usuario actualizado correctamente' }
    });

    dialogRef.afterClosed().subscribe(() => {
      
    });
  }
}