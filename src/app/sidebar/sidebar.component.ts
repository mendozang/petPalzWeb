import { Component, input, output } from '@angular/core';
import {MatSidenavModule} from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [
    MatSidenavModule,
    MatIconModule,
    RouterModule,
    CommonModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  isLeftSidebarCollapsed = input.required<boolean>();
  changeIsLeftSidebarCollapsed = output<boolean>();

  items = [
    {
      routeLink: '/dashboard',
      icon: 'home',
      label: 'Inicio'
    },
    {
      routeLink: '/guias',
      icon: 'local_hospital',
      label: 'Guías'
    },
    {
      routeLink: '/monitoreo',
      icon: 'bar_chart',
      label: 'Monitoreo'
    },
    {
      routeLink: '/veterinarios',
      icon: 'location_on',
      label: 'Veterinarios'
    },
    {
      routeLink: '/mascota',
      icon: 'pets',
      label: 'Mascota'
    },
    {
      routeLink: '/configuracion',
      icon:'settings',
      label: "Configuración"
    }
  ];

  toggleCollapse(): void {
    this.changeIsLeftSidebarCollapsed.emit(!this.isLeftSidebarCollapsed())
  }
}
