import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Module } from '../../../models/module.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { Vehicle } from '../../../models/vehicle.model';
import { Fleet } from '../../../models/fleet.model';
import { Interface } from '../../../models/interface.model';
import { Manufacturer } from '../../../models/manufacturer.model';

@Component({
  selector: 'app-module-form',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './module-form.component.html',
  standalone: true,
  styleUrl: './module-form.component.css',
})
export class ModuleFormComponent implements OnChanges, OnInit {
  @Input() module!: Module;
  @Input() showModuleSelect = false;
  @Input() manufacturers!: Manufacturer[];
  @Input() fleets!: Fleet[];
  @Input() vehicles!: Vehicle[];
  @Input() interfaces!: Interface[];
  @Output() save = new EventEmitter<Module>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  selectedInterfaceId: number | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService) { 
    this.form = new FormGroup({selectedInterfaceId: new FormControl(null)
    });
  }
  ngOnInit(): void {
    this.selectedInterfaceId = this.module.interfaceId;
  }

  ngOnChanges(): void {
    const defaultManufacturerId = this.showModuleSelect
      ? (this.module.manufacturerId || this.manufacturers[0]?.id || null)
      : (this.authService.currentUser?.manufacturerId || this.module.manufacturerId || null);
    this.selectedInterfaceId = this.module.interfaceId;

    this.form = this.fb.group({
      id: [this.module.id],
      hardwareId: [this.module.hardwareId, [Validators.required]],
      manufacturerId: [defaultManufacturerId, [Validators.required, Validators.min(1)]],
      interfaceId: [this.selectedInterfaceId, [Validators.required, Validators.min(1)]],
      vehicleId: [this.module.vehicleId ?? 0, [Validators.required, Validators.min(1)]],
    });
  }

  submit() {
    if (this.form.valid) {
      const vehicleId = this.form.value.vehicleId;
      const interfaceId = this.form.value.interfaceId;
      const manufacturerId = this.form.value.manufacturerId;

      const exists = this.vehicles?.some(v => v.id === vehicleId);
      if (!exists) {
        alert('The provided vehicle ID does not exist.');
        return;
      }
      if (!interfaceId || interfaceId < 1) {
        alert('Please select an interface.');
        return;
      }
      if (!manufacturerId || manufacturerId < 1) {
        alert('Manufacturer is missing or invalid.');
        return;
      }

      this.save.emit(this.form.value);
    }
  }
}
