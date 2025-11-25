using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using SoftArchVehicleFleetManager.Data;
using SoftArchVehicleFleetManager.Dtos.Manufacturers;
using SoftArchVehicleFleetManager.Models;

namespace SoftArchVehicleFleetManager.Controllers
{
    [ApiController]
    [Route("api/manufacturers")]
    [Authorize]
    public class ManufacturersController : ControllerBase
    {
        private readonly FleetDbContext _db;
        public ManufacturersController(FleetDbContext db) => _db = db;


        [HttpGet]
        public async Task<ActionResult<IEnumerable<ManufacturerDto>>> GetAll()
        {
            var manufacturers = await _db.Manufacturers
                .AsNoTracking()
                .Select(m => new ManufacturerDto(
                    m.Id,
                    m.Name
                ))
                .ToListAsync();

            return Ok(manufacturers);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ManufacturerDto>> GetOne(int id)
        {
            var manufacturer = await _db.Manufacturers.FindAsync(id);
            return manufacturer is null
                ? NotFound()
                : new ManufacturerDto(
                    manufacturer.Id,
                    manufacturer.Name
                );
        }

        [HttpPost]
        public async Task<ActionResult<ManufacturerDto>> Create(ManufacturerCreateDto createDto)
        {
            var manufacturer = new Manufacturer
            {
                Name = createDto.Name
            };

            await _db.Manufacturers.AddAsync(manufacturer);
            await _db.SaveChangesAsync();

            var result = new ManufacturerDto(manufacturer.Id, manufacturer.Name);
            return CreatedAtAction(nameof(GetOne), new { id = manufacturer.Id }, result);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, ManufacturerUpdateDto updateDto)
        {
            var manufacturer = await _db.Manufacturers.FindAsync(id);
            if (manufacturer is null) return NotFound();

            manufacturer.Name = updateDto.Name;

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