using System.Text.Json.Serialization;

namespace SoftArchVehicleFleetManager.Dtos.Interfaces
{
    public record InterfaceUpdateDto(
        [property: JsonPropertyName("INTERFACE_NAME")] string? Name,
        [property: JsonPropertyName("INTERFACE_FIELDS")] List<string>? InterfaceFields,
        [property: JsonPropertyName("MANUFACTURER_ID")] int? ManufacturerId
    );
}
