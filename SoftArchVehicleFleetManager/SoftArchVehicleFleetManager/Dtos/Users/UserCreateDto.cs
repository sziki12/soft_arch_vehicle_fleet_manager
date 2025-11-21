using SoftArchVehicleFleetManager.Enums;
using System.Text.Json.Serialization;

namespace SoftArchVehicleFleetManager.Dtos.Users
{
    public record UserCreateDto(
        [property: JsonPropertyName("USER_NAME")] string Username,
        [property: JsonPropertyName("USER_ROLE")] UserRole Role,
        [property: JsonPropertyName("PASSWORD")] string Password
    );
}
