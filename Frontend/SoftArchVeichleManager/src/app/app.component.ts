import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlarmManagerPageComponent } from './alarm/alarm-manager-page/alarm-manager-page.component';
import { FleetManagerPageComponent } from './fleet/fleet-manager-page/fleet-manager-page.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { LoginComponent } from './auth/login.component';
import { AuthService } from './services/auth.service';
import { UserSession } from './models/auth-user.model';
import { HttpClientModule } from '@angular/common/http';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [CommonModule, HttpClientModule, FleetManagerPageComponent, AlarmManagerPageComponent, AdminDashboardComponent, LoginComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'SoftArchVeichleManager';
  currentRole: 'manager' | 'admin' = 'manager';
  activeScreen: 'fleet' | 'alarm' = 'fleet';
  session: UserSession | null = null;
  private sub?: Subscription;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.sub = this.authService.session$.subscribe(session => {
      this.session = session;
      if (session) {
        this.currentRole = session.role;
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  setScreen(screen: 'fleet' | 'alarm') {
    this.activeScreen = screen;
  }

  logout(): void {
    this.authService.logout();
  }
}
