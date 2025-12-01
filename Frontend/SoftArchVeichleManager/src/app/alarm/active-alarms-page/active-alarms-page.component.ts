import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, of, timer } from 'rxjs';
import { switchMap, takeUntil, tap, finalize } from 'rxjs/operators';
import { MainLayoutComponent } from '../../layout/main-layout/main-layout.component';
import { CardComponent } from '../../../shared/card/card.component';
import { TelemetryService } from '../../services/telemetry.service';
import { AuthService } from '../../services/auth.service';

interface ActiveAlarm {
  id: string;
  module: string;
  details: string;
}

@Component({
  selector: 'app-active-alarms-page',
  standalone: true,
  imports: [
    CommonModule,
    MainLayoutComponent,
    CardComponent
  ],
  templateUrl: './active-alarms-page.component.html',
  styleUrls: ['./active-alarms-page.component.css']
})
export class ActiveAlarmsPageComponent implements OnInit, OnDestroy {
  alarms: ActiveAlarm[] = [];
  lastUpdated: Date | null = null;
  message = '';
  loading = false;
  pollIntervalMs = 10000;
  fleetId = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private telemetryService: TelemetryService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.fleetId = this.authService.currentUser?.fleetId ?? 0;

    timer(0, this.pollIntervalMs)
      .pipe(
        takeUntil(this.destroy$),
        tap(() => this.loading = true),
        switchMap(() => {
          if (!this.fleetId) {
            this.alarms = [];
            this.message = 'No fleet is assigned to your account.';
            this.lastUpdated = new Date();
            this.loading = false;
            return of(null);
          }
          return this.telemetryService.getFleetAlarms(this.fleetId).pipe(
            finalize(() => this.loading = false)
          );
        })
      )
      .subscribe(response => {
        if (!response) {
          return;
        }
        this.message = response.message;
        this.alarms = this.parseAlarms(response.rawData);
        this.lastUpdated = new Date();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private parseAlarms(raw: string | null): ActiveAlarm[] {
    if (!raw) return [];

    const parsedRoot = this.deepParseJson(raw);
    if (parsedRoot && typeof parsedRoot === 'object' && !Array.isArray(parsedRoot)) {
      return Object.entries(parsedRoot).map(([key, value], idx) => {
        const resolvedValue = typeof value === 'string' ? this.deepParseJson(value) ?? value : value;
        return this.mapAlarmEntry(key || `alarm_${idx + 1}`, resolvedValue);
      });
    }

    return [{ id: 'payload', module: '', details: this.stringifyTelemetry(parsedRoot ?? raw) }];
  }

  private mapAlarmEntry(id: string, payload: unknown): ActiveAlarm {
    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
      const moduleId = (payload as any).modul ?? (payload as any).module ?? '';
      const data = (payload as any).data ?? payload;
      return {
        id,
        module: moduleId ? String(moduleId) : '',
        details: this.stringifyTelemetry(data)
      };
    }
    return {
      id,
      module: '',
      details: this.stringifyTelemetry(payload)
    };
  }

  private deepParseJson(value: string): any {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'string') {
        return this.deepParseJson(parsed);
      }
      return parsed;
    } catch {
      return null;
    }
  }

  private stringifyTelemetry(value: unknown): string {
    if (typeof value === 'string') {
      const parsed = this.deepParseJson(value);
      if (parsed !== null && parsed !== undefined) {
        return this.stringifyTelemetry(parsed);
      }
      return value;
    }
    if (Array.isArray(value)) {
      return value.map(v => this.stringifyTelemetry(v)).join(', ');
    }
    if (value && typeof value === 'object') {
      return this.formatObject(value as Record<string, unknown>);
    }
    if (value === null || value === undefined) return '';
    return String(value);
  }

  private formatObject(obj: Record<string, unknown>): string {
    const entries = Object.entries(obj);
    if (!entries.length) return '{}';
    return entries.map(([k, v]) => `${k}: ${this.stringifyTelemetry(v)}`).join('\n');
  }
}
