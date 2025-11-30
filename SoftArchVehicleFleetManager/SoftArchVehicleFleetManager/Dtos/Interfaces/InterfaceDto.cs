using System.Text.Json.Serialization;

namespace SoftArchVehicleFleetManager.Dtos.Interfaces
{
    public record InterfaceDto(
        [property: JsonPropertyName("INTERFACE_ID")] int Id,
        [property: JsonPropertyName("INTERFACE_NAME")] string Name,
        [property: JsonPropertyName("INTERFACE_FIELDS")] List<string> InterfaceFields,
        [property: JsonPropertyName("MANUFACTURER_ID")] int ManufacturerId
    );
}
