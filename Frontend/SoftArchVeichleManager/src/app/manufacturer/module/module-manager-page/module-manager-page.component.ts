import { Component, OnInit } from '@angular/core';
import { MainLayoutComponent } from "../../../layout/main-layout/main-layout.component";
import { CardComponent } from "../../../../shared/card/card.component";
import { ModuleFormComponent } from "../module-form/module-form.component";
import { Module } from '../../../models/module.model';
import { ModuleService } from '../../../services/module.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-module-manager-page',
  imports: [MainLayoutComponent, CardComponent, ModuleFormComponent, CommonModule],
  templateUrl: './module-manager-page.component.html',
  styleUrl: './module-manager-page.component.css',
  standalone: true,
})
export class ModuleManagerPageComponent implements OnInit {
  modules: Module[] = [];
  selectedModule: Module | null = null;
  loading = false;

  constructor(private moduleService: ModuleService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.moduleService.getModules().subscribe(data => {
      this.modules = data;
      this.loading = false;
    });
  }

  selectModule(m: Module) {

    this.selectedModule = { ...m };
  }

  createNew() {

    this.selectedModule = {
      moduleId: 0,
      hardwareId: '',
      moduleName: '',
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
    this.moduleService.saveModule(module).subscribe(() => {
      this.selectedModule = null;
      this.loadData();
    });
  }
}