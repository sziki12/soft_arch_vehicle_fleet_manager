namespace SoftArchVehicleFleetManager.Dtos.Vehicles
{
    public record VehicleCreateDto(
        string Name,
        string LicensePlate,
        string Model,
        int Year,

        int FleetId
    );
}
