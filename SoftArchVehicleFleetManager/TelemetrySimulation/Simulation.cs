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
                simulatedModules.Add(new SimulatedModule("FleetA", "ManufacturerA", "ABC234"));
                simulatedModules.Add(new SimulatedModule("FleetA", "ManufacturerA", "ABC345"));

                simulatedModules.Add(new SimulatedModule("FleetB", "ManufacturerA", "DEF123"));
                simulatedModules.Add(new SimulatedModule("FleetB", "ManufacturerA", "DEF234"));

                for (int i = 0; i < 5; i++)
                {
                    foreach (var simulatedModule in simulatedModules)
                    {
                        Thread.Sleep(15000);
                        simulatedModule.GenerateSpeedTelemetry(true);
                    }
                }
            }
            catch (Exception exception)
            {
                Console.WriteLine($"{exception.Message}");
            }
        }
    }
}