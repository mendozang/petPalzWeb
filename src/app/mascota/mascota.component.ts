import { Component, signal, HostListener, OnInit } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { AgregarMascotaComponent } from '../agregar-mascota/agregar-mascota.component';
import { AgregarRecordatorioComponent } from '../agregar-recordatorio/agregar-recordatorio.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-mascota',
  imports: [
    SidebarComponent,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    AgregarMascotaComponent,
    AgregarRecordatorioComponent,
    MatMenuModule,
    MatDialogModule
  ],
  templateUrl: './mascota.component.html',
  styleUrls: ['./mascota.component.scss']
})
export class MascotaComponent implements OnInit {
  isLeftSidebarCollapsed = signal<boolean>(false);
  pets: any[] = [];

  changeIsLeftSidebarCollapsed(isLeftSidebarCollapsed: boolean): void {
    this.isLeftSidebarCollapsed.set(isLeftSidebarCollapsed);
  }

  screenWidth = signal<number>(0);

  constructor(private http: HttpClient, private authService: AuthService, private dialog: MatDialog) {
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

    this.authService.currentUser$.subscribe(user => {
      if (user && user.mascotas) {
        this.pets = user.mascotas;
      }
    });
  }

  isMascotaModalVisible = false;
  isRecordatorioModalVisible = false;

  showMascotaModal() {
    this.isMascotaModalVisible = true;
  }

  hideMascotaModal() {
    this.isMascotaModalVisible = false;
  }

  showRecordatorioModal() {
    this.isRecordatorioModalVisible = true;
  }

  hideRecordatorioModal() {
    this.isRecordatorioModalVisible = false;
  }

  addPet(pet: any): void {
    this.pets.push(pet);
    this.updateUserPets();
  }

  deletePet(petId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.http.delete(`https://petpalzapi.onrender.com/api/Mascota/${petId}`).subscribe(
          async () => {
            this.pets = this.pets.filter(pet => pet.id !== petId);
            await this.updateUserPets();
          },
          error => {
            console.error('Error eliminando mascota', error);
          }
        );
      }
    });
  }

  private async updateUserPets(): Promise<void> {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      currentUser.mascotas = this.pets;
      await this.authService.setCurrentUser(currentUser);
    }
  }

  reloadPets(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user && user.mascotas) {
        this.pets = user.mascotas;
      }
    });
  }
}