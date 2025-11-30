export interface AdminUser {
    id: number;
    name: string;
    role: 'admin' | 'manager' | 'manufacturer' | 'fleet_operator';
    fleetId?: number | null;
    manufacturerId?: number | null;
}
