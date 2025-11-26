using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Serialization;
using SoftArchVehicleFleetManager.Services;

[ApiController]
[Route("auth")]
[AllowAnonymous]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.LoginAsync(request.Username, request.Password);

        return result.Status switch
        {
            LoginResultStatus.Success => Ok(new { token = result.Token }),
            LoginResultStatus.UserNotFound => NotFound(),
            LoginResultStatus.InvalidPassword => Unauthorized(),
            _ => StatusCode(StatusCodes.Status500InternalServerError)
        };
    }
}

public record LoginRequest
(
    [property: JsonPropertyName("USERNAME")] string Username,
    [property: JsonPropertyName("PASSWORD")] string Password
);