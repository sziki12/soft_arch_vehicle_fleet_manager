import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Vehicle } from '../../models/vehicle.model';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vehicle-form.component.html',

  styleUrls: ['./vehicle-form.component.css']
})
export class VehicleFormComponent implements OnChanges {
  @Input() vehicle!: Vehicle;
  @Output() save = new EventEmitter<Vehicle>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnChanges(): void {
    this.form = this.fb.group({
      vehicleId: [this.vehicle.id],
      vehicleName: [this.vehicle.name, Validators.required],
      fleetId: [this.vehicle.fleetId, [Validators.required, Validators.min(1)]],
      vehicleYear: [this.vehicle.vehicleYear, [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear() + 1)]],
      vehicleModel: [this.vehicle.vehicleModel, Validators.required]
    });
  }

  submit() {
    if (this.form.valid) {
      this.save.emit(this.form.value);
    }
  }
}