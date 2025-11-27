using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoftArchVehicleFleetManager.Dtos.Users;
using SoftArchVehicleFleetManager.Services;
using static SoftArchVehicleFleetManager.Services.UsersService;

namespace SoftArchVehicleFleetManager.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly UsersService _usersService;

        public UsersController(UsersService usersService)
        {
            _usersService = usersService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetAll()
        {
            var users = await _usersService.GetAllAsync();
            return Ok(users);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<UserDto>> GetOne(int id)
        {
            var user = await _usersService.GetOneAsync(id);
            if (user is null) return NotFound();
            return Ok(user);
        }

        [HttpPost]
        public async Task<ActionResult<UserDto>> Create(UserCreateDto createDto)
        {
            var result = await _usersService.CreateAsync(createDto);
            return CreatedAtAction(nameof(GetOne), new { id = result.Id }, result);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, UserUpdateDto updateDto)
        {
            var updateResult = await _usersService.UpdateAsync(id, updateDto);

            return updateResult switch
            {
                UserUpdateResult.Success => NoContent(),
                UserUpdateResult.NotFound => NotFound(),
                UserUpdateResult.InvalidManufacturerId => BadRequest(new { error = "Invalid ManufacturerId" }),
                UserUpdateResult.InvalidFleetId => BadRequest(new { error = "Invalid FleetId" }),
                _ => StatusCode(StatusCodes.Status500InternalServerError)
            };
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _usersService.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
