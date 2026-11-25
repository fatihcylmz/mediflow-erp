using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Guids;
using Volo.Abp.Identity;
using Volo.Abp.MultiTenancy;
using Volo.Abp.Uow;
using MediFlow.Application.Configuration;
using Microsoft.Extensions.Logging;
using System.Linq;

namespace MediFlow.Application.Services
{
    public class UserInitializationService : ITransientDependency
    {
        private readonly IdentityUserManager _userManager;
        private readonly IdentityRoleManager _roleManager;
        private readonly ILogger<UserInitializationService> _logger;
        private readonly IGuidGenerator _guidGenerator;
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly ICurrentTenant _currentTenant;

        public UserInitializationService(
            IdentityUserManager userManager,
            IdentityRoleManager roleManager,
            ILogger<UserInitializationService> logger,
            IGuidGenerator guidGenerator,
            IUnitOfWorkManager unitOfWorkManager,
            ICurrentTenant currentTenant)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _logger = logger;
            _guidGenerator = guidGenerator;
            _unitOfWorkManager = unitOfWorkManager;
            _currentTenant = currentTenant;
        }

        [UnitOfWork]
        public async Task InitializeDefaultUsersAsync()
        {
            // Unit of work utility is not available in this version; initialize roles/users without transaction
            await EnsureRoleExistsAsync("Admin", "Admin", new[] { "admin:all" });
            await EnsureRoleExistsAsync("PharmacyAdmin", "Eczane", new[] { "pharmacy:all" });
            await EnsureRoleExistsAsync("Supplier", "Tedarikçi", new[] { "supplier:all" });
            await EnsureRoleExistsAsync("WarehouseAdmin", "Ana Depo", new[] { "warehouse:all" });
            await EnsureRoleExistsAsync("Sales", "Satış Personeli", new[] { "sales:all" });

            await CreateOrUpdateUserAsync(
                MediFlowConfiguration.AdminUsername,
                MediFlowConfiguration.AdminFullName,
                MediFlowConfiguration.AdminEmail,
                MediFlowConfiguration.AdminPassword,
                new[] { "Admin" }
            );

            await CreateOrUpdateUserAsync(
                MediFlowConfiguration.PharmacyAdminUsername,
                MediFlowConfiguration.PharmacyAdminFullName,
                MediFlowConfiguration.PharmacyAdminEmail,
                MediFlowConfiguration.PharmacyAdminPassword,
                new[] { "PharmacyAdmin" }
            );

            await CreateOrUpdateUserAsync(
                MediFlowConfiguration.SupplierUsername,
                MediFlowConfiguration.SupplierFullName,
                MediFlowConfiguration.SupplierEmail,
                MediFlowConfiguration.SupplierPassword,
                new[] { "Supplier" }
            );

            await CreateOrUpdateUserAsync(
                MediFlowConfiguration.WarehouseUsername,
                MediFlowConfiguration.WarehouseFullName,
                MediFlowConfiguration.WarehouseEmail,
                MediFlowConfiguration.WarehousePassword,
                new[] { "WarehouseAdmin" }
            );

            await CreateOrUpdateUserAsync(
                MediFlowConfiguration.SalesUsername,
                MediFlowConfiguration.SalesFullName,
                MediFlowConfiguration.SalesEmail,
                MediFlowConfiguration.SalesPassword,
                new[] { "Sales" }
            );
        }

        private async Task EnsureRoleExistsAsync(string roleName, string displayName, string[] permissions)
        {
            var existingRole = await _roleManager.FindByNameAsync(roleName);
            if (existingRole == null)
            {
                var role = new IdentityRole(_guidGenerator.Create(), roleName, null);
                await _roleManager.CreateAsync(role);
                _logger.LogInformation("ROL OLUSTURULDU: {RoleName}", roleName);
            }
            else
            {
                _logger.LogInformation("ROL ZATEN MEVCUT: {RoleName}", roleName);
            }
        }

        private async Task CreateOrUpdateUserAsync(string username, string fullName, string email, string password, string[] roleNames)
        {
            var existingUser = await _userManager.FindByNameAsync(username);
            if (existingUser == null)
            {
                var user = new IdentityUser(_guidGenerator.Create(), username, email, null);
                user.Name = fullName.Split(' ')[0];
                user.Surname = fullName.Split(' ').Length > 1 ? fullName.Split(' ')[1] : string.Empty;
                user.SetEmailConfirmed(true);

                var result = await _userManager.CreateAsync(user, password);
                if (!result.Succeeded)
                {
                    _logger.LogError("KULLANICI OLUSTURULAMADI: {Username}: {Errors}", username, string.Join(", ", result.Errors.Select(e => e.Description)));
                    return;
                }

                _logger.LogInformation("KULLANICI OLUSTURULDU: {Username} - Roller: {Roles}", username, string.Join(", ", roleNames));
            }
            else
            {
                _logger.LogInformation("KULLANICI ZATEN MEVCUT: {Username} - Bilgiler kontrol ediliyor", username);

                // Email, isim, soyisim güncelle (sadece farklıysa)
                if (existingUser.Email != email)
                {
                    await _userManager.SetEmailAsync(existingUser, email);
                }
                var newName = fullName.Split(' ')[0];
                var newSurname = fullName.Split(' ').Length > 1 ? fullName.Split(' ')[1] : string.Empty;
                if (existingUser.Name != newName || existingUser.Surname != newSurname)
                {
                    existingUser.Name = newName;
                    existingUser.Surname = newSurname;
                    await _userManager.UpdateAsync(existingUser);
                }

                // Şifre güncelle - UoW sorunu yaratmayacak şekilde güncelliyoruz
                // Eğer şifre değişmek istenirse, userManager.ChangePasswordAsync kullanılabilir
                var hasPassword = await _userManager.HasPasswordAsync(existingUser);
                if (!hasPassword || existingUser.PasswordHash == null)
                {
                    var token = await _userManager.GeneratePasswordResetTokenAsync(existingUser);
                    await _userManager.ResetPasswordAsync(existingUser, token, password);
                }

                // Rolleri güncelle - mevcut rolleri kaldır ve yeni rolleri ata
                var currentRoles = await _userManager.GetRolesAsync(existingUser);
                foreach (var role in currentRoles)
                {
                    await _userManager.RemoveFromRoleAsync(existingUser, role);
                }
                // Rolün var olup olmadığını kontrol et, yoksa oluştur
                foreach (var roleName in roleNames)
                {
                    if (!await _roleManager.RoleExistsAsync(roleName))
                    {
                        await _roleManager.CreateAsync(new IdentityRole(Guid.NewGuid(), roleName, _currentTenant.Id));
                    }
                    await _userManager.AddToRoleAsync(existingUser, roleName);
                }

                _logger.LogInformation("KULLANICI BILGILERI GUNCELLENDI: {Username} (Roller güncellendi)", username);
            }
        }
    }
}