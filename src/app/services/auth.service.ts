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
    try {
      const freshUserData: any = await this.http.get(`${this.apiUrl}/${user.id}`).toPromise();
      
      if (!freshUserData) {
        console.error("Error: No user data received from API.");
        return;
      }
  
      console.log("Fetched user data:", freshUserData); // Debugging step
  
      const pets = Array.isArray(freshUserData.mascotas) ? freshUserData.mascotas.map((pet: any) => ({ id: pet.id, name: pet.nombre })) : [];
  
      const basicUserData = {
        id: freshUserData.id || null,
        name: freshUserData.nombre || '',
        email: freshUserData.email || '',
        password: freshUserData.contraseña || '',
        pets: freshUserData.mascotas
      };
  
      console.log("Processed user data for storage:", basicUserData);
  
      if (!basicUserData.id) {
        console.error("Error: User ID is missing from API response.");
        return;
      }
  
      await this.indexedDBService.setUser(basicUserData);
      localStorage.setItem('currentUser', JSON.stringify(basicUserData));
      this.currentUserSubject.next(basicUserData);
    } catch (error) {
      console.error("Error setting current user:", error);
    }
  }
  

  private async loadUserFromIndexedDB(): Promise<void> {
    try {
      const users = await this.indexedDBService.getUser();
      
      if (users && users.length > 0) {
        const user = users[0];
        console.log("User loaded from IndexedDB:", user);
  
        if (!user.id) {
          console.error("Error: User ID missing in IndexedDB data.");
          return;
        }
  
        this.currentUserSubject.next(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
      } else {
        console.warn("No user found in IndexedDB.");
      }
    } catch (error) {
      console.error("Error loading user from IndexedDB:", error);
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