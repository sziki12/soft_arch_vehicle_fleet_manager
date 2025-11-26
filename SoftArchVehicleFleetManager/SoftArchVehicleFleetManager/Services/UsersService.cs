using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SoftArchVehicleFleetManager.Data;
using SoftArchVehicleFleetManager.Dtos.Users;
using SoftArchVehicleFleetManager.Models;

namespace SoftArchVehicleFleetManager.Services
{
    public enum UserUpdateResult
    {
        Success,
        NotFound,
        InvalidManufacturerId,
        InvalidFleetId
    }

    public class UsersService
    {
        private readonly FleetDbContext _db;
        private readonly IPasswordHasher<User> _passwordHasher;

        public UsersService(FleetDbContext db, IPasswordHasher<User> passwordHasher)
        {
            _db = db;
            _passwordHasher = passwordHasher;
        }

        public async Task<List<UserDto>> GetAllAsync()
        {
            return await _db.Users
                .AsNoTracking()
                .Select(u => new UserDto(
                    u.Id,
                    u.Username,
                    u.Role,
                    u.ManufacturerId,
                    u.FleetId
                ))
                .ToListAsync();
        }

        public async Task<UserDto?> GetOneAsync(int id)
        {
            var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id);
            if (user is null) return null;

            return new UserDto(
                user.Id,
                user.Username,
                user.Role,
                user.ManufacturerId,
                user.FleetId
            );
        }

        public async Task<UserDto> CreateAsync(UserCreateDto createDto)
        {
            var user = new User
            {
                Username = createDto.Username,
                Role = createDto.Role,
                ManufacturerId = null,
                FleetId = null
            };

            user.PasswordHash = _passwordHasher.HashPassword(user, createDto.Password);

            await _db.Users.AddAsync(user);
            await _db.SaveChangesAsync();

            return new UserDto(user.Id, user.Username, user.Role, user.ManufacturerId, user.FleetId);
        }

        public async Task<UserUpdateResult> UpdateAsync(int id, UserUpdateDto updateDto)
        {
            var user = await _db.Users.FindAsync(id);
            if (user is null) return UserUpdateResult.NotFound;

            if (updateDto.Username is not null)
                user.Username = updateDto.Username;

            if (updateDto.Password is not null)
                user.PasswordHash = _passwordHasher.HashPassword(user, updateDto.Password);

            if (updateDto.Role is not null)
                user.Role = (Enums.UserRole)updateDto.Role;

            if (updateDto.ManufacturerId != user.ManufacturerId)
            {
                if (updateDto.ManufacturerId is int mid &&
                    !await _db.Manufacturers.AsNoTracking().AnyAsync(m => m.Id == mid))
                {
                    return UserUpdateResult.InvalidManufacturerId;
                }

                user.ManufacturerId = updateDto.ManufacturerId;
            }

            if (updateDto.FleetId != user.FleetId)
            {
                if (updateDto.FleetId is int fid &&
                    !await _db.Fleets.AsNoTracking().AnyAsync(f => f.Id == fid))
                {
                    return UserUpdateResult.InvalidFleetId;
                }

                user.FleetId = updateDto.FleetId;
            }

            await _db.SaveChangesAsync();
            return UserUpdateResult.Success;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var user = await _db.Users.FindAsync(id);
            if (user is null) return false;

            _db.Users.Remove(user);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}