using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using SoftArchVehicleFleetManager.Data;
using SoftArchVehicleFleetManager.Dtos.Modules;
using SoftArchVehicleFleetManager.Models;

namespace SoftArchVehicleFleetManager.Controllers
{
    [ApiController]
    [Route("api/modules")]
    public class ModulesController : ControllerBase
    {
        private readonly FleetDbContext _db;
        public ModulesController(FleetDbContext db) => _db = db;


        [HttpGet]
        public async Task<ActionResult<IEnumerable<ModuleDto>>> GetAll()
        {
            var modules = await _db.Modules
                .AsNoTracking()
                .Select(m => new ModuleDto(
                    m.Id,
                    m.HardwareId,
                    m.ManufacturerId,
                    m.InterfaceId,
                    m.VehicleId
                ))
                .ToListAsync();

            return Ok(modules);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ModuleDto>> GetOne(int id)
        {
            var module = await _db.Modules.FindAsync(id);
            return module is null
                ? NotFound()
                : new ModuleDto(
                    module.Id,
                    module.HardwareId,
                    module.ManufacturerId,
                    module.InterfaceId,
                    module.VehicleId
                );
        }

        [HttpPost]
        public async Task<ActionResult<ModuleDto>> Create(ModuleCreateDto createDto)
        {
            // Validate foreign keys
            if (!await _db.Manufacturers.AsNoTracking().AnyAsync(m => m.Id == createDto.ManufacturerId))
                return BadRequest(new { error = "Invalid ManufacturerId." });

            if (!await _db.Interfaces.AsNoTracking().AnyAsync(i => i.Id == createDto.InterfaceId))
                return BadRequest(new { error = "Invalid InterfaceId." });

            if (!await _db.Vehicles.AsNoTracking().AnyAsync(v => v.Id == createDto.VehicleId))
                return BadRequest(new { error = "Invalid VehicleId." });

            var module = new Module
            {
                HardwareId = createDto.HardwareId,
                ManufacturerId = createDto.ManufacturerId,
                InterfaceId = createDto.InterfaceId,
                VehicleId = createDto.VehicleId
            };

            await _db.Modules.AddAsync(module);
            await _db.SaveChangesAsync();

            var result = new ModuleDto(
                    module.Id,
                    module.HardwareId,
                    module.ManufacturerId,
                    module.InterfaceId,
                    module.VehicleId
                );
            return CreatedAtAction(nameof(GetOne), new
            {
                id = result.Id
            }, result);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, ModuleUpdateDto updateDto)
        {
            var module = await _db.Modules.FindAsync(id);
            if (module is null) return NotFound();

            if (updateDto.HardwareId is not null)
            {
                module.HardwareId = updateDto.HardwareId;
            }

            if (updateDto.ManufacturerId is not null)
            {
                if (!await _db.Manufacturers.AsNoTracking().AnyAsync(m => m.Id == updateDto.ManufacturerId))
                    return BadRequest(new { error = "Invalid ManufacturerId." });

                module.ManufacturerId = (int)updateDto.ManufacturerId;
            }

            if (updateDto.VehicleId is not null)
            {
                if (!await _db.Vehicles.AsNoTracking().AnyAsync(v => v.Id == updateDto.VehicleId))
                    return BadRequest(new { error = "Invalid VehicleId." });

                module.VehicleId = (int)updateDto.VehicleId;
            }

            if (updateDto.InterfaceId is not null)
            {
                if (!await _db.Interfaces.AsNoTracking().AnyAsync(i => i.Id == updateDto.InterfaceId))
                    return BadRequest(new { error = "Invalid InterfaceId." });

                module.InterfaceId = (int)updateDto.InterfaceId;
            }

            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var module = await _db.Modules.FindAsync(id);
            if (module is null) return NotFound();

            _db.Modules.Remove(module);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}