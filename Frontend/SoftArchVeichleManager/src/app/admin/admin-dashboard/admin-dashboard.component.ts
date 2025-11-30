import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Alarm } from '../../models/alarm.model';
import { AdminUser } from '../../models/admin-user.model';
import { Fleet } from '../../models/fleet.model';
import { ReportSummary } from '../../models/report.model';
import { Vehicle } from '../../models/vehicle.model';
import { AdminService } from '../../services/admin.service';
import { Interface } from '../../models/interface.model';
import { Module } from '../../models/module.model';
import { Manufacturer } from '../../models/manufacturer.model';
import { VehicleService } from '../../services/vehicle.service';
import { FleetService } from '../../services/fleet.service';
import { VehicleFormComponent } from '../../fleet/vehicle-form/vehicle-form.component';
import { AlarmFormComponent } from '../../alarm/alarm-form/alarm-form.component';
import { AlarmService } from '../../services/alarm.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, VehicleFormComponent, AlarmFormComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  users: AdminUser[] = [];
  fleets: Fleet[] = [];
  vehicles: Vehicle[] = [];
  alarms: Alarm[] = [];
  interfaces: Interface[] = [];
  modules: Module[] = [];
  manufacturers: Manufacturer[] = [];
  selectedVehicle: Vehicle | null = null;
  selectedAlarm: Alarm | null = null;
  selectedAlarmUserId: number | null = null;

  activeSection: 'fleets' | 'users' | 'vehicles' | 'alarms' | 'interfaces' | 'modules' = 'fleets';
  fleetForm: FormGroup;
  assignmentForm: FormGroup;

  userSearch = '';
  userRoleFilter: 'all' | 'admin' | 'manager' | 'fleet_operator' | 'manufacturer' = 'all';

  fleetSearch = '';
  vehicleSearch = '';
  vehicleFleetFilter: 'all' | number = 'all';

  alarmSearch = '';
  reportSearch = '';

  interfaceSearch = '';
  moduleSearch = '';

  showAllFleets = false;
  showAllUsers = false;
  showAllVehicles = false;
  showAllAlarms = false;
  showAllInterfaces = false;
  showAllModules = false;

  loadingUsers = false;
  loadingFleets = false;
  loadingVehicles = false;
  loadingAlarms = false;
  loadingInterfaces = false;
  loadingModules = false;

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder,
    private vehicleService: VehicleService,
    private fleetService: FleetService,
    private alarmService: AlarmService,
    private userService: UserService
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
    this.loadInterfaces();
    this.loadModules();
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
    this.fleetService.getFleets().subscribe(fleets => {
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
    this.adminService.getAlarms().subscribe(alarms => {
      this.alarms = alarms;
      this.loadingAlarms = false;
    });
  }

  loadInterfaces(): void {
    this.loadingInterfaces= true;
    this.adminService.getInterfaces().subscribe(interfaces => {
      this.interfaces = interfaces;
      this.loadingInterfaces = false;
    });
  }

  loadModules(): void {
    this.loadingModules = true;
    this.adminService.getModules().subscribe(modules => {
      this.modules = modules;
      this.loadingModules = false;
    });
  }

  setSection(section: 'fleets' | 'users' | 'vehicles' | 'alarms' | 'interfaces' | 'modules'): void {
    this.activeSection = section;
  }

  selectVehicle(vehicle: Vehicle): void {
    this.selectedVehicle = { ...vehicle };
  }

  createVehicle(): void {
    this.selectedVehicle = {
      id: 0,
      name: '',
      licensePlate: '',
      fleetId: this.fleets[0]?.id ?? 0,
      year: new Date().getFullYear(),
      model: ''
    };
  }

  onSaveVehicle(vehicle: Vehicle): void {
    this.loadingVehicles = true;
    this.vehicleService.saveVehicle(vehicle).subscribe({
      next: () => {
        this.selectedVehicle = null;
        this.loadVehicles();
      },
      error: () => {
        alert('Vehicle save failed. Please check the data and try again.');
        this.loadingVehicles = false;
      }
    });
  }

  onDeleteVehicle(id: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (confirm('Biztos törlöd a járművet?')) {
      this.vehicleService.deleteVehicle(id).subscribe(() => {
        this.selectedVehicle = null;
        this.loadVehicles();
      });
    }
  }

  selectAlarm(alarm: Alarm): void {
    this.selectedAlarm = { ...alarm };
  }

  createAlarm(): void {
    if (!this.selectedAlarmUserId && this.alarmOperators.length) {
      this.selectedAlarmUserId = this.alarmOperators[0].id;
    }
    const defaultFleetId = this.getFleetIdForUser(this.selectedAlarmUserId) ?? this.fleets[0]?.id ?? 0;
    this.selectedAlarm = {
      id: 0,
      fleetId: defaultFleetId,
      interfaceId: 1,
      alarmJson: '{}'
    };
  }

  onSaveAlarm(alarm: Alarm): void {
    this.loadingAlarms = true;
    if (!this.selectedAlarmUserId) {
      alert('Válassz egy fleet operátort a riasztáshoz.');
      this.loadingAlarms = false;
      return;
    }
    const targetFleetId = this.getFleetIdForUser(this.selectedAlarmUserId);
    if (!targetFleetId) {
      alert('A kiválasztott operátorhoz nincs flotta rendelve.');
      this.loadingAlarms = false;
      return;
    }
    alarm.fleetId = targetFleetId;
    this.alarmService.saveAlarm(alarm).subscribe({
      next: () => {
        this.selectedAlarm = null;
        this.loadAlarms();
      },
      error: () => {
        alert('Alarm save failed. Please check the data and try again.');
        this.loadingAlarms = false;
      }
    });
  }

  onDeleteAlarm(id: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (confirm('Biztos törlöd a riasztást?')) {
      this.alarmService.deleteAlarm(id).subscribe(() => {
        this.selectedAlarm = null;
        this.loadAlarms();
      });
    }
  }

  onAlarmUserChange(userId: number | null): void {
    this.selectedAlarmUserId = userId;
    if (this.selectedAlarm) {
      const fleetId = this.getFleetIdForUser(userId) ?? this.selectedAlarm.fleetId;
      this.selectedAlarm = { ...this.selectedAlarm, fleetId };
    }
  }

  getFleetIdForUser(userId: number | null): number | null {
    if (!userId) {
      return null;
    }
    const user = this.users.find(u => u.id === userId);
    return user?.fleetId ?? null;
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
    const targetUserId = Number(userId);
    if (!targetUserId) {
      return;
    }
    const normalizedFleetId = id === 0 || id === '0' ? null : Number(id);

    const user = this.users.find(u => u.id === targetUserId);
    if (!user) {
      return;
    }

    this.adminService.assignUserToFleet(user, normalizedFleetId).subscribe({
      next: updatedUser => {
        const merged = updatedUser
          ? { ...user, ...updatedUser, fleetId: updatedUser.fleetId ?? normalizedFleetId }
          : { ...user, fleetId: normalizedFleetId };
        this.users = this.users.map(u => u.id === merged.id ? merged : u);
        this.assignmentForm.reset({ userId: null, id: 0 });
      },
      error: (err) => {
        console.error('Assign user to fleet failed', err);
      }
    });
  }

  getFleetVehicleCount(id: number): number {
    return this.vehicles.filter(v => v.fleetId === id).length;
  }

  getUsersForFleet(id: number): AdminUser[] {
    return this.users.filter(u => u.fleetId === id);
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
      f.name.toLowerCase().includes(term)
    );
    return this.limitList(filtered, this.showAllFleets ? undefined : 4);
  }

  get filteredUsers(): AdminUser[] {
    const term = this.userSearch.toLowerCase();
    const filtered = this.users
      .filter(u => !term || u.name.toLowerCase().includes(term))
      .filter(u => this.userRoleFilter === 'all' || u.role === this.userRoleFilter)
      ;
    return this.limitList(filtered, this.showAllUsers ? undefined : 6);
  }

  deleteUser(user: AdminUser, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (!confirm(`Biztos törlöd ${user.name} felhasználót?`)) {
      return;
    }
    this.userService.deleteUser(user.id).subscribe(() => {
      this.users = this.users.filter(u => u.id !== user.id);
    });
  }

  get filteredVehicles(): Vehicle[] {
    const term = this.vehicleSearch.toLowerCase();
    const filtered = this.vehicles
      .filter(v => !term || v.name.toLowerCase().includes(term) || v.model.toLowerCase().includes(term))
      .filter(v => this.vehicleFleetFilter === 'all' || v.fleetId === this.vehicleFleetFilter);
    return this.limitList(filtered, this.showAllVehicles ? undefined : 6);
  }

  get filteredAlarms(): Alarm[] {
    const term = this.alarmSearch.toLowerCase();
    const filtered = this.alarms
      .filter(a => !term || a.alarmJson.toLowerCase().includes(term) || String(a.id).includes(term) || String(a.fleetId).includes(term))
      .filter(a => !this.selectedAlarmUserId || a.fleetId === this.getFleetIdForUser(this.selectedAlarmUserId));
    return this.limitList(filtered, this.showAllAlarms ? undefined : 5);
  }

  get filteredInterfaces(): Interface[] {
    const term = this.interfaceSearch.toLowerCase();
    const filtered = this.interfaces
      .filter(a => !term || a.interfaceJson.toLowerCase().includes(term) || String(a.id).includes(term) || String(a.name).toLowerCase().includes(term) || String(a.manufacturerId).includes(term));
    return this.limitList(filtered, this.showAllInterfaces ? undefined : 5);
  }

  get filteredModules(): Module[] {
    const term = this.moduleSearch.toLowerCase();
    const filtered = this.modules
      .filter(a => !term || a.hardwareId.toLowerCase().includes(term) || String(a.id).includes(term) || String(a.vehicleId).includes(term) 
      || String(a.interfaceId).includes(term) || String(a.manufacturerId).includes(term));
    return this.limitList(filtered, this.showAllAlarms ? undefined : 5);
  }

  get alarmOperators(): AdminUser[] {
    return this.users.filter(u => {
      const role = (u.role || '').toLowerCase();
      return role === 'manager' || role === 'fleet_operator' || role === 'fleet-operator';
    });
  }

  private limitList<T>(list: T[], max?: number): T[] {
    if (!max) return list;
    return list.slice(0, max);
  }
}
