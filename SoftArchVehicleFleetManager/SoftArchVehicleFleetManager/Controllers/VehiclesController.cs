using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using SoftArchVehicleFleetManager.Data;
using SoftArchVehicleFleetManager.Dtos.Alarms;
using SoftArchVehicleFleetManager.Dtos.Vehicles;
using SoftArchVehicleFleetManager.Models;

namespace SoftArchVehicleFleetManager.Controllers
{
    [ApiController]
    [Route("api/vehicles")]
    [Authorize]
    public class VehiclesController : ControllerBase
    {
        private readonly FleetDbContext _db;
        public VehiclesController(FleetDbContext db) => _db = db;


        [HttpGet]
        public async Task<ActionResult<IEnumerable<VehicleDto>>> Get([FromQuery(Name = "fleet_id")] int? fleetId)
        {
            if (fleetId is not null)
            {
                var fleetVehicles = await _db.Fleets
                      .Where(f => f.Id == fleetId)
                      .SelectMany(f => f.Vehicles)
                      .ToListAsync();

                return Ok(fleetVehicles.Select(v => new VehicleDto(
                    v.Id,
                    v.Name,
                    v.LicensePlate,
                    v.Model,
                    v.Year,
                    v.FleetId
                )));
            }

            var vehicles = await _db.Vehicles
                .AsNoTracking()
                .Select(v => new VehicleDto(
                    v.Id,
                    v.Name,
                    v.LicensePlate,
                    v.Model,
                    v.Year,
                    v.FleetId
                ))
                .ToListAsync();

            return Ok(vehicles);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<VehicleDto>> GetOne(int id)
        {
            var vehicle = await _db.Vehicles.FindAsync(id);
            return vehicle is null
                ? NotFound()
                : new VehicleDto(
                    vehicle.Id,
                    vehicle.Name,
                    vehicle.LicensePlate,
                    vehicle.Model,
                    vehicle.Year,
                    vehicle.FleetId
                );
        }

        [HttpPost]
        public async Task<ActionResult<VehicleDto>> Create(VehicleCreateDto createDto)
        {
            // Validate foreign keys
            if (!await _db.Fleets.AsNoTracking().AnyAsync(m => m.Id == createDto.FleetId))
                return BadRequest(new { error = "Invalid FleetId." });

            var vehicle = new Vehicle
            {
                Name = createDto.Name,
                LicensePlate = createDto.LicensePlate,
                Model = createDto.Model,
                Year = createDto.Year,
                FleetId = createDto.FleetId
            };

            await _db.Vehicles.AddAsync(vehicle);
            await _db.SaveChangesAsync();

            var result = new VehicleDto(
                    vehicle.Id,
                    vehicle.Name,
                    vehicle.LicensePlate,
                    vehicle.Model,
                    vehicle.Year,
                    vehicle.FleetId
                );
            return CreatedAtAction(nameof(GetOne), new { id = vehicle.Id }, result);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, VehicleUpdateDto updateDto)
        {
            var vehicle = await _db.Vehicles.FindAsync(id);
            if (vehicle is null) return NotFound();

            if (updateDto.Name is not null)
            {
                vehicle.Name = updateDto.Name;
            }

            if (updateDto.LicensePlate is not null)
            {
                vehicle.LicensePlate = updateDto.LicensePlate;
            }

            if (updateDto.Model is not null)
            {
                vehicle.Model = updateDto.Model;
            }

            if (updateDto.Year is not null)
            {
                vehicle.Year = (int)updateDto.Year;
            }

            if (updateDto.FleetId is not null)
            {
                if (!await _db.Fleets.AsNoTracking().AnyAsync(f => f.Id == updateDto.FleetId))
                    return BadRequest(new { error = "Invalid FleetId." });

                vehicle.FleetId = (int)updateDto.FleetId;
            }

            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var vehicle = await _db.Vehicles.FindAsync(id);
            if (vehicle is null) return NotFound();

            _db.Vehicles.Remove(vehicle);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}