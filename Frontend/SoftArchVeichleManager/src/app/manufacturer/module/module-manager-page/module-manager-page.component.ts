import { Component, OnInit } from '@angular/core';
import { MainLayoutComponent } from "../../../layout/main-layout/main-layout.component";
import { CardComponent } from "../../../../shared/card/card.component";
import { ModuleFormComponent } from "../module-form/module-form.component";
import { Module } from '../../../models/module.model';
import { ModuleService } from '../../../services/module.service';
import { CommonModule } from '@angular/common';
import { Interface } from '../../../models/interface.model';
import { InterfaceService } from '../../../services/interface.serice';
import { Vehicle } from '../../../models/vehicle.model';
import { Fleet } from '../../../models/fleet.model';
import { VehicleService } from '../../../services/vehicle.service';
import { FleetService } from '../../../services/fleet.service';

@Component({
  selector: 'app-module-manager-page',
  imports: [MainLayoutComponent, CardComponent, ModuleFormComponent, CommonModule],
  templateUrl: './module-manager-page.component.html',
  styleUrl: './module-manager-page.component.css',
  standalone: true,
})
export class ModuleManagerPageComponent implements OnInit {
  modules: Module[] = [];
  interfaces: Interface[] = [];
  fleets: Fleet[] = [];
  vehicles: Vehicle[] = [];
  selectedModule: Module | null = null;
  loading = false;

  constructor(private moduleService: ModuleService, private interfaceService: InterfaceService, 
    private fleetService: FleetService, private vehicleService: VehicleService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.moduleService.getModules().subscribe(data => {
      this.modules = data;
      this.loading = false;
    });
    this.interfaceService.getInterfaces().subscribe(data => {
      this.interfaces = data;
    });
    this.vehicleService.getVehicles().subscribe(data => {
      this.vehicles = data;
    });
    this.fleetService.getFleets().subscribe(data => {
      this.fleets = data;
    });
  }

  selectModule(m: Module) {

    this.selectedModule = { ...m };
  }

  createNew() {

    this.selectedModule = {
      id: 0,
      hardwareId: '',
      manufacturerId: 0,
      interfaceId: 0,
      vehicleId: 0
    };
  }

  onDelete(id: number, event: Event) {
    event.stopPropagation();
    if (confirm('Biztos törlöd?')) {

      this.moduleService.deleteModule(id).subscribe(() => this.loadData());
    }
  }

  onSave(module: Module) {
    this.loading = true;
    this.moduleService.saveModule(module).subscribe({
      next: () => {
        this.selectedModule = null;
        this.loadData();
      },
      error: () => {
        alert('Save failed. Please ensure the vehicle ID exists.');
        this.loading = false;
      }
    });
  }

  findInterfaceName(interfaceId: number): string {
    const i = this.interfaces.find(i => i.id === interfaceId);
    return i ? i.name : 'N/A';
  }
}
