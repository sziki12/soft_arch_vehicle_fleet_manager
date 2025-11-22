import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AlarmManagerPageComponent } from './alarm/alarm-manager-page/alarm-manager-page.component';
import { FleetManagerPageComponent } from './fleet/fleet-manager-page/fleet-manager-page.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FleetManagerPageComponent, AlarmManagerPageComponent, AdminDashboardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'SoftArchVeichleManager';
  currentRole: 'manager' | 'admin' = 'manager';
  activeScreen: 'fleet' | 'alarm' = 'fleet';

  setRole(role: 'manager' | 'admin') {
    this.currentRole = role;
    if (role === 'manager' && !this.activeScreen) {
      this.activeScreen = 'fleet';
    }
  }

  setScreen(screen: 'fleet' | 'alarm') {
    this.activeScreen = screen;
  }
}
