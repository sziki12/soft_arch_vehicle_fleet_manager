using SoftArchVehicleFleetManager.Enums;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace SoftArchVehicleFleetManager.Converters
{
    public class UserRoleJsonConverter : JsonConverter<UserRole>
    {
        public override UserRole Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            var value = reader.GetString();

            return value?.ToLowerInvariant() switch
            {
                "admin" => UserRole.Admin,
                "fleet_operator" => UserRole.FleetOperator,
                "manufacturer" => UserRole.Manufacturer,
                _ => throw new JsonException($"Invalid UserRole value: {value}")
            };
        }

        public override void Write(Utf8JsonWriter writer, UserRole value, JsonSerializerOptions options)
        {
            var str = value switch
            {
                UserRole.Admin => "admin",
                UserRole.FleetOperator => "fleet_operator",
                UserRole.Manufacturer => "manufacturer",
                _ => throw new JsonException($"Invalid UserRole value: {value}")
            };

            writer.WriteStringValue(str);
        }
    }
}
