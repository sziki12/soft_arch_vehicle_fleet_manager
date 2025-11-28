import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { Vehicle } from '../models/vehicle.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { DtoMappereService } from './dto-mapper.service';


@Injectable({ providedIn: 'root' })
export class VehicleService {

    private apiBase = 'https://localhost:7172/api/vehicles';
    private headers: HttpHeaders;
    constructor(private http: HttpClient, private authService: AuthService, private dtoMapperService: DtoMappereService) { 
        this.headers = new HttpHeaders();
            this.headers = this.headers.set('Authorization', `Bearer ${authService.currentUser?.token}`);
    }

    private mockData: Vehicle[] = [
        { id: 1, name: 'Főnöki Autó', fleetId: 101, year: 2022, model: 'Audi A6', licensePlate: 'ABC-123' },
        { id: 2, name: 'Szerviz Furgon', fleetId: 101, year: 2018, model: 'Ford Transit', licensePlate: 'CDF-456' },
        { id: 3, name: 'Tartalék Kocsi', fleetId: 102, year: 2015, model: 'Opel Astra', licensePlate: 'GHI-789' },
    ];

    private vehicles: Vehicle[] = [];

    getVehicles(): Observable<Vehicle[]> {
        //API
        if (this.apiBase) {
            return this.http.get<any[]>(`${this.apiBase}/byuser?user_id=${this.authService.currentUser?.userId}`, { headers: this.headers }).pipe(
                        map(data => this.dtoMapperService.transformArray(
                            data,
                            this.dtoMapperService.dtoToVehicle
                        )),
                        tap(transformed => this.vehicles = transformed)
                        );
        }
        //Mock
        return of([...this.mockData]).pipe(delay(400));
    }

    saveVehicle(vehicle: Vehicle): Observable<Vehicle> {
        var dto = this.dtoMapperService.vehicleToDto(vehicle);
        console.log('Saving vehicle DTO:', dto);
        //API
        if (this.apiBase) {
            if (vehicle.id && vehicle.id > 0) {
                // UPDATE
                return this.http.put<Vehicle>(`${this.apiBase}/${vehicle.id}`, dto, { headers: this.headers });
            } else {
                // CREATE
                return this.http.post<Vehicle>(`${this.apiBase}`, dto, { headers: this.headers });
            }
        }
        //Mock
        return new Observable(observer => {
            setTimeout(() => {
                if (vehicle.id && vehicle.id > 0) {
                    // UPDATE
                    const index = this.mockData.findIndex(v => v.id === vehicle.id);
                    if (index > -1) this.mockData[index] = vehicle;
                } else {
                    // CREATE - Új ID generálás
                    const maxId = this.mockData.length > 0 ? Math.max(...this.mockData.map(v => v.id)) : 0;
                    vehicle.id = maxId + 1;
                    this.mockData.push(vehicle);
                }
                observer.next(vehicle);
                observer.complete();
            }, 400);
        });
    }

    deleteVehicle(id: number): Observable<boolean> {
        //API
        if (this.apiBase) {
            return this.http.delete<boolean>(`${this.apiBase}/${id}`, { headers: this.headers });
        }
        //Mock
        return new Observable(observer => {
            setTimeout(() => {
                const index = this.mockData.findIndex(v => v.id === id);
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

    generateVehicleReport(id: number): Observable<{ id: number; generatedAt: string; payload: unknown }> {
        const mockPayload = {
            status: 'OK',
            mileageKm: 128430,
            fuelLevelPercent: 62,
            tirePressurePsi: { frontLeft: 33, frontRight: 33, rearLeft: 34, rearRight: 34 },
            lastService: '2024-04-12T09:30:00Z'
        };

        return of({
            id,
            generatedAt: new Date().toISOString(),
            payload: mockPayload
        }).pipe(delay(500));
    }
}
