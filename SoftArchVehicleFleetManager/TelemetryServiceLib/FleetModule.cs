using System.Text.Json;

namespace TelemetryServiceLib
{
    public class FleetModule
    {
        public string HardwareAddress { get; set; } = "";

        public string ModuleManufacturer { get; set; } = "";

        public string TelemetryData { get; set; } = "";
    }
}
