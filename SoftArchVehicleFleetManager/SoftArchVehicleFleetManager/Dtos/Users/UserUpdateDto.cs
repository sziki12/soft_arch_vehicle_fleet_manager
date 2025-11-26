using SoftArchVehicleFleetManager.Enums;
using System.Text.Json.Serialization;

namespace SoftArchVehicleFleetManager.Dtos.Users
{
    public record UserUpdateDto(
        [property: JsonPropertyName("USER_NAME")] string? Username,
        [property: JsonPropertyName("PASSWORD")] string? Password,
        [property: JsonPropertyName("USER_ROLE")] UserRole? Role,
        [property: JsonPropertyName("MANUFACTURER_ID")] int? ManufacturerId,
        [property: JsonPropertyName("FLEET_ID")] int? FleetId
    );
}
