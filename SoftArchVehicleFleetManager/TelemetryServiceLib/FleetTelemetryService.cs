using System.Text.Json;
using System.Collections.Concurrent;
using System.Reflection.Metadata.Ecma335;

namespace TelemetryServiceLib
{
    // Manages a fleet of modules under a specific fleet name
    public class FleetTelemetryService
    {
        public string FleetName { get; set; }

        public ConcurrentDictionary<string, FleetModule> FleetModules { get; set; } = new();

        public ConcurrentDictionary<string, FleetAlarmConstraint> FleetAlarmConstraints { get; set; } = new();

        private HiveClient hiveClient;

        // Constructor initializes HiveClient and sets up message handling
        public FleetTelemetryService(string fleetName)
        {
            FleetName = fleetName;

            try
            {
                hiveClient = new HiveClient("FleetTelemetryServiceClient");

                hiveClient.ClientInstance.OnMessageReceived += (sender, args) =>
                {
                    string message = args.PublishMessage.PayloadAsString;

                    Console.WriteLine($"FleetService {FleetName} received payload:\n {message}");

                    JsonDocument json = JsonDocument.Parse(message);

                    string hardwareAddress = json.RootElement.GetProperty("header").GetProperty("hardware").GetString() ?? "N.A.";
                    string moduleManufacturer = json.RootElement.GetProperty("header").GetProperty("manufacturer").GetString() ?? "N.A.";

                    JsonElement element = json.RootElement.GetProperty("data");

                    FleetModules.AddOrUpdate(hardwareAddress,
                        new FleetModule
                        {
                            HardwareAddress = hardwareAddress,
                            ModuleManufacturer = moduleManufacturer,
                            TelemetryData = element.GetRawText()
                        },
                        (key, existingModule) =>
                        {
                            existingModule.ModuleManufacturer = moduleManufacturer;
                            existingModule.TelemetryData = element.GetRawText();
                            return existingModule;
                        }
                    );
                };
            }
            catch (Exception exception)
            {
                var error = $"Error initializing HiveClient for {FleetName} FleetService : {exception.Message}";
                throw new ArgumentNullException(error);
            }
        }


        // Adds subscription for a specific module's telemetry topic
        public void AddSingleModuleSubscripition(string moduleManufacturer, string hardwareAddress)
        {
            string topic = $"telemetry/{FleetName}/{moduleManufacturer}/{hardwareAddress}";
            hiveClient.SubscribeToTopic(topic);
        }


        // Gets data from DB as in memory Lists and adds subscriptions to handle MQTT
        public void AddModuleTelemetrySubscripition(List<string> manufacturers, List<string> hardwares)
        {
            foreach (var manufacturer in manufacturers)
            {
                foreach (var hardware in hardwares)
                {
                    AddSingleModuleSubscripition(manufacturer, hardware);
                }
            }
        }


        // Get specific module telemetry data
        public string GetModuleTelemetry(string hardwareAddress)
        {
            FleetModule? fleetModule = null;

            FleetModules.TryGetValue(hardwareAddress, out fleetModule);

            if (fleetModule != null)
            {
                return fleetModule.TelemetryData;
            }
            else
            {
                return "";
            }
        }


        // Removes alarm constraint from FleetAlarmConstraints
        public bool RemoveFleetAlarmConstraint(string alarmId)
        {
            return FleetAlarmConstraints.TryRemove(alarmId, out _);
        }


        // Gets alarm constraints from DB and adds them to FleetAlarmConstraints
        public void AddModuleAlarmConstraint(string alarmId, string moduleManufacturer, string alarmConstraint)
        {
            FleetAlarmConstraints.AddOrUpdate(alarmId,
                new FleetAlarmConstraint
                {
                    AlarmId = alarmId,
                    ModuleManufacturer = moduleManufacturer,
                    AlarmConstraint = alarmConstraint
                },
                (key, existingConstraint) =>
                {
                    existingConstraint.ModuleManufacturer = moduleManufacturer;
                    existingConstraint.AlarmConstraint = alarmConstraint;
                    return existingConstraint;
                }
            );
        }


        // Checks if the telemetry value meets the alarm constraint
        private bool AlarmForTelemetry(double telemetryValue, double constraintValue, string constraint)
        {
            return constraint switch
            {
                "GT" => telemetryValue > constraintValue,
                "LT" => telemetryValue < constraintValue,
                "EQ" => telemetryValue == constraintValue,
                _ => false
            };
        }


        // Parses alarm constraints and checks if the given FleetModule is under alarm
        private bool ParseAlarmConstraintsFor(FleetModule fleetModule, FleetAlarmConstraint fleetAlarmConstraint)
        {
            JsonDocument? telemetryData = JsonDocument.Parse(fleetModule.TelemetryData);
            if (telemetryData == null)
            {
                return false;
            }

            JsonDocument? alarmConstraint = JsonDocument.Parse(fleetAlarmConstraint.AlarmConstraint);
            if (alarmConstraint == null)
            {
                return false;
            }

            if (fleetModule.ModuleManufacturer != fleetAlarmConstraint.ModuleManufacturer)
            {
                return false;
            }

            foreach (var telemetryElement in telemetryData.RootElement.EnumerateObject())
            {
                foreach (var constraintElement in alarmConstraint.RootElement.EnumerateObject())
                {
                    if (telemetryElement.Name == constraintElement.Name)
                    {
                        var element = constraintElement.Value;
                        string? _operator = element.GetProperty("operator").GetString();
                        double? constraint = element.GetProperty("value").GetDouble();

                        double measurementValue = telemetryElement.Value.GetDouble();

                        if (constraint is not null)
                        {
                            if (AlarmForTelemetry(measurementValue, constraint ?? 0d, _operator))
                            {
                                return true;
                            }
                        }
                    }
                }
            }
            return false;
        }


        // Returns a list of FleetModule instances so that web UI can display them
        public List<FleetModule> GetModulesUnderAlarm()
        {
            List<FleetModule> result = new List<FleetModule>();

            try
            {
                foreach (var fleetModule in FleetModules)
                {
                    foreach (var fleetAlarmConstraint in FleetAlarmConstraints)
                    {
                        if (ParseAlarmConstraintsFor(fleetModule.Value, fleetAlarmConstraint.Value))
                        {
                            result.Add(fleetModule.Value);
                            break;
                        }
                    }
                }
            }
            catch (Exception exception)
            {
                Console.WriteLine($"Error in GetModulesUnderAlarm: {exception.Message}");
            }

            return result;
        }
    }
}