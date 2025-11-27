using Microsoft.EntityFrameworkCore;
using SoftArchVehicleFleetManager.Data;
using SoftArchVehicleFleetManager.Dtos.Fleets;
using SoftArchVehicleFleetManager.Dtos.Vehicles;
using SoftArchVehicleFleetManager.Models;

namespace SoftArchVehicleFleetManager.Services
{
    public enum FleetUpdateResult
    {
        Success,
        NotFound
    }

    public class FleetsService
    {
        private readonly FleetDbContext _db;
        private readonly UsersService _usersService;

        public FleetsService(FleetDbContext db, UsersService usersService)
        {
            _db = db;
            _usersService = usersService;
        }

        public async Task<List<FleetDto>> GetAllAsync()
        {
            return await _db.Fleets
                .AsNoTracking()
                .Select(f => new FleetDto(
                    f.Id,
                    f.Name
                ))
                .ToListAsync();
        }

        public async Task<FleetDto?> GetOneAsync(int id)
        {
            var fleet = await _db.Fleets
                .AsNoTracking()
                .FirstOrDefaultAsync(f => f.Id == id);

            if (fleet is null) return null;

            return new FleetDto(
                fleet.Id,
                fleet.Name
            );
        }

        public async Task<List<FleetDto>> GetAllByUserIdAsync(int userId)
        {
            var user = await _usersService.GetOneAsync(userId);
            if (user is null)
                return [];
            if (user.Role == Enums.UserRole.FleetOperator && user.FleetId != null)
            {
                var fleet = await GetOneAsync(user.FleetId.Value);
                return [fleet];
            }
            else if (user.Role == Enums.UserRole.Admin)
            {
                return await GetAllAsync();
            }
            return [];
        }

        public async Task<FleetDto> CreateAsync(FleetCreateDto createDto)
        {
            var fleet = new Fleet
            {
                Name = createDto.Name
            };

            await _db.Fleets.AddAsync(fleet);
            await _db.SaveChangesAsync();

            return new FleetDto(fleet.Id, fleet.Name);
        }

        public async Task<FleetUpdateResult> UpdateAsync(int id, FleetUpdateDto updateDto)
        {
            var fleet = await _db.Fleets.FindAsync(id);
            if (fleet is null) return FleetUpdateResult.NotFound;

            fleet.Name = updateDto.Name;

            await _db.SaveChangesAsync();
            return FleetUpdateResult.Success;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var fleet = await _db.Fleets.FindAsync(id);
            if (fleet is null) return false;

            _db.Fleets.Remove(fleet);
            await _db.SaveChangesAsync();

            return true;
        }
    }
}