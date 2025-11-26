using System.Text.Json.Serialization;

namespace SoftArchVehicleFleetManager.Models
{
    public class Interface
    {
        // Primary Key
        public int Id { get; set; }

        // Properties
        public string Name { get; set; }
        public string InterfaceJSON { get; set; }

        // Foreign Keys
        public int ManufacturerId { get; set; }

        // Navigation Properties
        [JsonIgnore] public Manufacturer Manufacturer { get; set; } = default!;
    }
}
