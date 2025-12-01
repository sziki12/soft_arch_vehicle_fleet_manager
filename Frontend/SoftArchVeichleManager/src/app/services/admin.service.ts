import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User } from '../models/admin-user.model';
import { Fleet } from '../models/fleet.model';
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
import { ManufacturerService } from './manufacturer.service';
import { Manufacturer } from '../models/manufacturer.model';

@Injectable({ providedIn: 'root' })
export class AdminService {

    private apiBase = 'https://localhost:7172/api/fleets';
    private headers: HttpHeaders;
    constructor(private http: HttpClient, private authService: AuthService,
        private dtoMapperService: DtoMappereService, private fleetService: FleetService,
        private vehicleService: VehicleService, private alarmService: AlarmService,
        private interfaceService: InterfaceService, private moduleService: ModuleService, 
        private userService: UserService, private manufacturerService: ManufacturerService,
    ) { 
        this.headers = new HttpHeaders();
        this.headers = this.headers.set('Authorization', `Bearer ${authService.currentUser?.token}`);
    }

    getUsers(): Observable<User[]> {
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

    getManufacturers(): Observable<Manufacturer[]> {
        return this.manufacturerService.getManufacturers();
    }

    createManufacturer(payload: { name: string }): Observable<Manufacturer> {
        var newManufacturer: Manufacturer = {id: 0, name: payload.name};
        return this.manufacturerService.saveManufacturer(newManufacturer);
    }

    createFleet(payload: { name: string }): Observable<Fleet> { 
        var newFleet: Fleet = {id: 0, name: payload.name};
        return this.fleetService.saveFleet(newFleet);
    }

    createUser(payload: { name: string; password: string, role: User['role'] }): Observable<User> {
        var newUser: User = { id: 0, ...payload };
        return this.userService.saveUser(newUser);
    }

    assignUserToFleetOrManufacturer(user: User, fleetId: number | null, manufacturerId: number | null): Observable<User> {
        return this.userService.saveUser({ ...user, fleetId, manufacturerId });
    }
}
