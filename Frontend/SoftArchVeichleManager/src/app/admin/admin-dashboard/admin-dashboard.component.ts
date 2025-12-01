import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Alarm } from '../../models/alarm.model';
import { User } from '../../models/admin-user.model';
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
import { ManufacturerService } from '../../services/manufacturer.service';
import { InterfaceService } from '../../services/interface.serice';
import { ModuleService } from '../../services/module.service';
import { InterfaceFormComponent } from '../../manufacturer/interface/interface-form/interface-form.component';
import { ModuleFormComponent } from '../../manufacturer/module/module-form/module-form.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, VehicleFormComponent, AlarmFormComponent, InterfaceFormComponent, ModuleFormComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  users: User[] = [];
  fleets: Fleet[] = [];
  vehicles: Vehicle[] = [];
  alarms: Alarm[] = [];
  interfaces: Interface[] = [];
  modules: Module[] = [];
  manufacturers: Manufacturer[] = [];
  selectedVehicle: Vehicle | null = null;
  selectedAlarm: Alarm | null = null;
  selectedManufacturer: Manufacturer | null = null;
  selectedInterface: Interface | null = null;
  selectedModule: Module | null = null;
  selectedAlarmUserId: number | null = null;

  activeSection: 'fleets' | 'users' | 'vehicles' | 'alarms' | 'interfaces' | 'modules' | 'manufacturers' = 'fleets';
  fleetForm: FormGroup;
  manufacturerForm: FormGroup;
  assignmentForm: FormGroup;

  userSearch = '';
  userRoleFilter: 'all' | 'admin' | 'manager' | 'fleet_operator' | 'manufacturer' = 'all';

  fleetSearch = '';
  manufacturerSearch = '';
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
  showAllManufacturers = false;

  loadingUsers = false;
  loadingFleets = false;
  loadingVehicles = false;
  loadingAlarms = false;
  loadingInterfaces = false;
  loadingModules = false;
  loadingManufacturers = false;

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder,
    private vehicleService: VehicleService,
    private alarmService: AlarmService,
    private userService: UserService,
    private interfaceService: InterfaceService,
    private moduleService: ModuleService,
  ) {
    this.fleetForm = this.fb.group({
      name: ['', Validators.required],
    });

    this.manufacturerForm = this.fb.group({
      name: ['', Validators.required],
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
    this.loadManufacturers();
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
    this.vehicleService.getVehicles().subscribe({
      next: vehicles => {
        console.log('[AdminDashboard] vehicles received', vehicles?.length ?? 0, vehicles);
        this.vehicles = vehicles;
        this.loadingVehicles = false;
      },
      error: (err) => {
        console.error('[AdminDashboard] vehicle load failed', err);
        this.loadingVehicles = false;
      }
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
    this.loadingInterfaces = true;
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

  loadManufacturers(): void {
    this.loadingManufacturers = true;
    this.adminService.getManufacturers().subscribe(manufacturers => {
      this.manufacturers = manufacturers;
      this.loadingManufacturers = false;
    });
  }

  setSection(section: 'fleets' | 'users' | 'vehicles' | 'alarms' | 'interfaces' | 'modules' | 'manufacturers'): void {
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
    let targetFleetId: number | null = alarm.fleetId ?? null;

    if (this.selectedAlarmUserId) {
      targetFleetId = this.getFleetIdForUser(this.selectedAlarmUserId);
      if (!targetFleetId) {
        alert('A kiválasztott operátorhoz nincs flotta rendelve.');
        this.loadingAlarms = false;
        return;
      }
    } else if (!alarm.id || alarm.id === 0) {
      alert('Válassz egy fleet operátort a riasztáshoz.');
      this.loadingAlarms = false;
      return;
    }

    if (!targetFleetId) {
      alert('A riasztás flottája hiányzik.');
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
      console.log("new newFleet", newFleet);
      this.fleets.push(newFleet)
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

  getUsersForFleet(id: number): User[] {
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

  createManufacturer(): void {
    if (this.manufacturerForm.invalid) {
      this.manufacturerForm.markAllAsTouched();
      return;
    }
    this.adminService.createManufacturer(this.manufacturerForm.value).subscribe(newManufacturer => {
      this.manufacturers.push(newManufacturer)
      this.manufacturerForm.reset({ name: ''});
    });
  }

  onSaveManufacturer(manufacturer: Manufacturer): void {
    this.loadingManufacturers = true;
    this.adminService.createManufacturer(manufacturer).subscribe({
      next: () => {
        this.selectedManufacturer = null;
        this.loadManufacturers();
      },
      error: () => {
        alert('Manufacturer save failed. Please check the data and try again.');
        this.loadingManufacturers = false;
      }
    });
  }

  selectInterface(inetrface: Interface): void {
    this.selectedInterface = { ...inetrface };
  }

  createInterface(): void {
    this.selectedInterface = {
      id: 0,
      name: '',
      interfaceFields: [],
      manufacturerId: this.manufacturers[0]?.id ?? 0,
    };
  }

  onSaveInterface(interfaceModel: Interface): void {
    this.loadingInterfaces = true;
    this.interfaceService.saveInterface(interfaceModel).subscribe({
      next: () => {
        this.selectedInterface = null;
        this.loadInterfaces();
      },
      error: () => {
        alert('Interface save failed. Please check the data and try again.');
        this.loadingInterfaces = false;
      }
    });
  }

  onDeleteInterface(id: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (confirm('Biztos törlöd az interface-t?')) {
      this.interfaceService.deleteInterface(id).subscribe(() => {
        this.selectedInterface = null;
        this.loadInterfaces();
      });
    }
  }
  //MODULE
    selectModule(module: Module): void {
    this.selectedModule = { ...module };
  }

  createModule(): void {
    this.selectedModule = {
      id: 0,
      hardwareId: '',
      interfaceId: 0,
      manufacturerId: this.manufacturers[0]?.id ?? 0,
      vehicleId: 0,
    };
  }

  onSaveModule(module: Module): void {
    this.loadingModules = true;
    this.moduleService.saveModule(module).subscribe({
      next: () => {
        this.selectedModule = null;
        this.loadModules();
      },
      error: () => {
        alert('Module save failed. Please check the data and try again.');
        this.loadingModules = false;
      }
    });
  }

  onDeleteModule(id: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (confirm('Biztos törlöd a járművet?')) {
      this.moduleService.deleteModule(id).subscribe(() => {
        this.selectedModule = null;
        this.loadModules();
      });
    }
  }

  get filteredFleets(): Fleet[] {
    const term = this.fleetSearch.toLowerCase();
    const filtered = this.fleets.filter(f =>
      !term ||
      f.name.toLowerCase().includes(term)
    );
    return this.limitList(filtered, this.showAllFleets ? undefined : 4);
  }

  get filteredUsers(): User[] {
    const term = this.userSearch.toLowerCase();
    const filtered = this.users
      .filter(u => !term || u.name.toLowerCase().includes(term))
      .filter(u => this.userRoleFilter === 'all' || u.role === this.userRoleFilter)
      ;
    return this.limitList(filtered, this.showAllUsers ? undefined : 6);
  }

  deleteUser(user: User, event?: Event): void {
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
      .filter(a => !term || a.interfaceFields.map(f => f.toLowerCase()).includes(term) || String(a.id).includes(term) || String(a.name).toLowerCase().includes(term) || String(a.manufacturerId).includes(term));
    return this.limitList(filtered, this.showAllInterfaces ? undefined : 5);
  }

  get filteredModules(): Module[] {
    const term = this.moduleSearch.toLowerCase();
    const filtered = this.modules
      .filter(a => !term || a.hardwareId.toLowerCase().includes(term) || String(a.id).includes(term) || String(a.vehicleId).includes(term)
        || String(a.interfaceId).includes(term) || String(a.manufacturerId).includes(term));
    return this.limitList(filtered, this.showAllAlarms ? undefined : 5);
  }

  get filteredManufacturers(): Manufacturer[] {
    const term = this.manufacturerSearch.toLowerCase();
    const filtered = this.manufacturers
      .filter(a => !term || a.name.toLowerCase().includes(term) || String(a.id).includes(term));
    return this.limitList(filtered, this.showAllManufacturers ? undefined : 5);
  }

  getAlarmEntries(alarm: Alarm): Array<{ key: string; value: string }> {
    try {
      const parsed = JSON.parse(alarm.alarmJson);
      if (parsed && typeof parsed === 'object') {
        return Object.entries(parsed).map(([key, value]) => ({
          key,
          value: this.stringifyEntryValue(value)
        }));
      }
    } catch {
      // keep fallback below
    }
    return [{ key: 'payload', value: alarm.alarmJson }];
  }

  private stringifyEntryValue(value: any): string {
    if (value && typeof value === 'object' && 'operator' in value) {
      const symbol = this.operatorSymbol((value as any).operator);
      const val = (value as any).value;
      const displayValue = typeof val === 'object' ? JSON.stringify(val) : String(val);
      return [symbol, displayValue].filter(Boolean).join(' ');
    }
    return typeof value === 'object' ? JSON.stringify(value) : String(value);
  }

  private operatorSymbol(raw: any): string {
    const upper = String(raw || '').toUpperCase();
    if (upper === 'GT') return '>';
    if (upper === 'LT') return '<';
    if (upper === 'EQ') return '=';
    return '';
  }

  get alarmOperators(): User[] {
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
