using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;
using MediFlow.Dashboard;
using MediFlow.Drugs;
using MediFlow.Inventories;
using MediFlow.Orders;
using MediFlow.Pharmacies;
using MediFlow.Sales;
using MediFlow.Warehouses;

namespace MediFlow.Application.Dashboard;

public class DashboardAppService : ApplicationService, IDashboardAppService
{
    private readonly IRepository<Drug, Guid> _drugRepository;
    private readonly IRepository<StockBatch, Guid> _stockBatchRepository;
    private readonly IRepository<Order, Guid> _orderRepository;
    private readonly IRepository<Sale, Guid> _saleRepository;
    private readonly IRepository<Pharmacy, Guid> _pharmacyRepository;
    private readonly IRepository<Warehouse, Guid> _warehouseRepository;
    private readonly ICurrentUser _currentUser;

    public DashboardAppService(
        IRepository<Drug, Guid> drugRepository,
        IRepository<StockBatch, Guid> stockBatchRepository,
        IRepository<Order, Guid> orderRepository,
        IRepository<Sale, Guid> saleRepository,
        IRepository<Pharmacy, Guid> pharmacyRepository,
        IRepository<Warehouse, Guid> warehouseRepository,
        ICurrentUser currentUser)
    {
        _drugRepository = drugRepository;
        _stockBatchRepository = stockBatchRepository;
        _orderRepository = orderRepository;
        _saleRepository = saleRepository;
        _pharmacyRepository = pharmacyRepository;
        _warehouseRepository = warehouseRepository;
        _currentUser = currentUser;
    }

    private async Task<(Guid? PharmacyId, Guid? WarehouseId, string? Role)> GetUserScopeAsync()
    {
        // Admin ise her şeyi görebilir
        if (await IsInRoleAsync("Admin"))
        {
            return (null, null, "Admin");
        }

        // Kullanıcının rollerini al
        var roles = _currentUser.Roles;

        if (roles.Contains("PharmacyAdmin"))
        {
            // Eczane kullanıcısı - kendi eczane ID'sini bul
            var pharmacy = await _pharmacyRepository.FirstOrDefaultAsync(p => p.GLN == _currentUser.UserName || p.Name.Contains(_currentUser.Name ?? ""));
            return (pharmacy?.Id, null, "PharmacyAdmin");
        }

        if (roles.Contains("Supplier"))
        {
            // Tedarikçi - kendi verilerini görebilir (sipariş, sevkiyat, fatura)
            return (null, null, "Supplier");
        }

        if (roles.Contains("WarehouseAdmin"))
        {
            // Depo kullanıcısı - kendi depo ID'sini bul
            var warehouse = await _warehouseRepository.FirstOrDefaultAsync(w => w.Name.Contains(_currentUser.Name ?? ""));
            return (null, warehouse?.Id, "WarehouseAdmin");
        }

        if (roles.Contains("Sales"))
        {
            // Satış personeli - eczane bazlı
            var pharmacy = await _pharmacyRepository.FirstOrDefaultAsync(p => p.Name.Contains(_currentUser.Name ?? ""));
            return (pharmacy?.Id, null, "Sales");
        }

        return (null, null, null);
    }

    private async Task<bool> IsInRoleAsync(string roleName)
    {
        return _currentUser.Roles.Contains(roleName);
    }

    private DashboardFilterDto ApplyUserScope(DashboardFilterDto filter, Guid? pharmacyId, Guid? warehouseId)
    {
        // Eğer filtre zaten özel bir ID verilmişse (admin için), onu kullan
        // Değilse kullanıcının scope'unu uygula
        if (filter == null)
        {
            filter = new DashboardFilterDto();
        }

        if (!filter.PharmacyId.HasValue && pharmacyId.HasValue)
        {
            filter.PharmacyId = pharmacyId.Value;
        }

        if (!filter.WarehouseId.HasValue && warehouseId.HasValue)
        {
            filter.WarehouseId = warehouseId.Value;
        }

        return filter;
    }

