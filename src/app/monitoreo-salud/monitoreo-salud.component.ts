import { Component, ElementRef, ViewChild, AfterViewInit, Inject, PLATFORM_ID, Input, OnChanges, SimpleChanges, ChangeDetectorRef, signal, HostListener, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ActivatedRoute } from '@angular/router';
import * as echarts from 'echarts';

@Component({
  selector: 'app-monitoreo-salud',
  imports: [SidebarComponent, CommonModule],
  templateUrl: './monitoreo-salud.component.html',
  styleUrls: ['./monitoreo-salud.component.scss']
})
export class MonitoreoSaludComponent implements OnInit {
  isBrowser = false;
  petId!: number;
  pet: any;
  isLeftSidebarCollapsed = signal<boolean>(false);

  changeIsLeftSidebarCollapsed(isLeftSidebarCollapsed: boolean): void {
    this.isLeftSidebarCollapsed.set(isLeftSidebarCollapsed);
  }

  screenWidth = signal<number>(0);

  @ViewChild('healthTemp') healthTemp!: ElementRef;
  @ViewChild('healthRate') healthRate!: ElementRef;
  @ViewChild('healthBreathing') healthBreathing!: ElementRef;
  @ViewChild('healthVfc') healthVfc!: ElementRef;

  temperatura: number | null = null;
  pulso: number | null = null;
  respiracion: number | null = null;
  vfc: number | null = null;

  petSize: 'Mini (1 a 5 kilos)' | 'Pequeño (5 a 10 kilos)' | 'Mediano (10 a 25 kilos)' | 'Grande (25 a 45 kilos)' | 'Gigante (45+ kilos)'
  | 'Pequeño (1 a 3 kilos)' | 'Mediano (3 a 6 kilos)' | 'Grande (6+ kilos)' = 'Mini (1 a 5 kilos)';
  petSpecies: 'Perro' | 'Gato' = 'Perro';

  tempChart: echarts.ECharts | null = null;
  rateChart: echarts.ECharts | null = null;
  breathingChart: echarts.ECharts | null = null;
  vfcChart: echarts.ECharts | null = null;

