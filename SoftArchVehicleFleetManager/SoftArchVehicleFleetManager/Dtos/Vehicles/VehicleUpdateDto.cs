namespace SoftArchVehicleFleetManager.Dtos.Vehicles
{
    public record VehicleUpdateDto(
        string? Name,
        string? LicensePlate,
        string? Model,
        int? Year,

        int? FleetId
    );
}
