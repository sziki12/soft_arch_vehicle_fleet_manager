import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface TelemetryAlarmResponse {
  message: string;
  rawData: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class TelemetryService {
  private apiBase = 'https://localhost:7172/api/telemetry';
  private headers: HttpHeaders;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.headers = new HttpHeaders();
    this.headers = this.headers.set('Authorization', `Bearer ${authService.currentUser?.token}`);
  }

  getFleetAlarms(fleetId?: number): Observable<TelemetryAlarmResponse> {
    const resolvedFleetId = fleetId ?? this.authService.currentUser?.fleetId ?? 0;
    if (!resolvedFleetId) {
      return of({
        message: 'No fleet assigned to current user.',
        rawData: null
      });
    }

    const requestUrl = `${this.apiBase}/alarms/${resolvedFleetId}`;
    console.log('[TelemetryService] GET', requestUrl);

    return this.http.get<{ TELEMETRY_MESSAGE?: string; TELEMETRY_DATA?: string | null }>(
      requestUrl,
      { headers: this.headers }
    ).pipe(
      map(response => ({
        message: response?.TELEMETRY_MESSAGE ?? 'Telemetry alarms',
        rawData: response?.TELEMETRY_DATA ?? null
      })),
      catchError(err => {
        console.error('[TelemetryService] alarms load failed', err);
        return of({
          message: 'Failed to load telemetry alarms.',
          rawData: null
        });
      })
    );
  }
}
