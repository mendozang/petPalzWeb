import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { IndexedDBService } from './indexeddb.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://petpalzapi.onrender.com/api/Usuario';
  private currentUserSubject = new BehaviorSubject<any>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private indexedDBService: IndexedDBService) {
    this.loadUserFromIndexedDB();
  }

  login(email: string, contraseña: string): Observable<any> {
    return this.http.get(`${this.apiUrl}?searchTerm=${email}`);
  }

  async setCurrentUser(user: any): Promise<void> {
    const freshUserData = await this.http.get(`${this.apiUrl}/${user.id}`).toPromise();
    this.currentUserSubject.next(freshUserData);
    await this.indexedDBService.setUser(freshUserData);
  }
  

  private async loadUserFromIndexedDB(): Promise<void> {
    const user = await this.indexedDBService.getUser();
    if (user) {
      this.currentUserSubject.next(user);
    }
  }

  async logout(): Promise<void> {
    await this.indexedDBService.deleteUser();
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }
}