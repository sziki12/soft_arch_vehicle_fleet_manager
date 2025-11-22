import { Injectable } from '@angular/core';
import { Interface } from '../models/interface.model';
import { delay, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InterfaceService {

    constructor() { }
    private mockData: Interface[] = [
        { interfaceId: 1, interfaceName: 'Speed Meter Interface', interfaceJson: "{}", manufacturerId: 1},
        { interfaceId: 2, interfaceName: 'Distance Sensor Interface', interfaceJson: "{}", manufacturerId: 1},
        { interfaceId: 3, interfaceName: 'Temperature Meter Interface', interfaceJson: "{}", manufacturerId: 2},
    ];

    getInterfaces(): Observable<Interface[]> {
        return of([...this.mockData]).pipe(delay(400));
    }

    saveInterface(interfaceModel: Interface): Observable<Interface> {
        return new Observable(observer => {
            setTimeout(() => {
                if (interfaceModel.interfaceId && interfaceModel.interfaceId > 0) {
                    // UPDATE
                    const index = this.mockData.findIndex(i => i.interfaceId === interfaceModel.interfaceId);
                    if (index > -1) this.mockData[index] = interfaceModel;
                } else {
                    // CREATE - Új ID generálás
                    const maxId = this.mockData.length > 0 ? Math.max(...this.mockData.map(i => i.interfaceId)) : 0;
                    interfaceModel.interfaceId = maxId + 1;
                    this.mockData.push(interfaceModel);
                }
                observer.next(interfaceModel);
                observer.complete();
            }, 400);
        });
    }

    deleteInterface(id: number): Observable<boolean> {
        return new Observable(observer => {
            setTimeout(() => {
                const index = this.mockData.findIndex(i => i.interfaceId === id);
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
