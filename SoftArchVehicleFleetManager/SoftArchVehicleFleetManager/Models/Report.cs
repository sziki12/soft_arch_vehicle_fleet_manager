namespace SoftArchVehicleFleetManager.Models
{
    public class Report
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public string Data { get; set; }

        public Vehicle Vehicle { get; set; }
        public Module Module { get; set; }
    }
}
