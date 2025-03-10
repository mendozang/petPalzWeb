import { Component, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { AgregarVacunaComponent } from '../agregar-vacuna/agregar-vacuna.component';
import { AgregarEnfermedadComponent } from '../agregar-enfermedad/agregar-enfermedad.component';
import { AgregarTratamientoComponent } from '../agregar-tratamiento/agregar-tratamiento.component';
import { EditarVacunaComponent } from '../editar-vacuna/editar-vacuna.component';
import { EditarEnfermedadComponent } from '../editar-enfermedad/editar-enfermedad.component';
import { EditarTratamientoComponent } from '../editar-tratamiento/editar-tratamiento.component';
import { DeleteDialogComponent } from './delete-dialog/delete-dialog.component';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-monitoreo-historial',
  imports: [
    MatExpansionModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDialogModule,
    CommonModule
  ],
  templateUrl: './monitoreo-historial.component.html',
  styleUrls: ['./monitoreo-historial.component.scss'],
  providers: [DatePipe]
})
export class MonitoreoHistorialComponent implements OnInit {
  @Input() petId!: number;
  historialMedico: any;
  vacunas: any[] = [];
  enfermedades: any[] = [];
  tratamientos: any[] = [];

  constructor(private dialog: MatDialog, private http: HttpClient, private datePipe: DatePipe) {}

  ngOnInit(): void {
    this.fetchHistorialMedico();
  }

  fetchHistorialMedico(): void {
    this.http.get(`https://petpalzapi.onrender.com/api/historial-medico/mascota/${this.petId}`).subscribe(
      (data: any) => {
        this.historialMedico = data;
        this.vacunas = data.vacunas.$values;
        this.enfermedades = data.enfermedades.$values;
        this.tratamientos = data.tratamientos.$values;
      },
      (error) => {
        console.error('Error fetching historial medico:', error);
      }
    );
  }

  formatDate(date: string): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd')!;
  }

  openAgregarVacunaModal(): void {
    const dialogRef = this.dialog.open(AgregarVacunaComponent, {
      width: '500px',
      data: { historialMedicoId: this.historialMedico.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchHistorialMedico();
      }
    });
  }

  openAgregarEnfermedadModal(): void {
    const dialogRef = this.dialog.open(AgregarEnfermedadComponent, {
      width: '500px',
      data: { historialMedicoId: this.historialMedico.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchHistorialMedico();
      }
    });
  }

  openAgregarTratamientoModal(): void {
    const dialogRef = this.dialog.open(AgregarTratamientoComponent, {
      width: '500px',
      data: { historialMedicoId: this.historialMedico.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchHistorialMedico();
      }
    });
  }

  openEditarVacunaModal(vacuna: any): void {
    const dialogRef = this.dialog.open(EditarVacunaComponent, {
      width: '500px',
      data: { vacuna }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchHistorialMedico();
      }
    });
  }

  openEditarEnfermedadModal(enfermedad: any): void {
    const dialogRef = this.dialog.open(EditarEnfermedadComponent, {
      width: '500px',
      data: { enfermedad }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchHistorialMedico();
      }
    });
  }

  openEditarTratamientoModal(tratamiento: any): void {
    const dialogRef = this.dialog.open(EditarTratamientoComponent, {
      width: '500px',
      data: { tratamiento }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchHistorialMedico();
      }
    });
  }

  openDeleteDialog(item: any, type: string): void {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '300px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteItem(item, type);
      }
    });
  }

  deleteItem(item: any, type: string): void {
    let url = '';
    switch (type) {
      case 'vacuna':
        url = `https://petpalzapi.onrender.com/api/historial-medico/vacunas/${item.id}`;
        break;
      case 'enfermedad':
        url = `https://petpalzapi.onrender.com/api/historial-medico/enfermedades/${item.id}`;
        break;
      case 'tratamiento':
        url = `https://petpalzapi.onrender.com/api/historial-medico/tratamientos/${item.id}`;
        break;
    }

    this.http.delete(url).subscribe(
      () => {
        console.log(`${type} eliminada correctamente`);
        this.fetchHistorialMedico(); // Refresh the data
      },
      error => {
        console.error(`Error eliminando ${type}`, error);
      }
    );
  }
}