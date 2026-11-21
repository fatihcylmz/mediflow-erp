using System;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace MediFlow.Inventories;

public class StockMovementLogAppService : CrudAppService<
    StockMovementLog, 
    StockMovementLogDto, 
    Guid, 
    PagedAndSortedResultRequestDto, 
    CreateUpdateStockMovementLogDto>, IStockMovementLogAppService
{
    public StockMovementLogAppService(IRepository<StockMovementLog, Guid> repository) : base(repository)
    {
    }
}