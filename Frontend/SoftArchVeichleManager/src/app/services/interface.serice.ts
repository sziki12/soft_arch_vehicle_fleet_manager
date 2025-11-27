import { Injectable } from '@angular/core';
import { Interface } from '../models/interface.model';
import { BehaviorSubject, delay, Observable, of, tap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class InterfaceService {
    private apiBase = 'https://localhost:7172/api/interfaces';
    private headers: HttpHeaders;
    constructor(private http: HttpClient, private authService: AuthService) { 
        this.headers = new HttpHeaders();
            this.headers = this.headers.set('Authorization', `Bearer ${authService.currentUser?.token}`);
    }
    private mockData: Interface[] = [
        { id: 1, name: 'Speed Meter Interface', interfaceJSON: "{}", manufacturerId: 1},
        { id: 2, name: 'Distance Sensor Interface', interfaceJSON: "{}", manufacturerId: 1},
        { id: 3, name: 'Temperature Meter Interface', interfaceJSON: "{}", manufacturerId: 2},
    ];

    private interfaces: Interface[] = [];

    getInterfaces(): Observable<Interface[]> {
        //API
        if (this.apiBase) {
            //console.log(`API Call to: ${this.apiBase}/byuser?user_id=${this.authService.currentUser?.userId}, with token: ${this.authService.currentUser?.token}`);
            return this.http.get<Interface[]>(`${this.apiBase}/byuser?user_id=${this.authService.currentUser?.userId}`, { headers: this.headers }).pipe(tap(data => this.interfaces = data));
        }
        //Mock
        return of([...this.mockData]).pipe(delay(400));
    }

    saveInterface(interfaceModel: Interface): Observable<Interface> {
        //API
        if (this.apiBase) {
            if (interfaceModel.id && interfaceModel.id > 0) {
                // UPDATE
                return this.http.put<Interface>(`${this.apiBase}/${interfaceModel.id}`, interfaceModel, { headers: this.headers });
            } else {
                // CREATE
                console.log(`interfaceModel`);
                console.log(interfaceModel);
                return this.http.post<Interface>(`${this.apiBase}`, interfaceModel, { headers: this.headers });
            }
        }
        //Mock
        return new Observable(observer => {
            setTimeout(() => {
                if (interfaceModel.id && interfaceModel.id > 0) {
                    // UPDATE
                    const index = this.mockData.findIndex(i => i.id === interfaceModel.id);
                    if (index > -1) this.mockData[index] = interfaceModel;
                } else {
                    // CREATE - Új ID generálás
                    const maxid = this.mockData.length > 0 ? Math.max(...this.mockData.map(i => i.id)) : 0;
                    interfaceModel.id = maxid + 1;
                    this.mockData.push(interfaceModel);
                }
                observer.next(interfaceModel);
                observer.complete();
            }, 400);
        });
    }

    deleteInterface(id: number): Observable<boolean> {
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
}
