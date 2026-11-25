using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Identity;
using Volo.Abp.Data;

namespace MediFlow.Users;

public static class MediFlowRoles
{
    public const string Admin = "Admin";
    public const string PharmacyAdmin = "PharmacyAdmin";
    public const string Supplier = "Supplier";
    public const string WarehouseAdmin = "WarehouseAdmin";
    public const string Sales = "Sales";

    // Arayüzde kullanılan Türkçe etiketler -> ABP rol adları
    private static readonly Dictionary<string, string> Aliases = new(StringComparer.OrdinalIgnoreCase)
    {
        ["Admin"] = Admin,
        ["Yönetici"] = Admin,
        ["Yonetici"] = Admin,
        ["Eczacı"] = PharmacyAdmin,
        ["Eczaci"] = PharmacyAdmin,
        ["Eczane"] = PharmacyAdmin,
        ["PharmacyAdmin"] = PharmacyAdmin,
        ["Depocu"] = WarehouseAdmin,
        ["Depo"] = WarehouseAdmin,
        ["WarehouseAdmin"] = WarehouseAdmin,
        ["Tedarikçi"] = Supplier,
        ["Tedarikci"] = Supplier,
        ["Supplier"] = Supplier,
        ["Sales"] = Sales,
        ["Satış"] = Sales,
    };

    /// <summary>
    /// Verilen rol adını (Türkçe etiket ya da ABP rol adı) standart ABP rol adına çevirir.
    /// Boş değer boş string olarak döner.
    /// </summary>
    public static string Normalize(string? roleName)
    {
        if (string.IsNullOrWhiteSpace(roleName))
        {
            return string.Empty;
        }

        var trimmed = roleName.Trim();
        return Aliases.TryGetValue(trimmed, out var normalized) ? normalized : trimmed;
    }

    /// <summary>Arayüzde gösterilecek Türkçe etiket.</summary>
    public static string DisplayName(string? roleName)
    {
        return Normalize(roleName) switch
        {
            Admin => "Admin",
            PharmacyAdmin => "Eczacı",
            WarehouseAdmin => "Depocu",
            Supplier => "Tedarikçi",
            Sales => "Satış",
            _ => roleName ?? string.Empty
        };
    }

    public static bool IsAdmin(string? roleName) => Normalize(roleName) == Admin;
}

public class UserManagementAppService : MediFlowAppService, IUserManagementAppService
{
    private readonly IdentityUserManager _userManager;
    private readonly IdentityRoleManager _roleManager;
    private readonly IIdentityUserRepository _userRepository;

