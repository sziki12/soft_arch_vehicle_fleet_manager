namespace SoftArchVehicleFleetManager.Models
{
    public class Fleet
    {
        // Primary Key
        public int Id { get; set; }

        // Properties
        public string Name { get; set; }

        // Navigation Properties
        public List<Vehicle> Vehicles { get; set; } = new();
    }
}
