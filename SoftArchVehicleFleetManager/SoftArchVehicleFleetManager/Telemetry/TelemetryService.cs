using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SoftArchVehicleFleetManager.Data;
using SoftArchVehicleFleetManager.Dtos.Telemetry;
using SoftArchVehicleFleetManager.Models;
using System.Collections.Concurrent;
using System.Text.Json;
using System.Text.Json.Nodes;
using TelemetryServiceLib;

namespace SoftArchVehicleFleetManager.Telemetry
{
    public class TelemetryService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        ConcurrentDictionary<string, FleetTelemetryService> _fleetTelemetryServices =
            new ConcurrentDictionary<string, FleetTelemetryService>();

        public TelemetryService(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        public async Task InitTelemetryService()
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<FleetDbContext>();

            // load fleets
            var fleets = await db.Fleets
                .Include(f => f.Vehicles)
                    .ThenInclude(v => v.Modules)
                        .ThenInclude(m => m.Manufacturer)
                .AsNoTracking()
                .ToListAsync();

            // get manufacturers and hardwares
            foreach (var fleet in fleets)
            {
                var manufacturers = new HashSet<string>();
                var hardwares = new HashSet<string>();

                if (fleet.Vehicles is not null)
                {
                    foreach (var vehicle in fleet.Vehicles)
                    {
                        if (vehicle.Modules is null) continue;

                        foreach (var module in vehicle.Modules)
                        {
                            if (!string.IsNullOrWhiteSpace(module.Manufacturer.Name))
                                manufacturers.Add(module.Manufacturer.Name);

                            if (!string.IsNullOrWhiteSpace(module.HardwareId))
                                hardwares.Add(module.HardwareId);
                        }
                    }
                }

                // add new mqtt service for fleet
                var fleetTelemetryService = new FleetTelemetryService(fleet.Name);
                if (manufacturers.Count > 0 && hardwares.Count > 0)
                {
                    fleetTelemetryService.AddModulTelemetrySubscripition(manufacturers.ToList(), hardwares.ToList());
                }
                _fleetTelemetryServices.TryAdd(fleet.Name, fleetTelemetryService);
            }

            await ConfigureServiceAlarms();
        }

        public async Task<TelemetryReportDto> GetVehiceleReport(int vehicleId)
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<FleetDbContext>();

            // retrieve vehicle
            var vehicle = await db.Vehicles
                .AsNoTracking()
                .FirstOrDefaultAsync(v => v.Id == vehicleId);
            if (vehicle == null)
            {
                return new TelemetryReportDto($"Vehicle with ID {vehicleId} not found.", "");
            }

            // retrieve fleet
            var fleet = await db.Fleets
                .AsNoTracking()
                .FirstOrDefaultAsync(f => f.Id == vehicle.FleetId);
            if (fleet == null)
            {
                return new TelemetryReportDto($"Fleet for Vehicle ID {vehicleId} not found.", "");
            }

            // retrieve modules
            var modules = await db.Modules
               .AsNoTracking()
               .Where(m => m.VehicleId == vehicleId)
               .ToListAsync();
            if (modules == null || modules.Count == 0)
            {
                return new TelemetryReportDto($"No modules found for Vehicle ID {vehicleId}.", "");
            }

            // get telemetry data from fleet telemetry service
            Dictionary<string, string> telemetryReports = new Dictionary<string, string>();
            if (_fleetTelemetryServices.TryGetValue(fleet.Name, out var fleetTelemetryService))
            {
                foreach (var module in modules)
                {
                    var telemetry = fleetTelemetryService.GetModuleTelemetry(module.HardwareId);
                    if (!string.IsNullOrEmpty(telemetry)) 
                    {
                        telemetryReports.Add(module.HardwareId, telemetry);
                    }
                }
            }
            else
            {
                return new TelemetryReportDto($"No mqtt service found for Fleet {fleet.Name}.", "");
            }
            if (telemetryReports.Count == 0)
            {
                return new TelemetryReportDto($"No mqtt data arrived yet for Vehicle ID {vehicleId}.", "");
            }

            // construct JSON result
            var root = new JsonObject();
            foreach (var kv in telemetryReports)
            {
                root[kv.Key] = kv.Value;
            }
            return new TelemetryReportDto(
                $"Telemetry report for Vehicle ID {vehicleId} retrieved successfully.",
                root.ToJsonString(new JsonSerializerOptions { WriteIndented = true })
            );
        }

        public async Task ConfigureServiceAlarms() {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<FleetDbContext>();

            // load alarms
            var alarms = await db.Alarms
                .Include(a => a.Interface)
                    .ThenInclude(i => i.Manufacturer)
                .Include(a => a.Fleet)        
                .AsNoTracking()
                .ToListAsync();

            // add alarms to fleet telemetry service
            foreach (var alarm in alarms) {
                var fleetName = alarm.Fleet.Name;
                var manufacturerName = alarm.Interface.Manufacturer.Name;

                if (_fleetTelemetryServices.TryGetValue(fleetName, out var fleetTelemetryService))
                {
                    fleetTelemetryService.AddModuleAlarmConstraint(alarm.Id.ToString(), manufacturerName, alarm.AlarmJSON);
                }
                else
                {
                    throw new Exception($"No mqtt service found for Fleet {fleetName}.");
                }

            }
        }    
        
        public async Task<TelemetryAlarmDto> GetFleetVehiclesUnderAlarm(int fleetId)
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<FleetDbContext>();

            // retrieve fleet
            var fleet = await db.Fleets
                .AsNoTracking()
                .FirstOrDefaultAsync(f => f.Id == fleetId);

            if (fleet == null) 
            {
                return new TelemetryAlarmDto($"There is no fleet with Id: {fleetId}", "");
            }

            return new TelemetryAlarmDto("", "");
        }
    }
}
