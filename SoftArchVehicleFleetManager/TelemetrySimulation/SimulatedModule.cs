using System.Text.Json;
using System.Text.Json.Nodes;
using TelemetryServiceLib;

namespace TelemetrySimulation
{
    internal class SimulatedModule
    {
        public string FleetName { get; set; }

        public string ModuleManufacturer { get; set; }

        public string HardwareAddress { get; set; }

        private HiveClient hiveClient;

        public SimulatedModule(string fleetName, string moduleManufacturer, string hardwareAddress)
        {
            FleetName = fleetName;
            ModuleManufacturer = moduleManufacturer;
            HardwareAddress = hardwareAddress;

            try
            {
                hiveClient = new HiveClient("ModuleSimulationClient");

                hiveClient.ClientInstance.OnMessageReceived += (sender, args) =>
                {
                    var message = args.PublishMessage.PayloadAsString;
                    Console.WriteLine($"Module {HardwareAddress} received payload:\n {message}");
                };
            }
            catch (Exception exception)
            {
                var error = $"Error initializing HiveClient for module {HardwareAddress}: {exception.Message}";
                throw new ArgumentNullException(error);
            }
        }

        public void GenerateSpeedTelemetry(bool printMessage) 
        {
            int speedValue = 100 + new Random().Next(-10, 10);

            var messageJson = new JsonObject
            {
                ["header"] = new JsonObject()
                {
                    ["hardware"] = HardwareAddress,
                    ["manufacturer"] = ModuleManufacturer,
                },
                ["data"] = new JsonObject()
                {
                    ["speed"] = speedValue,
                    ["distance"] = 10
                }
            };

            var message = JsonSerializer.Serialize(messageJson);

            if (printMessage) 
            {
                Console.WriteLine($"Module {HardwareAddress} publishing payload:\n {message} \n\n\n");
            }

            string topic = $"telemetry/{FleetName}/{ModuleManufacturer}/{HardwareAddress}";
            hiveClient.PublishToTopic(topic, message);
        }
    }
}
