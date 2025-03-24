import { Component, signal, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { MonitoreoInformacionComponent } from '../monitoreo-informacion/monitoreo-informacion.component';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-monitoreo',
  imports: [
    SidebarComponent,
    CommonModule,
    MonitoreoInformacionComponent,
  ],
  templateUrl: './monitoreo.component.html',
  styleUrls: ['./monitoreo.component.scss'],
})
export class MonitoreoComponent implements OnInit {
  isLeftSidebarCollapsed = signal<boolean>(false);
  pet: any;

  changeIsLeftSidebarCollapsed(isLeftSidebarCollapsed: boolean): void {
    this.isLeftSidebarCollapsed.set(isLeftSidebarCollapsed);
  }

  screenWidth = signal<number>(0);

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private authService: AuthService
  ) {
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

    this.route.paramMap.subscribe(params => {
      const petId = params.get('id');
      if (petId) {
        this.loadPetData(petId);
      }
    });
  }

  loadPetData(petId: string): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.http.get(`https://petpalzapi.onrender.com/api/Mascota/${petId}`).subscribe(
        (petData: any) => {
          this.pet = petData;
        },
        error => {
          console.error('Error fetching pet data:', error);
        }
      );
    }
  }
}
