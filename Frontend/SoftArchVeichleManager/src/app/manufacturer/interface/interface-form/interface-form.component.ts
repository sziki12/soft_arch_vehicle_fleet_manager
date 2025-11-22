import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { Interface } from '../../../models/interface.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-interface-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './interface-form.component.html',
  styleUrl: './interface-form.component.css',
  standalone: true,
})
export class InterfaceFormComponent implements OnChanges {
  @Input() interface!: Interface;
  @Output() save = new EventEmitter<Interface>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnChanges(): void {
    this.form = this.fb.group({
      interfaceId: [this.interface.interfaceId],
      interfaceName: [this.interface.interfaceName, Validators.required],
      interfaceJson: [this.interface.interfaceJson, [Validators.required, Validators.min(1)]],
      manufacturerId: [this.interface.manufacturerId, Validators.required],
    });
  }

  submit() {
    if (this.form.valid) {
      this.save.emit(this.form.value);
    }
  }
}