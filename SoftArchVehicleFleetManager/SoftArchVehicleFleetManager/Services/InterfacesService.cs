using Microsoft.AspNetCore.Mvc;
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
        private readonly UsersService _usersService;

        public InterfacesService(FleetDbContext db, UsersService usersService)
        {
            _db = db;
            _usersService = usersService;
        }

        public async Task<List<InterfaceDto>> GetAllAsync()
        {
            return await _db.Interfaces
                .AsNoTracking()
                .Select(i => new InterfaceDto(
                    i.Id,
                    i.Name,
                    i.InterfaceJSON,
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
                iface.InterfaceJSON,
                iface.ManufacturerId
            );
        }

        public async Task<List<InterfaceDto>> GetAllByUserIdAsync(int userId)
        {
            var user = await _usersService.GetOneAsync(userId);
            if(user is null) 
                return [];
            if(user.Role == Enums.UserRole.Manufacturer && user.ManufacturerId != null)
            {
                var interfaces = await GetAllAsync();
                var resultInterfaces = interfaces.Where(i => i.ManufacturerId == user.ManufacturerId.Value).ToList();
                return resultInterfaces;
            }
            else
            {
                return await GetAllAsync();
            }
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
                InterfaceJSON = createDto.InterfaceJSON,
                ManufacturerId = createDto.ManufacturerId
            };

            await _db.Interfaces.AddAsync(iface);
            await _db.SaveChangesAsync();

            var dto = new InterfaceDto(
                iface.Id,
                iface.Name,
                iface.InterfaceJSON,
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

            if (updateDto.InterfaceJSON is not null)
            {
                iface.InterfaceJSON = updateDto.InterfaceJSON;
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