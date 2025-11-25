using System.Text.Json;

namespace TelemetryServiceLib
{
    // FLEET SERVICE CLASS
    // Manages a fleet of modules under a specific fleet name
    public class FleetService
    {
        public string FleetName { get; set; }

        public List<FleetModul> FleetModules { get; set; } = new List<FleetModul>();

        public List<FleetAlertConstraint> FleetAlertConstraints { get; set; } = new List<FleetAlertConstraint>();

        private HiveClient hiveClient;

        private readonly object fleetModulesLock = new object();

        public FleetService(string fleetName)
        {
            FleetName = fleetName;

            try
            {
                hiveClient = new HiveClient("FleetServiceClient");

                hiveClient.ClientInstance.OnMessageReceived += (sender, args) =>
                {
                    string message = args.PublishMessage.PayloadAsString;

                    Console.WriteLine($"FleetService {FleetName} received payload:\n {message}");

                    JsonDocument json = JsonDocument.Parse(message);

                    string hardwareAddress = json.RootElement.GetProperty("header").GetProperty("hardware").GetString() ?? "N.A.";
                    string modulManufacturer = json.RootElement.GetProperty("header").GetProperty("manufacturer").GetString() ?? "N.A.";

                    JsonElement element = json.RootElement.GetProperty("data");

                    lock (fleetModulesLock)
                    {
                        foreach (var modul in FleetModules)
                        {
                            if (modul.HardwareAddress == hardwareAddress)
                            {
                                modul.ModulManufacturer = modulManufacturer;
                                modul.TelemetryData = JsonDocument.Parse(element.GetRawText());
                                return;
                            }
                        }

                        FleetModul newFleetModul = new FleetModul
                        {
                            HardwareAddress = hardwareAddress,
                            ModulManufacturer = modulManufacturer,
                            TelemetryData = JsonDocument.Parse(element.GetRawText())
                        };

                        FleetModules.Add(newFleetModul);
                    }
                };
            }
            catch (Exception exception)
            {
                var error = $"Error initializing HiveClient for {FleetName} FleetService : {exception.Message}";
                throw new ArgumentNullException(error);
            }
        }

        // Adds subscription for a specific module's telemetry topic
        public void AddModulTelemetrySubscripition(string modulManufacturer, string hardwareAddress)
        {
            string topic = $"telemetry/{FleetName}/{modulManufacturer}/{hardwareAddress}";
            hiveClient.SubscribeToTopic(topic);
        }

        // Gets data from DB as in memory Lists and adds subscriptions to handle MQTT
        public void AddModulTelemetrySubscripition(List<string> manufacturers, List<string> hardwares)
        {
            foreach (var manufacturer in manufacturers)
            {
                foreach (var hardware in hardwares)
                {
                    AddModulTelemetrySubscripition(manufacturer, hardware);
                }
            }
        }

        // Get specific module telemetry data
        public JsonDocument? GetModulTelemetry(string hardwareAddress) { 
           return FleetModules.Find(m => m.HardwareAddress == hardwareAddress)?.TelemetryData;
        }

        // Gets alert constraints from DB and adds them to FleetAlertConstraints
        public void AddModulAlertConstraint(string modulManufacturer, string alertConstraint) 
        { 
            
        }

        // Parses alert constraints and checks if the given FleetModul is under alert
        private bool ParseAlertConstraintsFor(FleetModul fleetModul, JsonDocument alertConstraint) 
        {
            bool hasAlert = false;
            return hasAlert;
        }

        // Returns a list of FleetModul instances so that web UI can display them
        public List<FleetModul> GetModulesUnderAlert() 
        { 
            return new List<FleetModul>();
        }
    }
}