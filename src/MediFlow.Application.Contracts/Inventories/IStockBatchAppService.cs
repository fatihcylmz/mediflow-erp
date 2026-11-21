using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace MediFlow.Inventories;

public interface IStockBatchAppService : ICrudAppService<StockBatchDto, Guid, PagedAndSortedResultRequestDto, CreateUpdateStockBatchDto>
{
    /// <summary>
    /// Manuel stok girişi/çıkışı. positive = giriş, negative = çıkış.
    /// </summary>
    Task AdjustStockAsync(Guid stockBatchId, int quantityChange, string description);
}