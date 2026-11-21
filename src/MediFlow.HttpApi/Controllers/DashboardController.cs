using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.AspNetCore.Mvc;
using Volo.Abp.Domain.Repositories;
using MediFlow.Drugs;
using MediFlow.Inventories;
using MediFlow.Orders;

namespace MediFlow.HttpApi.Controllers;

[Area("admin")]
[Route("api/app/[controller]")]
public class DashboardController : AbpController
{
    private readonly IRepository<Drug, Guid> _drugRepository;
    private readonly IRepository<StockBatch, Guid> _stockBatchRepository;
    private readonly IRepository<Order, Guid> _orderRepository;

    public DashboardController(
        IRepository<Drug, Guid> drugRepository,
        IRepository<StockBatch, Guid> stockBatchRepository,
        IRepository<Order, Guid> orderRepository)
    {
        _drugRepository = drugRepository;
        _stockBatchRepository = stockBatchRepository;
        _orderRepository = orderRepository;
    }

    [HttpPost("get-stats")]
    public async Task<ActionResult<DashboardStatsDto>> GetStatsAsync()
    {
        // Toplam ilaç sayısı
        var drugsCount = (await _drugRepository.GetListAsync()).Count;

        // Aktif siparişler
        var pendingOrders = (await _orderRepository.GetListAsync(o => o.Status == OrderStatus.Pending)).Count;

        // Low stock warning - MinimumStockLevel altında olan ilaçlar
        var lowStockDrugs = new List<LowStockWarning>();
        var allDrugs = await _drugRepository.GetListAsync();
        foreach (var drug in allDrugs)
        {
            if (drug.MinimumStockLevel > 0)
            {
                var batches = await _stockBatchRepository.GetListAsync(sb => sb.DrugId == drug.Id);
                var totalQuantity = batches.Sum(sb => sb.Quantity);

                if (totalQuantity < drug.MinimumStockLevel)
                {
                    lowStockDrugs.Add(new LowStockWarning
                    {
                        DrugId = drug.Id,
                        DrugName = drug.Name,
                        CurrentStock = totalQuantity,
                        MinimumStock = drug.MinimumStockLevel,
                        Shortage = drug.MinimumStockLevel - totalQuantity
                    });
                }
            }
        }

        return Ok(new DashboardStatsDto
        {
            TotalDrugs = drugsCount,
            PendingOrders = pendingOrders,
            LowStockWarnings = lowStockDrugs
        });
    }
}

public class DashboardStatsDto
{
    public int TotalDrugs { get; set; }
    public int PendingOrders { get; set; }
    public List<LowStockWarning> LowStockWarnings { get; set; } = new();
}

public class LowStockWarning
{
    public Guid DrugId { get; set; }
    public string DrugName { get; set; } = string.Empty;
    public int CurrentStock { get; set; }
    public int MinimumStock { get; set; }
    public int Shortage { get; set; }
}
