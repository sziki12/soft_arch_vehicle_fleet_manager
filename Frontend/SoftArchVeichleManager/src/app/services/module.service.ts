import { Injectable } from '@angular/core';
import { Module } from '../models/module.model';
import { delay, Observable, of, tap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ModuleService {

    constructor(private http: HttpClient, private authService: AuthService) {
        this.headers = new HttpHeaders();
            this.headers = this.headers.set('Authorization', `Bearer ${authService.currentUser?.token}`);
     }
    private apiBase = 'https://localhost:7172/api/modules';
    private headers: HttpHeaders;
    private mockData: Module[] = [
        { id: 1, hardwareId: "SPDM-559", interfaceId: 1, manufacturerId: 1, vehicleId: 1},
        { id: 2, hardwareId: "DSM-396", interfaceId: 2, manufacturerId: 1, vehicleId: -1},
        { id: 3, hardwareId: "TMM-288", interfaceId: 3, manufacturerId: 2, vehicleId: -1},
    ];
    private modules: Module[] = [];

    getModules(): Observable<Module[]> {
        //API
        if (this.apiBase) {
             return this.http.get<Module[]>(`${this.apiBase}/byuser?user_id=${this.authService.currentUser?.userId}`, { headers: this.headers }).pipe(tap(data => this.modules = data));
        }
        //Mock
        return of([...this.mockData]).pipe(delay(400));
    }

    saveModule(module: Module): Observable<Module> {
        //API
        if (this.apiBase) {
            if (module.id && module.id > 0) {
                // UPDATE
                return this.http.put<Module>(`${this.apiBase}/${module.id}`, this.moduleToDto(module), { headers: this.headers });
            } else {
                // CREATE
                return this.http.post<Module>(`${this.apiBase}`, this.moduleToDto(module), { headers: this.headers });
            }
        }
        //Mock
        return new Observable(observer => {
            setTimeout(() => {
                if (module.id && module.id > 0) {
                    // UPDATE
                    const index = this.mockData.findIndex(i => i.id === module.id);
                    if (index > -1) this.mockData[index] = module;
                } else {
                    // CREATE - Új ID generálás
                    const maxId = this.mockData.length > 0 ? Math.max(...this.mockData.map(i => i.id)) : 0;
                    module.id = maxId + 1;
                    this.mockData.push(module);
                }
                observer.next(module);
                observer.complete();
            }, 400);
        });
    }

    deleteModule(id: number): Observable<boolean> {
        //API
        if (this.apiBase) {
            return this.http.delete<boolean>(`${this.apiBase}/${id}`, { headers: this.headers });
        }
        //Mock
        return new Observable(observer => {
            setTimeout(() => {
                const index = this.mockData.findIndex(i => i.id === id);
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

    moduleToDto(module: Module) {
    return {
        id: module.id,
        hardwareId: module.hardwareId,
        manufacturerId: module.manufacturerId,
        interfaceId: module.interfaceId,
        vehicleId: (module.vehicleId && module.vehicleId > 0) ? module.vehicleId : null,
    };
}
}