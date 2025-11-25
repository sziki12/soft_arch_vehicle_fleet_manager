using System.Text.Json;
using System.Text.Json.Nodes;
using TelemetryServiceLib;

namespace TelemetrySimulation
{
    internal class SimulatedModule
    {
        public string FleetName { get; set; }

        public string ModulManufacturer { get; set; }

        public string HardwareAddress { get; set; }

        private HiveClient hiveClient;

        public SimulatedModule(string fleetName, string modulManufacturer, string hardwareAddress)
        {
            FleetName = fleetName;
            ModulManufacturer = modulManufacturer;
            HardwareAddress = hardwareAddress;

            try
            {
                hiveClient = new HiveClient("ModulSimulationClient");

                hiveClient.ClientInstance.OnMessageReceived += (sender, args) =>
                {
                    var message = args.PublishMessage.PayloadAsString;
                    Console.WriteLine($"Modul {HardwareAddress} received payload:\n {message}");
                };
            }
            catch (Exception exception)
            {
                var error = $"Error initializing HiveClient for modul {HardwareAddress}: {exception.Message}";
                throw new ArgumentNullException(error);
            }
        }

        public void GenerateSpeedTelemetry(bool printMessage) 
        {
            var messageJson = new JsonObject
            {
                ["header"] = new JsonObject()
                {
                    ["hardware"] = HardwareAddress,
                    ["manufacturer"] = ModulManufacturer,
                },
                ["data"] = new JsonObject()
                {
                    ["speed"] = 100,
                    ["distance"] = 10
                }
            };

            var message = JsonSerializer.Serialize(messageJson);

            if (printMessage) 
            {
                Console.WriteLine($"Modul {HardwareAddress} publishing payload:\n {message} \n\n\n");
            }

            string topic = $"telemetry/{FleetName}/{ModulManufacturer}/{HardwareAddress}";
            hiveClient.PublishToTopic(topic, message);
        }
    }
}
