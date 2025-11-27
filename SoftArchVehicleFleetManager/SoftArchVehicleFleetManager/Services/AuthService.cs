using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SoftArchVehicleFleetManager.Data;
using SoftArchVehicleFleetManager.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace SoftArchVehicleFleetManager.Services
{
    public enum LoginResultStatus
    {
        Success,
        UserNotFound,
        InvalidPassword
    }

    public record LoginResult(LoginResultStatus Status, string? Token = null);

    public class AuthService
    {
        private readonly IConfiguration _config;
        private readonly FleetDbContext _db;
        private readonly IPasswordHasher<User> _passwordHasher;

        public AuthService(IConfiguration config, FleetDbContext db, IPasswordHasher<User> passwordHasher)
        {
            _config = config;
            _db = db;
            _passwordHasher = passwordHasher;
        }

        public async Task<LoginResult> LoginAsync(string username, string password)
        {
            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.Username == username);

            if (user is null)
            {
                return new LoginResult(LoginResultStatus.UserNotFound);
            }

            var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, password);

            if (result == PasswordVerificationResult.Failed)
            {
                return new LoginResult(LoginResultStatus.InvalidPassword);
            }

            if (result == PasswordVerificationResult.SuccessRehashNeeded)
            {
                user.PasswordHash = _passwordHasher.HashPassword(user, password);
                _db.Users.Update(user);
                await _db.SaveChangesAsync();
            }

            var token = GenerateToken(user);
            return new LoginResult(LoginResultStatus.Success, token);
        }

        private string GenerateToken(User user)
        {
            var jwtKey = _config["Jwt:Key"];
            var jwtIssuer = _config["Jwt:Issuer"];

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.Name, user.Username),
                new Claim("id", user.Id.ToString()),
                new Claim(ClaimTypes.Role, user.Role.ToString())
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
}