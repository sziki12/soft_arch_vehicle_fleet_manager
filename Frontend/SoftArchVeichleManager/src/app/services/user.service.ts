import { Injectable } from '@angular/core';
import { BehaviorSubject, delay, map, Observable, of, tap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { DtoMappereService } from './dto-mapper.service';
import { User } from '../models/admin-user.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiBase = 'https://localhost:7172/api/users';
    private authBase = 'https://localhost:7172/auth';
    private headers: HttpHeaders;
    constructor(private http: HttpClient, private authService: AuthService, private dtoMapperService: DtoMappereService) {
        this.headers = new HttpHeaders();
        this.headers = this.headers.set('Authorization', `Bearer ${authService.currentUser?.token}`);
    }


    private users: User[] = [];

    getUsers(): Observable<User[]> {

        return this.http.get<any[]>(`${this.apiBase}`, { headers: this.headers }).pipe(
            map(data => this.dtoMapperService.transformArray(
                data,
                this.dtoMapperService.dtoToUser
            )),
            tap(transformed => this.users = transformed)
        );
    }

    registerUser(payload: { username: string; password: string; role: User['role'] }): Observable<User> {

        const body = {
            USERNAME: payload.username,
            PASSWORD: payload.password,
            USER_ROLE: payload.role
        };
        console.log('Register payload:', body);
        const registerUrl = this.authBase ? `${this.authBase}/register` : '/auth/register';
        return this.http.post<User>(registerUrl, body);
    }

    saveUser(user: User): Observable<User> {
        var dto = this.dtoMapperService.userToDto(user);
        if (user.id && user.id > 0) {
            // UPDATE
            return this.http.put<User>(`${this.apiBase}/${user.id}`, dto, { headers: this.headers });
        } else {
            // CREATE
            return this.http.post<User>(`${this.apiBase}`, dto, { headers: this.headers });
        }


    }

    deleteUser(id: number): Observable<boolean> {

        return this.http.delete<boolean>(`${this.apiBase}/${id}`, { headers: this.headers });


    }
}
