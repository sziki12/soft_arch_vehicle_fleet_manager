namespace SoftArchVehicleFleetManager.Models
{
    public class Vehicle
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string LicensePlate { get; set; }
        public string Model { get; set; }
        public int Year { get; set; }

        public Fleet Fleet { get; set; }
    }
}
