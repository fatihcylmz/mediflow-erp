using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using AbpIdentityUser = Volo.Abp.Identity.IdentityUser;
using Microsoft.AspNetCore.Identity;
using Volo.Abp.Authorization.Permissions;
using Volo.Abp.Identity;
using MediFlow.Permissions;

namespace MediFlow.HttpApi.Controllers;

[Area("admin")]
[Route("api/app/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly UserManager<AbpIdentityUser> _userManager;
    private readonly IdentityRoleManager _roleManager;

    public AuthController(IConfiguration configuration, UserManager<AbpIdentityUser> userManager, IdentityRoleManager roleManager)
    {
        _configuration = configuration;
        _userManager = userManager;
        _roleManager = roleManager;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        // Try username first, then email if not found
        var user = await _userManager.FindByNameAsync(request.UserName);
        if (user == null)
        {
            user = await _userManager.FindByEmailAsync(request.UserName);
        }
        if (user == null)
        {
            return Unauthorized(new { message = "Kullanıcı adı veya şifre hatalı.", debug = new { foundUser = false, requestedUser = request.UserName } });
        }

        var isPasswordValid = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!isPasswordValid)
        {
            // Debug: Check if password hash exists
            var hasPassword = await _userManager.HasPasswordAsync(user);
            return Unauthorized(new { message = "Kullanıcı adı veya şifre hatalı.", debug = new { userName = user.UserName, hasPassword, foundUser = true } });
        }

        var roles = await _userManager.GetRolesAsync(user);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.UserName ?? string.Empty),
            new(ClaimTypes.Email, user.Email ?? string.Empty),
        };

        if (user.TenantId.HasValue)
        {
            claims.Add(new("http://www.aspnetboilerplate.com/claims/tenant-id", user.TenantId.Value.ToString()));
        }

        // Add role NAMES under ClaimTypes.Role so ABP identity middleware recognizes them
        foreach (var roleName in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, roleName));
        }

        // Add permission claims from AbpRoleClaims for each role the user belongs to.
        // Permission claim type is AbpClaimTypes.Permission ("permission") so that ABP's
        // RolePermissionValueProvider recognizes them and grants access to [Authorize(Permission)] endpoints.
        foreach (var roleName in roles)
        {
            var roleEntity = await _roleManager.FindByNameAsync(roleName);
            if (roleEntity != null)
            {
                var roleClaims = await _roleManager.GetClaimsAsync(roleEntity);
                var permissionClaims = roleClaims.Where(c => c.Type == "permission").Select(c => c.Value);
                foreach (var perm in permissionClaims)
                {
                    claims.Add(new Claim("http://www.aspnetboilerplate.com/claims/permission", perm));
                    claims.Add(new Claim("permission", perm));
                }
            }
        }

        var keyString = _configuration["StringEncryption:DefaultPassPhrase"] ?? "MediFlow_Default_Secret_Key_32Chars!";
        // Debug: Log the key being used
        Console.WriteLine($"[AuthController] Using key: '{keyString}' (Length: {keyString.Length})");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString))
        {
            KeyId = "MediFlowKey"
        };
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: "MediFlow",
            audience: "MediFlow",
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: creds
        );

        // Debug: Verify the token can be validated with the same key
        var handler = new JwtSecurityTokenHandler();
        var tokenString = handler.WriteToken(token);

        // Debug: Re-validate immediately
        var validationParams = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = "MediFlow",
            ValidateAudience = true,
            ValidAudience = "MediFlow",
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = key,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(5)
        };
        try {
            var principal = handler.ValidateToken(tokenString, validationParams, out var validatedToken);
            Console.WriteLine($"[AuthController] Token self-validation SUCCESS. Claims: {principal.Claims.Count()}");
        } catch (Exception ex) {
            Console.WriteLine($"[AuthController] Token self-validation FAILED: {ex.Message}");
        }

        return Ok(new
        {
            accessToken = tokenString,
            token = tokenString,
            expiresIn = 28800,
            userName = user.UserName,
            roles = roles
        });
    }
}

// Keep this for backward compatibility if needed
public class LoginRequest
{
    public string UserName { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

