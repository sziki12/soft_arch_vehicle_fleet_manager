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

        [HttpGet("vehicle/{vehicleId}")]
        public async Task<ActionResult<TelemetryReportDto>> GetVehicleReport(string vehicleId)
        {
            var report = await _telemetryService.getVehiceleReport(vehicleId);
            if (string.IsNullOrEmpty(report.Data))
            {
                return NotFound(report);
            }
            return Ok(report);
        }
    }
}