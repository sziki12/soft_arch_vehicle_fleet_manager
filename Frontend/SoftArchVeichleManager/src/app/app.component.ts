import { Component } from '@angular/core';
import { FleetManagerPageComponent } from './fleet/fleet-manager-page/fleet-manager-page.component';

@Component({
  selector: 'app-root',
  imports: [FleetManagerPageComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'SoftArchVeichleManager';
}
