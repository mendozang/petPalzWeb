import { Component, signal, HostListener, OnInit} from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import {MatTabsModule} from '@angular/material/tabs'; 

@Component({
  selector: 'app-monitoreo',
  imports: [
    SidebarComponent,
    CommonModule,
    MatTabsModule,
  ],
  templateUrl: './monitoreo.component.html',
  styleUrl: './monitoreo.component.scss',
  
})
export class MonitoreoComponent implements OnInit {
  isLeftSidebarCollapsed = signal<boolean>(false);

  changeIsLeftSidebarCollapsed(isLeftSidebarCollapsed: boolean): void {
    this.isLeftSidebarCollapsed.set(isLeftSidebarCollapsed);
  }

  screenWidth = signal<number>(0);

  constructor() {
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
  }
}
