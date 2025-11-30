using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Serialization;
using SoftArchVehicleFleetManager.Services;
using SoftArchVehicleFleetManager.Enums;

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

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request.Username, request.Role, request.Password);

        return result.Status switch
        {
            RegisterResultStatus.Success => Ok(new { token = result.Token }),
            RegisterResultStatus.UsernameAlreadyExists => BadRequest(new { error = "Username already exists." }),
            _ => StatusCode(StatusCodes.Status500InternalServerError)
        };
    }
}

public record LoginRequest
(
    [property: JsonPropertyName("USERNAME")] string Username,
    [property: JsonPropertyName("PASSWORD")] string Password
);

public record RegisterRequest
(
    [property: JsonPropertyName("USERNAME")] string Username,
    [property: JsonPropertyName("USER_ROLE")] UserRole Role,
    [property: JsonPropertyName("PASSWORD")] string Password
);