using System;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace MediFlow.Warehouses;

public interface IWarehouseAppService : ICrudAppService<WarehouseDto, Guid, PagedAndSortedResultRequestDto, CreateUpdateWarehouseDto>
{
}