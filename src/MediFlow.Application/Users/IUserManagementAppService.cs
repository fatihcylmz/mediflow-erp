using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace MediFlow.Users;

public interface IUserManagementAppService : IApplicationService
{
    Task<List<UserDto>> GetUsersByRoleAsync(string roleName);
    Task<UserDto> CreateUserAsync(CreateUserDto input);
    Task<UserDto> UpdateUserAsync(Guid userId, UpdateUserDto input);
    Task<UserDto> SetUserRoleAsync(Guid userId, string roleName);
    Task<UserDto> DeleteUserAsync(Guid userId);
    Task<UserDto> SetPasswordAsync(SetPasswordInput input);
}

public class SetPasswordInput
{
    public Guid UserId { get; set; }
    public string NewPassword { get; set; } = string.Empty;
}

public class UserDto
{
    public Guid Id { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string? Surname { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Address { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public string? RoleDisplayName { get; set; }
    public bool IsActive { get; set; } = true;
}

public class CreateUserDto
{
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? Address { get; set; }
    /// <summary>Admin | PharmacyAdmin(Eczacı) | WarehouseAdmin(Depocu) | Supplier(Tedarikçi)</summary>
    public string RoleName { get; set; } = string.Empty;

    // Rol bazlı ek bilgiler
    public string? PharmacyName { get; set; }
    public string? PharmacyGln { get; set; }
    public string? WarehouseName { get; set; }
    public string? WarehouseLocation { get; set; }
    public string? SupplierName { get; set; }
    public string? SupplierTaxNumber { get; set; }
}

public class UpdateUserDto
{
    public Guid UserId { get; set; }
    public string? UserName { get; set; }
    public string? Email { get; set; }
    public string? Name { get; set; }
    public string? Surname { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Address { get; set; }
    public string RoleName { get; set; } = string.Empty;
}
