import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { IndexedDBService } from './indexeddb.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://petpalzapi.onrender.com/api/Usuario';
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser$: Observable<any>;

  constructor(private http: HttpClient, private indexedDBService: IndexedDBService) {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.currentUserSubject = new BehaviorSubject<any>(user);
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.loadUserFromIndexedDB();
  }

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  async updateCurrentUser(user: any): Promise<void> {
    await this.indexedDBService.setUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user)); // Persist user to localStorage
    this.currentUserSubject.next(user);
  }

  login(email: string, contraseña: string): Observable<any> {
    return this.http.get(`${this.apiUrl}?searchTerm=${email}`);
  }

  async setCurrentUser(user: any): Promise<void> {
    const freshUserData = await this.http.get(`${this.apiUrl}/${user.id}`).toPromise();
    await this.indexedDBService.setUser(freshUserData);
    localStorage.setItem('currentUser', JSON.stringify(freshUserData)); // Persist user to localStorage
    this.currentUserSubject.next(freshUserData);
  }

  private async loadUserFromIndexedDB(): Promise<void> {
    const user = await this.indexedDBService.getUser();
    if (user) {
      this.currentUserSubject.next(user);
      localStorage.setItem('currentUser', JSON.stringify(user)); // Persist user to localStorage
    }
  }

  async logout(): Promise<void> {
    await this.indexedDBService.deleteUser();
    localStorage.removeItem('currentUser'); // Remove user from localStorage
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  async updateUserImage(userId: number, imageUrl: string): Promise<void> {
    await this.indexedDBService.setImage(userId, imageUrl);
  }

  async getUserImage(userId: number): Promise<string | null> {
    return await this.indexedDBService.getImage(userId);
  }
}