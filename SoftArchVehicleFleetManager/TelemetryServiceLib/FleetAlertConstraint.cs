using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace TelemetryServiceLib
{
    public class FleetAlertConstraint
    {
        public string AlertId { get; set; } = "";

        public string ModuleManufacturer { get; set; } = "";

        public string AlertConstraint { get; set; } = "";
    }
}
