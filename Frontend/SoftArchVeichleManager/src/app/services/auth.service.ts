import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { UserSession } from '../models/auth-user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
    //TODO 
    private apiBase = '';

    private sessionSubject = new BehaviorSubject<UserSession | null>(null);
    session$ = this.sessionSubject.asObservable();

    constructor(private http: HttpClient) { }

    login(credentials: { email: string; password: string; role: 'admin' | 'manager' }): Observable<UserSession> {
        if (this.apiBase) {
            return this.http.post<UserSession>(`${this.apiBase}/auth/login`, credentials)
                .pipe(tap(session => this.sessionSubject.next(session)));
        }

        // Mock path until apiBase is set
        const mock: UserSession = {
            userId: credentials.role === 'admin' ? 1 : 2,
            name: credentials.role === 'admin' ? 'Mock Admin' : 'Mock Manager',
            email: credentials.email,
            role: credentials.role,
            token: 'mock-token'
        };
        return of(mock).pipe(
            delay(300),
            tap(session => this.sessionSubject.next(session))
        );
    }

    register(payload: { name: string; email: string; password: string; role: 'admin' | 'manager' }): Observable<UserSession> {
        if (this.apiBase) {
            return this.http.post<UserSession>(`${this.apiBase}/auth/register`, payload)
                .pipe(tap(session => this.sessionSubject.next(session)));
        }

        const mock: UserSession = {
            userId: Math.floor(Math.random() * 1000) + 10,
            name: payload.name,
            email: payload.email,
            role: payload.role,
            token: 'mock-token'
        };
        return of(mock).pipe(
            delay(400),
            tap(session => this.sessionSubject.next(session))
        );
    }

    logout(): void {
        this.sessionSubject.next(null);
    }

    get currentUser(): UserSession | null {
        return this.sessionSubject.value;
    }
}
