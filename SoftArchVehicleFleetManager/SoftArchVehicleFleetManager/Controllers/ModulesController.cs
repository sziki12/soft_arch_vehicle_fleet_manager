using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoftArchVehicleFleetManager.Dtos.Modules;
using SoftArchVehicleFleetManager.Services;

namespace SoftArchVehicleFleetManager.Controllers
{
    [ApiController]
    [Route("api/modules")]
    [Authorize]
    public class ModulesController : ControllerBase
    {
        private readonly ModulesService _modulesService;

        public ModulesController(ModulesService modulesService)
        {
            _modulesService = modulesService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ModuleDto>>> GetAll()
        {
            var modules = await _modulesService.GetAllAsync();
            return Ok(modules);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ModuleDto>> GetOne(int id)
        {
            var module = await _modulesService.GetOneAsync(id);
            if (module is null) return NotFound();
            return Ok(module);
        }

        [HttpPost]
        public async Task<ActionResult<ModuleDto>> Create(ModuleCreateDto createDto)
        {
            var (status, result) = await _modulesService.CreateAsync(createDto);

            return status switch
            {
                ModuleCreateResult.Success => CreatedAtAction(nameof(GetOne), new { id = result!.Id }, result),
                ModuleCreateResult.InvalidManufacturerId => BadRequest(new { error = "Invalid ManufacturerId." }),
                ModuleCreateResult.InvalidInterfaceId => BadRequest(new { error = "Invalid InterfaceId." }),
                ModuleCreateResult.InvalidVehicleId => BadRequest(new { error = "Invalid VehicleId." }),
                _ => StatusCode(StatusCodes.Status500InternalServerError, new { error = "Unknown error" })
            };
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, ModuleUpdateDto updateDto)
        {
            var result = await _modulesService.UpdateAsync(id, updateDto);

            return result switch
            {
                ModuleUpdateResult.Success => NoContent(),
                ModuleUpdateResult.NotFound => NotFound(),
                ModuleUpdateResult.InvalidManufacturerId => BadRequest(new { error = "Invalid ManufacturerId." }),
                ModuleUpdateResult.InvalidInterfaceId => BadRequest(new { error = "Invalid InterfaceId." }),
                ModuleUpdateResult.InvalidVehicleId => BadRequest(new { error = "Invalid VehicleId." }),
                _ => StatusCode(StatusCodes.Status500InternalServerError, new { error = "Unknown error" })
            };
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _modulesService.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}