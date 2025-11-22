export interface AdminUser {
    userId: number;
    name: string;
    email: string;
    role: 'admin' | 'manager';
    fleetId?: number | null;
}
