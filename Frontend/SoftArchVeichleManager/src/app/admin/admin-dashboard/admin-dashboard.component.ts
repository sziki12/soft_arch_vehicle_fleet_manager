import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Alarm } from '../../models/alarm.model';
import { AdminUser } from '../../models/admin-user.model';
import { Fleet } from '../../models/fleet.model';
import { ReportSummary } from '../../models/report.model';
import { Vehicle } from '../../models/vehicle.model';
import { AlarmService } from '../../services/alarm.service';
import { AdminService } from '../../services/admin.service';
import { VehicleService } from '../../services/vehicle.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  users: AdminUser[] = [];
  fleets: Fleet[] = [];
  vehicles: Vehicle[] = [];
  alarms: Alarm[] = [];
  reports: ReportSummary[] = [];

  activeSection: 'fleets' | 'users' | 'vehicles' | 'alarms' | 'reports' = 'fleets';
  fleetForm: FormGroup;
  assignmentForm: FormGroup;

  userSearch = '';
  userRoleFilter: 'all' | 'admin' | 'manager' = 'all';
  userFleetFilter: 'all' | number | 'unassigned' = 'all';

  fleetSearch = '';
  vehicleSearch = '';
  vehicleFleetFilter: 'all' | number = 'all';

  alarmSearch = '';
  reportSearch = '';

  showAllFleets = false;
  showAllUsers = false;
  showAllVehicles = false;
  showAllAlarms = false;
  showAllReports = false;

  loadingUsers = false;
  loadingFleets = false;
  loadingVehicles = false;
  loadingAlarms = false;
  loadingReports = false;

  constructor(
    private adminService: AdminService,
    private vehicleService: VehicleService,
    private alarmService: AlarmService,
    private fb: FormBuilder
  ) {
    this.fleetForm = this.fb.group({
      name: ['', Validators.required],
      region: ['']
    });

    this.assignmentForm = this.fb.group({
      userId: [null, Validators.required],
      id: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadFleets();
    this.loadVehicles();
    this.loadAlarms();
    this.loadReports();
  }

  loadUsers(): void {
    this.loadingUsers = true;
    this.adminService.getUsers().subscribe(users => {
      this.users = users;
      this.loadingUsers = false;
    });
  }

  loadFleets(): void {
    this.loadingFleets = true;
    this.adminService.getFleets().subscribe(fleets => {
      this.fleets = fleets;
      this.loadingFleets = false;
    });
  }

  loadVehicles(): void {
    this.loadingVehicles = true;
    this.vehicleService.getVehicles().subscribe(vehicles => {
      this.vehicles = vehicles;
      this.loadingVehicles = false;
    });
  }

  loadAlarms(): void {
    this.loadingAlarms = true;
    this.alarmService.getAlarms().subscribe(alarms => {
      this.alarms = alarms;
      this.loadingAlarms = false;
    });
  }

  loadReports(): void {
    this.loadingReports = true;
    this.adminService.getReports().subscribe(reports => {
      this.reports = reports;
      this.loadingReports = false;
    });
  }

  setSection(section: 'fleets' | 'users' | 'vehicles' | 'alarms' | 'reports'): void {
    this.activeSection = section;
  }

  createFleet(): void {
    if (this.fleetForm.invalid) {
      this.fleetForm.markAllAsTouched();
      return;
    }

    this.adminService.createFleet(this.fleetForm.value).subscribe(newFleet => {
      this.fleets = [...this.fleets, newFleet];
      this.fleetForm.reset({ name: '', region: '' });
    });
  }

  assignFleet(): void {
    if (this.assignmentForm.invalid) {
      this.assignmentForm.markAllAsTouched();
      return;
    }

    const { userId, id } = this.assignmentForm.value;
    const normalizedFleetId = id === 0 ? null : id;

    this.adminService.assignUserToFleet(userId, normalizedFleetId).subscribe(updatedUser => {
      this.users = this.users.map(u => u.userId === updatedUser.userId ? updatedUser : u);
    });
  }

  getFleetVehicleCount(id: number): number {
    return this.vehicles.filter(v => v.id === id).length;
  }

  getUsersForFleet(id: number): AdminUser[] {
    return this.users.filter(u => u.userId === id);
  }

  getFleetName(id: number | null | undefined): string {
    if (id == null) {
      return 'Unassigned';
    }
    const fleet = this.fleets.find(f => f.id === id);
    return fleet ? fleet.name : `#${id}`;
  }

  statusBadgeClass(status: ReportSummary['status']): string {
    if (status === 'green') return 'status-green';
    if (status === 'amber') return 'status-amber';
    return 'status-red';
  }

  get filteredFleets(): Fleet[] {
    const term = this.fleetSearch.toLowerCase();
    const filtered = this.fleets.filter(f =>
      !term ||
      f.name.toLowerCase().includes(term) ||
      (f.region || '').toLowerCase().includes(term)
    );
    return this.limitList(filtered, this.showAllFleets ? undefined : 4);
  }

  get filteredUsers(): AdminUser[] {
    const term = this.userSearch.toLowerCase();
    const filtered = this.users
      .filter(u => !term || u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term))
      .filter(u => this.userRoleFilter === 'all' || u.role === this.userRoleFilter)
      .filter(u => {
        if (this.userFleetFilter === 'all') return true;
        if (this.userFleetFilter === 'unassigned') return !u.userId;
        return u.userId === this.userFleetFilter;
      });
    return this.limitList(filtered, this.showAllUsers ? undefined : 6);
  }

  get filteredVehicles(): Vehicle[] {
    const term = this.vehicleSearch.toLowerCase();
    const filtered = this.vehicles
      .filter(v => !term || v.name.toLowerCase().includes(term) || v.model.toLowerCase().includes(term))
      .filter(v => this.vehicleFleetFilter === 'all' || v.id === this.vehicleFleetFilter);
    return this.limitList(filtered, this.showAllVehicles ? undefined : 6);
  }

  get filteredAlarms(): Alarm[] {
    const term = this.alarmSearch.toLowerCase();
    const filtered = this.alarms
      .filter(a => !term || a.alarmJson.toLowerCase().includes(term) || String(a.id).includes(term) || String(a.fleetId).includes(term));
    return this.limitList(filtered, this.showAllAlarms ? undefined : 5);
  }

  get filteredReports(): ReportSummary[] {
    const term = this.reportSearch.toLowerCase();
    const filtered = this.reports
      .filter(r => !term ||
        r.title.toLowerCase().includes(term) ||
        String(r.vehicleId).includes(term) ||
        String(r.ownerFleet).includes(term));
    return this.limitList(filtered, this.showAllReports ? undefined : 6);
  }

  private limitList<T>(list: T[], max?: number): T[] {
    if (!max) return list;
    return list.slice(0, max);
  }
}
