import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { Module } from '../../../models/module.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-module-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './module-form.component.html',
  standalone: true,
  styleUrl: './module-form.component.css',
})
export class ModuleFormComponent implements OnChanges {
  @Input() module!: Module;
  @Output() save = new EventEmitter<Module>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnChanges(): void {
    this.form = this.fb.group({
      moduleId: [this.module.moduleId],
      moduleName: [this.module.moduleName, Validators.required],
      hardwareId: [this.module.hardwareId, [Validators.required, Validators.min(1)]],
      manufacturerId: [this.module.manufacturerId, Validators.required],
      interfaceId: [this.module.interfaceId, Validators.required],
      vehicleId: [this.module.vehicleId, Validators.required],
    });
  }

  submit() {
    if (this.form.valid) {
      this.save.emit(this.form.value);
    }
  }
}