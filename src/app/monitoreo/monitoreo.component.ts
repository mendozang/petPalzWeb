import { Component, signal, HostListener, OnInit, AfterViewInit, Inject, PLATFORM_ID, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { MatTabsModule, MatTabChangeEvent } from '@angular/material/tabs'; 
import { MonitoreoHistorialComponent } from '../monitoreo-historial/monitoreo-historial.component';
import { MonitoreoInformacionComponent } from '../monitoreo-informacion/monitoreo-informacion.component';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Chart, registerables } from 'chart.js';
import { isPlatformBrowser as angularIsPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-monitoreo',
  imports: [
    SidebarComponent,
    CommonModule,
    MatTabsModule,
    MonitoreoHistorialComponent,
    MonitoreoInformacionComponent
  ],
  templateUrl: './monitoreo.component.html',
  styleUrls: ['./monitoreo.component.scss'],
})
export class MonitoreoComponent implements OnInit, AfterViewInit {
  isLeftSidebarCollapsed = signal<boolean>(false);
  isBrowser = false;
  pet: any;

  @ViewChild('healthTemp') healthTemp!: ElementRef;
  @ViewChild('healthRate') healthRate!: ElementRef;
  @ViewChild('healthBreathing') healthBreathing!: ElementRef;
  @ViewChild('healthVfc') healthVfc!: ElementRef;

  temperatura: number | null = null;
  pulso: number | null = null;
  respiracion: number | null = null;
  vfc: number | null = null;

  petSize: '1' | '2' | '3' | '4' | '5' = '1';
  petSpecies: 'Perro' | 'Gato' = 'Perro';

  tempChart: Chart | null = null;
  rateChart: Chart | null = null;
  breathingChart: Chart | null = null;
  vfcChart: Chart | null = null;

  changeIsLeftSidebarCollapsed(isLeftSidebarCollapsed: boolean): void {
    this.isLeftSidebarCollapsed.set(isLeftSidebarCollapsed);
  }

