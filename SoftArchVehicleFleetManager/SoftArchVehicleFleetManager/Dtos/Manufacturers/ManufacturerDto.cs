using System.Text.Json.Serialization;

namespace SoftArchVehicleFleetManager.Dtos.Manufacturers
{
    public record ManufacturerDto(
        [property: JsonPropertyName("MANUFACTURER_ID")] int Id,
        [property: JsonPropertyName("MANUFACTURER_NAME")] string Name
    );
}
