using Microsoft.EntityFrameworkCore;
using SoftArchVehicleFleetManager.Data;
using SoftArchVehicleFleetManager.Dtos.Manufacturers;
using SoftArchVehicleFleetManager.Models;

namespace SoftArchVehicleFleetManager.Services
{
    public class ManufacturersService
    {
        private readonly FleetDbContext _db;

        public ManufacturersService(FleetDbContext db)
        {
            _db = db;
        }

        public async Task<List<ManufacturerDto>> GetAllAsync()
        {
            return await _db.Manufacturers
                .AsNoTracking()
                .Select(m => new ManufacturerDto(
                    m.Id,
                    m.Name
                ))
                .ToListAsync();
        }

        public async Task<ManufacturerDto?> GetOneAsync(int id)
        {
            var manufacturer = await _db.Manufacturers
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.Id == id);

            if (manufacturer is null) return null;

            return new ManufacturerDto(
                manufacturer.Id,
                manufacturer.Name
            );
        }

        public async Task<ManufacturerDto> CreateAsync(ManufacturerCreateDto createDto)
        {
            var manufacturer = new Manufacturer
            {
                Name = createDto.Name
            };

            await _db.Manufacturers.AddAsync(manufacturer);
            await _db.SaveChangesAsync();

            return new ManufacturerDto(manufacturer.Id, manufacturer.Name);
        }

        public async Task<bool> UpdateAsync(int id, ManufacturerUpdateDto updateDto)
        {
            var manufacturer = await _db.Manufacturers.FindAsync(id);
            if (manufacturer is null) return false;

            manufacturer.Name = updateDto.Name;

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var manufacturer = await _db.Manufacturers.FindAsync(id);
            if (manufacturer is null) return false;

            _db.Manufacturers.Remove(manufacturer);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}