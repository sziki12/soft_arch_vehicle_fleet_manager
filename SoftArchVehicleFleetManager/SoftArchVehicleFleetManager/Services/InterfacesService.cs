using Microsoft.EntityFrameworkCore;
using SoftArchVehicleFleetManager.Data;
using SoftArchVehicleFleetManager.Dtos.Interfaces;
using SoftArchVehicleFleetManager.Models;

namespace SoftArchVehicleFleetManager.Services
{
    public enum InterfaceUpdateResult
    {
        Success,
        NotFound,
        InvalidManufacturerId
    }

    public enum InterfaceCreateResult
    {
        Success,
        InvalidManufacturerId
    }

    public class InterfacesService
    {
        private readonly FleetDbContext _db;

        public InterfacesService(FleetDbContext db)
        {
            _db = db;
        }

        public async Task<List<InterfaceDto>> GetAllAsync()
        {
            return await _db.Interfaces
                .AsNoTracking()
                .Select(i => new InterfaceDto(
                    i.Id,
                    i.Name,
                    i.InterfaceFields,
                    i.ManufacturerId
                ))
                .ToListAsync();
        }

        public async Task<InterfaceDto?> GetOneAsync(int id)
        {
            var iface = await _db.Interfaces
                .AsNoTracking()
                .FirstOrDefaultAsync(i => i.Id == id);

            if (iface is null) return null;

            return new InterfaceDto(
                iface.Id,
                iface.Name,
                iface.InterfaceFields,
                iface.ManufacturerId
            );
        }

        public async Task<(InterfaceCreateResult status, InterfaceDto? result)> CreateAsync(InterfaceCreateDto createDto)
        {
            // Validate foreign keys
            var manufacturerExists = await _db.Manufacturers
                .AsNoTracking()
                .AnyAsync(m => m.Id == createDto.ManufacturerId);

            if (!manufacturerExists)
                return (InterfaceCreateResult.InvalidManufacturerId, null);

            var iface = new Interface
            {
                Name = createDto.Name,
                InterfaceFields = createDto.InterfaceFields,
                ManufacturerId = createDto.ManufacturerId
            };

            await _db.Interfaces.AddAsync(iface);
            await _db.SaveChangesAsync();

            var dto = new InterfaceDto(
                iface.Id,
                iface.Name,
                iface.InterfaceFields,
                iface.ManufacturerId
            );

            return (InterfaceCreateResult.Success, dto);
        }

        public async Task<InterfaceUpdateResult> UpdateAsync(int id, InterfaceUpdateDto updateDto)
        {
            var iface = await _db.Interfaces.FindAsync(id);
            if (iface is null) return InterfaceUpdateResult.NotFound;

            if (updateDto.Name is not null)
            {
                iface.Name = updateDto.Name;
            }

            if (updateDto.InterfaceFields is not null)
            {
                iface.InterfaceFields = updateDto.InterfaceFields;
            }

            if (updateDto.ManufacturerId is not null)
            {
                var mid = updateDto.ManufacturerId.Value;

                var manufacturerExists = await _db.Manufacturers
                    .AsNoTracking()
                    .AnyAsync(m => m.Id == mid);

                if (!manufacturerExists)
                    return InterfaceUpdateResult.InvalidManufacturerId;

                iface.ManufacturerId = mid;
            }

            await _db.SaveChangesAsync();
            return InterfaceUpdateResult.Success;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var iface = await _db.Interfaces.FindAsync(id);
            if (iface is null) return false;

            _db.Interfaces.Remove(iface);
            await _db.SaveChangesAsync();

            return true;
        }
    }
}