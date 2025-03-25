import { Component, signal, HostListener, OnInit, ViewChild, ElementRef, Inject, PLATFORM_ID, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-veterinarios',
  imports: [
    SidebarComponent,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    RouterModule
  ],
  templateUrl: './veterinarios.component.html',
  styleUrls: ['./veterinarios.component.scss']
})
export class VeterinariosComponent implements OnInit, AfterViewInit {
  isLeftSidebarCollapsed = signal<boolean>(false);
  isBrowser = false;
  map: any;
  vetClinics: any[] = [];
  filteredVetClinics: any[] = []; // Filtered vet clinics to be displayed
  userLocation: [number, number] = [20.966530, -89.617211]; // Default location
  userMarker: any; // Marker for the user's location

  @ViewChild('map') mapContainer!: ElementRef;

  changeIsLeftSidebarCollapsed(isLeftSidebarCollapsed: boolean): void {
    this.isLeftSidebarCollapsed.set(isLeftSidebarCollapsed);
  }

  screenWidth = signal<number>(0);

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
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
    this.getUserLocation();
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  async initializeMap(): Promise<void> {
    if (this.isBrowser && !this.map) {
      const L = await import('leaflet');
  
      this.map = L.map(this.mapContainer.nativeElement).setView(this.userLocation, 16);
  
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);
  
      // Listen for map movement and update clinics accordingly
      this.map.on('moveend', () => {
        this.filterVetClinics();
      });
  
      this.addMarkers();
    }
  }
  

  getUserLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation = [position.coords.latitude, position.coords.longitude];
          if (this.map) {
            this.map.setView(this.userLocation, 16); // Update map view to user's location
            this.addUserMarker(); // Add marker for user's location
          }
          this.fetchVetClinics();
        },
        (error) => {
          console.error('Error getting user location:', error);
          this.fetchVetClinics(); // Fetch vet clinics even if user location is not available
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      this.fetchVetClinics(); // Fetch vet clinics if geolocation is not supported
    }
  }

  fetchVetClinics(): void {
    this.http.get('https://petpalzapi.onrender.com/api/Veterinario').subscribe(
      (data: any) => {
        this.vetClinics = data.$values || [];
        this.filterVetClinics();
        this.addMarkers();
      },
      (error) => {
        console.error('Error fetching vet clinics:', error);
      }
    );
  }

  filterVetClinics(): void {
    this.filteredVetClinics = this.vetClinics.filter((clinic) => {
      const distance = this.calculateDistance(
        this.userLocation[0],
        this.userLocation[1],
        clinic.latitud,
        clinic.longitud
      );
      return distance <= 4; // Show only clinics within a certain distance (e.g., 4 km)
    });

    this.cdr.detectChanges();
  }

  addMarkers(): void {
    if (!this.map || !this.filteredVetClinics.length) return;

    import('leaflet').then((L) => {
      // Create a custom icon
      const customIcon = L.icon({
        iconUrl: '/assets/map-marker.png', // Path to your custom marker image
        iconSize: [30, 50], // Size of the icon
        iconAnchor: [19, 38], // Point of the icon which will correspond to marker's location
        popupAnchor: [0, -38] // Point from which the popup should open relative to the iconAnchor
      });

      this.filteredVetClinics.forEach((clinic) => {
        const marker = L.marker([clinic.latitud, clinic.longitud], { icon: customIcon }).addTo(this.map);
        marker.bindPopup(`
          <div>
            <h4>${clinic.nombre}</h4>
            <p>Descripción: ${clinic.descripcion}</p>
            <p>Dirección: ${clinic.direccion}</p>
            <p>Horario: ${clinic.horario}</p>
          </div>
        `);
      });
    });
  }

  addUserMarker(): void {
    import('leaflet').then((L) => {
      if (this.userMarker) {
        this.map.removeLayer(this.userMarker);
      }
  
      // Manually define a default Leaflet icon
      const defaultIcon = L.icon({
        iconUrl: 'assets/marker-icon.png',
        shadowUrl: 'assets/marker-shadow.png',
        iconSize: [25, 41], // Default Leaflet size
        iconAnchor: [12, 41], // Adjust anchor point
        popupAnchor: [1, -34]
      });
  
      this.userMarker = L.marker(this.userLocation, { icon: defaultIcon })
        .addTo(this.map)
        .bindPopup('Estás Aquí');
    });
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon1 - lon2); // Corrected the order of subtraction
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  }

  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  getStarIcons(rating: number | string): string[] {
    const numericRating = typeof rating === 'number' ? rating : parseFloat(rating);
    if (isNaN(numericRating)) return Array(5).fill('star_border'); // Handle invalid data
  
    const fullStars = Math.floor(numericRating);
    const halfStars = numericRating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStars;
    
    return [
      ...Array(fullStars).fill('star'),
      ...Array(halfStars).fill('star_half'),
      ...Array(emptyStars).fill('star_border')
    ];
  }
  
}