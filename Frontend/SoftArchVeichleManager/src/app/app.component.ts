import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlarmManagerPageComponent } from './alarm/alarm-manager-page/alarm-manager-page.component';
import { FleetManagerPageComponent } from './fleet/fleet-manager-page/fleet-manager-page.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { LoginComponent } from './auth/login.component';
import { RegisterComponent } from './auth/register.component';
import { AuthService } from './services/auth.service';
import { UserSession } from './models/auth-user.model';
import { HttpClientModule } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { InterfaceManagerPageComponent } from './manufacturer/interface/interface-manager-page/interface-manager-page.component';
import { ModuleManagerPageComponent } from './manufacturer/module/module-manager-page/module-manager-page.component';
import { ActiveAlarmsPageComponent } from './alarm/active-alarms-page/active-alarms-page.component';
import { Fleet } from './models/fleet.model';
import { Manufacturer } from './models/manufacturer.model';
import { ManufacturerService } from './services/manufacturer.service';
import { FleetService } from './services/fleet.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FleetManagerPageComponent, AlarmManagerPageComponent, ActiveAlarmsPageComponent, InterfaceManagerPageComponent, ModuleManagerPageComponent, AdminDashboardComponent, LoginComponent, RegisterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'SoftArchVeichleManager';
  currentRole: 'fleet_operator' | 'admin' | 'manufacturer' = 'fleet_operator';
  activeScreen: 'fleet' | 'alarm' | 'activeAlarms' | 'interface' | 'module' = 'fleet';
  session: UserSession | null = null;
  authView: 'login' | 'register' = 'login';
  hasNoAccess:boolean = true
  private sub?: Subscription;

  constructor(private authService: AuthService, private manufacturerService: ManufacturerService, private fleetService: FleetService) { }
  manufacturers: Manufacturer[] = [];
  fleets: Fleet[] = [];
  ngOnInit(): void {
    this.sub = this.authService.session$.subscribe(session => {
      this.session = session;
      if (session) {
        this.currentRole = session.role;
        this.activeScreen = session.role === 'manufacturer' ? 'interface' : 'fleet';
        this.authView = 'login';
        this.hasNoAccess = !(session?.fleetId || session?.manufacturerId || session?.role == 'admin')
      }
      this.fleetService.getFleets().subscribe(
        data => 
          this.fleets = data
      )
      this.manufacturerService.getManufacturers().subscribe(
        data => 
          this.manufacturers = data
      )
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  setScreen(screen: 'fleet' | 'alarm' | 'activeAlarms' | 'interface' | 'module') {
    this.activeScreen = screen;
  }

  logout(): void {
    this.authService.logout();
  }

  switchToRegister(): void {
    this.authView = 'register';
  }

  switchToLogin(): void {
    this.authView = 'login';
  }

  getAssociationName()
  {
    var currentUser = this.authService.currentUser;
    if(currentUser?.role == "fleet_operator" && currentUser.fleetId){
      var fleet = this.fleets.filter(f => f.id == currentUser?.fleetId)[0]
      return fleet.name
    }

    if(currentUser?.role == "manufacturer" && currentUser.manufacturerId){
      var manufacturer = this.manufacturers.filter(f => f.id == currentUser?.manufacturerId)[0]
      return manufacturer.name
    }

    if(currentUser?.role == "admin"){
      return ""
    }
    return "No Association Status"
  }
}
