using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SoftArchVehicleFleetManager.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly FleetDbContext _db;

    public AuthController(IConfiguration config, FleetDbContext db)
    {
        _config = config;
        _db = db;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        string? password = await _db.Users
            .Where(u => u.Username == request.Username)
            .Select(u => u.Password).FirstOrDefaultAsync();

        if (password == null)
        {
            return NotFound();
        }

        if (password != request.Password)
        {
            return Unauthorized();
        }

        var token = GenerateToken(request.Username);
        return Ok(new { token });
    }

    private string GenerateToken(string username)
    {
        var jwtKey = _config["Jwt:Key"];
        var jwtIssuer = _config["Jwt:Issuer"];

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.Name, username),
            new Claim("role", "admin")
        };

        var token = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: null,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(30),   // “session” length
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public record LoginRequest
(
    [property: JsonPropertyName("USERNAME")] string Username,
    [property: JsonPropertyName("PASSWORD")] string Password
);