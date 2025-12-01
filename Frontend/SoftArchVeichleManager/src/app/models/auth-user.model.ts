export interface UserSession {
    userId: number;
    name: string;
    email: string;
    role: 'admin' | 'fleet_operator' | 'manufacturer';
    token?: string;
    manufacturerId?: number;
    fleetId?: number;
}
