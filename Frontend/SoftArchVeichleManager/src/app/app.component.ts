import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AlarmManagerPageComponent } from './alarm/alarm-manager-page/alarm-manager-page.component';
import { FleetManagerPageComponent } from './fleet/fleet-manager-page/fleet-manager-page.component';
import { InterfaceManagerPageComponent } from './manufacturer/interface/interface-manager-page/interface-manager-page.component';
import { ModuleManagerPageComponent } from './manufacturer/module/module-manager-page/module-manager-page.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FleetManagerPageComponent, AlarmManagerPageComponent, InterfaceManagerPageComponent, ModuleManagerPageComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'SoftArchVeichleManager';
  activeScreen: 'fleet' | 'alarm' | 'interface' | 'module' = 'fleet';

  setScreen(screen: 'fleet' | 'alarm' | 'interface' | 'module') {
    this.activeScreen = screen;
  }
}
