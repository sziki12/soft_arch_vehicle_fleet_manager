import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { Alarm } from '../models/alarm.model';
import { DtoMappereService } from './dto-mapper.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AlarmService {

    private apiBase = 'https://localhost:7172/api/alarms';
    private interfaceApiBase = 'https://localhost:7172/api/interfaces';
    private headers: HttpHeaders;
    private interfaceCache: Record<number, Array<{ id: number; name: string; properties: string[] }>> = {};

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

    getAlarmInterfaces(userId?: number): Observable<string[]> {
        const cacheKey = userId ?? this.authService.currentUser?.userId ?? 0;
        const cached = this.interfaceCache[cacheKey];
        if (cached && cached.length) {
            return of(cached.map(i => i.name));
        }

        return this.http.get<any[]>(`${this.interfaceApiBase}/byuser?user_id=${cacheKey}`, { headers: this.headers }).pipe(
            map(data => this.dtoMapperService.transformArray(
                data,
                this.dtoMapperService.dtoToInterface
            )),
            map(interfaces => {
                this.interfaceCache[cacheKey] = interfaces.map(i => ({
                    id: i.id,
                    name: i.name,
                    properties: i.interfaceFields
                }));
                return interfaces.map(i => i.name);
            }),
            catchError(() => of([]))
        );
    }

    getInterfaceProperties(interfaceName: string, userId?: number): Observable<string[]> {
        const cacheKey = userId ?? this.authService.currentUser?.userId ?? 0;
        const cached = this.interfaceCache[cacheKey]?.find(i => i.name === interfaceName);
        if (cached) {
            return of(cached.properties);
        }
        return of([]);
    }

    getInterfaceNameById(id: number, userId?: number): string | null {
        const cacheKey = userId ?? this.authService.currentUser?.userId ?? 0;
        const cached = this.interfaceCache[cacheKey]?.find(i => i.id === id);
        return cached ? cached.name : null;
    }

    getInterfaceIdByName(name: string, userId?: number): number | null {
        const cacheKey = userId ?? this.authService.currentUser?.userId ?? 0;
        const cached = this.interfaceCache[cacheKey]?.find(i => i.name === name);
        return cached ? cached.id : null;
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
