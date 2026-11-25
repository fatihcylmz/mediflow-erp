using System;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Identity;
using Volo.Abp.Uow;
using Volo.Abp.MultiTenancy;

namespace MediFlow.EntityFrameworkCore;

public class UserDataSeedContributor : IDataSeedContributor, ITransientDependency
{
    private readonly IdentityUserManager _userManager;
    private readonly IdentityRoleManager _roleManager;
    private readonly ICurrentTenant _currentTenant;

    public UserDataSeedContributor(
        IdentityUserManager userManager,
        IdentityRoleManager roleManager,
        ICurrentTenant currentTenant)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _currentTenant = currentTenant;
    }

    [UnitOfWork]
    public virtual async Task SeedAsync(DataSeedContext context)
    {
        await CreateRolesAsync();
        await CreateUsersAsync();
    }

    private async Task CreateRolesAsync()
    {
        string[] roles = { "Admin", "PharmacyAdmin", "WarehouseAdmin", "Supplier", "Sales" };

        foreach (var roleName in roles)
        {
            if (!await _roleManager.RoleExistsAsync(roleName))
            {
                await _roleManager.CreateAsync(new IdentityRole(Guid.NewGuid(), roleName, _currentTenant.Id));
            }
        }
    }

    private async Task CreateUsersAsync()
    {
        var users = new[]
        {
            new { UserName = "admin_mehmet", Email = "admin@mediflow.local", Password = "Admin123!", Role = "Admin", Name = "Mehmet", Surname = "Zortmaz" },
            new { UserName = "eczane_ahmet", Email = "eczane@mediflow.local", Password = "Pharmacy123!", Role = "PharmacyAdmin", Name = "Ahmet", Surname = "Eczacı" },
            new { UserName = "depo_ayse", Email = "depo@mediflow.local", Password = "Warehouse123!", Role = "WarehouseAdmin", Name = "Ayşe", Surname = "Depocu" },
            new { UserName = "tedarikci_mustafa", Email = "tedarikci@mediflow.local", Password = "Supplier123!", Role = "Supplier", Name = "Mustafa", Surname = "Tedarikçi" },
            new { UserName = "sales_cemal", Email = "sales@mediflow.local", Password = "Sales123!", Role = "Sales", Name = "Cemal", Surname = "Satış" },
        };

        foreach (var u in users)
        {
            var existing = await _userManager.FindByNameAsync(u.UserName);
            if (existing != null)
            {
                // Kullanıcı varsa güncelle (şifre, email, isim, rol)
                await _userManager.SetEmailAsync(existing, u.Email);
                existing.Name = u.Name;
                existing.Surname = u.Surname;
                existing.SetEmailConfirmed(true);
                await _userManager.UpdateAsync(existing);

                // Şifre güncelle
                await _userManager.RemovePasswordAsync(existing);
                await _userManager.AddPasswordAsync(existing, u.Password);

                // Rol güncelle
                var currentRoles = await _userManager.GetRolesAsync(existing);
                foreach (var role in currentRoles)
                {
                    await _userManager.RemoveFromRoleAsync(existing, role);
                }
                if (!await _roleManager.RoleExistsAsync(u.Role))
                {
                    await _roleManager.CreateAsync(new IdentityRole(Guid.NewGuid(), u.Role, _currentTenant.Id));
                }
                await _userManager.AddToRoleAsync(existing, u.Role);
                continue;
            }

            var user = new IdentityUser(Guid.NewGuid(), u.UserName, u.Email, _currentTenant.Id)
            {
                Name = u.Name,
                Surname = u.Surname,
            };
            user.SetEmailConfirmed(true);

            var result = await _userManager.CreateAsync(user, u.Password);
            if (!result.Succeeded)
            {
                throw new System.Exception($"Kullanıcı '{u.UserName}' oluşturulamadı: {string.Join(", ", result.Errors.Select(e => e.Description))}");
            }

            if (!await _roleManager.RoleExistsAsync(u.Role))
            {
                await _roleManager.CreateAsync(new IdentityRole(Guid.NewGuid(), u.Role, _currentTenant.Id));
            }

            await _userManager.AddToRoleAsync(user, u.Role);
        }
    }
}