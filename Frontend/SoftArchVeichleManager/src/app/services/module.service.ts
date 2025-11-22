import { Injectable } from '@angular/core';
import { Module } from '../models/module.model';
import { delay, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModuleService {

    constructor() { }
    private mockData: Module[] = [
        { moduleId: 1, hardwareId: "SPDM-559", moduleName: 'Speed Meter Module', interfaceId: 1, manufacturerId: 1, vehicleId: 1},
        { moduleId: 2, hardwareId: "DSM-396", moduleName: 'Distance Sensor Module', interfaceId: 2, manufacturerId: 1, vehicleId: -1},
        { moduleId: 3, hardwareId: "TMM-288", moduleName: 'Temperature Meter Module', interfaceId: 3, manufacturerId: 2, vehicleId: -1},
    ];

    getModules(): Observable<Module[]> {
        return of([...this.mockData]).pipe(delay(400));
    }

    saveModule(module: Module): Observable<Module> {
        return new Observable(observer => {
            setTimeout(() => {
                if (module.moduleId && module.moduleId > 0) {
                    // UPDATE
                    const index = this.mockData.findIndex(i => i.moduleId === module.moduleId);
                    if (index > -1) this.mockData[index] = module;
                } else {
                    // CREATE - Új ID generálás
                    const maxId = this.mockData.length > 0 ? Math.max(...this.mockData.map(i => i.moduleId)) : 0;
                    module.moduleId = maxId + 1;
                    this.mockData.push(module);
                }
                observer.next(module);
                observer.complete();
            }, 400);
        });
    }

    deleteModule(id: number): Observable<boolean> {
        return new Observable(observer => {
            setTimeout(() => {
                const index = this.mockData.findIndex(i => i.moduleId === id);
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
}