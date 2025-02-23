import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://petpalzapi.onrender.com/api/Usuario';

  constructor(private http: HttpClient) {}

  registerUser(user: { nombre: string; email: string; contraseña: string }): Observable<any> {
    return this.http.post(this.apiUrl, user);
  }
}