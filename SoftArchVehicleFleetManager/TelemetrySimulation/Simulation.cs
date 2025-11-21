namespace TelemetrySimulation
{
    internal class Simulation
    {
        static void Main(string[] args)
        {
            try
            {
                SimulatedModule vehicle1 = new SimulatedModule("1234", "OperatorA", "ManufacturerA","ABC123");
                SimulatedModule vehicle2 = new SimulatedModule("2345", "OperatorA", "ManufacturerA","ABC234");
                SimulatedModule vehicle3 = new SimulatedModule("3456", "OperatorA", "ManufacturerA","ABC345");
                SimulatedModule vehicle4 = new SimulatedModule("4576", "OperatorA", "ManufacturerA","ABC456");
                SimulatedModule vehicle5 = new SimulatedModule("5687", "OperatorA", "ManufacturerA","ABC567");

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