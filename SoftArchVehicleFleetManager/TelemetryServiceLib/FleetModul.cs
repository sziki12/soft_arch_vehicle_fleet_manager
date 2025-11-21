using System.Text.Json;

namespace TelemetryServiceLib
{
    public class FleetModul
    {
        public string HardwareAddress { get; set; } = "";

        public string OperatorName { get; set; } = "";

        public string ModulManufacturer { get; set; } = "";

        public string PlateNumber { get; set; } = "";

        public JsonDocument? TelemetryData { get; set; }
    }
}
