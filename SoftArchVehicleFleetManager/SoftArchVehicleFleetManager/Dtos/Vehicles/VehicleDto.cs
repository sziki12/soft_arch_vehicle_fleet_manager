namespace SoftArchVehicleFleetManager.Dtos.Vehicles
{
    public record VehicleDto(
        int Id,
        string Name,
        string LicensePlate,
        string Model,
        int Year,

        int FleetId
    );
}
