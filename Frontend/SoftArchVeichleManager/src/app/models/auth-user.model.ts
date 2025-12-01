export interface UserSession {
    userId: number;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'manufacturer';
    token?: string;
    manufacturerId?: number;
    fleetId?: number;
}
