import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [
    MatSidenavModule,
    MatIconModule,
    RouterModule,
    CommonModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @Input() isLeftSidebarCollapsed!: boolean;
  @Output() changeIsLeftSidebarCollapsed = new EventEmitter<boolean>();
  currentUser: any;

  items = [
    {
      routeLink: '/dashboard',
      icon: 'home',
      label: 'Inicio'
    },
    {
      routeLink: '/mascota',
      icon: 'pets',
      label: 'Mascota'
    },
    {
      routeLink: '/veterinarios',
      icon: 'location_on',
      label: 'Veterinarios'
    },
    {
      routeLink: '/guias',
      icon: 'local_hospital',
      label: 'Guías'
    },
    {
      routeLink: '/configuracion',
      icon: 'settings',
      label: "Configuración"
    }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleCollapse(): void {
    this.changeIsLeftSidebarCollapsed.emit(!this.isLeftSidebarCollapsed);
  }

  trackByFn(index: number, item: any): number {
    return index; 
  }
}