  tempMessage: string | null = null;
  rateMessage: string | null = null;
  breathingMessage: string | null = null;
  vfcMessage: string | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute) {
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
    if (this.isBrowser) {
      this.route.paramMap.subscribe(params => {
        this.petId = Number(params.get('petId'));
        this.fetchPetDetails(this.petId);
        setTimeout(() => {
          this.fetchHealthData(this.petId);
        }, 1000);
        
      });
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

  showNotification(title: string, body: string): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
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

    this.tempMessage = this.generateMessage(this.temperatura ?? 0, normalRange.temperatura, 'Temperatura', 'La fiebre alta en perros puede tener muchas causas, entre ellas infecciones, golpes de calor, enfermedades inmunomediadas, o envenenamiento', 'La temperatura baja en perros puede ser causada por hipotermia, shock, o enfermedades metabólicas.');
    this.rateMessage = this.generateMessage(this.pulso ?? 0, normalRange.pulso, 'Pulso', 'El pulso alto en perros puede ser causado por estrés, dolor, fiebre, o enfermedades cardíacas.', 'El pulso bajo en perros puede ser causado por enfermedades cardíacas, hipotermia, o ciertos medicamentos.');
    this.breathingMessage = this.generateMessage(this.respiracion ?? 0, normalRange.respiracion, 'Respiración', 'La respiración rápida en perros puede ser causada por estrés, dolor, fiebre, o enfermedades respiratorias.', 'La respiración lenta en perros puede ser causada por enfermedades respiratorias, hipotermia, o ciertos medicamentos.');
    this.vfcMessage = this.generateMessage(this.vfc ?? 0, normalRange.vfc, 'VFC', 'La VFC alta en perros puede ser causada por estrés, dolor, fiebre, o enfermedades cardíacas.', 'La VFC baja en perros puede ser causada por enfermedades cardíacas, hipotermia, o ciertos medicamentos.');


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

  generateMessage(value: number, range: number[], label: string, highMessage: string, lowMessage: string): string | null {
    if (value < range[0]) {
      return `⚠️ ${label} muy baja: ${value}°.\n ${lowMessage}`;
    } else if (value > range[1]) {
      return `⚠️ ${label} muy alta: ${value}°.\n ${highMessage}`;
    }
    return null;
  }

  calculateColorStops(range: number[], min: number, max: number): [number, string][] {
    const lowerBound = (range[0] - min) / (max - min);
    const upperBound = (range[1] - min) / (max - min);
    return [
      [lowerBound, '#50B39D'],
      [upperBound, '#16D2A8'],
      [1, '#fd666d']
    ];
  }

  updateCharts(healthData: any): void {
    console.log('Pet size:', this.petSize); // Debugging
    console.log('Pet species:', this.petSpecies); // Debugging

    const normalRange = normalRanges[this.petSpecies]?.[this.petSize];

    if (!normalRange) {
      console.error('Error: normalRange is undefined for petSize:', this.petSize, 'and petSpecies:', this.petSpecies);
      return;
    }

    const minTemp = 35;
    const maxTemp = 42;
    const minPulse = 60;
    const maxPulse = 230;
    const minRespiration = 10;
    const maxRespiration = 50;
    const minVfc = 10;
    const maxVfc = 110;

    if (this.healthTemp && this.healthTemp.nativeElement) {
      const temp = this.healthTemp.nativeElement;
      if (this.tempChart) this.tempChart.dispose();
      console.log('healthTemp:', this.healthTemp?.nativeElement);
      this.tempChart = echarts.init(temp);
      const tempOption = {
        series: [
          {
            type: 'gauge',
            min: minTemp,
            max: maxTemp,
            splitNumber: 5,
            axisLine: {
              lineStyle: {
                width: 30,
                color: this.calculateColorStops(normalRange.temperatura, minTemp, maxTemp)
              }
            },
            pointer: {
              itemStyle: {
                color: 'auto'
              }
            },
            axisTick: {
              distance: -30,
              length: 8,
              lineStyle: {
                color: '#fff',
                width: 0
              }
            },
            splitLine: {
              distance: -30,
              length: 30,
              lineStyle: {
                color: '#fff',
                width: 0
              }
            },
            axisLabel: {
              color: 'inherit',
              distance: -30,
              fontSize: 12
            },
            detail: {
              valueAnimation: true,
              formatter: '{value} °C',
              color: 'inherit',
              offsetCenter: [0, '70%'],
              fontSize: 20
            },
            data: [
              {
                value: healthData.temperatura ?? 0
              }
            ]
          }
        ]
      };
      this.tempChart.setOption(tempOption);
    }

    if (this.healthRate && this.healthRate.nativeElement) {
      const rate = this.healthRate.nativeElement;
      if (this.rateChart) this.rateChart.dispose();
      this.rateChart = echarts.init(rate);
      const rateOption = {
        series: [
          {
            type: 'gauge',
            min: minPulse,
            max: maxPulse,
            splitNumber: 5,
            axisLine: {
              lineStyle: {
                width: 30,
                color: this.calculateColorStops(normalRange.pulso, minPulse, maxPulse)
              }
            },
            pointer: {
              itemStyle: {
                color: 'auto'
              }
            },
            axisTick: {
              distance: -30,
              length: 8,
              lineStyle: {
                color: '#fff',
                width: 0
              }
            },
            splitLine: {
              distance: -30,
              length: 30,
              lineStyle: {
                color: '#fff',
                width: 0
              }
            },
            axisLabel: {
              color: 'inherit',
              distance: -30,
              fontSize: 12
            },
            detail: {
              valueAnimation: true,
              formatter: '{value} bpm',
              color: 'inherit',
              offsetCenter: [0, '70%'],
              fontSize: 18
            },
            data: [
              {
                value: healthData.pulso ?? 0
              }
            ]
          }
        ]
      };
      this.rateChart.setOption(rateOption);
    }

    if (this.healthBreathing && this.healthBreathing.nativeElement) {
      const breathing = this.healthBreathing.nativeElement;
      if (this.breathingChart) this.breathingChart.dispose();
      this.breathingChart = echarts.init(breathing);
      const breathingOption = {
        series: [
          {
            type: 'gauge',
            min: minRespiration,
            max: maxRespiration,
            splitNumber: 5,
            axisLine: {
              lineStyle: {
                width: 30,
                color: this.calculateColorStops(normalRange.respiracion, minRespiration, maxRespiration)
              }
            },
            pointer: {
              itemStyle: {
                color: 'auto'
              }
            },
            axisTick: {
              distance: -30,
              length: 8,
              lineStyle: {
                color: '#fff',
                width: 0
              }
            },
            splitLine: {
              distance: -30,
              length: 30,
              lineStyle: {
                color: '#fff',
                width: 0
              }
            },
            axisLabel: {
              color: 'inherit',
              distance: -30,
              fontSize: 12
            },
            detail: {
              valueAnimation: true,
              formatter: '{value} rpm',
              color: 'inherit',
              offsetCenter: [0, '70%'],
              fontSize: 20
            },
            data: [
              {
                value: healthData.respiracion ?? 0
              }
            ]
          }
        ]
      };
      this.breathingChart.setOption(breathingOption);
    }

    if (this.healthVfc && this.healthVfc.nativeElement) {
      const vfc = this.healthVfc.nativeElement;
      if (this.vfcChart) this.vfcChart.dispose();
      this.vfcChart = echarts.init(vfc);
      const vfcOption = {
        series: [
          {
            type: 'gauge',
            min: minVfc,
            max: maxVfc,
            splitNumber: 5,
            axisLine: {
              lineStyle: {
                width: 30,
                color: this.calculateColorStops(normalRange.vfc, minVfc, maxVfc)
              }
            },
            pointer: {
              itemStyle: {
                color: 'auto'
              }
            },
            axisTick: {
              distance: -30,
              length: 8,
              lineStyle: {
                color: '#fff',
                width: 0
              }
            },
            splitLine: {
              distance: -30,
              length: 30,
              lineStyle: {
                color: '#fff',
                width: 0
              }
            },
            axisLabel: {
              color: 'inherit',
              distance: -30,
              fontSize: 12
            },
            detail: {
              valueAnimation: true,
              formatter: '{value} ms',
              color: 'inherit',
              offsetCenter: [0, '70%'],
              fontSize: 20
            },
            data: [
              {
                value: healthData.vfc ?? 0
              }
            ]
          }
        ]
      };
      this.vfcChart.setOption(vfcOption);
    }
  }


  clearCharts(): void {
    if (this.tempChart) this.tempChart.dispose();
    if (this.rateChart) this.rateChart.dispose();
    if (this.breathingChart) this.breathingChart.dispose();
    if (this.vfcChart) this.vfcChart.dispose();
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
    'Mini (1 a 5 kilos)': { temperatura: [38, 39], pulso: [120, 160], respiracion: [20, 40], vfc: [40, 80] },
    'Pequeño (5 a 10 kilos)': { temperatura: [38, 39], pulso: [100, 140], respiracion: [18, 35], vfc: [35, 75] },
    'Mediano (10 a 25 kilos)': { temperatura: [38, 39], pulso: [80, 120], respiracion: [16, 30], vfc: [30, 70] },
    'Grande (25 a 45 kilos)': { temperatura: [38, 39], pulso: [70, 100], respiracion: [14, 25], vfc: [25, 65] },
    'Gigante (45+ kilos)': { temperatura: [38, 39], pulso: [60, 90], respiracion: [12, 20], vfc: [20, 60] }
  },
  'Gato': {
    'Pequeño (1 a 3 kilos)': { temperatura: [38, 39.5], pulso: [150, 220], respiracion: [20, 40], vfc: [50, 100] },
    'Mediano (3 a 6 kilos)': { temperatura: [38, 39.5], pulso: [140, 200], respiracion: [16, 35], vfc: [45, 95] },
    'Grande (6+ kilos)': { temperatura: [38, 39.5], pulso: [120, 180], respiracion: [12, 30], vfc: [40, 90] }
  }
};