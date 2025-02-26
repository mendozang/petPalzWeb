import { Component, signal, HostListener, OnInit, ChangeDetectorRef, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
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
import { MatDatepickerModule} from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { CustomDateAdapter, CUSTOM_DATE_FORMATS } from '../custom-date-adapter';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { EditarRecordatorioComponent } from '../editar-recordatorio/editar-recordatorio.component';

registerLocaleData(localeEs, 'es');

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
    MatDialogModule,
    MatDatepickerModule,
    EditarRecordatorioComponent
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: LOCALE_ID, useValue: 'es' }
  ],
  templateUrl: './mascota.component.html',
  styleUrls: ['./mascota.component.scss']
})
export class MascotaComponent implements OnInit {
  isLeftSidebarCollapsed = signal<boolean>(false);
  pets: any[] = [];
  reminders: any[] = [];
  selectedDate: Date = new Date();

  options: Option[] = [
    { value: '1', viewValue: 'Toma de medicamentos', icon: 'medication' },
    { value: '2', viewValue: 'Cita veterinaria', icon: 'local_hospital' },
    { value: '3', viewValue: 'Vacunación', icon: 'vaccines' },
    { value: '4', viewValue: 'Desparasitación', icon: 'bug_report' },
    { value: '5', viewValue: 'Baño', icon: 'shower' },
    { value: '6', viewValue: 'Paseo', icon: 'directions_walk' }
  ];

  changeIsLeftSidebarCollapsed(isLeftSidebarCollapsed: boolean): void {
    this.isLeftSidebarCollapsed.set(isLeftSidebarCollapsed);
  }

  screenWidth = signal<number>(0);

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
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

    this.loadPets();
    this.loadReminders(this.selectedDate);
  }

  loadPets(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.http.get(`https://petpalzapi.onrender.com/api/Usuario/${currentUser.id}`).subscribe(
        (userData: any) => {
          console.log('User data:', userData); // Log the user data to check the structure
          this.pets = Array.isArray(userData.mascotas) 
            ? userData.mascotas 
            : userData.mascotas?.$values || []; // Ensure it's an array
          console.log('Pets:', this.pets); // Log the pets to check the structure
          this.cdr.detectChanges();
        },
        error => {
          console.error('Error fetching pets:', error);
        }
      );
    }
  }

  loadReminders(date: Date): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.reminders = [];
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0] + 'T00:00:00Z';
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0] + 'T23:59:59Z';
      const petRequests = this.pets.map(pet => 
        this.http.get(`https://petpalzapi.onrender.com/api/Recordatorio/Mascota/${pet.id}?startDate=${startDate}&endDate=${endDate}`)
          .pipe(map((response: any) => {
            const reminders = response.$values || [];
            return Array.isArray(reminders) ? reminders.map(reminder => ({ ...reminder, pet })) : [];
          }))
      );
  
      forkJoin(petRequests).subscribe(
        (responses: any[]) => {
          this.reminders = responses.flat();
          this.generateDailyReminders(date);
          console.log('reminders:', this.reminders);
          this.cdr.detectChanges();
        },
        (error: any) => {
          console.error('Error fetching reminders:', error);
        }
      );
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
            dailyReminders.push({ ...reminder, fechaUnica: new Date(d) });
          }
        }
      } else if (reminder.fechaUnica && reminder.fechaUnica.split('T')[0] === date.toISOString().split('T')[0]) {
        dailyReminders.push(reminder);
      }
    });
    this.reminders = dailyReminders;
  }

  onDateChange(date: Date): void {
    this.selectedDate = date;
    this.loadReminders(date);
  }

  openEditReminderModal(reminderId: number): void {
    this.http.get(`https://petpalzapi.onrender.com/api/Recordatorio/${reminderId}`).subscribe(
      (reminder: any) => {
        const dialogRef = this.dialog.open(EditarRecordatorioComponent, {
          data: { reminder }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.loadReminders(this.selectedDate); // Reload reminders after editing
          }
        });
      },
      error => {
        console.error('Error fetching reminder:', error);
      }
    );
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
    this.http.post(`https://petpalzapi.onrender.com/api/Mascota`, pet).subscribe(
      () => {
        this.loadPets(); // Fetch updated pet list
      },
      error => {
        console.error('Error adding pet:', error);
      }
    );
  }

  deletePet(petId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.http.delete(`https://petpalzapi.onrender.com/api/Mascota/${petId}`).subscribe(
          () => {
            this.loadPets(); // Reload pets after deletion
          },
          error => {
            console.error('Error deleting pet:', error);
          }
        );
      }
    });
  }

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