using SoftArchVehicleFleetManager.Enums;
using System.Text.Json.Serialization;

namespace SoftArchVehicleFleetManager.Dtos.Users
{
    public record UserDto(
        [property: JsonPropertyName("USER_ID")] int Id,
        [property: JsonPropertyName("USER_NAME")] string Username,
        [property: JsonPropertyName("USER_ROLE")] UserRole Role,
        [property: JsonPropertyName("MANUFACTURER_ID")] int? ManufacturerId,
        [property: JsonPropertyName("FLEET_ID")] int? FleetId
    );
}
