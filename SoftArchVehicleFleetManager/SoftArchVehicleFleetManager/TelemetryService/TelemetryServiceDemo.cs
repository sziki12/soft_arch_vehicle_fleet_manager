using SoftArchVehicleFleetManager.Data;
using SoftArchVehicleFleetManager.Services;
using System.Text.Json.Nodes;
using TelemetryServiceLib;

namespace SoftArchVehicleFleetManager.TelemetryService
{
    public class TelemetryServiceDemo
    {
        public static async Task InitDemoAsync()
        {
            // Initialize Fleet Service
            var fleetServiceA = new FleetService("FleetA");
            fleetServiceA.AddModuleTelemetrySubscripition("ManufacturerA", "ABC123");
            fleetServiceA.AddModuleTelemetrySubscripition("ManufacturerB", "ABC234");
            fleetServiceA.AddModuleTelemetrySubscripition("ManufacturerA", "ABC345");

            var alertJson = new JsonObject { ["speed"] = "GT 100" };
            fleetServiceA.AddModuleAlertConstraint("Alert1", "ManufacturerA", alertJson.ToString());

            await Task.Delay(60000);

            // Check for modules under alert
            var modulesUnderAlert = fleetServiceA.GetModulesUnderAlert();

            try
            {
                // Retrieve telemetry for a specific module
                var telemetry = fleetServiceA.GetModuleTelemetry("ABC123");
            }
            catch
            {
                Console.WriteLine($"Error retrieving telemetry from: ABC123");
            }

            // Remove alert constraint
            fleetServiceA.RemoveFleetAlertConstraint("Alert1");

        }

        public static void RunAsync()
        {
            _ = Task.Run(async () =>
            {
                await InitDemoAsync();
            });
        }
    }
}
