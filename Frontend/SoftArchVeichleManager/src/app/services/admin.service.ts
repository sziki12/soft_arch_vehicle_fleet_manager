import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AdminUser } from '../models/admin-user.model';
import { Fleet } from '../models/fleet.model';
import { ReportSummary } from '../models/report.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { DtoMappereService } from './dto-mapper.service';
import { FleetService } from './fleet.service';
import { VehicleService } from './vehicle.service';
import { AlarmService } from './alarm.service';
import { InterfaceService } from './interface.serice';
import { ModuleService } from './module.service';
import { Interface } from '../models/interface.model';
import { Module } from '../models/module.model';
import { Vehicle } from '../models/vehicle.model';
import { Alarm } from '../models/alarm.model';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class AdminService {

    private apiBase = 'https://localhost:7172/api/fleets';
    private headers: HttpHeaders;
    constructor(private http: HttpClient, private authService: AuthService, 
        private dtoMapperService: DtoMappereService, private fleetService: FleetService,
        private vehicleService: VehicleService, private alarmService: AlarmService,
        private interfaceService: InterfaceService, private moduleService: ModuleService, 
        private userService: UserService) { 
        this.headers = new HttpHeaders();
            this.headers = this.headers.set('Authorization', `Bearer ${authService.currentUser?.token}`);
    }
    
    private users: AdminUser[] = [
        { id: 1, name: 'Anna Admin', role: 'admin' },
        { id: 2, name: 'Milan Manager', role: 'manager', fleetId: 101 },
        { id: 3, name: 'Sara Supervisor',  role: 'manager', fleetId: 102 },
        { id: 4, name: 'Peter Planner', role: 'manager', fleetId: null },
        { id: 4, name: 'Manufacturer Manuel',  role: 'manufacturer', manufacturerId: 1 },
        { id: 4, name: 'Module Mark', role: 'manufacturer', fleetId: 2 }
    ];

    private fleets: Fleet[] = [
        { id: 101, name: 'Central Ops'},
        { id: 102, name: 'Northern Logistics' }
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
        return this.fleetService.getFleets();
    }

    getVehicles(): Observable<Vehicle[]> {
        return this.vehicleService.getVehicles();
    }

    getAlarms(): Observable<Alarm[]> {
        return this.alarmService.getAlarms();
    }

    getInterfaces(): Observable<Interface[]> {
        return this.interfaceService.getInterfaces();
    }

    getModules(): Observable<Module[]> {
        return this.moduleService.getModules();
    }

    getReports(): Observable<ReportSummary[]> {
        return of([...this.reports]).pipe(delay(250));
    }

    createFleet(payload: { name: string; region?: string }): Observable<Fleet> { 
        var newFleet: Fleet = {id: 0, name: payload.name};
        return this.fleetService.saveFleet(newFleet);
    }

    createUser(payload: { name: string; password: string, role: 'admin' | 'manager' | 'manufacturer' }): Observable<AdminUser> { 
        var newUser: AdminUser = {id: 0, ...payload};
        return this.userService.saveUser(newUser);
    }

    assignUserToFleet(userId: number, fleetId: number | null): Observable<AdminUser> {
        this.userService.saveUser({...this.users.find(u => u.id === userId)!, fleetId});

        const idx = this.users.findIndex(u => u.id === userId);
        if (idx === -1) {
            throw new Error('User not found');
        }

        this.users[idx] = { ...this.users[idx], fleetId };
        return of({ ...this.users[idx] }).pipe(delay(200));
    }
}
