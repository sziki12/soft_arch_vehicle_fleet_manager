using System.Text.Json.Serialization;

namespace SoftArchVehicleFleetManager.Dtos.Manufacturers
{
    public record ManufacturerCreateDto(
        [property: JsonPropertyName("MANUFACTURER_NAME")] string Name
    );
}
