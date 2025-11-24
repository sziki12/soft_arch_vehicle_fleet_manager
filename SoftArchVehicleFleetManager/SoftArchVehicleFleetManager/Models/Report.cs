using System.Text.Json.Serialization;

namespace SoftArchVehicleFleetManager.Models
{
    public class Report
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public string Data { get; set; }

        [JsonIgnore] public Vehicle Vehicle { get; set; }
        [JsonIgnore] public Module Module { get; set; }
    }
}
