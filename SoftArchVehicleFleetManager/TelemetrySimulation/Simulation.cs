namespace TelemetrySimulation
{
    internal class Simulation
    {
        static void Main(string[] args)
        {
            try
            {
                List<SimulatedModule> simulatedModules = new List<SimulatedModule>();

                simulatedModules.Add(new SimulatedModule("FleetA", "ManufacturerA", "ABC123"));
                simulatedModules.Add(new SimulatedModule("FleetA", "ManufacturerB", "ABC234"));
                simulatedModules.Add(new SimulatedModule("FleetA", "ManufacturerA", "ABC345"));

                //simulatedModules.Add(new SimulatedModule("FleetB", "ManufacturerA", "ABC456"));
                //simulatedModules.Add(new SimulatedModule("FleetB", "ManufacturerB", "ABC567"));
                //simulatedModules.Add(new SimulatedModule("FleetB", "ManufacturerA", "ABC678"));

                foreach (var simulatedModule in simulatedModules) {
                    Thread.Sleep(10000);
                    simulatedModule.GenerateSpeedTelemetry(true);
                }
            }
            catch (Exception exception)
            {
                Console.WriteLine($"{exception.Message}");
            }
        }
    }
}