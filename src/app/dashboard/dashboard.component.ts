import { Component, signal, HostListener, OnInit, AfterViewInit, Inject, PLATFORM_ID, ElementRef, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { CUSTOM_DATE_FORMATS, CustomDateAdapter } from '../custom-date-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AgregarRecordatorioComponent } from '../agregar-recordatorio/agregar-recordatorio.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterModule, 
    SidebarComponent, 
    CommonModule, 
    MatButtonModule, 
    MatIconModule,
    AgregarRecordatorioComponent,
    RouterModule
  ],
  providers: [
      { provide: DateAdapter, useClass: CustomDateAdapter },
      { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
      { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
      
    ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  //sidebar collapse true-false
  isLeftSidebarCollapsed = signal<boolean>(false);
  isBrowser = false;
  currentDate = new Date();
  currentMonth: string = '';

  daysInMonth: Date[] = [];

  @ViewChild('healthTemp') healthTemp!: ElementRef;
  @ViewChild('healthRate') healthRate!: ElementRef;
  @ViewChild('healthBreathing') healthBreathing!: ElementRef;
  @ViewChild('healthVfc') healthVfc!: ElementRef;
  @ViewChild('map') mapContainer!: ElementRef;
  @ViewChild('daysContainer') daysContainer!: ElementRef;

  changeIsLeftSidebarCollapsed(isLeftSidebarCollapsed: boolean): void {
    this.isLeftSidebarCollapsed.set(isLeftSidebarCollapsed);
  }

  screenWidth = signal<number>(0);

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private dateAdapter: DateAdapter<any>) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.screenWidth.set(window.innerWidth);
    };
    this.dateAdapter.setLocale('es-ES');
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
      setTimeout(() => this.initializeMap(), 3);
      this.updateCalendar();
      setTimeout(() => this.centerCurrentDay(), 3);
      this.enableDragScroll();
      this.getDayName(new Date());
    }
  }

  //health charts
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

  //map
  async initializeMap(): Promise<void> {
    if (this.isBrowser) {
      const L = await import('leaflet'); // Dynamically import Leaflet
  
      const map = L.map(this.mapContainer.nativeElement).setView([51.505, -0.09], 13);
  
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
  
      L.marker([51.505, -0.09]).addTo(map)
        .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
        .openPopup();
    }
  }

  //calendar

  // Generar los días del mes actual
  updateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    this.daysInMonth = [];
    for (let day = firstDay.getDate(); day <= lastDay.getDate(); day++) {
      this.daysInMonth.push(new Date(year, month, day));
    }

    this.currentMonth = this.dateAdapter.format(this.currentDate, 'MMMM'); // Obtiene el mes en español
  }

  getDayName(date: Date): string {
    return new Intl.DateTimeFormat('es-ES', { weekday: 'short' })
      .format(date)
      .charAt(0).toUpperCase() + 
      new Intl.DateTimeFormat('es-ES', { weekday: 'short' })
      .format(date)
      .slice(1, 3); // Capitaliza la primera letra y toma solo tres caracteres
  }

  // Cambiar al mes anterior
  prevMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.updateCalendar();
    this.centerCurrentDay();
  }

  // Cambiar al siguiente mes
  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.updateCalendar();
    this.centerCurrentDay();
  }

  // Center the current day
  centerCurrentDay() {
    const currentDayIndex = this.daysInMonth.findIndex(day => this.isCurrentDay(day));
    if (currentDayIndex !== -1) {
      const daysContainer = this.daysContainer.nativeElement;
      const dayElement = daysContainer.children[currentDayIndex];
      const offset = dayElement.offsetLeft - (daysContainer.clientWidth / 2) + (dayElement.clientWidth / 2);
      daysContainer.scrollLeft = offset;
    }
  }

  // Enable drag scroll
  enableDragScroll() {
    const daysContainer = this.daysContainer.nativeElement;
    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    daysContainer.addEventListener('mousedown', (e: MouseEvent) => {
      isDown = true;
      daysContainer.classList.add('active');
      startX = e.pageX - daysContainer.offsetLeft;
      scrollLeft = daysContainer.scrollLeft;
    });

    daysContainer.addEventListener('mouseleave', () => {
      isDown = false;
      daysContainer.classList.remove('active');
    });

    daysContainer.addEventListener('mouseup', () => {
      isDown = false;
      daysContainer.classList.remove('active');
    });

    daysContainer.addEventListener('mousemove', (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - daysContainer.offsetLeft;
      const walk = (x - startX) * 1.5; // Adjust scroll speed
      daysContainer.scrollLeft = scrollLeft - walk;
    });

    // Add touch support
    daysContainer.addEventListener('touchstart', (e: TouchEvent) => {
      isDown = true;
      startX = e.touches[0].pageX - daysContainer.offsetLeft;
      scrollLeft = daysContainer.scrollLeft;
    });

    daysContainer.addEventListener('touchend', () => {
      isDown = false;
    });

    daysContainer.addEventListener('touchmove', (e: TouchEvent) => {
      if (!isDown) return;
      const x = e.touches[0].pageX - daysContainer.offsetLeft;
      const walk = (x - startX) * 1.5; // Adjust scroll speed
      daysContainer.scrollLeft = scrollLeft - walk;
    });
  }

  isCurrentDay(day: Date): boolean {
    const today = new Date();
    return day.getDate() === today.getDate() &&
           day.getMonth() === today.getMonth() &&
           day.getFullYear() === today.getFullYear();
  }

  isRecordatorioModalVisible = false;

  showRecordatorioModal() {
    this.isRecordatorioModalVisible = true;
  }

  hideRecordatorioModal() {
    this.isRecordatorioModalVisible = false;
  }
}