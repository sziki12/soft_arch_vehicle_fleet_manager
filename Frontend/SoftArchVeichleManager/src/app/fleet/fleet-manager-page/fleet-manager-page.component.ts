import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { Vehicle } from '../../models/vehicle.model';
import { VehicleService } from '../../services/vehicle.service';
import { MainLayoutComponent } from '../../layout/main-layout/main-layout.component';
import { CardComponent } from '../../../shared/card/card.component';
import { VehicleFormComponent } from '../vehicle-form/vehicle-form.component';
import { Fleet } from '../../models/fleet.model';
import { FleetService } from '../../services/fleet.service';

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
  fleets: Fleet[] = [];
  selectedVehicle: Vehicle | null = null;
  loading = false;
  reportLoadingId: number | null = null;
  reportPayloadEntries: Array<{ key: string; value: string }> = [];
  reportVehicleId: number | null = null;
  reportVehicleName: string | null = null;
  reportHeaderDate: Date | null = null;
  reportMessage = '';

  constructor(private vehicleService: VehicleService, private fleetService: FleetService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.vehicleService.getVehicles().subscribe(data => {
      this.vehicles = data;
      this.fleetService.getFleets().subscribe(data => {
        this.fleets = data;
        this.loading = false;
      });
    });
  }

  selectVehicle(v: Vehicle): void {
    this.selectedVehicle = { ...v };
  }

  createNew(): void {
    this.selectedVehicle = {
      id: 0,
      name: '',
      licensePlate: '',
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
          this.reportVehicleId = report.vehicleId;
          this.reportVehicleName = this.getVehicleNameById(report.vehicleId);
          this.reportHeaderDate = new Date();
          this.reportMessage = report.message;

          const entries = this.getReportEntries(report.data);
          this.reportPayloadEntries = entries.length
            ? entries
            : [{ key: 'info', value: 'No telemetry data returned.' }];
        },
        error: () => alert('Report generation failed. Please try again.')
      });
  }

  closeReport(): void {
    this.reportVehicleId = null;
    this.reportVehicleName = null;
    this.reportHeaderDate = null;
    this.reportPayloadEntries = [];
    this.reportMessage = '';
  }

  private getReportEntries(payload: string | null | undefined): Array<{ key: string; value: string }> {
    if (!payload) return [];

    const trimmed = payload.trim();
    if (!trimmed) return [];

    const parsedObject = this.tryParseJson(trimmed);
    if (parsedObject && typeof parsedObject === 'object' && !Array.isArray(parsedObject)) {
      return this.normalizeObjectEntries(parsedObject as Record<string, unknown>);
    }

    // Support multiple JSON objects separated by commas without an array wrapper.
    const segments = trimmed.split(/(?<=})\s*,\s*(?={)/).map(s => s.trim()).filter(Boolean);
    if (segments.length > 1) {
      return segments.map((segment, idx) => {
        const parsedSegment = this.tryParseJson(segment);
        return {
          key: `segment_${idx + 1}`,
          value: this.stringifyTelemetry(parsedSegment ?? segment)
        };
      });
    }

    return [{ key: 'data', value: trimmed }];
  }

  private normalizeObjectEntries(obj: Record<string, unknown>): Array<{ key: string; value: string }> {
    return Object.entries(obj).map(([key, value], idx) => ({
      key: key || `entry_${idx + 1}`,
      value: this.stringifyTelemetry(value)
    }));
  }

  private stringifyTelemetry(value: unknown): string {
    if (typeof value === 'string') {
      const parsed = this.tryParseJson(value);
      if (parsed !== null && parsed !== undefined) {
        return this.stringifyTelemetry(parsed);
      }
      return value;
    }
    if (Array.isArray(value)) {
      return value.map(v => this.stringifyTelemetry(v)).join(', ');
    }
    if (value && typeof value === 'object') {
      return this.formatObject(value as Record<string, unknown>);
    }
    if (value === null || value === undefined) return '';
    return String(value);
  }

  private formatObject(obj: Record<string, unknown>): string {
    const entries = Object.entries(obj);
    if (!entries.length) return '{}';
    return entries
      .map(([k, v]) => `${k}: ${this.stringifyTelemetry(v)}`)
      .join('\n');
  }

  private tryParseJson(value: string): unknown | null {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  getFleetNameByVehicle(vehicle: Vehicle): string {
    const fleet = this.fleets.find(f => f.id === vehicle.fleetId);
    return fleet ? fleet.name : 'Unknown Fleet';
  }

  private getVehicleNameById(id: number | null): string | null {
    if (!id) return null;
    const vehicle = this.vehicles.find(v => v.id === id);
    return vehicle ? vehicle.name : null;
  }
}
