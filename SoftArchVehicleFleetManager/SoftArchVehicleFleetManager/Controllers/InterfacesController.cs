using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoftArchVehicleFleetManager.Dtos.Interfaces;
using SoftArchVehicleFleetManager.Services;

namespace SoftArchVehicleFleetManager.Controllers
{
    [ApiController]
    [Route("api/interfaces")]
    [Authorize]
    public class InterfacesController : ControllerBase
    {
        private readonly InterfacesService _interfacesService;

        public InterfacesController(InterfacesService interfacesService)
        {
            _interfacesService = interfacesService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<InterfaceDto>>> GetAll()
        {
            var interfaces = await _interfacesService.GetAllAsync();
            return Ok(interfaces);
        }

        [HttpGet("byuser")]
        public async Task<ActionResult<IEnumerable<InterfaceDto>>> GetAllByUserId(
            [FromQuery(Name = "user_id")] int userId)
        {
            var interfaces = await _interfacesService.GetAllByUserIdAsync(userId);
            return Ok(interfaces);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<InterfaceDto>> GetOne(int id)
        {
            var iface = await _interfacesService.GetOneAsync(id);
            if (iface is null) return NotFound();
            return Ok(iface);
        }

        [HttpPost]
        public async Task<ActionResult<InterfaceDto>> Create(InterfaceCreateDto createDto)
        {
            var (status, result) = await _interfacesService.CreateAsync(createDto);

            return status switch
            {
                InterfaceCreateResult.Success => CreatedAtAction(nameof(GetOne), new { id = result!.Id }, result),
                InterfaceCreateResult.InvalidManufacturerId => BadRequest(new { error = "Invalid ManufacturerId." }),
                _ => StatusCode(StatusCodes.Status500InternalServerError)
            };
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, InterfaceUpdateDto updateDto)
        {
            var result = await _interfacesService.UpdateAsync(id, updateDto);

            return result switch
            {
                InterfaceUpdateResult.Success => NoContent(),
                InterfaceUpdateResult.NotFound => NotFound(),
                InterfaceUpdateResult.InvalidManufacturerId => BadRequest(new { error = "Invalid ManufacturerId." }),
                _ => StatusCode(StatusCodes.Status500InternalServerError)
            };
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _interfacesService.DeleteAsync(id);

            if (result)
            {
                return NoContent();
            }

            return NotFound();
        }
    }
}