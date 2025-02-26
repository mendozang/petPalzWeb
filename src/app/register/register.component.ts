import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UserService } from '../services/user.service';
import { SuccessDialogComponent } from './success-dialog/success-dialog.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    ReactiveFormsModule,
    MatDialogModule,
    CommonModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      confirmarContrasena: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    let updatingValidity = false; 
  
    this.registerForm.get('contrasena')?.valueChanges.subscribe(() => {
      if (!updatingValidity) {
        updatingValidity = true;
        this.registerForm.get('confirmarContrasena')?.updateValueAndValidity({ onlySelf: true });
        updatingValidity = false;
      }
    });
  
    this.registerForm.get('confirmarContrasena')?.valueChanges.subscribe(() => {
      if (!updatingValidity) {
        updatingValidity = true;
        this.registerForm.get('contrasena')?.updateValueAndValidity({ onlySelf: true });
        updatingValidity = false;
      }
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('contrasena')?.value;
    const confirmPassword = control.get('confirmarContrasena')?.value;

    if (confirmPassword && password !== confirmPassword) {
      return { passwordsMismatch: true };
    }

    return null;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const { nombre, email, contrasena } = this.registerForm.value;
      this.userService.registerUser({ nombre, email, contraseña: contrasena }).subscribe(
        response => {
          console.log('Usuario creado correctamente', response);
          this.openSuccessDialog();
        },
        error => {
          console.error('Error registrando al usuario', error);
          alert('Error registrando al usuario: ' + error.message);
        }
      );
    }
  }

  openSuccessDialog() {
    const dialogRef = this.dialog.open(SuccessDialogComponent, {
      width: '250px',
      data: { message: 'Usuario creado correctamente' }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }

  get nombre() { return this.registerForm.get('nombre'); }
  get email() { return this.registerForm.get('email'); }
  get contrasena() { return this.registerForm.get('contrasena'); }
  get confirmarContrasena() { return this.registerForm.get('confirmarContrasena'); }
}