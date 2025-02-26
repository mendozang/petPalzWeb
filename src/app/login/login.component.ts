import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  loginError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.maxLength(50)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe(
        response => {
          console.log('API response:', response);
          const users = response?.$values; // Extract values
          if (users && users.length > 0) {
            const user = users[0];
            console.log('User data:', user);
            if (user.contraseña === password) { // Ensure field name matches API
              console.log('Login successful');
              this.authService.setCurrentUser(user);
              this.router.navigate(['/dashboard']);
            } else {
              this.loginError = 'Contraseña incorrecta.';
            }
          } else {
            this.loginError = 'Correo electrónico no encontrado.';
          }
        },
        error => {
          console.error('Error logging in', error);
          this.loginError = 'Error al iniciar sesión. Inténtalo de nuevo más tarde.';
        }
      );
    }
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}