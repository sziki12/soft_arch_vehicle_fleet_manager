using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using SoftArchVehicleFleetManager.Data;
using SoftArchVehicleFleetManager.Dtos.Interfaces;
using SoftArchVehicleFleetManager.Models;

namespace SoftArchVehicleFleetManager.Controllers
{
    [ApiController]
    [Route("api/interfaces")]
    public class InterfacesController : ControllerBase
    {
        private readonly FleetDbContext _db;
        public InterfacesController(FleetDbContext db) => _db = db;


        [HttpGet]
        public async Task<ActionResult<IEnumerable<InterfaceDto>>> GetAll()
        {
            var interfaces = await _db.Interfaces
                .AsNoTracking()
                .Select(i => new InterfaceDto(
                    i.Id,
                    i.Name,
                    i.InterfaceJSON,
                    i.ManufacturerId
                ))
                .ToListAsync();

            return Ok(interfaces);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<InterfaceDto>> GetOne(int id)
        {
            var interface_ = await _db.Interfaces.FindAsync(id);
            return interface_ is null
                ? NotFound()
                : new InterfaceDto(
                    interface_.Id,
                    interface_.Name,
                    interface_.InterfaceJSON,
                    interface_.ManufacturerId
                );
        }

        [HttpPost]
        public async Task<ActionResult<InterfaceDto>> Create(InterfaceCreateDto createDto)
        {
            // Validate foreign keys
            if (!await _db.Manufacturers.AsNoTracking().AnyAsync(m => m.Id == createDto.ManufacturerId))
                return BadRequest(new { error = "Invalid ManufacturerId." });

            var interface_ = new Interface
            {
                Name = createDto.Name,
                InterfaceJSON = createDto.InterfaceJSON,
                ManufacturerId = createDto.ManufacturerId
            };

            await _db.Interfaces.AddAsync(interface_);
            await _db.SaveChangesAsync();

            var result = new InterfaceDto(
                    interface_.Id,
                    interface_.Name,
                    interface_.InterfaceJSON,
                    interface_.ManufacturerId
                );
            return CreatedAtAction(nameof(GetOne), new
            {
                id = interface_.Id
            }, result);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, InterfaceUpdateDto updateDto)
        {
            var interface_ = await _db.Interfaces.FindAsync(id);
            if (interface_ is null) return NotFound();

            if (updateDto.Name is not null)
            {
                interface_.Name = updateDto.Name;
            }

            if (updateDto.InterfaceJSON is not null)
            {
                interface_.InterfaceJSON = updateDto.InterfaceJSON;
            }

            if (updateDto.ManufacturerId is not null)
            {
                if (!await _db.Fleets.AsNoTracking().AnyAsync(f => f.Id == updateDto.ManufacturerId))
                    return BadRequest(new { error = "Invalid ManufacturerId." });

                interface_.ManufacturerId = (int)updateDto.ManufacturerId;
            }

            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var interface_ = await _db.Interfaces.FindAsync(id);
            if (interface_ is null) return NotFound();

            _db.Interfaces.Remove(interface_);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}