    public async Task<DashboardStatsDto> GetStatsAsync(DashboardFilterDto filter)
    {
        var (pharmacyId, warehouseId, role) = await GetUserScopeAsync();
        filter = ApplyUserScope(filter, pharmacyId, warehouseId);

        var now = DateTime.Now;
        var startDate = filter?.StartDate ?? now.AddDays(-30);
        var endDate = filter?.EndDate ?? now;
        var filterPharmacyId = filter?.PharmacyId;
        var filterWarehouseId = filter?.WarehouseId;

        // 1. Toplam ilaç sayısı - DB'de count
        var drugsCount = await _drugRepository.CountAsync();

        // 2. Aktif siparişler - DB'de filtrele
        var pendingOrders = await _orderRepository.CountAsync(o =>
            o.OrderDate >= startDate && o.OrderDate <= endDate &&
            (!filterPharmacyId.HasValue || o.PharmacyId == filterPharmacyId.Value) &&
            o.Status == OrderStatus.Pending);

        // 3. Stok analizi - DB seviyesinde gruplama (GroupBy) ile bellek verimli
        // Sadece MinimumStockLevel > 0 olan ilaçları al
        var drugQueryable = await _drugRepository.GetQueryableAsync();
        var drugsWithMinStock = await drugQueryable
            .Where(d => d.MinimumStockLevel > 0)
            .Select(d => new { d.Id, d.Name, d.MinimumStockLevel })
            .ToListAsync();

        var drugIdsWithMinStock = drugsWithMinStock.Select(d => d.Id).ToList();

        // DB'de filtreli stok miktarlarını hesapla (warehouse filtresi + karantina hariç)
        var stockBatchQueryable = await _stockBatchRepository.GetQueryableAsync();
        var stockSumsQuery = stockBatchQueryable
            .Where(b => !b.IsQuarantined &&
                        drugIdsWithMinStock.Contains(b.DrugId) &&
                        (!filterWarehouseId.HasValue || b.WarehouseId == filterWarehouseId.Value))
            .GroupBy(b => b.DrugId)
            .Select(g => new { DrugId = g.Key, TotalQty = g.Sum(b => b.Quantity) });

        var stockSums = await stockSumsQuery.ToListAsync();
        var stockDict = stockSums.ToDictionary(x => x.DrugId, x => x.TotalQty);

        // Düşük stok uyarılarını oluştur
        var lowStockDrugs = new List<LowStockWarning>();
        foreach (var drug in drugsWithMinStock)
        {
            var currentStock = stockDict.TryGetValue(drug.Id, out var qty) ? qty : 0;

            if (currentStock < drug.MinimumStockLevel)
            {
                lowStockDrugs.Add(new LowStockWarning
                {
                    DrugId = drug.Id,
                    DrugName = drug.Name,
                    CurrentStock = currentStock,
                    MinimumStock = drug.MinimumStockLevel,
                    Shortage = drug.MinimumStockLevel - currentStock
                });
            }
        }

        var criticalStockCount = lowStockDrugs.Count(d => d.Shortage >= d.MinimumStock);
        var lowStockCount = lowStockDrugs.Count;

        // 4. SKT yaklaşanlar - DB'de filtrele, sadece gerekli alanları çek
        var cutoffDate = now.AddDays(90);
        var today = now.Date;

        var nearExpiryBatches = await stockBatchQueryable
            .Where(b => !b.IsQuarantined &&
                        b.ExpirationDate <= cutoffDate &&
                        b.ExpirationDate > today &&
                        (!filterWarehouseId.HasValue || b.WarehouseId == filterWarehouseId.Value))
            .OrderBy(b => b.ExpirationDate)
            .Take(20) // Sadece ilk 20'si yeterli (sonradan Take(5) alınıyor)
            .Select(b => new
            {
                b.Id,
                b.DrugId,
                b.LotNumber,
                b.ExpirationDate,
                b.Quantity
            })
            .ToListAsync();

        // Drug name'leri batch ile join et (tek sorgu)
        var nearExpiryDrugIds = nearExpiryBatches.Select(b => b.DrugId).Distinct().ToList();
        var drugNames = await drugQueryable
            .Where(d => nearExpiryDrugIds.Contains(d.Id))
            .Select(d => new { d.Id, d.Name })
            .ToDictionaryAsync(d => d.Id, d => d.Name);

        var nearExpiryList = nearExpiryBatches
            .Select(b => new NearExpiryBatch
            {
                BatchId = b.Id,
                DrugName = drugNames.TryGetValue(b.DrugId, out var name) ? name : "Bilinmeyen",
                LotNumber = b.LotNumber,
                ExpirationDate = b.ExpirationDate,
                DaysRemaining = (b.ExpirationDate.Date - today).Days,
                Quantity = b.Quantity
            })
            .OrderBy(b => b.DaysRemaining)
            .Take(5)
            .ToList();

        // 5. Ciro ve satış istatistikleri - DB'de aggregate
        var saleQueryable = await _saleRepository.GetQueryableAsync();
        var salesQuery = saleQueryable
            .Where(s => s.SaleDate >= startDate && s.SaleDate <= endDate &&
                        (!filterPharmacyId.HasValue || s.PharmacyId == filterPharmacyId.Value));

        var totalSalesAmount = await salesQuery.SumAsync(s => (double)s.TotalAmount);
        var totalOrdersCount = await salesQuery.CountAsync();
        var totalPrescriptions = await salesQuery.CountAsync(s => s.PrescriptionId.HasValue);

        return new DashboardStatsDto
        {
            TotalDrugs = drugsCount,
            PendingOrders = pendingOrders,
            TotalOrders = totalOrdersCount,
            TotalSalesAmount = totalSalesAmount,
            TotalPrescriptions = totalPrescriptions,
            CriticalStockCount = criticalStockCount,
            LowStockCount = lowStockCount,
            LowStockWarnings = lowStockDrugs,
            NearExpiryBatches = nearExpiryList
        };
    }

