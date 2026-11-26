using System;
using System.Threading.Tasks;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Identity;
using Volo.Abp.Users;
using MediFlow.Pharmacies;
using MediFlow.Warehouses;

namespace MediFlow.Services;

/// <summary>
/// Rol bazlı veri kapsamı (row-level scoping) yardımcı servisi.
///
/// - Admin / Supplier      : kapsam yok (null) — sınırsız erişim
/// - PharmacyAdmin / Sales : yalnızca kendi eczanesi (kullanıcının ExtraProperties["PharmacyName"])
/// - WarehouseAdmin        : yalnızca kendi deposu (kullanıcının ExtraProperties["WarehouseName"])
///
/// Eşleşen kurum bulunamazsa Guid.Empty döner: bu, kullanıcının hiçbir kayda
/// erişememesi anlamına gelir (fail-closed).
/// </summary>
public class UserScopeService : ITransientDependency
{
    private readonly ICurrentUser _currentUser;
    private readonly IdentityUserManager _userManager;
    private readonly IRepository<Pharmacy, Guid> _pharmacyRepository;
    private readonly IRepository<Warehouse, Guid> _warehouseRepository;

    public UserScopeService(
        ICurrentUser currentUser,
        IdentityUserManager userManager,
        IRepository<Pharmacy, Guid> pharmacyRepository,
        IRepository<Warehouse, Guid> warehouseRepository)
    {
        _currentUser = currentUser;
        _userManager = userManager;
        _pharmacyRepository = pharmacyRepository;
        _warehouseRepository = warehouseRepository;
    }

    public bool IsAdmin() => _currentUser.Roles != null && _currentUser.Roles.Contains("Admin");

    public bool IsSupplier() => _currentUser.Roles != null && _currentUser.Roles.Contains("Supplier");

    public bool HasPharmacyRole() => _currentUser.Roles != null &&
        (_currentUser.Roles.Contains("PharmacyAdmin") || _currentUser.Roles.Contains("Sales"));

    public bool HasWarehouseRole() => _currentUser.Roles != null &&
        _currentUser.Roles.Contains("WarehouseAdmin");

    /// <summary>
    /// Güncel kullanıcının eczane kapsamı (PharmacyId).
    /// Admin/Supplier/Tedarikçi için null; eczane rolleri için eczane GUID'u;
    /// kurum eşleşmesi yoksa Guid.Empty (erişim kapalı).
    /// </summary>
    public async Task<Guid?> GetPharmacyScopeAsync()
    {
        if (IsAdmin() || IsSupplier())
        {
            return null;
        }

        if (!HasPharmacyRole())
        {
            return null;
        }

        var pharmacyName = await GetUserExtraPropertyAsync("PharmacyName");
        if (string.IsNullOrWhiteSpace(pharmacyName))
        {
            return Guid.Empty;
        }

        var pharmacy = await _pharmacyRepository.FirstOrDefaultAsync(p => p.Name == pharmacyName);
        return pharmacy?.Id ?? Guid.Empty;
    }

    /// <summary>
    /// Güncel kullanıcının depo kapsamı (WarehouseId).
    /// Admin/Supplier için null; WarehouseAdmin için depo GUID'u;
    /// kurum eşleşmesi yoksa Guid.Empty (erişim kapalı).
    /// </summary>
    public async Task<Guid?> GetWarehouseScopeAsync()
    {
        if (IsAdmin() || IsSupplier())
        {
            return null;
        }

        if (!HasWarehouseRole())
        {
            return null;
        }

        var warehouseName = await GetUserExtraPropertyAsync("WarehouseName");
        if (string.IsNullOrWhiteSpace(warehouseName))
        {
            return Guid.Empty;
        }

        var warehouse = await _warehouseRepository.FirstOrDefaultAsync(w => w.Name == warehouseName);
        return warehouse?.Id ?? Guid.Empty;
    }

    private async Task<string> GetUserExtraPropertyAsync(string key)
    {
        if (_currentUser.Id == null)
        {
            return null;
        }

        var user = await _userManager.FindByIdAsync(_currentUser.Id.Value.ToString());
        return user.ExtraProperties.TryGetValue(key, out var value) ? value?.ToString() : null;
    }
}
