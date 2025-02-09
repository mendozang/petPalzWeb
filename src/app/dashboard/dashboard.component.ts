import { Component, signal, HostListener, OnInit, AfterViewInit, Inject, PLATFORM_ID, ElementRef, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';


@Component({
  selector: 'app-dashboard',
  imports: [RouterModule, SidebarComponent, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  //sidebar collapse true-false
  isLeftSidebarCollapsed = signal<boolean>(false);
  isBrowser = false;
  

  @ViewChild('healthTemp') healthTemp!: ElementRef;
  @ViewChild('healthRate') healthRate!: ElementRef;
  @ViewChild('healthBreathing') healthBreathing!: ElementRef;
  @ViewChild('healthVfc') healthVfc!: ElementRef;

  changeIsLeftSidebarCollapsed(isLeftSidebarCollapsed: boolean): void {
    this.isLeftSidebarCollapsed.set(isLeftSidebarCollapsed);
  }

  screenWidth = signal<number>(0);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.screenWidth.set(window.innerWidth);
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (this.isBrowser) {
      this.screenWidth.set(window.innerWidth);
      if (this.screenWidth() < 768) {
        this.isLeftSidebarCollapsed.set(true);
      } else {
        this.isLeftSidebarCollapsed.set(false);
      }
    }
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.isLeftSidebarCollapsed.set(this.screenWidth() < 768);
    }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      setTimeout(() => this.initializeChart(), 3);
    }
  }

  initializeChart(): void {
    Chart.register(...registerables);
    
    const temp = this.healthTemp.nativeElement.getContext('2d');
    new Chart(temp, {
      type: 'doughnut',
      data: {
        datasets: [{
          label: 'Temperatura',
          data: [400, 50],
          backgroundColor: ['#0ECBA1', '#E9EDF0']
        }]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false
      }
    });
    const rate = this.healthRate.nativeElement.getContext('2d');
    new Chart(rate, {
      type: 'doughnut',
      data: {
        datasets: [{
          label: 'Ritmo Cardíaco',
          data: [300, 150],
          backgroundColor: ['#0ECBA1', '#E9EDF0']
        }]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false
      }
    });
    const breathing = this.healthBreathing.nativeElement.getContext('2d');
    new Chart(breathing, {
      type: 'doughnut',
      data: {
        datasets: [{
          label: 'Respiración',
          data: [200, 250],
          backgroundColor: ['#0ECBA1', '#E9EDF0']
        }]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false
      }
    });
    const vfc = this.healthVfc.nativeElement.getContext('2d');
    new Chart(vfc, {
      type: 'doughnut',
      data: {
        datasets: [{
          label: 'VFC',
          data: [100, 350],
          backgroundColor: ['#0ECBA1', '#E9EDF0']
        }]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false
      }
    });

  }

}