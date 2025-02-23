import { Component, signal, HostListener, OnInit } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-configuracion',
  imports: [
    SidebarComponent,
    CommonModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.scss']
})
export class ConfiguracionComponent implements OnInit {
  isLeftSidebarCollapsed = signal<boolean>(false);
  userName: string | null = null;
  userEmail: string | null = null;

  changeIsLeftSidebarCollapsed(isLeftSidebarCollapsed: boolean): void {
    this.isLeftSidebarCollapsed.set(isLeftSidebarCollapsed);
  }

  screenWidth = signal<number>(0);

  constructor(private authService: AuthService, private router: Router) {
    if (typeof window !== 'undefined') {
      this.screenWidth.set(window.innerWidth);
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (typeof window !== 'undefined') {
      this.screenWidth.set(window.innerWidth);
      if (this.screenWidth() < 768) {
        this.isLeftSidebarCollapsed.set(true);
      } else {
        this.isLeftSidebarCollapsed.set(false);
      }
    }
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.isLeftSidebarCollapsed.set(this.screenWidth() < 768);
    }

    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userName = user.nombre;
        this.userEmail = user.email;
      }
    });
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/']);
  }
}