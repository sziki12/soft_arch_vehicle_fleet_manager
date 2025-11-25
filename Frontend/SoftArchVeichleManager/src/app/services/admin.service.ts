import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AdminUser } from '../models/admin-user.model';
import { Fleet } from '../models/fleet.model';
import { ReportSummary } from '../models/report.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
    private users: AdminUser[] = [
        { userId: 1, name: 'Anna Admin', email: 'anna.admin@example.com', role: 'admin' },
        { userId: 2, name: 'Milan Manager', email: 'milan.manager@example.com', role: 'manager', fleetId: 101 },
        { userId: 3, name: 'Sara Supervisor', email: 'sara.supervisor@example.com', role: 'manager', fleetId: 102 },
        { userId: 4, name: 'Peter Planner', email: 'peter.planner@example.com', role: 'manager', fleetId: null }
    ];

    private fleets: Fleet[] = [
        { fleetId: 101, fleetName: 'Central Ops', region: 'Budapest' },
        { fleetId: 102, fleetName: 'Northern Logistics', region: 'Gyor' }
    ];

    private reports: ReportSummary[] = [
        { reportId: 1, vehicleId: 1, title: 'Daily health check', createdAt: '2024-05-10T09:10:00Z', status: 'green', ownerFleet: 101 },
        { reportId: 2, vehicleId: 2, title: 'Oil temperature alert', createdAt: '2024-05-10T08:45:00Z', status: 'amber', ownerFleet: 101 },
        { reportId: 3, vehicleId: 3, title: 'Tire pressure drop', createdAt: '2024-05-09T18:30:00Z', status: 'red', ownerFleet: 102 }
    ];

    getUsers(): Observable<AdminUser[]> {
        return of([...this.users]).pipe(delay(250));
    }

    getFleets(): Observable<Fleet[]> {
        return of([...this.fleets]).pipe(delay(250));
    }

    getReports(): Observable<ReportSummary[]> {
        return of([...this.reports]).pipe(delay(250));
    }

    createFleet(payload: { fleetName: string; region?: string }): Observable<Fleet> {
        const maxId = this.fleets.length ? Math.max(...this.fleets.map(f => f.fleetId)) : 100;
        const newFleet: Fleet = {
            fleetId: maxId + 1,
            fleetName: payload.fleetName,
            region: payload.region || 'Unassigned'
        };

        this.fleets.push(newFleet);
        return of(newFleet).pipe(delay(200));
    }

    assignUserToFleet(userId: number, fleetId: number | null): Observable<AdminUser> {
        const idx = this.users.findIndex(u => u.userId === userId);
        if (idx === -1) {
            throw new Error('User not found');
        }

        this.users[idx] = { ...this.users[idx], fleetId };
        return of({ ...this.users[idx] }).pipe(delay(200));
    }
}
