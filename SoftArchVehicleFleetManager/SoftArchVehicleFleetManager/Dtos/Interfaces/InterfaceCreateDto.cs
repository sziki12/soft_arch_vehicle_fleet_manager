using System.Text.Json.Serialization;

namespace SoftArchVehicleFleetManager.Dtos.Interfaces
{
    public record InterfaceCreateDto(
        [property: JsonPropertyName("INTERFACE_NAME")] string Name,
        [property: JsonPropertyName("INTERFACE_JSON")] string InterfaceJSON,
        [property: JsonPropertyName("MANUFACTURER_ID")] int ManufacturerId
    );
}
