import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MainLayoutComponent } from '../../layout/main-layout/main-layout.component';
import { CardComponent } from '../../../shared/card/card.component';
import { AlarmFormComponent } from '../alarm-form/alarm-form.component';
import { Alarm } from '../../models/alarm.model';
import { AlarmService } from '../../services/alarm.service';

@Component({
  selector: 'app-alarm-manager-page',
  standalone: true,
  imports: [
    CommonModule,
    MainLayoutComponent,
    CardComponent,
    AlarmFormComponent
  ],
  templateUrl: './alarm-manager-page.component.html',
  styleUrls: ['./alarm-manager-page.component.css']
})
export class AlarmManagerPageComponent implements OnInit {
  alarms: Alarm[] = [];
  selectedAlarm: Alarm | null = null;
  loading = false;

  constructor(private alarmService: AlarmService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.alarmService.getAlarms().subscribe(data => {
      this.alarms = data;
      this.loading = false;
    });
  }

  selectAlarm(alarm: Alarm): void {
    this.selectedAlarm = { ...alarm };
  }

  createNew(): void {
    this.selectedAlarm = {
      alarmId: 0,
      alarmFleet: 0,
      alarmJson: '{}'
    };
  }

  onSave(alarm: Alarm): void {
    this.loading = true;
    this.alarmService.saveAlarm(alarm).subscribe(() => {
      this.selectedAlarm = null;
      this.loadData();
    });
  }

  onDelete(id: number, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this alarm?')) {
      this.alarmService.deleteAlarm(id).subscribe(() => this.loadData());
    }
  }

  getAlarmEntries(alarm: Alarm): Array<{ key: string; value: string }> {
    try {
      const parsed = JSON.parse(alarm.alarmJson);
      if (parsed && typeof parsed === 'object') {
        return Object.entries(parsed).map(([key, value]) => ({
          key,
          value: typeof value === 'object' ? JSON.stringify(value) : String(value)
        }));
      }
    } catch {

    }
    return [{ key: 'payload', value: alarm.alarmJson }];
  }
}
