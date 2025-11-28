import { Injectable } from "@angular/core";
import { Module } from "../models/module.model";
import { Interface } from "../models/interface.model";
import { Vehicle } from "../models/vehicle.model";
import { Fleet } from "../models/fleet.model";
import { Alarm } from "../models/alarm.model";

@Injectable({
  providedIn: 'root'
})
export class DtoMappereService {
    constructor() {}

    public transformArray<T>(array: any[], transformFn: (dto: any) => T): T[] {
        return array.map(item => transformFn(item));
    }

    //To DTO Mappers
    public moduleToDto(module: Module): any
    {
        return {
            MODULE_ID: (module.id > 0) ? module.id : null,
            HWID: module.hardwareId,
            INTERFACE_ID: module.interfaceId,
            MANUFACTURER_ID: module.manufacturerId,
            VEHICLE_ID: (module.vehicleId > 0) ? module.vehicleId : null
        };
    }

    public interfaceToDto(interfaceModel: Interface): any
    {
        return {
            INTERFACE_ID: (interfaceModel.id > 0) ? interfaceModel.id : null,
            INTERFACE_NAME: interfaceModel.name,
            INTERFACE_JSON: interfaceModel.interfaceJson,
            MANUFACTURER_ID: interfaceModel.manufacturerId
        };
    }

    public vehicleToDto(vehilce: Vehicle): any
    {
        return {
            VEHICLE_ID: (vehilce.id > 0) ? vehilce.id : null,
            VEHICLE_NAME: vehilce.name,
            VEHICLE_LICENSE_PLATE: vehilce.licansePlate,
            VEHICLE_MODEL: vehilce.model,
            VEHICLE_YEAR: vehilce.year,
            FLEET_ID: vehilce.fleetId
        };
    }

    public fleetToDto(fleet: Fleet): any
    {
        return {
            FLEET_ID: (fleet.id > 0) ? fleet.id : null,
            FLEET_NAME: fleet.name
        };
    }

    public alarmToDto(alarm: Alarm): any
    {
        return {
            ALARM_ID: (alarm.id > 0) ? alarm.id : null,
            ALARM_JSON: alarm.alarmJson,
            ALARM_FLEET: alarm.fleetId,
            ALARM_INTERFACE: alarm.interfaceId
        };
    }

    //From DTO Mappers
    public dtoToModule(dto: any): Module
    {
        return {
            id: dto.MODULE_ID,
            hardwareId: dto.HWID,
            interfaceId: dto.INTERFACE_ID,
            manufacturerId: dto.MANUFACTURER_ID,
            vehicleId: dto.VEHICLE_ID
        };
    }

    public dtoToInterface(dto: any): Interface
    {
        return {
            id: dto.INTERFACE_ID,
            name: dto.INTERFACE_NAME,
            interfaceJson: dto.INTERFACE_JSON,
            manufacturerId: dto.MANUFACTURER_ID
        };
    }

    public dtoToVehicle(dto: any): Vehicle
    {
        return {
            id: dto.VEHICLE_ID,
            name: dto.VEHICLE_NAME,
            licansePlate: dto.VEHICLE_LICENSE_PLATE,
            model: dto.VEHICLE_MODEL,
            year: dto.VEHICLE_YEAR,
            fleetId: dto.FLEET_ID
        };
    }
    public dtoToFleet(dto: any): Fleet
    {
        return {
            id: dto.FLEET_ID,
            name: dto.FLEET_NAME
        };
    }
    public dtoToAlarm(dto: any): Alarm
    {
        return {
            id: dto.ALARM_ID,
            alarmJson: dto.ALARM_JSON,
            fleetId: dto.ALARM_FLEET,
            interfaceId: dto.ALARM_INTERFACE
        };
    }
}