    public async Task<DashboardTrendDto> GetTrendAsync(DashboardFilterDto filter)
    {
        var (pharmacyId, warehouseId, role) = await GetUserScopeAsync();
        filter = ApplyUserScope(filter, pharmacyId, warehouseId);

        var now = DateTime.Now;
        var startDate = filter?.StartDate ?? now.AddDays(-30);
        var endDate = filter?.EndDate ?? now;
        var period = string.IsNullOrWhiteSpace(filter?.Period) ? "day" : filter.Period.ToLowerInvariant();
        var filterPharmacyId = filter?.PharmacyId;
        var filterWarehouseId = filter?.WarehouseId;

        // 1. Satış ve sipariş trendleri - DB'de filtrele
        var saleQueryable = await _saleRepository.GetQueryableAsync();
        var orderQueryable = await _orderRepository.GetQueryableAsync();

        var salesQuery = saleQueryable
            .Where(s => s.SaleDate >= startDate && s.SaleDate <= endDate &&
                        (!filterPharmacyId.HasValue || s.PharmacyId == filterPharmacyId.Value));

        var ordersQuery = orderQueryable
            .Where(o => o.OrderDate >= startDate && o.OrderDate <= endDate &&
                        (!filterPharmacyId.HasValue || o.PharmacyId == filterPharmacyId.Value));

        // DB'de gruplama yap (günlük)
        var dailySalesDict = await salesQuery
            .GroupBy(s => s.SaleDate.Date)
            .Select(g => new { Date = g.Key, Total = g.Sum(s => (double)s.TotalAmount) })
            .ToDictionaryAsync(x => x.Date, x => x.Total);

        var dailyOrdersDict = await ordersQuery
            .GroupBy(o => o.OrderDate.Date)
            .Select(g => new { Date = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Date, x => x.Count);

        // Period key'leri oluştur ve veriyi period'a göre yeniden grupla (bellekte az veri)
        var dailySales = new Dictionary<string, double>();
        var dailyOrders = new Dictionary<string, int>();

        var current = startDate.Date;
        while (current <= endDate.Date)
        {
            var key = GetPeriodKey(current, period);
            if (!dailySales.ContainsKey(key)) dailySales[key] = 0;
            if (!dailyOrders.ContainsKey(key)) dailyOrders[key] = 0;
            current = current.AddDays(1);
        }

        foreach (var kv in dailySalesDict)
        {
            var key = GetPeriodKey(kv.Key, period);
            if (dailySales.ContainsKey(key))
                dailySales[key] += kv.Value;
        }

        foreach (var kv in dailyOrdersDict)
        {
            var key = GetPeriodKey(kv.Key, period);
            if (dailyOrders.ContainsKey(key))
                dailyOrders[key] += kv.Value;
        }

        // 2. Kategori dağılımı - DB'de count
        var drugQueryable = await _drugRepository.GetQueryableAsync();
        var categoryDistribution = new List<CategoryStat>
        {
            new CategoryStat { Name = "Reçetesiz(OTC)", Value = await drugQueryable.CountAsync(d => d.PrescriptionType == PrescriptionType.OverTheCounter) },
            new CategoryStat { Name = "Beyaz Reçete", Value = await drugQueryable.CountAsync(d => d.PrescriptionType == PrescriptionType.White) },
            new CategoryStat { Name = "Yeşil Reçete", Value = await drugQueryable.CountAsync(d => d.PrescriptionType == PrescriptionType.Green) },
            new CategoryStat { Name = "Kırmızı Reçete(Narkotik)", Value = await drugQueryable.CountAsync(d => d.PrescriptionType == PrescriptionType.Red) }
        };

        // 3. Stok dağılımı - DB seviyesinde hesapla
        // MinimumStockLevel > 0 olan ilaçları al
        var drugsForStockDist = await drugQueryable
            .Where(d => d.MinimumStockLevel > 0)
            .Select(d => new { d.Id, d.MinimumStockLevel })
            .ToListAsync();

        var drugIdsForStock = drugsForStockDist.Select(d => d.Id).ToList();

        var stockBatchQueryable = await _stockBatchRepository.GetQueryableAsync();
        var stockSumsQuery = stockBatchQueryable
            .Where(b => !b.IsQuarantined &&
                        drugIdsForStock.Contains(b.DrugId) &&
                        (!filterWarehouseId.HasValue || b.WarehouseId == filterWarehouseId.Value))
            .GroupBy(b => b.DrugId)
            .Select(g => new { DrugId = g.Key, TotalQty = g.Sum(b => b.Quantity) });

        var stockSums = await stockSumsQuery.ToListAsync();
        var stockDict = stockSums.ToDictionary(x => x.DrugId, x => x.TotalQty);

        var yeterliStok = 0;
        var dusukStok = 0;
        var kritikStok = 0;

        foreach (var drug in drugsForStockDist)
        {
            var qty = stockDict.TryGetValue(drug.Id, out var q) ? q : 0;
            if (qty == 0)
                kritikStok++;
            else if (qty < drug.MinimumStockLevel)
                dusukStok++;
            else
                yeterliStok++;
        }

        var stockDistribution = new List<StockStat>
        {
            new StockStat { Name = "Yeterli Stok", Value = yeterliStok },
            new StockStat { Name = "Düşük Stok", Value = dusukStok },
            new StockStat { Name = "Kritik Stok", Value = kritikStok }
        };

        var totalSales = await salesQuery.CountAsync();
        var totalSalesAmount = await salesQuery.SumAsync(s => (double)s.TotalAmount);
        var totalOrders = await ordersQuery.CountAsync();

        return new DashboardTrendDto
        {
            DailySales = dailySales.Select(kv => new DailyStat { Date = kv.Key, Amount = kv.Value }).ToList(),
            DailyOrders = dailyOrders.Select(kv => new DailyStat { Date = kv.Key, Count = kv.Value }).ToList(),
            CategoryDistribution = categoryDistribution,
            StockDistribution = stockDistribution,
            TotalSales = totalSales,
            TotalSalesAmount = totalSalesAmount,
            TotalOrders = totalOrders
        };
    }

    private static string GetPeriodKey(DateTime date, string period)
    {
        return period switch
        {
            "week" => $"{date.Year}-W{GetIsoWeek(date):D2}",
            "month" => $"{date.Year}-{date.Month:D2}",
            "year" => $"{date.Year}",
            _ => date.ToString("yyyy-MM-dd") // day
        };
    }

    private static int GetIsoWeek(DateTime date)
    {
        var day = date.Date.AddDays(-(int)date.DayOfWeek + (int)DayOfWeek.Monday);
        return (day - new DateTime(date.Year, 1, 1)).Days / 7 + 1;
    }
}