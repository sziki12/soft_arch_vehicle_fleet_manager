using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using SoftArchVehicleFleetManager.Data;
using SoftArchVehicleFleetManager.Dtos.Modules;
using SoftArchVehicleFleetManager.Models;

namespace SoftArchVehicleFleetManager.Services
{
    public enum ModuleUpdateResult
    {
        Success,
        NotFound,
        InvalidManufacturerId,
        InvalidInterfaceId,
        InvalidVehicleId,
        HWIDAlreadyExists,
    }

    public enum ModuleCreateResult
    {
        Success,
        InvalidManufacturerId,
        InvalidInterfaceId,
        InvalidVehicleId,
        HWIDAlreadyExists,
    }

    public class ModulesService
    {
        private readonly FleetDbContext _db;

        public ModulesService(FleetDbContext db)
        {
            _db = db;
        }

        public async Task<List<ModuleDto>> GetAllAsync()
        {
            return await _db.Modules
                .AsNoTracking()
                .Select(m => new ModuleDto(
                    m.Id,
                    m.HardwareId,
                    m.ManufacturerId,
                    m.InterfaceId,
                    m.VehicleId
                ))
                .ToListAsync();
        }

        public async Task<ModuleDto?> GetByHWIDAsync(string HWID)
        {
            return await _db.Modules
                .AsNoTracking()
                .Where(m => m.HardwareId == HWID)
                .Select(m => new ModuleDto(
                    m.Id,
                    m.HardwareId,
                    m.ManufacturerId,
                    m.InterfaceId,
                    m.VehicleId
                )).FirstOrDefaultAsync();
        }

        public async Task<ModuleDto?> GetOneAsync(int id)
        {
            var module = await _db.Modules
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.Id == id);

            if (module is null) return null;

            return new ModuleDto(
                module.Id,
                module.HardwareId,
                module.ManufacturerId,
                module.InterfaceId,
                module.VehicleId
            );
        }

        public async Task<(ModuleCreateResult Status, ModuleDto? Module)> CreateAsync(ModuleCreateDto createDto)
        {
            // Validate foreign keys
            if (!await _db.Manufacturers.AsNoTracking().AnyAsync(m => m.Id == createDto.ManufacturerId))
                return (ModuleCreateResult.InvalidManufacturerId, null);

            if (!await _db.Interfaces.AsNoTracking().AnyAsync(i => i.Id == createDto.InterfaceId))
                return (ModuleCreateResult.InvalidInterfaceId, null);

            if (createDto.VehicleId != null && !await _db.Vehicles.AsNoTracking().AnyAsync(v => v.Id == createDto.VehicleId))
                return (ModuleCreateResult.InvalidVehicleId, null);

            if (await _db.Modules.AsNoTracking().AnyAsync(m => m.HardwareId == createDto.HardwareId))
                return (ModuleCreateResult.HWIDAlreadyExists, null);

            var module = new Module
            {
                HardwareId = createDto.HardwareId,
                ManufacturerId = createDto.ManufacturerId,
                InterfaceId = createDto.InterfaceId,
                VehicleId = createDto.VehicleId
            };

            await _db.Modules.AddAsync(module);
            await _db.SaveChangesAsync();

            var dto = new ModuleDto(
                module.Id,
                module.HardwareId,
                module.ManufacturerId,
                module.InterfaceId,
                module.VehicleId
            );

            return (ModuleCreateResult.Success, dto);
        }

        public async Task<ModuleUpdateResult> UpdateAsync(int id, ModuleUpdateDto updateDto)
        {
            var module = await _db.Modules.FindAsync(id);
            if (module is null) return ModuleUpdateResult.NotFound;

            if (updateDto.HardwareId is not null)
            {
                if (await _db.Modules.AsNoTracking().AnyAsync(m => m.HardwareId == updateDto.HardwareId && module.Id != m.Id))
                    return ModuleUpdateResult.HWIDAlreadyExists;

                module.HardwareId = updateDto.HardwareId;
            }

            if (updateDto.ManufacturerId is not null)
            {
                var mid = updateDto.ManufacturerId.Value;
                if (!await _db.Manufacturers.AsNoTracking().AnyAsync(m => m.Id == mid))
                    return ModuleUpdateResult.InvalidManufacturerId;

                module.ManufacturerId = mid;
            }

            if (updateDto.VehicleId is not null)
            {
                var vid = updateDto.VehicleId.Value;
                if (!await _db.Vehicles.AsNoTracking().AnyAsync(v => v.Id == vid))
                    return ModuleUpdateResult.InvalidVehicleId;

                module.VehicleId = vid;
            }

            if (updateDto.InterfaceId is not null)
            {
                var iid = updateDto.InterfaceId.Value;
                if (!await _db.Interfaces.AsNoTracking().AnyAsync(i => i.Id == iid))
                    return ModuleUpdateResult.InvalidInterfaceId;

                module.InterfaceId = iid;
            }

            await _db.SaveChangesAsync();
            return ModuleUpdateResult.Success;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var module = await _db.Modules.FindAsync(id);
            if (module is null) return false;

            _db.Modules.Remove(module);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}