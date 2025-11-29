import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Alarm } from '../../models/alarm.model';
import { AlarmService } from '../../services/alarm.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-alarm-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './alarm-form.component.html',
  styleUrls: ['./alarm-form.component.css']
})
export class AlarmFormComponent implements OnInit, OnChanges {
  @Input() alarm!: Alarm;
  @Output() save = new EventEmitter<Alarm>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  interfaces: string[] = [];
  interfaceProperties: string[] = [];
  propertyValues: Record<string, string> = {};
  selectedInterface = '';

  constructor(
    private fb: FormBuilder,
    private alarmService: AlarmService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadInterfaces();
  }

  ngOnChanges(): void {
    const defaultFleetId = this.authService.currentUser?.fleetId ?? this.alarm.fleetId;

    this.form = this.fb.group({
      alarmId: [this.alarm.id],
      alarmFleet: [defaultFleetId, [Validators.required, Validators.min(1)]],
      interfaceName: [this.selectedInterface],
      alarmJson: [this.alarm.alarmJson || '{}', [Validators.required, Validators.minLength(2)]]
    });

    this.initializePropertiesFromJson(this.alarm.alarmJson);
    this.syncAlarmJson();
  }

  private loadInterfaces(): void {
    this.alarmService.getAlarmInterfaces().subscribe(list => {
      this.interfaces = list;
    });
  }

  onInterfaceSelect(name: string): void {
    this.selectedInterface = name;
    this.form.patchValue({ interfaceName: name });

    if (!name) {
      return;
    }

    this.alarmService.getInterfaceProperties(name).subscribe(props => {
      this.interfaceProperties = props;
      this.bootstrapPropertyValues(props);
      this.syncAlarmJson();
    });
  }

  private initializePropertiesFromJson(json: string): void {
    try {
      const parsed = JSON.parse(json);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        this.interfaceProperties = Object.keys(parsed);
        this.propertyValues = Object.entries(parsed).reduce((acc, [key, value]) => {
          acc[key] = this.stringifyValue(value);
          return acc;
        }, {} as Record<string, string>);
        return;
      }
    } catch {
      // ignore and fall back to empty state
    }

    this.interfaceProperties = [];
    this.propertyValues = {};
  }

  private bootstrapPropertyValues(props: string[]): void {
    const nextValues: Record<string, string> = {};
    props.forEach(prop => {
      nextValues[prop] = this.propertyValues[prop] ?? '';
    });
    this.propertyValues = nextValues;
  }

  private stringifyValue(value: unknown): string {
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }

  onPropertyValueChange(key: string, value: string): void {
    this.propertyValues = { ...this.propertyValues, [key]: value };
    this.syncAlarmJson();
  }

  onPropertyInput(key: string, event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const value = target?.value ?? '';
    this.onPropertyValueChange(key, value);
  }

  private syncAlarmJson(): void {
    const payload: Record<string, unknown> = {};
    const keys = this.interfaceProperties.length ? this.interfaceProperties : Object.keys(this.propertyValues);

    keys.forEach(key => {
      payload[key] = this.coerceValue(this.propertyValues[key]);
    });

    this.form.patchValue({
      alarmJson: JSON.stringify(payload, null, 2)
    }, { emitEvent: false });
  }

  private coerceValue(value: string): unknown {
    const trimmed = (value || '').trim();
    if (trimmed === '') {
      return '';
    }
    if (trimmed === 'true') {
      return true;
    }
    if (trimmed === 'false') {
      return false;
    }
    if (trimmed === 'null') {
      return null;
    }
    if (!isNaN(Number(trimmed))) {
      return Number(trimmed);
    }
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        return JSON.parse(trimmed);
      } catch {
        return value;
      }
    }
    return value;
  }

  submit() {
    if (this.form.valid) {
      const alarmJson = this.form.value.alarmJson;
      const fleetId = this.form.value.alarmFleet;
      const interfaceId = 1; // placeholder until real interface IDs are provided
      const id = this.form.value.alarmId ?? 0;
      this.save.emit({ id, fleetId, interfaceId, alarmJson });
    }
  }
}
