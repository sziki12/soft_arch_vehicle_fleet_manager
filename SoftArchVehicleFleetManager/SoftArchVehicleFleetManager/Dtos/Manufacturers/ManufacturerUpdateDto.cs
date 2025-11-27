using System.Text.Json.Serialization;

namespace SoftArchVehicleFleetManager.Dtos.Manufacturers
{
    public record ManufacturerUpdateDto(
        [property: JsonPropertyName("MANUFACTURER_NAME")] string Name
    );
}
