export interface ReportSummary {
    reportId: number;
    vehicleId: number;
    title: string;
    createdAt: string;
    status: 'green' | 'amber' | 'red';
    ownerFleet: number;
}
