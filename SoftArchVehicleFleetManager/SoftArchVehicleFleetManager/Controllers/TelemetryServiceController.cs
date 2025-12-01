using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoftArchVehicleFleetManager.Dtos.Telemetry;
using SoftArchVehicleFleetManager.Telemetry;

namespace SoftArchVehicleFleetManager.Controllers
{
    [ApiController]
    [Route("api/telemetry")]
    [Authorize]
    public class TelemetryServiceController : ControllerBase
    {
        private readonly TelemetryService _telemetryService;
        public TelemetryServiceController(TelemetryService telemetryService)
        {
            _telemetryService = telemetryService;
        }

        [HttpGet("report/{vehicleId}")]
        public async Task<ActionResult<TelemetryReportDto>> GetVehicleReport(int vehicleId)
        {
            var report = await _telemetryService.GetVehicleReport(vehicleId);
            return Ok(report);
        }

        [HttpGet("alarms/{fleetId}")]
        public async Task<ActionResult<TelemetryAlarmDto>> GetFleetAlarms(int fleetId)
        {
            var alarms = await _telemetryService.GetFleetVehiclesUnderAlarm(fleetId);
            return Ok(alarms);
        }
    }
}