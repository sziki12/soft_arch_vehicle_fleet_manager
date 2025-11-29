using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoftArchVehicleFleetManager.Dtos.Vehicles;
using SoftArchVehicleFleetManager.Services;

namespace SoftArchVehicleFleetManager.Controllers
{
    [ApiController]
    [Route("api/vehicles")]
    [Authorize]
    public class VehiclesController : ControllerBase
    {
        private readonly VehiclesService _vehiclesService;

        public VehiclesController(VehiclesService vehiclesService)
        {
            _vehiclesService = vehiclesService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<VehicleDto>>> Get(
            [FromQuery(Name = "fleet_id")] int? fleetId)
        {
            var vehicles = await _vehiclesService.GetAsync(fleetId);
            return Ok(vehicles);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<VehicleDto>> GetOne(int id)
        {
            var vehicle = await _vehiclesService.GetOneAsync(id);
            if (vehicle is null) return NotFound();
            return Ok(vehicle);
        }

        [HttpPost]
        public async Task<ActionResult<VehicleDto>> Create(VehicleCreateDto createDto)
        {
            var (result, vehicle) = await _vehiclesService.CreateAsync(createDto);

            return result switch
            {
                VehicleCreateResult.Success => CreatedAtAction(nameof(GetOne), new { id = vehicle!.Id }, vehicle),
                VehicleCreateResult.InvalidFleetId => BadRequest(new { error = "Invalid FleetId." }),
                _ => StatusCode(StatusCodes.Status500InternalServerError)
            };
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, VehicleUpdateDto updateDto)
        {
            var result = await _vehiclesService.UpdateAsync(id, updateDto);

            return result switch
            {
                VehicleUpdateResult.Success => NoContent(),
                VehicleUpdateResult.NotFound => NotFound(),
                VehicleUpdateResult.InvalidFleetId => BadRequest(new { error = "Invalid FleetId." }),
                _ => StatusCode(StatusCodes.Status500InternalServerError)
            };
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _vehiclesService.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}