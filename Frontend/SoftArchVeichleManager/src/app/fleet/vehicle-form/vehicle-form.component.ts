import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Vehicle } from '../../models/vehicle.model';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Fleet } from '../../models/fleet.model';


@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vehicle-form.component.html',

  styleUrls: ['./vehicle-form.component.css']
})
export class VehicleFormComponent implements OnChanges {
  @Input() vehicle!: Vehicle;
  @Input() fleets: Fleet[] = [];
  @Input() showFleetSelect = false;
  @Output() save = new EventEmitter<Vehicle>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) { }

  ngOnChanges(): void {
    const defaultFleetId = this.showFleetSelect
      ? (this.vehicle.fleetId || this.fleets[0]?.id || null)
      : (this.authService.currentUser?.fleetId || this.vehicle.fleetId || null);

    this.form = this.fb.group({
      id: [this.vehicle.id],
      name: [this.vehicle.name, Validators.required],
      licensePlate: [this.vehicle.licensePlate, Validators.required],
      fleetId: [defaultFleetId, [Validators.required, Validators.min(1)]],
      year: [this.vehicle.year, [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear() + 1)]],
      model: [this.vehicle.model, Validators.required]
    });
  }

  submit() {
    if (this.form.valid) {
      this.save.emit(this.form.value);
    }
  }
}
