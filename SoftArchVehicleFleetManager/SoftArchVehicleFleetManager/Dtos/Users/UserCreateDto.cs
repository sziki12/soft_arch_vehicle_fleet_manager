namespace SoftArchVehicleFleetManager.Dtos.Users
{
    public record UserCreateDto(
        string Username,
        string Password,
        int? ManufacturerId,
        int? FleetId
    );
}