    public UserManagementAppService(
        IdentityUserManager userManager,
        IdentityRoleManager roleManager,
        IIdentityUserRepository userRepository)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _userRepository = userRepository;
    }

    public async Task<List<UserDto>> GetUsersByRoleAsync(string roleName)
    {
        var normalizedRole = MediFlowRoles.Normalize(roleName);

        List<IdentityUser> users;
        if (string.IsNullOrEmpty(normalizedRole) || normalizedRole == "all" || normalizedRole == "Tüm Roller")
        {
            users = (await _userRepository.GetListAsync(sorting: nameof(IdentityUser.UserName))).ToList();
        }
        else
        {
            users = (await _userManager.GetUsersInRoleAsync(normalizedRole)).ToList();
        }

        var userDtos = new List<UserDto>();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            var role = roles.FirstOrDefault() ?? string.Empty;

            userDtos.Add(new UserDto
            {
                Id = user.Id,
                UserName = user.UserName ?? string.Empty,
                Email = user.Email ?? string.Empty,
                Name = user.Name,
                Surname = user.Surname,
                PhoneNumber = user.PhoneNumber,
                Address = user.ExtraProperties.GetValueOrDefault("Address") as string,
                RoleName = role,
                RoleDisplayName = MediFlowRoles.DisplayName(role),
                IsActive = user.IsActive
            });
        }

        return userDtos;
    }

    public async Task<UserDto> CreateUserAsync(CreateUserDto input)
    {
        if (string.IsNullOrWhiteSpace(input.UserName) || string.IsNullOrWhiteSpace(input.Password))
        {
            throw new UserFriendlyException("Kullanıcı adı ve şifre zorunludur!");
        }

        var email = string.IsNullOrWhiteSpace(input.Email)
            ? $"{input.UserName.Trim()}@mediflow.local"
            : input.Email.Trim();

        var user = new MediFlowUser(
            Guid.NewGuid(),
            input.UserName.Trim(),
            email,
            CurrentTenant.Id
        )
        {
            Name = input.Name,
            Surname = input.Surname
        };

        // Telefon numarası IdentityUserManager üzerinden atanmalı (setter protected internal)
        if (!string.IsNullOrWhiteSpace(input.PhoneNumber))
        {
            await _userManager.SetPhoneNumberAsync(user, input.PhoneNumber);
        }

        // Rol bazlı ek bilgiler ExtraProperties içinde saklanır
        if (!string.IsNullOrWhiteSpace(input.Address))
        {
            user.ExtraProperties["Address"] = input.Address;
        }
        if (!string.IsNullOrWhiteSpace(input.PharmacyName))
        {
            user.ExtraProperties["PharmacyName"] = input.PharmacyName;
        }
        if (!string.IsNullOrWhiteSpace(input.PharmacyGln))
        {
            user.ExtraProperties["PharmacyGln"] = input.PharmacyGln;
        }
        if (!string.IsNullOrWhiteSpace(input.WarehouseName))
        {
            user.ExtraProperties["WarehouseName"] = input.WarehouseName;
        }
        if (!string.IsNullOrWhiteSpace(input.WarehouseLocation))
        {
            user.ExtraProperties["WarehouseLocation"] = input.WarehouseLocation;
        }
        if (!string.IsNullOrWhiteSpace(input.SupplierName))
        {
            user.ExtraProperties["SupplierName"] = input.SupplierName;
        }
        if (!string.IsNullOrWhiteSpace(input.SupplierTaxNumber))
        {
            user.ExtraProperties["SupplierTaxNumber"] = input.SupplierTaxNumber;
        }

        user.SetEmailConfirmed(true);

        var result = await _userManager.CreateAsync(user, input.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new UserFriendlyException($"Kullanıcı oluşturulamadı: {errors}");
        }

        var normalizedRole = MediFlowRoles.Normalize(input.RoleName);
        if (!string.IsNullOrWhiteSpace(normalizedRole))
        {
            if (!await _roleManager.RoleExistsAsync(normalizedRole))
            {
                await _roleManager.CreateAsync(new IdentityRole(Guid.NewGuid(), normalizedRole, CurrentTenant.Id));
            }
            await _userManager.AddToRoleAsync(user, normalizedRole);
        }

        return new UserDto
        {
            Id = user.Id,
            UserName = user.UserName ?? string.Empty,
            Email = user.Email ?? string.Empty,
            Name = user.Name,
            Surname = user.Surname,
            PhoneNumber = user.PhoneNumber,
            Address = user.ExtraProperties.GetValueOrDefault("Address") as string,
            RoleName = normalizedRole,
            RoleDisplayName = MediFlowRoles.DisplayName(normalizedRole),
            IsActive = true
        };
    }

    public async Task<UserDto> UpdateUserAsync(Guid userId, UpdateUserDto input)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString())
                   ?? throw new UserFriendlyException("Kullanıcı bulunamadı!");

        // Temel bilgileri güncelle
        if (!string.IsNullOrWhiteSpace(input.UserName))
        {
            await _userManager.SetUserNameAsync(user, input.UserName.Trim());
        }
        if (!string.IsNullOrWhiteSpace(input.Email))
        {
            await _userManager.SetEmailAsync(user, input.Email.Trim());
        }
        if (!string.IsNullOrWhiteSpace(input.Name))
        {
            user.Name = input.Name.Trim();
        }
        if (!string.IsNullOrWhiteSpace(input.Surname))
        {
            user.Surname = input.Surname.Trim();
        }

        // Telefon numarası IdentityUserManager üzerinden atanmalı (setter protected internal)
        if (!string.IsNullOrWhiteSpace(input.PhoneNumber))
        {
            await _userManager.SetPhoneNumberAsync(user, input.PhoneNumber);
        }

        // Adres ExtraProperties içinde saklanır
        if (!string.IsNullOrWhiteSpace(input.Address))
        {
            user.ExtraProperties["Address"] = input.Address;
        }
        else
        {
            // Eğer adres boşsa temizle
            user.ExtraProperties.Remove("Address");
        }

        // Şifre güncelleme
        if (!string.IsNullOrWhiteSpace(input.Password))
        {
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            await _userManager.ResetPasswordAsync(user, token, input.Password.Trim());
        }

        // Rol değiştirme
        var normalizedRole = MediFlowRoles.Normalize(input.RoleName);
        if (!string.IsNullOrWhiteSpace(normalizedRole))
        {
            if (!await _roleManager.RoleExistsAsync(normalizedRole))
            {
                await _roleManager.CreateAsync(new IdentityRole(Guid.NewGuid(), normalizedRole, CurrentTenant.Id));
            }

            var currentRoles = await _userManager.GetRolesAsync(user);
            if (currentRoles.Any())
            {
                var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
                if (!removeResult.Succeeded)
                {
                    throw new UserFriendlyException("Mevcut rol kaldırılamadı!");
                }
            }

            await _userManager.AddToRoleAsync(user, normalizedRole);
        }

        return new UserDto
        {
            Id = user.Id,
            UserName = user.UserName ?? string.Empty,
            Email = user.Email ?? string.Empty,
            Name = user.Name,
            Surname = user.Surname,
            PhoneNumber = user.PhoneNumber,
            Address = user.ExtraProperties.GetValueOrDefault("Address") as string,
            RoleName = normalizedRole,
            RoleDisplayName = MediFlowRoles.DisplayName(normalizedRole),
            IsActive = user.IsActive
        };
    }

    public async Task<UserDto> SetUserRoleAsync(Guid userId, string roleName)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString())
                   ?? throw new UserFriendlyException("Kullanıcı bulunamadı!");

        var normalizedRole = MediFlowRoles.Normalize(roleName);
        if (string.IsNullOrWhiteSpace(normalizedRole))
        {
            throw new UserFriendlyException("Rol seçilmedi!");
        }

        if (!await _roleManager.RoleExistsAsync(normalizedRole))
        {
            await _roleManager.CreateAsync(new IdentityRole(Guid.NewGuid(), normalizedRole, CurrentTenant.Id));
        }

        var currentRoles = await _userManager.GetRolesAsync(user);
        if (currentRoles.Any())
        {
            var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
            if (!removeResult.Succeeded)
            {
                throw new UserFriendlyException("Mevcut rol kaldırılamadı!");
            }
        }

        await _userManager.AddToRoleAsync(user, normalizedRole);

        return new UserDto
        {
            Id = user.Id,
            UserName = user.UserName ?? string.Empty,
            Email = user.Email ?? string.Empty,
            Name = user.Name,
            Surname = user.Surname,
            PhoneNumber = user.PhoneNumber,
            Address = user.ExtraProperties.GetValueOrDefault("Address") as string,
            RoleName = normalizedRole,
            RoleDisplayName = MediFlowRoles.DisplayName(normalizedRole),
            IsActive = user.IsActive
        };
    }

        public async Task<UserDto> SetPasswordAsync(SetPasswordInput input)
    {
        var user = await _userManager.FindByIdAsync(input.UserId.ToString())
                   ?? throw new UserFriendlyException("Kullanıcı bulunamadı!");

        if (string.IsNullOrWhiteSpace(input.NewPassword))
        {
            throw new UserFriendlyException("Yeni şifre boş olamaz!");
        }

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var result = await _userManager.ResetPasswordAsync(user, token, input.NewPassword);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new UserFriendlyException($"Şifre güncellenemedi: {errors}");
        }

        var roles = await _userManager.GetRolesAsync(user);
        var role = roles.FirstOrDefault() ?? string.Empty;

        return new UserDto
        {
            Id = user.Id,
            UserName = user.UserName ?? string.Empty,
            Email = user.Email ?? string.Empty,
            Name = user.Name,
            Surname = user.Surname,
            PhoneNumber = user.PhoneNumber,
            Address = user.ExtraProperties.GetValueOrDefault("Address") as string,
            RoleName = role,
            RoleDisplayName = MediFlowRoles.DisplayName(role),
            IsActive = user.IsActive
        };
    }

    public async Task<UserDto> DeleteUserAsync(Guid userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString())
                   ?? throw new UserFriendlyException("Kullanıcı bulunamadı!");

        // Silinmeden önce bilgiyi al
        var normalizedRole = (await _userManager.GetRolesAsync(user)).FirstOrDefault() ?? string.Empty;

        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new UserFriendlyException($"Kullanıcı silinemedi: {errors}");
        }

        return new UserDto
        {
            Id = user.Id,
            UserName = user.UserName ?? string.Empty,
            Email = user.Email ?? string.Empty,
            Name = user.Name,
            Surname = user.Surname,
            RoleName = normalizedRole,
            IsActive = false
        };
    }
}
