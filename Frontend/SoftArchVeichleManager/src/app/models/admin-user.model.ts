export interface AdminUser {
    id: number;
    name: string;
    role: 'admin' | 'manager' | 'manufacturer';
    fleetId?: number | null;
    manufacturerId?: number | null;
}
