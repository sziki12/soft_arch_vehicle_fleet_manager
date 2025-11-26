using System.Text.Json.Serialization;

namespace SoftArchVehicleFleetManager.Dtos.Fleets
{
    public record FleetUpdateDto(
        [property: JsonPropertyName("FLEET_NAME")] string Name
    );
}
