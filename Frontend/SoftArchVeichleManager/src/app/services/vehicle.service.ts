import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Vehicle } from '../models/vehicle.model';


@Injectable({ providedIn: 'root' })
export class VehicleService {

    private mockData: Vehicle[] = [
        { vehicleId: 1, vehicleName: 'Főnöki Autó', fleetId: 101, vehicleYear: 2022, vehicleModel: 'Audi A6' },
        { vehicleId: 2, vehicleName: 'Szerviz Furgon', fleetId: 101, vehicleYear: 2018, vehicleModel: 'Ford Transit' },
        { vehicleId: 3, vehicleName: 'Tartalék Kocsi', fleetId: 102, vehicleYear: 2015, vehicleModel: 'Opel Astra' },
    ];

    getVehicles(): Observable<Vehicle[]> {
        return of([...this.mockData]).pipe(delay(400));
    }

    saveVehicle(vehicle: Vehicle): Observable<Vehicle> {
        return new Observable(observer => {
            setTimeout(() => {
                if (vehicle.vehicleId && vehicle.vehicleId > 0) {
                    // UPDATE
                    const index = this.mockData.findIndex(v => v.vehicleId === vehicle.vehicleId);
                    if (index > -1) this.mockData[index] = vehicle;
                } else {
                    // CREATE - Új ID generálás
                    const maxId = this.mockData.length > 0 ? Math.max(...this.mockData.map(v => v.vehicleId)) : 0;
                    vehicle.vehicleId = maxId + 1;
                    this.mockData.push(vehicle);
                }
                observer.next(vehicle);
                observer.complete();
            }, 400);
        });
    }

    deleteVehicle(id: number): Observable<boolean> {
        return new Observable(observer => {
            setTimeout(() => {
                const index = this.mockData.findIndex(v => v.vehicleId === id);
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

    generateVehicleReport(vehicleId: number): Observable<{ vehicleId: number; generatedAt: string; payload: unknown }> {
        const mockPayload = {
            status: 'OK',
            mileageKm: 128430,
            fuelLevelPercent: 62,
            tirePressurePsi: { frontLeft: 33, frontRight: 33, rearLeft: 34, rearRight: 34 },
            lastService: '2024-04-12T09:30:00Z'
        };

        return of({
            vehicleId,
            generatedAt: new Date().toISOString(),
            payload: mockPayload
        }).pipe(delay(500));
    }
}
