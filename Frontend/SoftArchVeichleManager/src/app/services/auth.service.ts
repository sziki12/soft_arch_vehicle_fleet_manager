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

type AppRole = 'admin' | 'fleet_operator' | 'manufacturer';

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
            const derivedId = this.parseUserIdFromToken(storedToken);
            const derivedManufacturerId = this.parseManufacturerIdFromToken(storedToken);
            const derivedFleetId = this.parseFleetIdFromToken(storedToken);
            this.sessionSubject.next(this.buildSession(derivedId, storedUser, storedToken, derivedRole, 
                {
                    manufacturerId: derivedManufacturerId,
                    fleetId: derivedFleetId
                }
            ));
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
                const userId = this.parseUserIdFromToken(response.token);
                const manufacturerId = this.parseManufacturerIdFromToken(response.token);
                const fleetId = this.parseFleetIdFromToken(response.token);
                return this.buildSession(
                    userId,
                    response.username ?? credentials.username,
                    response.token,
                    role,
                    {
                        name : response.name ?? response.username ?? credentials.username,
                        email : response.email ?? credentials.username,
                        manufacturerId,
                        fleetId
                    }
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

    private buildSession(userId: number, username: string, token: string, role: AppRole, optional: { name?: string, email?: string, manufacturerId?: number, fleetId?: number}): UserSession {
        return {
            userId: userId,
            name: optional.name ?? username,
            email: optional.email ?? username,
            role,
            token,
            manufacturerId: optional.manufacturerId,
            fleetId: optional.fleetId
        };
    }

    private parseRoleFromToken(token: string): AppRole {
        try {
            const payload = JSON.parse(this.decodeBase64Url(token.split('.')[1] || '')) as Record<string, unknown>;
            const roleClaim = (payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] as string | undefined) ?? '';
            const normalized = roleClaim.toLowerCase().replace('-', '_').replace(' ', '_');
            console.log('Parsed role from token:', roleClaim);
            if (normalized === 'admin') {
                return 'admin';
            }
            if (normalized === 'manufacturer') {
                return 'manufacturer';
            }
            // Treat anything else (including legacy "manager") as fleet operator.
            return 'fleet_operator';
        } catch (err) {
            console.warn('Failed to parse role from token', err);
        }
        return 'fleet_operator';
    }

    private parseUserIdFromToken(token: string): number {
        try {
            const payload = JSON.parse(this.decodeBase64Url(token.split('.')[1] || '')) as Record<string, unknown>;
            const parsedId = payload['id'] as number | undefined;
            return parsedId ?? 0;
        } catch (err) {
            console.warn('Failed to parse role from token', err);
        }
        return 0;
    }

    private parseManufacturerIdFromToken(token: string): number {
        try {
            const payload = JSON.parse(this.decodeBase64Url(token.split('.')[1] || '')) as Record<string, unknown>;
            const parsedId = payload['manufacturer_id'] as number | undefined;
            return parsedId ?? 0;
        } catch (err) {
            console.warn('Failed to parse role from token', err);
        }
        return 0;
    }

    private parseFleetIdFromToken(token: string): number {
        try {
            const payload = JSON.parse(this.decodeBase64Url(token.split('.')[1] || '')) as Record<string, unknown>;
            const parsedId = payload['fleet_id'] as number | undefined;
            return parsedId ?? 0;
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
