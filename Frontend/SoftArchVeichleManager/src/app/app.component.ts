import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AlarmManagerPageComponent } from './alarm/alarm-manager-page/alarm-manager-page.component';
import { FleetManagerPageComponent } from './fleet/fleet-manager-page/fleet-manager-page.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FleetManagerPageComponent, AlarmManagerPageComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'SoftArchVeichleManager';
  activeScreen: 'fleet' | 'alarm' = 'fleet';

  setScreen(screen: 'fleet' | 'alarm') {
    this.activeScreen = screen;
  }
}
