import { Component, signal, HostListener, OnInit, AfterViewInit, Inject, PLATFORM_ID, ElementRef, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { CUSTOM_DATE_FORMATS, CustomDateAdapter } from '../custom-date-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AgregarRecordatorioComponent } from '../agregar-recordatorio/agregar-recordatorio.component';
import { MatMenuModule } from '@angular/material/menu';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { EditarRecordatorioComponent } from '../editar-recordatorio/editar-recordatorio.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { DashboardMonitoreoComponent } from '../dashboard-monitoreo/dashboard-monitoreo.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterModule, 
    SidebarComponent, 
    CommonModule, 
    MatButtonModule, 
    MatIconModule,
    AgregarRecordatorioComponent,
    RouterModule,
    MatMenuModule,
    MatDialogModule,
    DashboardMonitoreoComponent
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
  isLeftSidebarCollapsed = signal<boolean>(false);
  isBrowser = false;
  currentDate = new Date();
  currentMonth: string = '';
  daysInMonth: Date[] = [];
  pets: any[] = [];
  selectedPet: any = null;
  reminders: any[] = [];
  isRecordatorioModalVisible = false;
  map: any;
  lastLocation: any = null;
  healthData: any = null;

  @ViewChild('map') mapContainer!: ElementRef;
  @ViewChild('daysContainer') daysContainer!: ElementRef;
  @ViewChild(DashboardMonitoreoComponent) dashboardMonitoreoComponent!: DashboardMonitoreoComponent;

  changeIsLeftSidebarCollapsed(isLeftSidebarCollapsed: boolean): void {
    this.isLeftSidebarCollapsed.set(isLeftSidebarCollapsed);
  }

  screenWidth = signal<number>(0);

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object, 
    private dateAdapter: DateAdapter<any>,
    private http: HttpClient,
    private authService: AuthService,
    private dialog: MatDialog
  ) {
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
    this.authService.currentUser$.subscribe(user => {
      if (user && user.id) {
        this.loadPets();
        this.loadPetLocation(this.selectedPet.id);
        this.loadReminders(this.currentDate);
      } else {
        console.error('No current user or user ID found.');
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      setTimeout(() => this.initializeMap(), 3);
      this.updateCalendar();
      setTimeout(() => this.centerCurrentDay(), 3);
      this.enableDragScroll();
      this.getDayName(new Date());
    }
  }

  loadPets(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.id) {
      this.http.get(`https://petpalzapi.onrender.com/api/Usuario/${currentUser.id}`).subscribe(
        (userData: any) => {
          this.pets = Array.isArray(userData.mascotas) 
            ? userData.mascotas 
            : userData.mascotas?.$values || []; // Ensure it's an array
          if (this.pets.length > 0) {
            this.selectedPet = this.pets[0]; // Select the first pet by default
            this.loadReminders(this.currentDate);
            this.loadPetLocation(this.selectedPet.id);
            this.loadHealthData(this.selectedPet.id);
          }
        },
        error => {
          console.error('Error fetching pets:', error);
        }
      );
    } else {
      console.error('No current user or user ID found.');
    }
  }

  loadReminders(date: Date): void {
    if (this.selectedPet) {
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0] + 'T00:00:00Z';
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0] + 'T23:59:59Z';
      this.http.get(`https://petpalzapi.onrender.com/api/Recordatorio/Mascota/${this.selectedPet.id}?startDate=${startDate}&endDate=${endDate}`)
        .subscribe(
          (response: any) => {
            this.reminders = response.$values || [];
            this.generateDailyReminders(date);
          },
          error => {
            console.error('Error fetching reminders:', error);
          }
        );
    }
  }

  loadPetLocation(mascotaId: number): void {
    this.http.get(`https://petpalzapi.onrender.com/api/Monitoreo/mascota/${mascotaId}`).subscribe(
      (response: any) => {
        const locations = response.$values || [];
        if (locations.length > 0) {
          this.lastLocation = locations[0]; // Assuming the first entry is the latest
          this.updateMap(this.lastLocation.latitud, this.lastLocation.longitud);
        }
      },
      error => {
        console.error('Error fetching pet location:', error);
      }
    );
  }

  loadHealthData(mascotaId: number): void {
    this.http.get(`https://petpalzapi.onrender.com/api/Monitoreo/mascota/${mascotaId}`).subscribe(
      (response: any) => {
        const healthData = response.$values || [];
        if (healthData.length > 0) {
          this.healthData = healthData[0]; // Assuming the first entry is the latest
          this.dashboardMonitoreoComponent.updateCharts(this.healthData);
          this.dashboardMonitoreoComponent.updateVitalSigns(this.healthData);
        }
      },
      error => {
        console.error('Error fetching health data:', error);
      }
    );
  }

  async updateMap(lat: number, lng: number): Promise<void> {
    if (this.map) {
      this.map.setView([lat, lng], 13);
  
      const L = await import('leaflet'); // Dynamically import Leaflet
      L.marker([lat, lng]).addTo(this.map)
        .bindPopup('Ubicación actual de la mascota.')
        .openPopup();
    }
  }
  

  generateDailyReminders(date: Date): void {
    const dailyReminders: any[] = [];
    this.reminders.forEach(reminder => {
      if (reminder.fechaInicio && reminder.fechaFin) {
        const startDate = new Date(reminder.fechaInicio);
        const endDate = new Date(reminder.fechaFin);
        for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
          if (d.toISOString().split('T')[0] === date.toISOString().split('T')[0]) {
            dailyReminders.push({ ...reminder, fechaUnica: new Date(d), pet: this.selectedPet });
          }
        }
      } else if (reminder.fechaUnica && reminder.fechaUnica.split('T')[0] === date.toISOString().split('T')[0]) {
        dailyReminders.push({ ...reminder, pet: this.selectedPet });
      }
    });
    this.reminders = dailyReminders;
  }
  
  onDateChange(date: Date): void {
    this.currentDate = date;
    this.loadReminders(date);
  }

  selectPet(pet: any): void {
    this.selectedPet = pet;
    this.loadReminders(this.currentDate);
    this.loadPetLocation(pet.id);
    this.loadHealthData(pet.id);
  }

  openEditReminderModal(reminderId: number): void {
    const dialogRef = this.dialog.open(EditarRecordatorioComponent, {
      data: { reminderId }
    });
  
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.loadReminders(this.currentDate); // Reload reminders after editing
      }
        
      },
      error => {
        console.error('Error fetching reminder:', error);
      }
    );
  }

  //map
  async initializeMap(): Promise<void> {
    if (this.isBrowser) {
      const L = await import('leaflet'); // Dynamically import Leaflet
      
      this.map = L.map(this.mapContainer.nativeElement).setView([51.505, -0.09], 13);
  
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);
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

  showRecordatorioModal() {
    this.isRecordatorioModalVisible = true;
  }

  hideRecordatorioModal() {
    this.isRecordatorioModalVisible = false;
  }

  options: Option[] = [
    { value: '1', viewValue: 'Toma de medicamentos', icon: 'medication' },
    { value: '2', viewValue: 'Cita veterinaria', icon: 'local_hospital' },
    { value: '3', viewValue: 'Vacunación', icon: 'vaccines' },
    { value: '4', viewValue: 'Desparasitación', icon: 'bug_report' },
    { value: '5', viewValue: 'Baño', icon: 'shower' },
    { value: '6', viewValue: 'Paseo', icon: 'directions_walk' }
  ];

  getReminderIcon(tipo: string): string {
    const option = this.options.find(r => r.value === tipo);
    return option ? option.icon : 'event';
  }
}

interface Option {
  value: string;
  viewValue: string;
  icon: string;
}