import { Injectable } from '@angular/core';
import { delay, map, Observable, of, tap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { DtoMappereService } from './dto-mapper.service';
import { User } from '../models/admin-user.model';
import { Manufacturer } from '../models/manufacturer.model';

@Injectable({
    providedIn: 'root'
})
export class ManufacturerService {
    private apiBase = 'https://localhost:7172/api/manufacturers';
    private headers: HttpHeaders;
    constructor(private http: HttpClient, private authService: AuthService, private dtoMapperService: DtoMappereService) {
        this.headers = new HttpHeaders();
        this.headers = this.headers.set('Authorization', `Bearer ${authService.currentUser?.token}`);
    }
    private mockData: Manufacturer[] = [
        { id: 1, name: 'Foundry' },
        { id: 2, name: 'The Manufacture' },
    ];

    private manufacturers: Manufacturer[] = [];

    getManufacturers(): Observable<Manufacturer[]> {
        //API
        if (this.apiBase) {
            return this.http.get<any[]>(`${this.apiBase}`, { headers: this.headers }).pipe(
                map(data => this.dtoMapperService.transformArray(
                    data,
                    this.dtoMapperService.dtoToManufacturer
                )),
                tap(transformed => this.manufacturers = transformed)
            );
        }
        //Mock
        return of([...this.mockData]).pipe(delay(400));
    }

    saveManufacturer(manufacturer: Manufacturer): Observable<Manufacturer> {
        var dto = this.dtoMapperService.manufacturerToDto(manufacturer);
        //API
        if (this.apiBase) {
            if (manufacturer.id && manufacturer.id > 0) {
                // UPDATE
                return this.http.put<User>(`${this.apiBase}/${manufacturer.id}`, dto, { headers: this.headers });
            } else {
                // CREATE
                return this.http.post<User>(`${this.apiBase}`, dto, { headers: this.headers });
            }
        }
        //Mock
        return new Observable(observer => {
            setTimeout(() => {
                if (manufacturer.id && manufacturer.id > 0) {
                    // UPDATE
                    const index = this.mockData.findIndex(i => i.id === manufacturer.id);
                    if (index > -1) this.mockData[index] = manufacturer;
                } else {
                    // CREATE - Új ID generálás
                    const maxid = this.mockData.length > 0 ? Math.max(...this.mockData.map(i => i.id)) : 0;
                    manufacturer.id = maxid + 1;
                    this.mockData.push(manufacturer);
                }
                observer.next(manufacturer);
                observer.complete();
            }, 400);
        });
    }

    deleteUser(id: number): Observable<boolean> {
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
