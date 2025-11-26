using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoftArchVehicleFleetManager.Dtos.Alarms;
using SoftArchVehicleFleetManager.Services;

namespace SoftArchVehicleFleetManager.Controllers
{
    [ApiController]
    [Route("api/alarms")]
    [Authorize]
    public class AlarmsController : ControllerBase
    {
        private readonly AlarmsService _alarmsService;

        public AlarmsController(AlarmsService alarmsService)
        {
            _alarmsService = alarmsService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AlarmDto>>> Get([FromQuery(Name = "fleet_id")] int? fleetId)
        {
            var alarms = await _alarmsService.GetAsync(fleetId);
            return Ok(alarms);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<AlarmDto>> GetOne(int id)
        {
            var alarm = await _alarmsService.GetOneAsync(id);
            if (alarm is null) return NotFound();
            return Ok(alarm);
        }

        [HttpPost]
        public async Task<ActionResult<AlarmDto>> Create(AlarmCreateDto createDto)
        {
            var (status, result) = await _alarmsService.CreateAsync(createDto);

            return status switch
            {
                AlarmCreateResult.Success => CreatedAtAction(nameof(GetOne), new { id = result!.id }, result),
                AlarmCreateResult.InvalidFleetId => BadRequest(new { error = "Invalid FleetId." }),
                AlarmCreateResult.InvalidInterfaceId => BadRequest(new { error = "Invalid InterfaceId." }),
                _ => StatusCode(500)
            };
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, AlarmUpdateDto updateDto)
        {
            var result = await _alarmsService.UpdateAsync(id, updateDto);

            return result switch
            {
                AlarmUpdateResult.Success => NoContent(),
                AlarmUpdateResult.NotFound => NotFound(),
                AlarmUpdateResult.InvalidFleetId => BadRequest(new { error = "Invalid FleetId." }),
                AlarmUpdateResult.InvalidInterfaceId => BadRequest(new { error = "Invalid InterfaceId." }),
                _ => StatusCode(500)
            };
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _alarmsService.DeleteAsync(id);

            if (result)
            {
                return NoContent();
            }

            return NotFound();
        }
    }
}