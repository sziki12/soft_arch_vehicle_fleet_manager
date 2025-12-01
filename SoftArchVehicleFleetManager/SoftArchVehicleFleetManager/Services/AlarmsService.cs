using Microsoft.EntityFrameworkCore;
using SoftArchVehicleFleetManager.Data;
using SoftArchVehicleFleetManager.Dtos.Alarms;
using SoftArchVehicleFleetManager.Dtos.Vehicles;
using SoftArchVehicleFleetManager.Models;
using SoftArchVehicleFleetManager.Telemetry;

namespace SoftArchVehicleFleetManager.Services
{
    public enum AlarmUpdateResult
    {
        Success,
        NotFound,
        InvalidFleetId,
        InvalidInterfaceId
    }

    public enum AlarmCreateResult
    {
        Success,
        InvalidFleetId,
        InvalidInterfaceId
    }

    public class AlarmsService
    {
        private readonly FleetDbContext _db;
        private readonly UsersService _usersService;
        private readonly TelemetryService _telemetryService;

        public AlarmsService(FleetDbContext db, UsersService usersService, TelemetryService telemetryService)
        {
            _db = db;
            _usersService = usersService;
            _telemetryService = telemetryService;
        }

        public async Task<List<AlarmDto>> GetAsync(int? fleetId = null)
        {
            if (fleetId is not null)
            {
                var fleetAlarms = await _db.Fleets
                    .Where(f => f.Id == fleetId)
                    .SelectMany(f => f.Alarms)
                    .ToListAsync();

                return fleetAlarms
                    .Select(a => new AlarmDto(
                        a.Id,
                        a.AlarmJSON,
                        a.FleetId,
                        a.InterfaceId))
                    .ToList();
            }

            return await _db.Alarms
                .AsNoTracking()
                .Select(a => new AlarmDto(
                    a.Id,
                    a.AlarmJSON,
                    a.FleetId,
                    a.InterfaceId))
                .ToListAsync();
        }

        public async Task<AlarmDto?> GetOneAsync(int id)
        {
            var alarm = await _db.Alarms.AsNoTracking().FirstOrDefaultAsync(a => a.Id == id);
            if (alarm is null) return null;

            return new AlarmDto(
                alarm.Id,
                alarm.AlarmJSON,
                alarm.FleetId,
                alarm.InterfaceId
            );
        }
        public async Task<List<AlarmDto>> GetAllByUserIdAsync(int userId)
        {
            var user = await _usersService.GetOneAsync(userId);
            if (user is null)
                return [];
            if (user.Role == Enums.UserRole.FleetOperator && user.FleetId != null)
            {
                var alarms = await GetAsync(user.FleetId);
                var resultAlarms = alarms.Where(m => m.fleetId == user.FleetId.Value).ToList();
                return resultAlarms;
            }
            else
            {
                return await GetAsync(null);
            }
        }

        public async Task<(AlarmCreateResult Result, AlarmDto? Alarm)> CreateAsync(AlarmCreateDto createDto)
        {
            if (!await _db.Fleets.AsNoTracking().AnyAsync(f => f.Id == createDto.fleetId))
                return (AlarmCreateResult.InvalidFleetId, null);

            if (!await _db.Interfaces.AsNoTracking().AnyAsync(i => i.Id == createDto.interfaceId))
                return (AlarmCreateResult.InvalidInterfaceId, null);

            var alarm = new Alarm
            {
                AlarmJSON = createDto.alarmJson,
                FleetId = createDto.fleetId,
                InterfaceId = createDto.interfaceId
            };

            await _telemetryService.ConfigureServiceForAlarm(alarm);

            await _db.Alarms.AddAsync(alarm);
            await _db.SaveChangesAsync();

            var dto = new AlarmDto(
                alarm.Id,
                alarm.AlarmJSON,
                alarm.FleetId,
                alarm.InterfaceId
            );

            return (AlarmCreateResult.Success, dto);
        }

        public async Task<AlarmUpdateResult> UpdateAsync(int id, AlarmUpdateDto updateDto)
        {
            var alarm = await _db.Alarms.FindAsync(id);
            if (alarm is null) return AlarmUpdateResult.NotFound;

            if (updateDto.fleetId is not null)
            {
                var fid = updateDto.fleetId.Value;
                if (!await _db.Fleets.AsNoTracking().AnyAsync(f => f.Id == fid))
                    return AlarmUpdateResult.InvalidFleetId;

                alarm.FleetId = fid;
            }

            if (updateDto.interfaceId is not null)
            {
                var iid = updateDto.interfaceId.Value;
                if (!await _db.Interfaces.AsNoTracking().AnyAsync(i => i.Id == iid))
                    return AlarmUpdateResult.InvalidInterfaceId;

                alarm.InterfaceId = iid;
            }

            if (updateDto.alarmJson is not null)
            {
                alarm.AlarmJSON = updateDto.alarmJson;
            }

            await _db.SaveChangesAsync();
            return AlarmUpdateResult.Success;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var alarm = await _db.Alarms.FindAsync(id);
            if (alarm is null) return false;

            _db.Alarms.Remove(alarm);
            await _db.SaveChangesAsync();

            return true;
        }
    }
}