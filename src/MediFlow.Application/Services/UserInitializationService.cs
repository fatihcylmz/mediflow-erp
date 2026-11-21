using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Guids;
using Volo.Abp.Identity;
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

        public UserInitializationService(
            IdentityUserManager userManager,
            IdentityRoleManager roleManager,
            ILogger<UserInitializationService> logger,
            IGuidGenerator guidGenerator,
            IUnitOfWorkManager unitOfWorkManager)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _logger = logger;
            _guidGenerator = guidGenerator;
            _unitOfWorkManager = unitOfWorkManager;
        }

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

                foreach (var roleName in roleNames)
                {
                    await _userManager.AddToRoleAsync(user, roleName);
                }

                _logger.LogInformation("KULLANICI OLUSTURULDU: {Username}", username);
            }
            else
            {
                _logger.LogInformation("KULLANICI ZATEN MEVCUT: {Username}", username);
            }
        }
    }
}
