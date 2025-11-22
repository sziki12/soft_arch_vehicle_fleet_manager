export interface UserSession {
    userId: number;
    name: string;
    email: string;
    role: 'admin' | 'manager';
    token?: string;
}
