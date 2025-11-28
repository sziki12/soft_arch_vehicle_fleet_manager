import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { Vehicle } from '../../models/vehicle.model';
import { VehicleService } from '../../services/vehicle.service';
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
  reportLoadingId: number | null = null;
  reportPayloadEntries: Array<{ key: string; value: string }> = [];
  reportVehicleId: number | null = null;
  reportHeaderDate: Date | null = null;

  constructor(private vehicleService: VehicleService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.vehicleService.getVehicles().subscribe(data => {
      this.vehicles = data;
      this.loading = false;
    });
  }

  selectVehicle(v: Vehicle): void {
    this.selectedVehicle = { ...v };
  }

  createNew(): void {
    this.selectedVehicle = {
      id: 0,
      name: '',
      licansePlate: '',
      fleetId: 0,
      year: new Date().getFullYear(),
      model: ''
    };
  }

  onDelete(id: number, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this vehicle?')) {
      this.vehicleService.deleteVehicle(id).subscribe(() => this.loadData());
    }
  }

  onSave(vehicle: Vehicle): void {
    this.loading = true;
    this.vehicleService.saveVehicle(vehicle).subscribe(() => {
      this.selectedVehicle = null;
      this.loadData();
    });
  }

  onGenerateReport(id: number, event: Event): void {
    event.stopPropagation();
    this.reportLoadingId = id;

    this.vehicleService.generateVehicleReport(id)
      .pipe(finalize(() => this.reportLoadingId = null))
      .subscribe({
        next: report => {
          this.reportVehicleId = report.id;
          this.reportHeaderDate = new Date();
          this.reportPayloadEntries = this.getReportEntries(report.payload);
        },
        error: () => alert('Report generation failed. Please try again.')
      });
  }

  closeReport(): void {
    this.reportVehicleId = null;
    this.reportHeaderDate = null;
    this.reportPayloadEntries = [];
  }

  private getReportEntries(payload: unknown): Array<{ key: string; value: string }> {
    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
      return Object.entries(payload as Record<string, unknown>).map(([key, value]) => ({
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value)
      }));
    }

    return [{ key: 'data', value: String(payload) }];
  }
}
