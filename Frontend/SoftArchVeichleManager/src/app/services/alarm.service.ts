import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { Alarm } from '../models/alarm.model';
import { DtoMappereService } from './dto-mapper.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AlarmService {

    private apiBase = 'https://localhost:7172/api/alarms';
    private headers: HttpHeaders;

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private dtoMapperService: DtoMappereService
    ) {
        this.headers = new HttpHeaders();
        this.headers = this.headers.set('Authorization', `Bearer ${authService.currentUser?.token}`);
    }

    private alarms: Alarm[] = [];

    getAlarms(): Observable<Alarm[]> {

        return this.http.get<any[]>(`${this.apiBase}/byuser?user_id=${this.authService.currentUser?.userId}`, { headers: this.headers }).pipe(
            map(data => this.dtoMapperService.transformArray(
                data,
                dto => {
                    const alarm = this.dtoMapperService.dtoToAlarm(dto);
                    return {
                        ...alarm,
                        alarmJson: this.normalizeAlarmJson(alarm.alarmJson)
                    };
                }
            )),
            tap(transformed => this.alarms = transformed)
        );

    }

    getAlarmInterfaces(): Observable<string[]> {
        return this.http.get<string[]>('', { params: {} }).pipe(
            catchError(() => of(['BatteryInterface', 'EngineInterface', 'MaintenanceInterface']))
        );
    }

    getInterfaceProperties(interfaceName: string): Observable<string[]> {
        return this.http.get<string[]>('', { params: { interfaceName } }).pipe(
            catchError(() => of(['type', 'level', 'detail']))
        );
    }

    saveAlarm(alarm: Alarm): Observable<Alarm> {
        const fleetId = this.authService.currentUser?.fleetId ?? alarm.fleetId;
        const interfaceId = alarm.interfaceId && alarm.interfaceId > 0 ? alarm.interfaceId : 1;
        const alarmForDto: Alarm = { ...alarm, fleetId, interfaceId };
        const dto = this.dtoMapperService.alarmToDto(alarmForDto);


        if (alarmForDto.id && alarmForDto.id > 0) {
            // UPDATE existing alarm
            return this.http.put<any>(`${this.apiBase}/${alarmForDto.id}`, dto, { headers: this.headers }).pipe(
                map(response => this.mapDtoToAlarmSafe(response, alarmForDto))
            );
        }

        // CREATE new alarm
        return this.http.post<any>(`${this.apiBase}`, dto, { headers: this.headers }).pipe(
            map(response => this.mapDtoToAlarmSafe(response, alarmForDto))
        );


    }

    deleteAlarm(id: number): Observable<boolean> {

        return this.http.delete<boolean>(`${this.apiBase}/${id}`, { headers: this.headers });



    }

    private normalizeAlarmJson(json: string): string {
        try {
            const parsed = JSON.parse(json);
            if (typeof parsed === 'object') {
                return JSON.stringify(parsed, null, 2);
            }
            return String(parsed);
        } catch {
            return json;
        }
    }

    private mapDtoToAlarmSafe(dto: any, fallback: Alarm): Alarm {
        if (dto && typeof dto === 'object' && 'ALARM_JSON' in dto) {
            const mapped = this.dtoMapperService.dtoToAlarm(dto);
            return {
                ...mapped,
                alarmJson: this.normalizeAlarmJson(mapped.alarmJson)
            };
        }

        // Fallback to the submitted alarm when API does not echo a payload
        return {
            ...fallback,
            alarmJson: this.normalizeAlarmJson(fallback.alarmJson)
        };
    }
}
