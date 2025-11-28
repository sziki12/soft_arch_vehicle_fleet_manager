import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { Alarm } from '../models/alarm.model';

@Injectable({ providedIn: 'root' })
export class AlarmService {

    constructor(private http: HttpClient) { }

    private mockData: Alarm[] = [
        {
            id: 1,
            fleetId: 101,
            interfaceId: 1,
            alarmJson: JSON.stringify({ type: 'Battery', level: 'Critical', lastUpdate: '2024-05-01T10:00:00Z' })
        },
        {
            id: 2,
            fleetId: 102,
            interfaceId: 2,
            alarmJson: JSON.stringify({ type: 'Engine', level: 'Warning', temperature: 95 })
        },
        {
            id: 3,
            fleetId: 101,
            interfaceId: 3,
            alarmJson: JSON.stringify({ type: 'Maintenance', dueInKm: 1500 })
        }
    ];

    getAlarms(): Observable<Alarm[]> {
        return new Observable(observer => {
            setTimeout(() => {
                observer.next([...this.mockData]);
                observer.complete();
            }, 400);
        });
    }

    getAlarmInterfaces(): Observable<string[]> {
        // TODO: replace empty URL with real endpoint when available
        return this.http.get<string[]>('', { params: {} }).pipe(
            catchError(() => of(['BatteryInterface', 'EngineInterface', 'MaintenanceInterface']))
        );
    }

    getInterfaceProperties(interfaceName: string): Observable<string[]> {
        // TODO: replace empty URL with real endpoint when available
        return this.http.get<string[]>('', { params: { interfaceName } }).pipe(
            catchError(() => of(['type', 'level', 'detail']))
        );
    }

    saveAlarm(alarm: Alarm): Observable<Alarm> {
        return new Observable(observer => {
            setTimeout(() => {
                if (alarm.id && alarm.id > 0) {
                    const index = this.mockData.findIndex(a => a.id === alarm.id);
                    if (index > -1) {
                        this.mockData[index] = alarm;
                    }
                } else {
                    const maxId = this.mockData.length > 0 ? Math.max(...this.mockData.map(a => a.id)) : 0;
                    alarm.id = maxId + 1;
                    this.mockData.push(alarm);
                }

                observer.next(alarm);
                observer.complete();
            }, 400);
        });
    }

    deleteAlarm(id: number): Observable<boolean> {
        return new Observable(observer => {
            setTimeout(() => {
                const index = this.mockData.findIndex(a => a.id === id);
                if (index > -1) {
                    this.mockData.splice(index, 1);
                    observer.next(true);
                } else {
                    observer.next(false);
                }

                observer.complete();
            }, 400);
        });
    }
}
