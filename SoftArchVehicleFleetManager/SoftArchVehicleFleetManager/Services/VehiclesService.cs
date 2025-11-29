using Microsoft.EntityFrameworkCore;
using SoftArchVehicleFleetManager.Data;
using SoftArchVehicleFleetManager.Dtos.Vehicles;
using SoftArchVehicleFleetManager.Models;

namespace SoftArchVehicleFleetManager.Services
{
    public enum VehicleCreateResult
    {
        Success,
        InvalidFleetId
    }

    public enum VehicleUpdateResult
    {
        Success,
        NotFound,
        InvalidFleetId
    }

    public class VehiclesService
    {
        private readonly FleetDbContext _db;

        public VehiclesService(FleetDbContext db)
        {
            _db = db;
        }

        public async Task<List<VehicleDto>> GetAsync(int? fleetId)
        {
            if (fleetId is not null)
            {
                var fleetVehicles = await _db.Fleets
                    .Where(f => f.Id == fleetId)
                    .SelectMany(f => f.Vehicles)
                    .ToListAsync();

                return fleetVehicles
                    .Select(v => new VehicleDto(
                        v.Id,
                        v.Name,
                        v.LicensePlate,
                        v.Model,
                        v.Year,
                        v.FleetId
                    ))
                    .ToList();
            }

            return await _db.Vehicles
                .AsNoTracking()
                .Select(v => new VehicleDto(
                    v.Id,
                    v.Name,
                    v.LicensePlate,
                    v.Model,
                    v.Year,
                    v.FleetId
                ))
                .ToListAsync();
        }

        public async Task<VehicleDto?> GetOneAsync(int id)
        {
            var vehicle = await _db.Vehicles
                .AsNoTracking()
                .FirstOrDefaultAsync(v => v.Id == id);

            if (vehicle is null) return null;

            return new VehicleDto(
                vehicle.Id,
                vehicle.Name,
                vehicle.LicensePlate,
                vehicle.Model,
                vehicle.Year,
                vehicle.FleetId
            );
        }

        public async Task<(VehicleCreateResult Result, VehicleDto? Vehicle)> CreateAsync(
            VehicleCreateDto createDto)
        {
            var fleetExists = await _db.Fleets
                .AsNoTracking()
                .AnyAsync(f => f.Id == createDto.FleetId);

            if (!fleetExists)
                return (VehicleCreateResult.InvalidFleetId, null);

            var vehicle = new Vehicle
            {
                Name = createDto.Name,
                LicensePlate = createDto.LicensePlate,
                Model = createDto.Model,
                Year = createDto.Year,
                FleetId = createDto.FleetId
            };

            await _db.Vehicles.AddAsync(vehicle);
            await _db.SaveChangesAsync();

            var dto = new VehicleDto(
                vehicle.Id,
                vehicle.Name,
                vehicle.LicensePlate,
                vehicle.Model,
                vehicle.Year,
                vehicle.FleetId
            );

            return (VehicleCreateResult.Success, dto);
        }

        public async Task<VehicleUpdateResult> UpdateAsync(int id, VehicleUpdateDto updateDto)
        {
            var vehicle = await _db.Vehicles.FindAsync(id);
            if (vehicle is null) return VehicleUpdateResult.NotFound;

            if (updateDto.Name is not null)
            {
                vehicle.Name = updateDto.Name;
            }

            if (updateDto.LicensePlate is not null)
            {
                vehicle.LicensePlate = updateDto.LicensePlate;
            }

            if (updateDto.Model is not null)
            {
                vehicle.Model = updateDto.Model;
            }

            if (updateDto.Year is not null)
            {
                vehicle.Year = updateDto.Year.Value;
            }

            if (updateDto.FleetId is not null)
            {
                var fid = updateDto.FleetId.Value;

                var fleetExists = await _db.Fleets
                    .AsNoTracking()
                    .AnyAsync(f => f.Id == fid);

                if (!fleetExists)
                    return VehicleUpdateResult.InvalidFleetId;

                vehicle.FleetId = fid;
            }

            await _db.SaveChangesAsync();
            return VehicleUpdateResult.Success;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var vehicle = await _db.Vehicles.FindAsync(id);
            if (vehicle is null) return false;

            _db.Vehicles.Remove(vehicle);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}