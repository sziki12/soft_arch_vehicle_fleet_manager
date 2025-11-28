namespace TelemetrySimulation
{
    internal class Simulation
    {
        static void Main(string[] args)
        {
            try
            {
                SimulatedModule vehicle1 = new SimulatedModule("FleetA", "ManufacturerA", "ABC123");
                SimulatedModule vehicle2 = new SimulatedModule("FleetA", "ManufacturerB", "ABC234");
                SimulatedModule vehicle3 = new SimulatedModule("FleetA", "ManufacturerA", "ABC345");

                Thread.Sleep(30000);
                vehicle1.GenerateSpeedTelemetry(true);

                Thread.Sleep(30000);
                vehicle1.GenerateSpeedTelemetry(true);

                Thread.Sleep(30000);
                vehicle2.GenerateSpeedTelemetry(true);
            }
            catch (Exception exception)
            {
                Console.WriteLine($"{exception.Message}");
            }
        }
    }
}