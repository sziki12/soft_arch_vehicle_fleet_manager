using System.Text.Json.Serialization;

namespace SoftArchVehicleFleetManager.Models
{
    public class Manufacturer
    {
        // Primary Key
        public int Id { get; set; }

        // Properties
        public string Name { get; set; }

        // Navigation Properties
        [JsonIgnore] public List<Interface> Interfaces { get; set; } = new();
    }
}
