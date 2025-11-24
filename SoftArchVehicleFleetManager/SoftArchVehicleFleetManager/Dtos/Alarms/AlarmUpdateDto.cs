using System.Text.Json.Serialization;

namespace SoftArchVehicleFleetManager.Dtos.Alarms
{
    public record AlarmUpdateDto(
        [property: JsonPropertyName("ALARM_JSON")] string? alarmJson,
        [property: JsonPropertyName("ALARM_FLEET")] int? fleetId,
        [property: JsonPropertyName("ALARM_INTERFACE")] int? interfaceId
    );
}
