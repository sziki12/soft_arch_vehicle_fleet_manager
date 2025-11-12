namespace SoftArchVehicleFleetManager.Models
{
    public class Alarm
    {
        public int Id { get; set; }
        public string Description { get; set; }
        public string SettingsJSON { get; set; }

        public Fleet Fleet { get; set; }
    }
}
