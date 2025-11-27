import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { UserSession } from '../models/auth-user.model';

interface LoginResponse {
    token: string;
    userId?: number;
    username?: string;
    email?: string;
    name?: string;
}

type AppRole = 'admin' | 'manager' | 'manufacturer';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private apiBase = 'https://localhost:7172';
    private sessionSubject = new BehaviorSubject<UserSession | null>(null);
    session$ = this.sessionSubject.asObservable();

    constructor(private http: HttpClient) {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_username');

        if (storedToken && storedUser) {
            const derivedRole = this.parseRoleFromToken(storedToken);
            const derivedId = this.parseIdFromToken(storedToken);
            this.sessionSubject.next(this.buildSession(derivedId, storedUser, storedToken, derivedRole));
        }
    }

    login(credentials: { username: string; password: string }): Observable<UserSession> {
        const payload = {
            USERNAME: credentials.username,
            PASSWORD: credentials.password
        };

        return this.http.post<LoginResponse>(`${this.apiBase}/auth/login`, payload).pipe(
            map(response => {
                const role = this.parseRoleFromToken(response.token);
                const userId = this.parseIdFromToken(response.token);
                return this.buildSession(
                    userId,
                    response.username ?? credentials.username,
                    response.token,
                    role,
                    response.name ?? response.username ?? credentials.username,
                    response.email ?? credentials.username
                );
            }),
            tap(session => {
                localStorage.setItem('auth_token', session.token ?? '');
                localStorage.setItem('auth_username', session.name);
                localStorage.setItem('auth_role', session.role);
                this.sessionSubject.next(session);
            })
        );
    }

    logout(): void {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_username');
        localStorage.removeItem('auth_role');
        this.sessionSubject.next(null);
    }

    get currentUser(): UserSession | null {
        return this.sessionSubject.value;
    }

    private buildSession(userId: number, username: string, token: string, role: AppRole, name?: string, email?: string): UserSession {
        return {
            userId: userId,
            name: name ?? username,
            email: email ?? username,
            role,
            token
        };
    }

    private parseRoleFromToken(token: string): AppRole {
        try {
            const payload = JSON.parse(this.decodeBase64Url(token.split('.')[1] || '')) as Record<string, unknown>;
            const roleClaim = payload['role'] as string | undefined;
            if (roleClaim === 'Admin') {
                return 'admin';
            }
            if (roleClaim === 'Manufacturer') {
                return 'manufacturer';
            }
        } catch (err) {
            console.warn('Failed to parse role from token', err);
        }
        return 'manager';
    }

    private parseIdFromToken(token: string): number {
        try {
            const payload = JSON.parse(this.decodeBase64Url(token.split('.')[1] || '')) as Record<string, unknown>;
            const pardedId = payload['id'] as number | undefined;
            return pardedId ?? 0;
        } catch (err) {
            console.warn('Failed to parse role from token', err);
        }
        return 0;
    }

    private decodeBase64Url(input: string): string {
        const normalized = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=');
        return atob(normalized);
    }
}
