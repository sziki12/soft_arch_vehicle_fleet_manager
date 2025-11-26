using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using SoftArchVehicleFleetManager.Data;
using SoftArchVehicleFleetManager.Dtos.Fleets;
using SoftArchVehicleFleetManager.Models;

namespace SoftArchVehicleFleetManager.Controllers
{
    [ApiController]
    [Route("api/fleets")]
    [Authorize]
    public class FleetsController : ControllerBase
    {
        private readonly FleetDbContext _db;
        public FleetsController(FleetDbContext db) => _db = db;


        [HttpGet]
        public async Task<ActionResult<IEnumerable<FleetDto>>> GetAll()
        {
            var fleets = await _db.Fleets
                .AsNoTracking()
                .Select(f => new FleetDto(
                    f.Id,
                    f.Name
                ))
                .ToListAsync();

            return Ok(fleets);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<FleetDto>> GetOne(int id)
        {
            var manufacturer = await _db.Fleets.FindAsync(id);
            return manufacturer is null
                ? NotFound()
                : new FleetDto(
                    manufacturer.Id,
                    manufacturer.Name
                );
        }

        [HttpPost]
        public async Task<ActionResult<FleetDto>> Create(FleetCreateDto createDto)
        {
            var fleet = new Fleet
            {
                Name = createDto.Name
            };

            await _db.Fleets.AddAsync(fleet);
            await _db.SaveChangesAsync();

            var result = new FleetDto(fleet.Id, fleet.Name);
            return CreatedAtAction(nameof(GetOne), new { id = fleet.Id }, result);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, FleetUpdateDto updateDto)
        {
            var fleet = await _db.Fleets.FindAsync(id);
            if (fleet is null) return NotFound();

            fleet.Name = updateDto.Name;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var fleet = await _db.Fleets.FindAsync(id);
            if (fleet is null) return NotFound();

            _db.Fleets.Remove(fleet);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}