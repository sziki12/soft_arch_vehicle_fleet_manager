using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using SoftArchVehicleFleetManager.Data;
using SoftArchVehicleFleetManager.Dtos.Alarms;
using SoftArchVehicleFleetManager.Dtos.Manufacturers;
using SoftArchVehicleFleetManager.Models;

namespace SoftArchVehicleFleetManager.Controllers
{
    [ApiController]
    [Route("api/alarms")]
    public class AlarmsController : ControllerBase
    {
        private readonly FleetDbContext _db;
        public AlarmsController(FleetDbContext db) => _db = db;


        [HttpGet]
        public async Task<ActionResult<IEnumerable<AlarmDto>>> Get([FromQuery(Name = "fleet_id")] int? fleetId)
        {
            if (fleetId is not null)
            {
                var fleetAlarms = await _db.Fleets
                                      .Where(f => f.Id == fleetId)
                                      .SelectMany(f => f.Alarms)
                                      .ToListAsync();

                return Ok(fleetAlarms.Select(a => new AlarmDto(
                        a.Id,
                        a.AlarmJSON,
                        a.FleetId,
                        a.InterfaceId)));
            }

            var alarms = await _db.Alarms
                                .AsNoTracking()
                                .Select(a => new AlarmDto(
                                    a.Id,
                                    a.AlarmJSON,
                                    a.FleetId,
                                    a.InterfaceId
                                ))
                                .ToListAsync();

            return Ok(alarms);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<AlarmDto>> GetOne(int id)
        {
            var alarm = await _db.Alarms.FindAsync(id);
            return alarm is null
                ? NotFound()
                : new AlarmDto(
                    alarm.Id,
                    alarm.AlarmJSON,
                    alarm.FleetId,
                    alarm.InterfaceId
                );
        }

        [HttpPost]
        public async Task<ActionResult<AlarmDto>> Create(AlarmCreateDto createDto)
        {
            if (!await _db.Fleets.AsNoTracking().AnyAsync(f => f.Id == createDto.fleetId))
                return BadRequest(new { error = "Invalid FleetId." });

            if (!await _db.Interfaces.AsNoTracking().AnyAsync(i => i.Id == createDto.interfaceId))
                return BadRequest(new { error = "Invalid InterfaceId." });

            var alarm = new Alarm
            {
                AlarmJSON = createDto.alarmJson,
                FleetId = createDto.fleetId,
                InterfaceId = createDto.interfaceId
            };

            await _db.Alarms.AddAsync(alarm);
            await _db.SaveChangesAsync();

            var result = new AlarmDto(
                    alarm.Id,
                    alarm.AlarmJSON,
                    alarm.FleetId,
                    alarm.InterfaceId
                );
            return CreatedAtAction(nameof(GetOne), new { id = alarm.Id }, result);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, AlarmUpdateDto updateDto)
        {
            var alarm = await _db.Alarms.FindAsync(id);
            if (alarm is null) return NotFound();

            if (updateDto.fleetId is not null)
            {
                if (!await _db.Fleets.AsNoTracking().AnyAsync(f => f.Id == updateDto.fleetId))
                    return BadRequest(new { error = "Invalid FleetId." });

                alarm.FleetId = (int)updateDto.fleetId;
            }

            if (updateDto.interfaceId is not null)
            {
                if (!await _db.Interfaces.AsNoTracking().AnyAsync(i => i.Id == updateDto.interfaceId))
                    return BadRequest(new { error = "Invalid InterfaceId." });

                alarm.InterfaceId = (int)updateDto.interfaceId;
            }

            if (updateDto.alarmJson is not null)
            {
                alarm.AlarmJSON = updateDto.alarmJson;
            }

            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var manufacturer = await _db.Manufacturers.FindAsync(id);
            if (manufacturer is null) return NotFound();

            _db.Manufacturers.Remove(manufacturer);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}