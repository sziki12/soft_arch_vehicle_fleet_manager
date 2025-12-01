import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
  private readonly defaultOperator: ComparisonOperator = 'EQ';
  @Input() alarm!: Alarm;
  @Input() overrideFleetId: number | null = null;
  @Input() interfaceUserId: number | null = null;
  @Output() save = new EventEmitter<Alarm>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  interfaces: string[] = [];
  interfaceProperties: string[] = [];
  propertyValues: Record<string, PropertyState> = {};
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
    this.selectedInterface = this.alarmService.getInterfaceNameById(this.alarm.interfaceId, this.interfaceUserId ?? undefined) ?? this.selectedInterface;
    const defaultFleetId = (this.alarm.fleetId && this.alarm.fleetId > 0)
      ? this.alarm.fleetId
      : this.overrideFleetId ?? this.authService.currentUser?.fleetId ?? this.alarm.fleetId;

    this.form = this.fb.group({
      alarmId: [this.alarm.id],
      alarmFleet: [defaultFleetId],
      interfaceName: [this.selectedInterface],
      alarmJson: [this.alarm.alarmJson || '{}']
    });

    this.initializePropertiesFromJson(this.alarm.alarmJson);
    this.syncAlarmJson();
  }

  private loadInterfaces(): void {
    this.alarmService.getAlarmInterfaces(this.interfaceUserId ?? undefined).subscribe(list => {
      this.interfaces = list;
      const nameFromId = this.alarmService.getInterfaceNameById(this.alarm.interfaceId, this.interfaceUserId ?? undefined);
      if (nameFromId) {
        this.selectedInterface = nameFromId;
        this.form?.patchValue({ interfaceName: nameFromId });
        this.onInterfaceSelect(nameFromId);
      }
    });
  }

  onInterfaceSelect(name: string): void {
    this.selectedInterface = name;
    this.form.patchValue({ interfaceName: name });

    if (!name) {
      return;
    }

    this.alarmService.getInterfaceProperties(name, this.interfaceUserId ?? undefined).subscribe(props => {
      this.interfaceProperties = props;
      console.log('Loaded interface properties for', name, ':', props);
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
          acc[key] = this.normalizePropertyState(value);
          return acc;
        }, {} as Record<string, PropertyState>);
        return;
      }
    } catch {
      // ignore and fall back to empty state
    }

    this.interfaceProperties = [];
    this.propertyValues = {};
  }

  private bootstrapPropertyValues(props: string[]): void {
    const nextValues: Record<string, PropertyState> = {};
    props.forEach(prop => {
      nextValues[prop] = this.propertyValues[prop] ?? { value: '', operator: this.defaultOperator };
    });
    this.propertyValues = nextValues;
  }

  private stringifyValue(value: unknown): string {
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return value === undefined ? '' : String(value);
  }

  private normalizePropertyState(raw: unknown): PropertyState {
    if (raw && typeof raw === 'object' && 'operator' in (raw as any)) {
      const { operator, value } = raw as any;
      return {
        operator: this.parseOperator(operator),
        value: this.stringifyValue(value)
      };
    }
    return {
      operator: this.defaultOperator,
      value: this.stringifyValue(raw)
    };
  }

  onPropertyValueChange(key: string, value: string): void {
    const existing = this.propertyValues[key] ?? { value: '', operator: this.defaultOperator };
    this.propertyValues = { ...this.propertyValues, [key]: { ...existing, value } };
    this.syncAlarmJson();
  }

  onOperatorChange(key: string, operator: string): void {
    const existing = this.propertyValues[key] ?? { value: '', operator: this.defaultOperator };
    this.propertyValues = { ...this.propertyValues, [key]: { ...existing, operator: this.parseOperator(operator) } };
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
      const current = this.propertyValues[key] ?? { value: '', operator: this.defaultOperator };
      const operator = current.operator ?? this.defaultOperator;
      payload[key] = {
        operator,
        value: this.coerceValue(current.value)
      };
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
      const resolvedInterfaceId = this.alarmService.getInterfaceIdByName(this.form.value.interfaceName, this.interfaceUserId ?? undefined) ?? this.alarm.interfaceId ?? 0;
      const interfaceId = resolvedInterfaceId;
      const id = this.form.value.alarmId ?? 0;
      console.log('Submitting alarm payload', { id, fleetId, interfaceId, alarmJson });
      this.save.emit({ id, fleetId, interfaceId, alarmJson });
    }
  }
  private parseOperator(raw: string): ComparisonOperator {
    const upper = (raw || '').toUpperCase();
    if (upper === 'GT' || upper === 'LT' || upper === 'EQ') {
      return upper;
    }
    return this.defaultOperator;
  }
}

type ComparisonOperator = 'GT' | 'LT' | 'EQ';

type PropertyState = {
  value: string;
  operator: ComparisonOperator;
};
