namespace SoftArchVehicleFleetManager.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }

        public Manufacturer? Manudfacturer { get; set; }
        public Fleet? Fleet { get; set; }
    }
}
