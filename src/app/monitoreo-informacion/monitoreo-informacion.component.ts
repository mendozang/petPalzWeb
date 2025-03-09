import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-monitoreo-informacion',
  imports: [MatIconModule, CommonModule],
  templateUrl: './monitoreo-informacion.component.html',
  styleUrls: ['./monitoreo-informacion.component.scss']
})
export class MonitoreoInformacionComponent implements OnInit {
  @Input() petId!: number;
  pet: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchPetData();
  }

  fetchPetData(): void {
    this.http.get(`https://petpalzapi.onrender.com/api/Mascota/${this.petId}`).subscribe(
      (petData: any) => {
        this.pet = petData;
      },
      (error) => {
        console.error('Error fetching pet data:', error);
      }
    );
  }

  calculateAge(birthYear: string): number {
    const currentYear = new Date().getFullYear();
    return currentYear - parseInt(birthYear, 10);
  }
}