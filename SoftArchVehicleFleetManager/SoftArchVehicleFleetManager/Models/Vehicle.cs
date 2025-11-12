using System.Text.Json.Serialization;

namespace SoftArchVehicleFleetManager.Models
{
    public class Vehicle
    {
        // Primary Key
        public int Id { get; set; }

        // Properties
        public string Name { get; set; }
        public string LicensePlate { get; set; }
        public string Model { get; set; }
        public int Year { get; set; }

        // Foreign Keys
        public int FleetId { get; set; }

        // Navigation Properties
        [JsonIgnore] public Fleet Fleet { get; set; } = default!;
        [JsonIgnore] public List<Module> Modules { get; set; } = new();
    }
}
