using System;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace MediFlow.Sales;

public interface ISaleItemAppService :
    ICrudAppService<
        SaleItemDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateUpdateSaleItemDto>
{
}