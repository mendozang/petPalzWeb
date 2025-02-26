import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { GuiasComponent } from './guias/guias.component';
import { MonitoreoComponent } from './monitoreo/monitoreo.component';
import { VeterinariosComponent } from './veterinarios/veterinarios.component';
import { MascotaComponent } from './mascota/mascota.component';
import { AgregarMascotaComponent } from './agregar-mascota/agregar-mascota.component';
import { ConfiguracionComponent } from './configuracion/configuracion.component';
import { AgregarRecordatorioComponent } from './agregar-recordatorio/agregar-recordatorio.component';
import { GuiasDetallesComponent } from './guias-detalles/guias-detalles.component';
import { VeterinariosDetallesComponent } from './veterinarios-detalles/veterinarios-detalles.component';
import { MascotaDetallesComponent } from './mascota-detalles/mascota-detalles.component';


export const routes: Routes = [
    {
        path: '', 
        component: HomeComponent
    },
    {
        path: 'register', 
        component: RegisterComponent
    },
    {
        path: 'login', 
        component: LoginComponent
    },
    {
        path: 'dashboard', 
        component: DashboardComponent
    },
    {
        path: 'sidebar', 
        component: SidebarComponent
    },
    {
        path: 'guias',
        component: GuiasComponent
    },
    {
        path: 'guias/guias-detalles',
        component: GuiasDetallesComponent
    },
    {
        path: 'monitoreo',
        component: MonitoreoComponent
    },
    {
        path: 'veterinarios',
        component: VeterinariosComponent
    },
    {
        path: 'veterinarios/veterinarios-detalles',
        component: VeterinariosDetallesComponent
    },
    {
        path: 'mascota',
        component: MascotaComponent
    },
    {
        path: 'mascota/mascota-detalles',
        component: MascotaDetallesComponent
    },
    {
        path: 'agregar-mascota',
        component: AgregarMascotaComponent
    },
    {
        path: 'configuracion',
        component: ConfiguracionComponent
    },
    {
        path: 'agregar-recordatorio',
        component: AgregarRecordatorioComponent
    }
];
