using FlashcardsApi.Models;
using FlashcardsApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace FlashcardsApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly IConfiguration _config;
        public UsersController(UserService userService, IConfiguration config)
        {
            _userService = userService;
            _config = config;
        }

        [HttpGet]
        [Authorize(Roles = "admin")]
        public ActionResult<IEnumerable<User>> GetAll() => Ok(_userService.GetAll());

        [HttpGet("{id}")]
        [Authorize]
        public ActionResult<User> GetById(string id)
        {
            var user = _userService.GetById(id);
            if (user == null) return NotFound();
            return Ok(user);
        }

        [HttpPost]
        [Authorize(Roles = "admin")]
        public IActionResult Add(User user)
        {
            _userService.Add(user);
            return Ok();
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public IActionResult Update(string id, User user)
        {
            if (id != user.Id) return BadRequest();
            _userService.Update(user);
            return Ok();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public IActionResult Delete(string id)
        {
            _userService.Delete(id);
            return Ok();
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public IActionResult Login([FromBody] LoginRequest req)
        {
            if (_userService.ValidateCredentials(req.Username, req.Password))
            {
                var user = _userService.GetByUsername(req.Username);
                var jwtSettings = _config.GetSection("Jwt");
                var key = jwtSettings["Key"] ?? Environment.GetEnvironmentVariable("JWT_KEY") ?? "REPLACE_WITH_A_SECRET_KEY";
                var issuer = jwtSettings["Issuer"] ?? "FlashcardsApi";
                var audience = jwtSettings["Audience"] ?? "FlashcardsApiUsers";
                var expireMinutes = int.TryParse(jwtSettings["ExpireMinutes"], out var exp) ? exp : 60;
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id),
                    new Claim(ClaimTypes.Name, user.Username),
                };
                foreach (var role in user.Roles)
                {
                    claims.Add(new Claim(ClaimTypes.Role, role));
                }
                var keyBytes = Encoding.UTF8.GetBytes(key);
                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(claims),
                    Expires = DateTime.UtcNow.AddMinutes(expireMinutes),
                    Issuer = issuer,
                    Audience = audience,
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(keyBytes), SecurityAlgorithms.HmacSha256Signature)
                };
                var tokenHandler = new JwtSecurityTokenHandler();
                var token = tokenHandler.CreateToken(tokenDescriptor);
                var jwt = tokenHandler.WriteToken(token);
                return Ok(new { token = jwt, user = new { user.Id, user.Username, user.Roles, user.Settings } });
            }
            return Unauthorized();
        }

        [HttpPut("{id}/settings")]
        [Authorize]
        public IActionResult UpdateSettings(string id, [FromBody] UserSettings settings)
        {
            var user = _userService.GetById(id);
            if (user == null) return NotFound();
            user.Settings = settings;
            _userService.Update(user);
            return Ok();
        }
    }

    public class LoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
