import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Alarm } from '../../models/alarm.model';

@Component({
  selector: 'app-alarm-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './alarm-form.component.html',
  styleUrls: ['./alarm-form.component.css']
})
export class AlarmFormComponent implements OnChanges {
  @Input() alarm!: Alarm;
  @Output() save = new EventEmitter<Alarm>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnChanges(): void {
    this.form = this.fb.group({
      alarmId: [this.alarm.alarmId],
      alarmFleet: [this.alarm.alarmFleet, [Validators.required, Validators.min(1)]],
      alarmJson: [this.alarm.alarmJson, [Validators.required, Validators.minLength(5)]]
    });
  }

  submit() {
    if (this.form.valid) {
      this.save.emit(this.form.value);
    }
  }
}
