using System;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Identity;
using Volo.Abp.MultiTenancy;
using Volo.Abp.Uow;
using MediFlow.Permissions;
using System.Security.Claims;
using System.Collections.Generic;

namespace MediFlow.EntityFrameworkCore;

public class PermissionDataSeedContributor : IDataSeedContributor, ITransientDependency
{
    private readonly IdentityRoleManager _roleManager;
    private readonly ICurrentTenant _currentTenant;

    public PermissionDataSeedContributor(IdentityRoleManager roleManager, ICurrentTenant currentTenant)
    {
        _roleManager = roleManager;
        _currentTenant = currentTenant;
    }

    [UnitOfWork]
    public virtual async Task SeedAsync(DataSeedContext context)
    {
        // Önce rolleri garanti altına al (UserDataSeedContributor henüz çalışmamış olabilir).
        // Eski sürümde rol yokken FindByNameAsync null dönüp sessizce return ettiği için
        // non-admin rollere 0 claim yazılıyordu (fail-closed 403 boşluğunun kök nedeni).
        await EnsureRoleAsync("Admin");
        await EnsureRoleAsync("PharmacyAdmin");
        await EnsureRoleAsync("Supplier");
        await EnsureRoleAsync("WarehouseAdmin");
        await EnsureRoleAsync("Sales");

        await GrantPermissionsToRoleAsync("PharmacyAdmin", GetPharmacyPermissions());
        await GrantPermissionsToRoleAsync("Supplier", GetSupplierPermissions());
        await GrantPermissionsToRoleAsync("WarehouseAdmin", GetWarehousePermissions());
        await GrantPermissionsToRoleAsync("Sales", GetSalesPermissions());
    }

    private async Task EnsureRoleAsync(string roleName)
    {
        if (await _roleManager.RoleExistsAsync(roleName)) return;
        await _roleManager.CreateAsync(new IdentityRole(Guid.NewGuid(), roleName, _currentTenant.Id));
    }

    private async Task GrantPermissionsToRoleAsync(string roleName, List<string> permissions)
    {
        var role = await _roleManager.FindByNameAsync(roleName);
        if (role == null)
        {
            // Rol hiç oluşmamışsa oluştur (CreateAsync IdentityResult döndürür, entity değil)
            await _roleManager.CreateAsync(new IdentityRole(Guid.NewGuid(), roleName, _currentTenant.Id));
            role = await _roleManager.FindByNameAsync(roleName);
            if (role == null) return;
        }

        var existingClaims = await _roleManager.GetClaimsAsync(role);
        var existingPerms = existingClaims.Where(c => c.Type == "permission").Select(c => c.Value).ToHashSet();

        foreach (var perm in permissions.Distinct())
        {
            if (!existingPerms.Contains(perm))
            {
                await _roleManager.AddClaimAsync(role, new Claim("permission", perm));
                // Add long URI format for compatibility if needed
                await _roleManager.AddClaimAsync(role, new Claim("http://www.aspnetboilerplate.com/claims/permission", perm));
            }
        }
    }

    private List<string> GetPharmacyPermissions()
    {
        return new List<string>
        {
            MediFlowPermissions.Dashboard,
            MediFlowPermissions.DashboardStats,
            MediFlowPermissions.Drugs,
            MediFlowPermissions.DrugsView,
            // Spec: etken madde yalnızca okuma (Create/Edit/Delete KESİNLİKLE kapalı)
            MediFlowPermissions.Ingredients,
            MediFlowPermissions.IngredientsView,
            MediFlowPermissions.Orders,
            MediFlowPermissions.OrdersView,
            MediFlowPermissions.OrdersCreate,
            MediFlowPermissions.OrdersEdit,
            MediFlowPermissions.OrdersDelete,
            MediFlowPermissions.Prescriptions,
            MediFlowPermissions.PrescriptionsView,
            MediFlowPermissions.PrescriptionsCreate,
            MediFlowPermissions.PrescriptionsEdit,
            MediFlowPermissions.Sales,
            MediFlowPermissions.SalesView,
            MediFlowPermissions.SalesCreate,
            MediFlowPermissions.SalesEdit,
            MediFlowPermissions.SalesCancel,
            MediFlowPermissions.Payments,
            MediFlowPermissions.PaymentsView,
            MediFlowPermissions.PaymentsCreate,
            MediFlowPermissions.Inventory,
            MediFlowPermissions.InventoryView,
            MediFlowPermissions.Returns,
            MediFlowPermissions.ReturnsView,
            MediFlowPermissions.ReturnsCreate,
            MediFlowPermissions.Customers,
            MediFlowPermissions.CustomersView,
            MediFlowPermissions.CustomersCreate
        };
    }

    private List<string> GetSupplierPermissions()
    {
        return new List<string>
        {
            MediFlowPermissions.Dashboard,
            MediFlowPermissions.DashboardStats,
            MediFlowPermissions.Orders,
            MediFlowPermissions.OrdersView,
            MediFlowPermissions.OrdersApprove,
            MediFlowPermissions.Shipments,
            MediFlowPermissions.ShipmentsView,
            MediFlowPermissions.ShipmentsCreate,
            MediFlowPermissions.ShipmentsEdit,
            MediFlowPermissions.ShipmentsDispatch,
            MediFlowPermissions.Invoices,
            MediFlowPermissions.InvoicesView,
            MediFlowPermissions.InvoicesCreate,
            MediFlowPermissions.InvoicesEdit,
            MediFlowPermissions.Payments,
            MediFlowPermissions.PaymentsView,
            MediFlowPermissions.DrugsView
        };
    }

    private List<string> GetWarehousePermissions()
    {
        return new List<string>
        {
            MediFlowPermissions.Dashboard,
            MediFlowPermissions.DashboardStats,
            MediFlowPermissions.Inventory,
            MediFlowPermissions.InventoryView,
            MediFlowPermissions.InventoryManage,
            // Warehouse ayrıca siparişlerini görüp onaylayabilsin (spec: Orders açık)
            MediFlowPermissions.Orders,
            MediFlowPermissions.OrdersView,
            MediFlowPermissions.Warehouses,
            MediFlowPermissions.WarehousesView,
            MediFlowPermissions.Shipments,
            MediFlowPermissions.ShipmentsView,
            MediFlowPermissions.ShipmentsEdit,
            MediFlowPermissions.Drugs,
            MediFlowPermissions.DrugsView
        };
    }

    private List<string> GetSalesPermissions()
    {
        return new List<string>
        {
            MediFlowPermissions.Dashboard,
            MediFlowPermissions.DashboardStats,
            MediFlowPermissions.Sales,
            MediFlowPermissions.SalesView,
            MediFlowPermissions.SalesCreate,
            MediFlowPermissions.Customers,
            MediFlowPermissions.CustomersView,
            MediFlowPermissions.PrescriptionsView,
            MediFlowPermissions.DrugsView
        };
    }
}
