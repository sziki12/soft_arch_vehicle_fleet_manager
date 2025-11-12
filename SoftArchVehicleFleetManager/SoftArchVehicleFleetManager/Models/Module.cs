using System.Text.Json.Serialization;

namespace SoftArchVehicleFleetManager.Models
{
    public class Module
    {
        public int Id { get; set; }
        public string HardwareId { get; set; }

        [JsonIgnore] public Manufacturer Manufacturer { get; set; }
        [JsonIgnore] public Interface Interface { get; set; }
        [JsonIgnore] public Vehicle? Vehicle { get; set; }
    }
}
