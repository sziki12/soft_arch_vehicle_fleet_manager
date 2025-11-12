namespace SoftArchVehicleFleetManager.Dtos.Users
{
    public record UserUpdateDto(
        string? Username,
        string? Password,
        int? ManufacturerId,
        int? FleetId
    );
}
