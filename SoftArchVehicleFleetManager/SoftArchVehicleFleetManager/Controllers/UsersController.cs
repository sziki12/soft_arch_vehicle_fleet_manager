using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using SoftArchVehicleFleetManager.Data;
using SoftArchVehicleFleetManager.Dtos.Users;
using SoftArchVehicleFleetManager.Models;

namespace SoftArchVehicleFleetManager.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly FleetDbContext _db;
        public UsersController(FleetDbContext db) => _db = db;


        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetAll()
        {
            var users = await _db.Users
                .AsNoTracking()
                .Select(u => new UserDto(
                    u.Id,
                    u.Username,
                    u.Role,
                    u.ManufacturerId,
                    u.FleetId
                ))
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<UserDto>> GetOne(int id)
        {
            var user = await _db.Users.FindAsync(id);
            return user is null
                ? NotFound()
                : new UserDto(
                    user.Id,
                    user.Username,
                    user.Role,
                    user.ManufacturerId,
                    user.FleetId
                );
        }

        [HttpPost]
        public async Task<ActionResult<UserDto>> Create(UserCreateDto createDto)
        {
            var user = new User
            {
                Username = createDto.Username,
                Role = createDto.Role,
                ManufacturerId = null,
                FleetId = null
            };

            user.PasswordHash = new PasswordHasher<User>().HashPassword(user, createDto.Password);

            await _db.Users.AddAsync(user);
            await _db.SaveChangesAsync();

            var result = new UserDto(user.Id, user.Username, user.Role, user.ManufacturerId, user.FleetId);
            return CreatedAtAction(nameof(GetOne), new { id = user.Id }, result);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, UserUpdateDto updateDto)
        {
            var user = await _db.Users.FindAsync(id);
            if (user is null) return NotFound();

            if (updateDto.Username is not null) user.Username = updateDto.Username;
            if (updateDto.Password is not null)
            {
                user.PasswordHash = new PasswordHasher<User>().HashPassword(user, updateDto.Password);
            }

            if (updateDto.Role is not null)
            {
                user.Role = (Enums.UserRole)updateDto.Role;
            }

            if (updateDto.ManufacturerId != user.ManufacturerId)
            {
                if (updateDto.ManufacturerId is int mid &&
                    !await _db.Manufacturers.AsNoTracking().AnyAsync(m => m.Id == mid))
                    return BadRequest(new { error = "Invalid ManufacturerId." });

                user.ManufacturerId = updateDto.ManufacturerId;
            }

            if (updateDto.FleetId != user.FleetId)
            {
                if (updateDto.FleetId is int fid &&
                    !await _db.Fleets.AsNoTracking().AnyAsync(f => f.Id == fid))
                    return BadRequest(new { error = "Invalid FleetId." });

                user.FleetId = updateDto.FleetId;
            }

            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var user = await _db.Users.FindAsync(id);
            if (user is null) return NotFound();

            _db.Users.Remove(user);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}