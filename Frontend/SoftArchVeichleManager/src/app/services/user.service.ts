import { Injectable } from '@angular/core';
import { Interface } from '../models/interface.model';
import { BehaviorSubject, delay, map, Observable, of, tap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Fleet } from '../models/fleet.model';
import { DtoMappereService } from './dto-mapper.service';
import { AdminUser } from '../models/admin-user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
    private apiBase = 'https://localhost:7172/api/users';
    private headers: HttpHeaders;
    constructor(private http: HttpClient, private authService: AuthService, private dtoMapperService: DtoMappereService) { 
        this.headers = new HttpHeaders();
            this.headers = this.headers.set('Authorization', `Bearer ${authService.currentUser?.token}`);
    }
    private mockData: AdminUser[] = [
        { id: 1, name: 'Anna Admin', role: 'admin' },
        { id: 2, name: 'Milan Manager', role: 'manager', fleetId: 101 },
        { id: 3, name: 'Sara Supervisor', role: 'manager', fleetId: 102 },
        { id: 4, name: 'Peter Planner', role: 'manager', fleetId: null },
        { id: 4, name: 'Manufacturer Manuel', role: 'manufacturer', manufacturerId: 1 },
        { id: 4, name: 'Module Mark', role: 'manufacturer', fleetId: 2 }
    ];

    private users: AdminUser[] = [];

    getUsers(): Observable<AdminUser[]> {
        //API
        if (this.apiBase) {
           return this.http.get<any[]>(`${this.apiBase}`, { headers: this.headers }).pipe(
                map(data => this.dtoMapperService.transformArray(
                    data,
                    this.dtoMapperService.dtoToUser
                )),
                tap(transformed => this.users = transformed)
                );
        }
        //Mock
        return of([...this.mockData]).pipe(delay(400));
    }

    registerUser(payload: { name: string; password: string; role: AdminUser['role'] }): Observable<AdminUser> {
        const dto = this.dtoMapperService.userToDto({ id: 0, name: payload.name, role: payload.role }, payload.password);
        return this.http.post<AdminUser>(`${this.apiBase}`, dto, { headers: this.headers });
    }

    saveUser(user: AdminUser): Observable<AdminUser> {
        var dto = this.dtoMapperService.userToDto(user);
        //API
        if (this.apiBase) {
            if (user.id && user.id > 0) {
                // UPDATE
                return this.http.put<AdminUser>(`${this.apiBase}/${user.id}`, dto, { headers: this.headers });
            } else {
                // CREATE
                return this.http.post<AdminUser>(`${this.apiBase}`, dto, { headers: this.headers });
            }
        }
        //Mock
        return new Observable(observer => {
            setTimeout(() => {
                if (user.id && user.id > 0) {
                    // UPDATE
                    const index = this.mockData.findIndex(i => i.id === user.id);
                    if (index > -1) this.mockData[index] = user;
                } else {
                    // CREATE - Új ID generálás
                    const maxid = this.mockData.length > 0 ? Math.max(...this.mockData.map(i => i.id)) : 0;
                    user.id = maxid + 1;
                    this.mockData.push(user);
                }
                observer.next(user);
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
