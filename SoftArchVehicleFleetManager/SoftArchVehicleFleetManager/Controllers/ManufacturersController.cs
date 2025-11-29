using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoftArchVehicleFleetManager.Dtos.Manufacturers;
using SoftArchVehicleFleetManager.Services;

namespace SoftArchVehicleFleetManager.Controllers
{
    [ApiController]
    [Route("api/manufacturers")]
    [Authorize]
    public class ManufacturersController : ControllerBase
    {
        private readonly ManufacturersService _manufacturersService;

        public ManufacturersController(ManufacturersService manufacturersService)
        {
            _manufacturersService = manufacturersService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ManufacturerDto>>> GetAll()
        {
            var manufacturers = await _manufacturersService.GetAllAsync();
            return Ok(manufacturers);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ManufacturerDto>> GetOne(int id)
        {
            var manufacturer = await _manufacturersService.GetOneAsync(id);
            if (manufacturer is null) return NotFound();
            return Ok(manufacturer);
        }

        [HttpPost]
        public async Task<ActionResult<ManufacturerDto>> Create(ManufacturerCreateDto createDto)
        {
            var result = await _manufacturersService.CreateAsync(createDto);
            return CreatedAtAction(nameof(GetOne), new { id = result.Id }, result);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, ManufacturerUpdateDto updateDto)
        {
            var updated = await _manufacturersService.UpdateAsync(id, updateDto);
            if (!updated) return NotFound();

            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _manufacturersService.DeleteAsync(id);
            if (!deleted) return NotFound();

            return NoContent();
        }
    }
}