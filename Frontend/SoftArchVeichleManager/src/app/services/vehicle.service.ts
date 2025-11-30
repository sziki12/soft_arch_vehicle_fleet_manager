import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Vehicle } from '../models/vehicle.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { DtoMappereService } from './dto-mapper.service';

@Injectable({ providedIn: 'root' })
export class VehicleService {

    private apiBase = 'https://localhost:7172/api/vehicles';
    private headers: HttpHeaders;

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private dtoMapperService: DtoMappereService
    ) {
        this.headers = new HttpHeaders();
        this.headers = this.headers.set('Authorization', `Bearer ${authService.currentUser?.token}`);
    }

    private vehicles: Vehicle[] = [];

    getVehicles(): Observable<Vehicle[]> {
        // Always hit API filtered by user id to avoid leaking vehicles to unassigned fleet operators.
        const userId = this.authService.currentUser?.userId;
        const requestUrl = `${this.apiBase}/byuser`;
        console.log('[VehicleService] GET', requestUrl, 'userId', userId);
        return this.http.get<any[]>(requestUrl, {
            headers: this.headers,
            // Backend expects snake_case `user_id`
            params: { user_id: userId?.toString() ?? '' }
        }).pipe(
            map(data => this.dtoMapperService.transformArray(
                data,
                this.dtoMapperService.dtoToVehicle
            )),
            tap(transformed => {
                console.log('[VehicleService] vehicles loaded', transformed?.length ?? 0);
                this.vehicles = transformed;
            }),
            catchError(err => {
                console.error('[VehicleService] load failed', err);
                throw err;
            })
        );
    }

    saveVehicle(vehicle: Vehicle): Observable<Vehicle> {
        const dto = this.dtoMapperService.vehicleToDto(vehicle);
        console.log('Saving vehicle DTO:', dto);
        if (vehicle.id && vehicle.id > 0) {
            // UPDATE
            return this.http.put<Vehicle>(`${this.apiBase}/${vehicle.id}`, dto, { headers: this.headers });
        }
        // CREATE
        return this.http.post<Vehicle>(`${this.apiBase}`, dto, { headers: this.headers });
    }

    deleteVehicle(id: number): Observable<boolean> {
        return this.http.delete<boolean>(`${this.apiBase}/${id}`, { headers: this.headers });
    }

    generateVehicleReport(id: number): Observable<{ id: number; generatedAt: string; payload: unknown }> {
        // TODO: Implement API-backed reports. Currently left as-is.
        return this.http.get<{ id: number; generatedAt: string; payload: unknown }>(`${this.apiBase}/${id}/report`, { headers: this.headers });
    }
}
