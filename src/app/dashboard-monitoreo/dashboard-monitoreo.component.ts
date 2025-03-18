import { Component, ElementRef, ViewChild, AfterViewInit, Inject, PLATFORM_ID, Input, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard-monitoreo',
  templateUrl: './dashboard-monitoreo.component.html',
  styleUrls: ['./dashboard-monitoreo.component.scss']
})
export class DashboardMonitoreoComponent implements AfterViewInit, OnChanges {
  isBrowser = false;
  @Input() selectedPetId!: number;

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

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private http: HttpClient, private cdr: ChangeDetectorRef) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      setTimeout(() => this.initializeChart(), 3);
      this.requestNotificationPermission();
      if (this.selectedPetId) {
        this.fetchPetDetails(this.selectedPetId);
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedPetId'] && changes['selectedPetId'].currentValue) {
      this.clearCharts();
      this.fetchPetDetails(changes['selectedPetId'].currentValue);
    }
  }

  requestNotificationPermission(): void {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Notification permission granted.');
        } else {
          console.log('Notification permission denied.');
        }
      });
    } else {
      console.log('This browser does not support notifications.');
    }
  }

  showNotification(title: string, body: string): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
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

    this.checkHealthData();
    this.cdr.detectChanges(); // Trigger change detection
  }

  checkHealthData(): void {
    const normalRange = normalRanges[this.petSpecies]?.[this.petSize];

    if (!normalRange) {
      console.error('Error: normalRange is undefined for petSize:', this.petSize, 'and petSpecies:', this.petSpecies);
      return;
    }

    if (this.temperatura !== null && (this.temperatura < normalRange.temperatura[0] || this.temperatura > normalRange.temperatura[1])) {
      this.showNotification('Alerta de Salud', `La temperatura de tu mascota está fuera del rango normal: ${this.temperatura} °C`);
    }

    if (this.pulso !== null && (this.pulso < normalRange.pulso[0] || this.pulso > normalRange.pulso[1])) {
      this.showNotification('Alerta de Salud', `El pulso de tu mascota está fuera del rango normal: ${this.pulso} bpm`);
    }

    if (this.respiracion !== null && (this.respiracion < normalRange.respiracion[0] || this.respiracion > normalRange.respiracion[1])) {
      this.showNotification('Alerta de Salud', `La respiración de tu mascota está fuera del rango normal: ${this.respiracion} rpm`);
    }

    if (this.vfc !== null && (this.vfc < normalRange.vfc[0] || this.vfc > normalRange.vfc[1])) {
      this.showNotification('Alerta de Salud', `La VFC de tu mascota está fuera del rango normal: ${this.vfc} ms`);
    }
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
      const remainingValue = range[1] - value;
      return remainingValue < 0 ? 0 : remainingValue;
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
          responsive: false,
          maintainAspectRatio: false
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

  //health charts
  initializeChart(): void {
    Chart.register(...registerables);
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