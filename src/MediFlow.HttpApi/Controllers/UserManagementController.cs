using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.AspNetCore.Mvc;
using MediFlow.Users;

namespace MediFlow.HttpApi.Controllers;

[Area("admin")]
[Route("api/app/[controller]")]
[Authorize(Roles = "Admin")]  // [Item 9] Rol bazlı yetki kontrolü
public class UserManagementController : AbpController
{
    private readonly IUserManagementAppService _userManagementAppService;

    public UserManagementController(IUserManagementAppService userManagementAppService)
    {
        _userManagementAppService = userManagementAppService;
    }

    [HttpPost("get-users-by-role")]
    public async Task<ActionResult<List<UserDto>>> GetUsersByRoleAsync([FromBody] GetUsersByRoleInput input)
    {
        var users = await _userManagementAppService.GetUsersByRoleAsync(input?.RoleName ?? string.Empty);
        return Ok(users);
    }

    [HttpPost("create-user")]
    public async Task<ActionResult<UserDto>> CreateUserAsync([FromBody] CreateUserDtoDto input)
    {
        if (input == null)
        {
            return BadRequest("Geçersiz veri.");
        }

        var createUserDto = new CreateUserDto
        {
            UserName = input.UserName,
            Email = input.Email,
            Password = input.Password,
            Name = input.Name,
            Surname = input.Surname,
            PhoneNumber = input.PhoneNumber,
            Address = input.Address,
            RoleName = input.RoleName,
            PharmacyName = input.PharmacyName,
            PharmacyGln = input.PharmacyGln,
            WarehouseName = input.WarehouseName,
            WarehouseLocation = input.WarehouseLocation,
            SupplierName = input.SupplierName,
            SupplierTaxNumber = input.SupplierTaxNumber
        };

        var user = await _userManagementAppService.CreateUserAsync(createUserDto);
        return Ok(user);
    }

    [HttpPost("set-user-role")]
    public async Task<ActionResult<UserDto>> SetUserRoleAsync([FromBody] SetUserRoleInput input)
    {
        var user = await _userManagementAppService.SetUserRoleAsync(input.UserId, input.RoleName);
        return Ok(user);
    }

    [HttpPost("delete-user")]
    public async Task<IActionResult> DeleteUserAsync([FromBody] DeleteUserInput input)
    {
        await _userManagementAppService.DeleteUserAsync(input.UserId);
        return Ok(new { success = true });
    }

    [HttpPost("update-user")]
    public async Task<ActionResult<UserDto>> UpdateUserAsync([FromBody] UpdateUserInput input)
    {
        var updateDto = new UpdateUserDto
        {
            Name = input.Name,
            Surname = input.Surname,
            PhoneNumber = input.PhoneNumber,
            Address = input.Address,
            RoleName = input.RoleName
        };
        var user = await _userManagementAppService.UpdateUserAsync(input.UserId, updateDto);
        return Ok(user);
    }
}

public class GetUsersByRoleInput
{
    public string RoleName { get; set; } = string.Empty;
}

public class SetUserRoleInput
{
    public Guid UserId { get; set; }
    public string RoleName { get; set; } = string.Empty;
}

public class DeleteUserInput
{
    public Guid UserId { get; set; }
}

public class CreateUserDtoDto
{
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? Address { get; set; }
    public string RoleName { get; set; } = string.Empty;

    public string? PharmacyName { get; set; }
    public string? PharmacyGln { get; set; }
    public string? WarehouseName { get; set; }
    public string? WarehouseLocation { get; set; }
    public string? SupplierName { get; set; }
    public string? SupplierTaxNumber { get; set; }
}

public class UpdateUserInput
{
    public Guid UserId { get; set; }
    public string? Name { get; set; }
    public string? Surname { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Address { get; set; }
    public string RoleName { get; set; } = string.Empty;
}

