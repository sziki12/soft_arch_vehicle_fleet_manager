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

    getUsers(): Observable<AdminUser[]> {
        return this.userService.getUsers();
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

    createFleet(payload: { name: string; region?: string }): Observable<Fleet> { 
        var newFleet: Fleet = {id: 0, name: payload.name};
        return this.fleetService.saveFleet(newFleet);
    }

    createUser(payload: { name: string; password: string, role: AdminUser['role'] }): Observable<AdminUser> { 
        var newUser: AdminUser = {id: 0, ...payload};
        return this.userService.saveUser(newUser);
    }

    assignUserToFleet(user: AdminUser, fleetId: number | null): Observable<AdminUser> {
        return this.userService.saveUser({ ...user, fleetId });
    }
}
