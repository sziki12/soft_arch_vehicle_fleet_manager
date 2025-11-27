using Microsoft.EntityFrameworkCore;
using SoftArchVehicleFleetManager.Data;
using SoftArchVehicleFleetManager.Dtos.Fleets;
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

        public FleetsService(FleetDbContext db)
        {
            _db = db;
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