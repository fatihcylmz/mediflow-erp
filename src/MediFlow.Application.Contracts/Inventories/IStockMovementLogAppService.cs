using System;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace MediFlow.Inventories;

public interface IStockMovementLogAppService : ICrudAppService<StockMovementLogDto, Guid, PagedAndSortedResultRequestDto, CreateUpdateStockMovementLogDto>
{
}