import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {MatExpansionModule} from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-monitoreo-historial',
  imports: [
    MatExpansionModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './monitoreo-historial.component.html',
  styleUrl: './monitoreo-historial.component.scss'
})
export class MonitoreoHistorialComponent {

}
