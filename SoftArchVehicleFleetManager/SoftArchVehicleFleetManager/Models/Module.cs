using System.Text.Json.Serialization;

namespace SoftArchVehicleFleetManager.Models
{
    public class Module
    {
        public int Id { get; set; }
        public string HardwareId { get; set; }

        // Foreign Keys
        public int ManufacturerId { get; set; }
        public int InterfaceId { get; set; }
        public int? VehicleId { get; set; }

        // Navigation Properties
        [JsonIgnore] public Manufacturer Manufacturer { get; set; } = default!;
        [JsonIgnore] public Interface Interface { get; set; } = default!;
        [JsonIgnore] public Vehicle? Vehicle { get; set; } = default!;
    }
}
