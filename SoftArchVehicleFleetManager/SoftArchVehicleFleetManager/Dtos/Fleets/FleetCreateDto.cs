using System.Text.Json.Serialization;

namespace SoftArchVehicleFleetManager.Dtos.Fleets
{
    public record FleetCreateDto(
        [property: JsonPropertyName("FLEET_NAME")] string Name
    );
}
