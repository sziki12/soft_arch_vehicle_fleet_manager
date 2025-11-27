using System.Text.Json.Serialization;

namespace SoftArchVehicleFleetManager.Dtos.Modules
{
    public record ModuleUpdateDto(
        [property: JsonPropertyName("HWID")] string? HardwareId,
        [property: JsonPropertyName("MANUFACTURER_ID")] int? ManufacturerId,
        [property: JsonPropertyName("INTERFACE_ID")] int? InterfaceId,
        [property: JsonPropertyName("VEHICLE_ID")] int? VehicleId
    );
}
