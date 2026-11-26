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

    private static readonly string[] PermissionClaimTypes =
    {
        "permission",
        "http://www.aspnetboilerplate.com/claims/permission"
    };

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

        var allowed = permissions.Distinct().ToHashSet();
        var existingClaims = await _roleManager.GetClaimsAsync(role);

        // Yetkili seed: bu rollerin eski seed'lardan kalan, yeni setin dışındaki
        // permission claim'lerini (Create/Edit/Delete vb.) kaldır — fail-closed kuralı.
        var staleClaims = existingClaims
            .Where(c => PermissionClaimTypes.Contains(c.Type) && !allowed.Contains(c.Value))
            .ToList();
        foreach (var stale in staleClaims)
        {
            await _roleManager.RemoveClaimAsync(role, stale);
        }

        var grantedPerms = existingClaims
            .Where(c => c.Type == "permission" && allowed.Contains(c.Value))
            .Select(c => c.Value)
            .ToHashSet();

        foreach (var perm in allowed.Where(p => !grantedPerms.Contains(p)))
        {
            await _roleManager.AddClaimAsync(role, new Claim("permission", perm));
            // Add long URI format for compatibility if needed
            await _roleManager.AddClaimAsync(role, new Claim("http://www.aspnetboilerplate.com/claims/permission", perm));
        }
    }

    private List<string> GetPharmacyPermissions()
    {
        return new List<string>
        {
            // Role dashboard'u (App.tsx PharmacyDashboard): /api/app/dashboard/trend -> DashboardTrend
            MediFlowPermissions.Dashboard,
            MediFlowPermissions.DashboardStats,
            MediFlowPermissions.DashboardTrend,

            // SALT OKUNUR (parent + View; Create/Edit/Delete KESİNLİKLE kapalı)
            MediFlowPermissions.Drugs,
            MediFlowPermissions.DrugsView,
            MediFlowPermissions.Ingredients,
            MediFlowPermissions.IngredientsView,
            MediFlowPermissions.Pharmacies,
            MediFlowPermissions.PharmaciesView,
            MediFlowPermissions.Suppliers,
            MediFlowPermissions.SuppliersView,
            MediFlowPermissions.Warehouses,
            MediFlowPermissions.WarehousesView,
            MediFlowPermissions.Invoices,
            MediFlowPermissions.InvoicesView,

            // TAM YETKİ (kendi eczanesi kapsamında) — Default(parent), Create, Edit
            // Inventories/StockBatches: GET -> InventoryView, POST/PUT/DELETE -> InventoryManage
            MediFlowPermissions.Inventory,
            MediFlowPermissions.InventoryView,
            MediFlowPermissions.InventoryManage,
            MediFlowPermissions.Prescriptions,
            MediFlowPermissions.PrescriptionsView,
            MediFlowPermissions.PrescriptionsCreate,
            MediFlowPermissions.PrescriptionsEdit,
            MediFlowPermissions.Orders,
            MediFlowPermissions.OrdersView,
            MediFlowPermissions.OrdersCreate,
            MediFlowPermissions.OrdersEdit,
            MediFlowPermissions.Sales,
            MediFlowPermissions.SalesView,
            MediFlowPermissions.SalesCreate,
            MediFlowPermissions.SalesEdit,
            MediFlowPermissions.Returns,
            MediFlowPermissions.ReturnsView,
            MediFlowPermissions.ReturnsCreate,
            MediFlowPermissions.ReturnsEdit,
            MediFlowPermissions.Payments,
            MediFlowPermissions.PaymentsView,
            MediFlowPermissions.PaymentsCreate,
            MediFlowPermissions.PaymentsEdit
        };
    }

    private List<string> GetSupplierPermissions()
    {
        return new List<string>
        {
            MediFlowPermissions.Dashboard,
            MediFlowPermissions.DashboardStats,
            MediFlowPermissions.DashboardTrend,

            // SALT OKUNUR (parent + View)
            MediFlowPermissions.Drugs,
            MediFlowPermissions.DrugsView,
            MediFlowPermissions.Ingredients,
            MediFlowPermissions.IngredientsView,
            MediFlowPermissions.Pharmacies,
            MediFlowPermissions.PharmaciesView,
            MediFlowPermissions.Warehouses,
            MediFlowPermissions.WarehousesView,
            // Inventories/StockBatches salt okunur: GET -> InventoryView
            MediFlowPermissions.Inventory,
            MediFlowPermissions.InventoryView,
            MediFlowPermissions.Returns,
            MediFlowPermissions.ReturnsView,

            // TAM YETKİ — Orders (Default, Edit/Onay)
            MediFlowPermissions.Orders,
            MediFlowPermissions.OrdersView,
            MediFlowPermissions.OrdersEdit,
            MediFlowPermissions.OrdersApprove,
            // Shipments (Default, Create, Edit)
            MediFlowPermissions.Shipments,
            MediFlowPermissions.ShipmentsView,
            MediFlowPermissions.ShipmentsCreate,
            MediFlowPermissions.ShipmentsEdit,
            // Invoices (Default, Create, Edit)
            MediFlowPermissions.Invoices,
            MediFlowPermissions.InvoicesView,
            MediFlowPermissions.InvoicesCreate,
            MediFlowPermissions.InvoicesEdit,
            // Payments (Default, Create)
            MediFlowPermissions.Payments,
            MediFlowPermissions.PaymentsView,
            MediFlowPermissions.PaymentsCreate
        };
    }

    private List<string> GetWarehousePermissions()
    {
        return new List<string>
        {
            MediFlowPermissions.Dashboard,
            MediFlowPermissions.DashboardStats,
            MediFlowPermissions.DashboardTrend,

            // SALT OKUNUR (parent + View)
            MediFlowPermissions.Drugs,
            MediFlowPermissions.DrugsView,
            MediFlowPermissions.Ingredients,
            MediFlowPermissions.IngredientsView,
            MediFlowPermissions.Pharmacies,
            MediFlowPermissions.PharmaciesView,
            MediFlowPermissions.Suppliers,
            MediFlowPermissions.SuppliersView,
            MediFlowPermissions.Returns,
            MediFlowPermissions.ReturnsView,

            // TAM YETKİ
            // Warehouses.Default: class -> Warehouses, GET -> WarehousesView
            MediFlowPermissions.Warehouses,
            MediFlowPermissions.WarehousesView,
            // Inventories/StockBatches (Default, Create, Edit): GET -> InventoryView, POST/PUT/DELETE -> InventoryManage
            MediFlowPermissions.Inventory,
            MediFlowPermissions.InventoryView,
            MediFlowPermissions.InventoryManage,
            // Orders.Default: class -> Orders, GET -> OrdersView
            MediFlowPermissions.Orders,
            MediFlowPermissions.OrdersView,
            // Shipments (Default, Create, Edit, Approve/Deliver):
            // GET -> ShipmentsView, POST -> ShipmentsCreate,
            // PUT(status->Delivered/Dispatch) -> ShipmentsEdit (Dispatch claim'i de tutarlılık için ekli)
            MediFlowPermissions.Shipments,
            MediFlowPermissions.ShipmentsView,
            MediFlowPermissions.ShipmentsCreate,
            MediFlowPermissions.ShipmentsEdit,
            MediFlowPermissions.ShipmentsDispatch
        };
    }

    private List<string> GetSalesPermissions()
    {
        return new List<string>
        {
            MediFlowPermissions.Dashboard,
            MediFlowPermissions.DashboardStats,
            MediFlowPermissions.DashboardTrend,
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
