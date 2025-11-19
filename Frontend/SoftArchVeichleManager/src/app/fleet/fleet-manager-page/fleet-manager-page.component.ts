import { Component, OnInit } from '@angular/core';
import { Vehicle } from '../../models/vehicle.model';
import { VehicleService } from '../../services/vehicle.service';
import { CommonModule } from '@angular/common';
import { MainLayoutComponent } from '../../layout/main-layout/main-layout.component';
import { CardComponent } from '../../../shared/card/card.component';
import { VehicleFormComponent } from '../vehicle-form/vehicle-form.component';


@Component({
  selector: 'app-fleet-manager-page',
  standalone: true,
  imports: [
    CommonModule,
    MainLayoutComponent,
    CardComponent,
    VehicleFormComponent
  ],
  templateUrl: './fleet-manager-page.component.html',

  styleUrls: ['./fleet-manager-page.component.css']
})
export class FleetManagerPageComponent implements OnInit {
  vehicles: Vehicle[] = [];
  selectedVehicle: Vehicle | null = null;
  loading = false;

  constructor(private vehicleService: VehicleService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.vehicleService.getVehicles().subscribe(data => {
      this.vehicles = data;
      this.loading = false;
    });
  }

  selectVehicle(v: Vehicle) {

    this.selectedVehicle = { ...v };
  }

  createNew() {

    this.selectedVehicle = {
      vehicleId: 0,
      vehicleName: '',
      fleetId: 0,
      vehicleYear: new Date().getFullYear(),
      vehicleModel: ''
    };
  }

  onDelete(id: number, event: Event) {
    event.stopPropagation();
    if (confirm('Biztos törlöd?')) {

      this.vehicleService.deleteVehicle(id).subscribe(() => this.loadData());
    }
  }

  onSave(vehicle: Vehicle) {
    this.loading = true;
    this.vehicleService.saveVehicle(vehicle).subscribe(() => {
      this.selectedVehicle = null;
      this.loadData();
    });
  }

  onGenerateReport(id: number, event: Event) {
    event.stopPropagation();
    alert(`📊 Riport generálása elindítva a(z) #${id} járműhöz...`);
  }


}