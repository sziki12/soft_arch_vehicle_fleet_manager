using HiveMQtt.MQTT5.Types;
using System.Text.Json;
using TelemetryService;

namespace TelemetryService
{
    public class FleetService
    {
        public string OperatorName { get; set; }

        private HiveClient hiveClient;

        public FleetService(string operatorName)
        {
            OperatorName = operatorName;
           
            try
            {
                hiveClient = new HiveClient("FleerServiceClient");

                hiveClient.ClientInstance.OnMessageReceived += (sender, args) =>
                {
                    var message = args.PublishMessage.PayloadAsString;
                    Console.WriteLine($"FleetService {OperatorName} received payload:\n {message}");
                };
            }
            catch (Exception exception)
            {
                var error = $"Error initializing HiveClient for {OperatorName} FleetService : {exception.Message}";
                throw new ArgumentNullException(error);
            }
        }

        public void AddVehicleTelemetrySubscripition(string vehiclePlateNumber)
        {
            hiveClient.SubscribeToTopic($"{OperatorName}/telemetry/speed/{vehiclePlateNumber}");
            hiveClient.SubscribeToTopic($"{OperatorName}/telemetry/tires/{vehiclePlateNumber}");
            hiveClient.SubscribeToTopic($"{OperatorName}/telemetry/fuel/{vehiclePlateNumber}");
        }
    }
}
