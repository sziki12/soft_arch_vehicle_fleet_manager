using System.Text.Json.Serialization;

namespace SoftArchVehicleFleetManager.Dtos.Fleets
{
    public record FleetDto(
        [property: JsonPropertyName("FLEET_ID")] int Id,
        [property: JsonPropertyName("FLEET_NAME")] string Name
    );
}
