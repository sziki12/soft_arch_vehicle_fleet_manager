using System.Text.Json.Serialization;

namespace SoftArchVehicleFleetManager.Models
{
    public class Alarm
    {
        public int Id { get; set; }
        public string Description { get; set; }
        public string SettingsJSON { get; set; }

        [JsonIgnore] public Fleet Fleet { get; set; }
    }
}
