using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoftArchVehicleFleetManager.Dtos.Fleets;
using SoftArchVehicleFleetManager.Services;

namespace SoftArchVehicleFleetManager.Controllers
{
    [ApiController]
    [Route("api/fleets")]
    [Authorize]
    public class FleetsController : ControllerBase
    {
        private readonly FleetsService _fleetsService;

        public FleetsController(FleetsService fleetsService)
        {
            _fleetsService = fleetsService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<FleetDto>>> GetAll()
        {
            var fleets = await _fleetsService.GetAllAsync();
            return Ok(fleets);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<FleetDto>> GetOne(int id)
        {
            var fleet = await _fleetsService.GetOneAsync(id);
            if (fleet is null) return NotFound();
            return Ok(fleet);
        }

        [HttpPost]
        public async Task<ActionResult<FleetDto>> Create(FleetCreateDto createDto)
        {
            var result = await _fleetsService.CreateAsync(createDto);
            return CreatedAtAction(nameof(GetOne), new { id = result.Id }, result);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, FleetUpdateDto updateDto)
        {
            var result = await _fleetsService.UpdateAsync(id, updateDto);

            return result switch
            {
                FleetUpdateResult.Success => NoContent(),
                FleetUpdateResult.NotFound => NotFound(),
                _ => StatusCode(StatusCodes.Status500InternalServerError)
            };
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _fleetsService.DeleteAsync(id);

            if (result)
            {
                return NoContent();
            }

            return NotFound();
        }
    }
}