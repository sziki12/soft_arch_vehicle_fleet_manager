using System.Text.Json.Serialization;

namespace SoftArchVehicleFleetManager.Models
{
    public class Alarm
    {
        public int Id { get; set; }

        public string AlarmJSON { get; set; }

        public int FleetId { get; set; }
        public int InterfaceId { get; set; }

        [JsonIgnore] public Fleet Fleet { get; set; }
        [JsonIgnore] public Interface Interface { get; set; }
    }
}
