using System.Text.Json.Serialization;

namespace SoftArchVehicleFleetManager.Dtos.Telemetry
{
    public record TelemetryAlarmDto(
       [property: JsonPropertyName("TELEMETRY_MESSAGE")] string Message,
       [property: JsonPropertyName("TELEMETRY_DATA")] string Data
    );
}
