namespace SoftArchVehicleFleetManager.Dtos.Users
{
    public record UserDto(
        int Id,
        string Username,
        int? ManufacturerId,
        int? FleetId
    );
}
