import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Module } from '../../../models/module.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { Manifacturer } from '../../../models/manufacturer.model';
import { Vehicle } from '../../../models/vehicle.model';
import { Fleet } from '../../../models/fleet.model';
import { Interface } from '../../../models/interface.model';

@Component({
  selector: 'app-module-form',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './module-form.component.html',
  standalone: true,
  styleUrl: './module-form.component.css',
})
export class ModuleFormComponent implements OnChanges, OnInit {
  @Input() module!: Module;
  @Input() fleets!: Fleet[];
  @Input() vehicles!: Vehicle[];
  @Input() interfaces!: Interface[];
  @Output() save = new EventEmitter<Module>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  public selectedInterfaceId: number | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService) { 
    this.form = new FormGroup({selectedInterfaceId: new FormControl(null)
    });
  }
  ngOnInit(): void {
    this.selectedInterfaceId = this.module.interfaceId;
  }

  ngOnChanges(): void {
    this.form = this.fb.group({
      id: [this.module.id],
      hardwareId: [this.module.hardwareId, [Validators.required]],
      manufacturerId: [this.authService.currentUser?.manufacturerId],
      interfaceId: [this.selectedInterfaceId],
      vehicleId: [0],
    });
  }

  submit() {
    if (this.form.valid) {
      this.save.emit(this.form.value);
    }
  }
}