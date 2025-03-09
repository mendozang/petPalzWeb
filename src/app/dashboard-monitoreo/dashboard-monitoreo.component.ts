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

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private http: HttpClient, private cdr: ChangeDetectorRef) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      setTimeout(() => this.initializeChart(), 3);
      if (this.selectedPetId) {
        this.fetchHealthData(this.selectedPetId);
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedPetId'] && changes['selectedPetId'].currentValue) {
      this.fetchHealthData(this.selectedPetId);
    }
  }

  fetchHealthData(petId: number): void {
    if (!petId) {
      console.error('No pet ID provided');
      return;
    }

    this.http.get(`https://petpalzapi.onrender.com/api/Monitoreo/mascota/${petId}`).subscribe(
      (response: any) => {
        const healthData = response.$values[0];
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
    this.respiracion = healthData['respiración'] ?? 0; // Use bracket notation
    this.vfc = healthData.vfc ?? 0;
  
    console.log('Updated vital signs:', this.temperatura, this.pulso, this.respiracion, this.vfc); // Debugging
  
    this.cdr.detectChanges(); // Trigger change detection
  }

  updateCharts(healthData: any): void {
    if (this.healthTemp && this.healthTemp.nativeElement) {
      const temp = this.healthTemp.nativeElement.getContext('2d');
      new Chart(temp, {
        type: 'doughnut',
        data: {
          datasets: [{
            label: 'Temperatura',
            data: [healthData.temperatura, 50],
            backgroundColor: ['#0ECBA1', '#E9EDF0']
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
      new Chart(rate, {
        type: 'doughnut',
        data: {
          datasets: [{
            label: 'Ritmo Cardíaco',
            data: [healthData.pulso, 150],
            backgroundColor: ['#0ECBA1', '#E9EDF0']
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
      new Chart(breathing, {
        type: 'doughnut',
        data: {
          datasets: [{
            label: 'Respiración',
            data: [healthData['respiración'], 250],
            backgroundColor: ['#0ECBA1', '#E9EDF0']
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
      new Chart(vfc, {
        type: 'doughnut',
        data: {
          datasets: [{
            label: 'VFC',
            data: [healthData.vfc, 350],
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

  //health charts
  initializeChart(): void {
    Chart.register(...registerables);
  }
}