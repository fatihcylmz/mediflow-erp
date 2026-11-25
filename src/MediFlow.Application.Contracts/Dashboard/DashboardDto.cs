using System;
using System.Collections.Generic;

namespace MediFlow.Dashboard;

public class DashboardStatsDto
{
    public int TotalDrugs { get; set; }
    public int PendingOrders { get; set; }
    public int TotalOrders { get; set; }
    public double TotalSalesAmount { get; set; }
    public int TotalPrescriptions { get; set; }
    public int CriticalStockCount { get; set; }
    public int LowStockCount { get; set; }
    public List<LowStockWarning> LowStockWarnings { get; set; } = new();
    public List<NearExpiryBatch> NearExpiryBatches { get; set; } = new();
}

public class LowStockWarning
{
    public Guid DrugId { get; set; }
    public string DrugName { get; set; } = string.Empty;
    public int CurrentStock { get; set; }
    public int MinimumStock { get; set; }
    public int Shortage { get; set; }
}

public class NearExpiryBatch
{
    public Guid BatchId { get; set; }
    public string DrugName { get; set; } = string.Empty;
    public string LotNumber { get; set; } = string.Empty;
    public DateTime ExpirationDate { get; set; }
    public int DaysRemaining { get; set; }
    public int Quantity { get; set; }
}

public class DailyStat
{
    public string Date { get; set; } = string.Empty;
    public double Amount { get; set; }
    public int Count { get; set; }
}

public class CategoryStat
{
    public string Name { get; set; } = string.Empty;
    public int Value { get; set; }
}

public class StockStat
{
    public string Name { get; set; } = string.Empty;
    public int Value { get; set; }
}

public class DashboardTrendDto
{
    public List<DailyStat> DailySales { get; set; } = new();
    public List<DailyStat> DailyOrders { get; set; } = new();
    public List<CategoryStat> CategoryDistribution { get; set; } = new();
    public List<StockStat> StockDistribution { get; set; } = new();
    public int TotalSales { get; set; }
    public double TotalSalesAmount { get; set; }
    public int TotalOrders { get; set; }
}

public class DashboardFilterDto
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Period { get; set; } // "day", "week", "month", "year"
    public Guid? PharmacyId { get; set; }
    public Guid? WarehouseId { get; set; }
}
