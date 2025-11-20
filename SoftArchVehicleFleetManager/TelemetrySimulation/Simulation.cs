using TelemetryService;

using HiveMQtt.Client;
using HiveMQtt.Client.Options;
using HiveMQtt.MQTT5.ReasonCodes;
using HiveMQtt.MQTT5.Types;
using System.Security;
using System.Text.Json;

namespace TelemetrySimulation
{
    internal class Simulation
    {
        static void Main(string[] args)
        {
            try
            {
                Vehicle vehicle1 = new Vehicle("OperatorA", "ABC123");
                while (true)
                {
                    vehicle1.GenerateSpeedTelemetry();
                }
            }
            catch (Exception exception)
            {
                Console.WriteLine($"{exception.Message}");
            }
        }
    }
}