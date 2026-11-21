using System;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace MediFlow.Sales;

[Authorize]
public class SaleItemAppService :
    CrudAppService<
        SaleItem,
        SaleItemDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateUpdateSaleItemDto>,
    ISaleItemAppService
{
    public SaleItemAppService(IRepository<SaleItem, Guid> repository)
        : base(repository)
    {
    }
}