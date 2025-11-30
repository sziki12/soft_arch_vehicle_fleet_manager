import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { Interface } from '../../../models/interface.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { ListEditorComponent } from '../../../../shared/list-editor/list-editor.component';
import { Manufacturer } from '../../../models/manufacturer.model';

@Component({
  selector: 'app-interface-form',
  imports: [CommonModule, ReactiveFormsModule, ListEditorComponent],
  templateUrl: './interface-form.component.html',
  styleUrl: './interface-form.component.css',
  standalone: true,
})
export class InterfaceFormComponent implements OnChanges {
  @Input() interface!: Interface;
  @Input() manufacturers!: Manufacturer[];
  @Input() showInterfaceSelect = false;
  @Output() save = new EventEmitter<Interface>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) { }

  ngOnChanges(): void {
    const defaultManufacturerId = this.showInterfaceSelect
      ? (this.interface.manufacturerId || this.manufacturers[0]?.id || null)
      : (this.authService.currentUser?.manufacturerId || this.interface.manufacturerId || null);
    this.form = this.fb.group({
      id: [this.interface.id],
      name: [this.interface.name, Validators.required],
      interfaceFields: [this.interface.interfaceFields, [Validators.required, Validators.min(1)]],
      manufacturerId: [defaultManufacturerId]
    });
  }

  submit() {
    if (this.form.valid) {
      this.save.emit(this.form.value);
    }
  }

  saveList(list: string[]) {
    this.form.patchValue({ interfaceFields: list });
  }
}