import { Injectable } from '@angular/core';
import { Interface } from '../models/interface.model';
import { BehaviorSubject, delay, Observable, of, tap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Fleet } from '../models/fleet.model';

@Injectable({
  providedIn: 'root'
})
export class FleetService {
    private apiBase = 'https://localhost:7172/api/fleets';
    private headers: HttpHeaders;
    constructor(private http: HttpClient, private authService: AuthService) { 
        this.headers = new HttpHeaders();
            this.headers = this.headers.set('Authorization', `Bearer ${authService.currentUser?.token}`);
    }
    private mockData: Fleet[] = [
        { id: 101, name: 'Central Ops', region: 'Budapest' },
        { id: 102, name: 'Northern Logistics', region: 'Gyor' }
    ];

    private fleets: Fleet[] = [];

    getFleets(): Observable<Fleet[]> {
        //API
        if (this.apiBase) {
            return this.http.get<Fleet[]>(`${this.apiBase}/byuser?user_id=${this.authService.currentUser?.userId}`, { headers: this.headers }).pipe(tap(data => this.fleets = data));
        }
        //Mock
        return of([...this.mockData]).pipe(delay(400));
    }

    saveFleet(fleet: Fleet): Observable<Fleet> {
        //API
        if (this.apiBase) {
            if (fleet.id && fleet.id > 0) {
                // UPDATE
                return this.http.put<Interface>(`${this.apiBase}/${fleet.id}`, fleet, { headers: this.headers });
            } else {
                // CREATE
                return this.http.post<Interface>(`${this.apiBase}`, fleet, { headers: this.headers });
            }
        }
        //Mock
        return new Observable(observer => {
            setTimeout(() => {
                if (fleet.id && fleet.id > 0) {
                    // UPDATE
                    const index = this.mockData.findIndex(i => i.id === fleet.id);
                    if (index > -1) this.mockData[index] = fleet;
                } else {
                    // CREATE - Új ID generálás
                    const maxid = this.mockData.length > 0 ? Math.max(...this.mockData.map(i => i.id)) : 0;
                    fleet.id = maxid + 1;
                    this.mockData.push(fleet);
                }
                observer.next(fleet);
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
