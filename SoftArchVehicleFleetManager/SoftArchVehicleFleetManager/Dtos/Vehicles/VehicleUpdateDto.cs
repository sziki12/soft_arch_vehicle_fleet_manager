using System.Text.Json.Serialization;

namespace SoftArchVehicleFleetManager.Dtos.Vehicles
{
    public record VehicleUpdateDto(
        [property: JsonPropertyName("VEHICLE_NAME")] string? Name,
        [property: JsonPropertyName("VEHICLE_LICENSE_PLATE")] string? LicensePlate,
        [property: JsonPropertyName("VEHICLE_MODEL")] string? Model,
        [property: JsonPropertyName("VEHICLE_YEAR")] int? Year,

        [property: JsonPropertyName("FLEET_ID")] int? FleetId
    );
}