  screenWidth = signal<number>(0);

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
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

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      setTimeout(() => this.initializeChart(), 3);
      if (this.pet?.id) {
        this.fetchPetDetails(this.pet.id);
      }
    }
  }

  loadPetData(petId: string): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.http.get(`https://petpalzapi.onrender.com/api/Mascota/${petId}`).subscribe(
        (petData: any) => {
          this.pet = petData;
          this.fetchPetDetails(petData.id);
        },
        error => {
          console.error('Error fetching pet data:', error);
        }
      );
    }
  }

  fetchPetDetails(petId: number): void {
    if (!petId) {
      console.error('No pet ID provided');
      return;
    }

    this.http.get(`https://petpalzapi.onrender.com/api/Mascota/${petId}`).subscribe(
      (response: any) => {
        this.petSize = response.tamano;
        this.petSpecies = response.especie;
        console.log('Fetched pet details:', response); // Debugging
        this.fetchHealthData(petId);
      },
      error => {
        console.error('Error fetching pet details:', error);
      }
    );
  }

  fetchHealthData(petId: number): void {
    if (!petId) {
      console.error('No pet ID provided');
      return;
    }

    this.http.get(`https://petpalzapi.onrender.com/api/Monitoreo/mascota/${petId}`).subscribe(
      (response: any) => {
        const healthData = response.$values[response.$values.length - 1]; // Get the latest health data
        console.log('Fetched health data:', healthData); // Debugging
        this.updateCharts(healthData);
        this.updateVitalSigns(healthData);
      },
      error => {
        console.error('Error fetching health data:', error);
      }
    );
  }

  updateVitalSigns(healthData: any): void {
    this.temperatura = healthData.temperatura ?? 0; // Default to 0 if undefined
    this.pulso = healthData.pulso ?? 0;
    this.respiracion = healthData.respiracion ?? 0; // Use bracket notation
    this.vfc = healthData.vfc ?? 0;

    console.log('Updated vital signs:', this.temperatura, this.pulso, this.respiracion, this.vfc); // Debugging

    this.cdr.detectChanges(); // Trigger change detection
  }

  updateCharts(healthData: any): void {
    console.log('Pet size:', this.petSize); // Debugging
    console.log('Pet species:', this.petSpecies); // Debugging

    const normalRange = normalRanges[this.petSpecies]?.[this.petSize];

    if (!normalRange) {
      console.error('Error: normalRange is undefined for petSize:', this.petSize, 'and petSpecies:', this.petSpecies);
      return;
    }

    const getColor = (value: number, range: number[]) => {
      return value >= range[0] && value <= range[1] ? '#0ECBA1' : '#BA1A1A';
    };

    const getRemainingValue = (value: number, range: number[]) => {
      return range[1] - value;
    };

    if (this.healthTemp && this.healthTemp.nativeElement) {
      const temp = this.healthTemp.nativeElement.getContext('2d');
      if (this.tempChart) this.tempChart.destroy();
      this.tempChart = new Chart(temp, {
        type: 'doughnut',
        data: {
          datasets: [{
            label: 'Temperatura',
            data: [healthData.temperatura, getRemainingValue(healthData.temperatura, normalRange.temperatura)],
            backgroundColor: [getColor(healthData.temperatura, normalRange.temperatura), '#E9EDF0']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true
        }
      });
    }

    if (this.healthRate && this.healthRate.nativeElement) {
      const rate = this.healthRate.nativeElement.getContext('2d');
      if (this.rateChart) this.rateChart.destroy();
      this.rateChart = new Chart(rate, {
        type: 'doughnut',
        data: {
          datasets: [{
            label: 'Ritmo Cardíaco',
            data: [healthData.pulso, getRemainingValue(healthData.pulso, normalRange.pulso)],
            backgroundColor: [getColor(healthData.pulso, normalRange.pulso), '#E9EDF0']
          }]
        },
        options: {
          responsive: false,
          maintainAspectRatio: false
        }
      });
    }

    if (this.healthBreathing && this.healthBreathing.nativeElement) {
      const breathing = this.healthBreathing.nativeElement.getContext('2d');
      if (this.breathingChart) this.breathingChart.destroy();
      this.breathingChart = new Chart(breathing, {
        type: 'doughnut',
        data: {
          datasets: [{
            label: 'Respiración',
            data: [healthData.respiracion, getRemainingValue(healthData.respiracion, normalRange.respiracion)],
            backgroundColor: [getColor(healthData.respiracion, normalRange.respiracion), '#E9EDF0']
          }]
        },
        options: {
          responsive: false,
          maintainAspectRatio: false
        }
      });
    }

    if (this.healthVfc && this.healthVfc.nativeElement) {
      const vfc = this.healthVfc.nativeElement.getContext('2d');
      if (this.vfcChart) this.vfcChart.destroy();
      this.vfcChart = new Chart(vfc, {
        type: 'doughnut',
        data: {
          datasets: [{
            label: 'VFC',
            data: [healthData.vfc, getRemainingValue(healthData.vfc, normalRange.vfc)],
            backgroundColor: [getColor(healthData.vfc, normalRange.vfc), '#E9EDF0']
          }]
        },
        options: {
          responsive: false,
          maintainAspectRatio: false
        }
      });
    }
  }

  clearCharts(): void {
    if (this.tempChart) this.tempChart.destroy();
    if (this.rateChart) this.rateChart.destroy();
    if (this.breathingChart) this.breathingChart.destroy();
    if (this.vfcChart) this.vfcChart.destroy();
  }

  initializeChart(): void {
    Chart.register(...registerables);
  }

  onTabChange(event: MatTabChangeEvent): void {
    if (event.index === 2) { // Assuming "Monitoreo" tab is at index 2
      if (this.pet?.id) {
        this.fetchHealthData(this.pet.id);
      }
    }
  }
}

interface NormalRanges {
  [key: string]: {
    [key: string]: {
      temperatura: number[];
      pulso: number[];
      respiracion: number[];
      vfc: number[];
    };
  };
}

const normalRanges: NormalRanges = {
  'Perro': {
    '1': { temperatura: [38, 39], pulso: [120, 160], respiracion: [20, 40], vfc: [40, 80] },
    '2': { temperatura: [38, 39], pulso: [100, 140], respiracion: [18, 35], vfc: [35, 75] },
    '3': { temperatura: [38, 39], pulso: [80, 120], respiracion: [16, 30], vfc: [30, 70] },
    '4': { temperatura: [38, 39], pulso: [70, 100], respiracion: [14, 25], vfc: [25, 65] },
    '5': { temperatura: [38, 39], pulso: [60, 90], respiracion: [12, 20], vfc: [20, 60] }
  },
  'Gato': {
    '1': { temperatura: [38, 39.5], pulso: [150, 220], respiracion: [20, 40], vfc: [50, 100] },
    '2': { temperatura: [38, 39.5], pulso: [140, 200], respiracion: [16, 35], vfc: [45, 95] },
    '3': { temperatura: [38, 39.5], pulso: [120, 180], respiracion: [12, 30], vfc: [40, 90] }
  }
};
function isPlatformBrowser(platformId: Object): boolean {
  return angularIsPlatformBrowser(platformId);
}
