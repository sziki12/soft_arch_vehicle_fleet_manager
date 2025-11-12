using System.Text.Json.Serialization;

namespace SoftArchVehicleFleetManager.Models
{
    public class User
    {
        // Primary Key
        public int Id { get; set; }

        // Properties
        public string Username { get; set; }
        public string Password { get; set; }

        // Foreign Keys
        public int? ManufacturerId { get; set; }
        public int? FleetId { get; set; }

        // Navigation Properties
        [JsonIgnore] public Manufacturer? Manufacturer { get; set; }
        [JsonIgnore] public Fleet? Fleet { get; set; }
    }
}
