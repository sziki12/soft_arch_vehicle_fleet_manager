using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SoftArchVehicleFleetManager.Data;
using SoftArchVehicleFleetManager.Enums;
using SoftArchVehicleFleetManager.Models;
using System.Collections.Generic;
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
        User? user = await _db.Users
            .Where(u => u.Username == request.Username)
            .FirstOrDefaultAsync();

        if (user == null)
        {
            return NotFound();
        }

        var result = new PasswordHasher<User>().VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (result == PasswordVerificationResult.Failed)
        {
            return Unauthorized();
        }

        if (result == PasswordVerificationResult.SuccessRehashNeeded)
        {
            user.PasswordHash = new PasswordHasher<User>().HashPassword(user, request.Password);
            _db.Users.Update(user);
            await _db.SaveChangesAsync();
        }

        var token = GenerateToken(request.Username, user.Role);
        return Ok(new { token });
    }

    private string GenerateToken(string username, UserRole role)
    {
        var jwtKey = _config["Jwt:Key"];
        var jwtIssuer = _config["Jwt:Issuer"];

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.Name, username),
            new Claim("role", role.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: null,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(30),   
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