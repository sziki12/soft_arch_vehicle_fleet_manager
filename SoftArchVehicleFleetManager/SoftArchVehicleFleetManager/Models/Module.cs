namespace SoftArchVehicleFleetManager.Models
{
    public class Module
    {
        public int Id { get; set; }
        public string HardwareId { get; set; }

        public Manufacturer Manufacturer { get; set; }
        public Interface Interface { get; set; }
        public Vehicle? Vehicle { get; set; }
    }
}
