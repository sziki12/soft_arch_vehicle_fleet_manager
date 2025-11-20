using HiveMQtt.MQTT5.Types;
using System.Text.Json;
using TelemetryService;

namespace TelemetrySimulation
{
    internal class Vehicle
    {
        public string OperatorName { get; set; }

        public string PlateNumber { get; set; }

        private HiveClient hiveClient;

        public Vehicle(string operatorName, string plateNumber)
        {
            OperatorName = operatorName;
            PlateNumber = plateNumber;

            try
            {
                hiveClient = new HiveClient("VehicleSimulationClient");

                hiveClient.ClientInstance.OnMessageReceived += (sender, args) =>
                {
                    var message = args.PublishMessage.PayloadAsString;
                    Console.WriteLine($"Vehicle {PlateNumber} received payload:\n {message}");
                };
            }
            catch (Exception exception)
            {
                var error = $"Error initializing HiveClient for vehicle {PlateNumber}: {exception.Message}";
                throw new ArgumentNullException(error);
            }
        }

        public void GenerateSpeedTelemetry() 
        {
            var message = JsonSerializer.Serialize(new { speed = 100, distance = 10});
            hiveClient.PublishToTopic($"{OperatorName}/telemetry/speed/{PlateNumber}", message);
        }
    }
}
