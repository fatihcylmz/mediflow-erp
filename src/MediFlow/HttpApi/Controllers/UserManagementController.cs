using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp;
using Volo.Abp.AspNetCore.Mvc;
using MediFlow.Users;
using MediFlow.Application.Users;

namespace MediFlow.HttpApi.Controllers;

[Area("admin")]
[Route("api/app/[controller]")]
[Authorize]
[IgnoreAntiforgeryToken]
public class UserManagementController : AbpController
{
    private readonly IUserManagementAppService _userManagementAppService;

    public UserManagementController(IUserManagementAppService userManagementAppService)
    {
        _userManagementAppService = userManagementAppService;
    }

    [HttpPost("get-users-by-role")]
    public async Task<ActionResult<List<UserDto>>> GetUsersByRoleAsync(GetUsersByRoleInput input)
    {
        var users = await _userManagementAppService.GetUsersByRoleAsync(input.RoleName);
        return Ok(users);
    }

    [HttpPost("create-user")]
    public async Task<ActionResult<UserDto>> CreateUserAsync(CreateUserDtoDto input)
    {
        var user = await _userManagementAppService.CreateUserAsync(input);
        return Ok(user);
    }

    [HttpPost("set-password")]
    public async Task<ActionResult<UserDto>> SetPasswordAsync(SetPasswordInput input)
    {
        var user = await _userManagementAppService.SetPasswordAsync(input);
        return Ok(user);
    }

    [HttpPost("update-user")]
    public async Task<ActionResult<UserDto>> UpdateUserAsync(UpdateUserDto input)
    {
        var user = await _userManagementAppService.UpdateUserAsync(input.UserId, input);
        return Ok(user);
    }
}

public class GetUsersByRoleInput
{
    public string RoleName { get; set; } = string.Empty;
}

public class CreateUserDtoDto
{
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string RoleName { get; set; } = string.Empty;
}