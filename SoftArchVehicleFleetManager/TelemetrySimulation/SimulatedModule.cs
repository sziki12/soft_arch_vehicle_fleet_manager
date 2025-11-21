using System.Text.Json;
using System.Text.Json.Nodes;
using TelemetryServiceLib;

namespace TelemetrySimulation
{
    internal class SimulatedModule
    {
        public string HardwareAddress { get; set; }

        public string OperatorName { get; set; }

        public string ModulManufacturer { get; set; }

        public string PlateNumber { get; set; }

        private HiveClient hiveClient;

        public SimulatedModule(string hardwareAddress, string operatorName, string modulManufacturer, string plateNumber)
        {
            HardwareAddress = hardwareAddress;
            OperatorName = operatorName;
            ModulManufacturer = modulManufacturer;
            PlateNumber = plateNumber;

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
                    ["operator"] = OperatorName,
                    ["manufacturer"] = ModulManufacturer,
                    ["plate"] = PlateNumber

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
                Console.WriteLine($"Modul {HardwareAddress} publishing payload:\n {message}\n\n\n");
            }

            string topic = $"telemetry/{OperatorName}/{PlateNumber}/{ModulManufacturer}/{HardwareAddress}";
            hiveClient.PublishToTopic(topic, message);
        }
    }
}
